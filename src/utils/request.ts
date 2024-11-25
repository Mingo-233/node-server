import axios from "axios";
import fs from "fs";
import path from "path";
import log, { isDevMode } from "@/utils/log";
import { generateHash, isBase64, isImg, isPng } from "./imgUtils";

export const assetsMap = new Map();

let _cacheDirName = "default";
axios.defaults.timeout = 20000;
const cacheRootDir = path.resolve(__dirname, `../../../../cache`);

export const defaultFont = {
  CJK: "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf",
  Arabic: "https://cdn.pacdora.com/font/Arial.ttf",
  Thai: "https://cdn.pacdora.com/font/Tahoma.ttf",
  Greek: "https://cdn.pacdora.com/font/Arial.ttf",
  Russian: "https://cdn.pacdora.com/font/Arial.ttf",
  Tamil: "https://cdn.pacdora.com/font/Latha.ttf",
  Telugu: "https://cdn.pacdora.com/font/NotoSansTelugu.ttf",
  Kannada: "https://cdn.pacdora.com/font/NotoSansKannada.ttf",
  Hindi: "https://cdn.pacdora.com/font/NotoSansDevanagari.ttf",
  Bengali: "https://cdn.pacdora.com/font/NotoSansBengali.ttf",
};
initAssetsMap();
function initAssetsMap() {
  for (const key in defaultFont) {
    const filename = path.basename(defaultFont[key]);
    const cacheFilePath = path.join(cacheRootDir, filename);
    assetsMap.set(defaultFont[key], cacheFilePath);
  }
}
/**
 * 获取缓存文件的路径
 * @param {string} url - 资源 URL
 * @returns {string} - 缓存文件路径
 */
export const getCacheFilePath = (url) => {
  const CACHE_DIR = path.join(cacheRootDir, _cacheDirName);
  // 确保缓存目录存在
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
  }
  const hash = generateHash(url);
  const extension = path.extname(url).split("?")[0] || ""; // 根据 URL 的扩展名生成文件名
  return path.join(CACHE_DIR, `${hash}${extension}`);
};
export const getCacheDir = () => {
  return path.join(cacheRootDir, _cacheDirName);
};
/**
 * 请求资源并缓存
 * @param {string} url - 资源 URL
 * @returns {Promise<Buffer>} - 返回资源内容的 Buffer
 */
export const fetchResourceWithCache = async (url) => {
  const assetsUrl = assetsMap.get(url);
  if (assetsUrl) {
    if (fs.existsSync(assetsUrl)) {
      return fs.readFileSync(assetsUrl);
    } else {
      console.warn("本地缓存文件存在，但是未读取到,重新请求", url, assetsUrl);
    }
  }
  const cacheFilePath = getCacheFilePath(url);
  if (!isBase64(url)) {
    assetsMap.set(url, cacheFilePath);
  }
  // 检查缓存文件是否存在
  if (fs.existsSync(cacheFilePath)) {
    return fs.readFileSync(cacheFilePath);
  }

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer", // 获取二进制数据
    });

    const data = response.data;

    // 将数据写入缓存文件
    fs.writeFileSync(cacheFilePath, data);

    console.log(`资源已缓存：${cacheFilePath}`);

    return data;
  } catch (error: any) {
    console.error(`请求资源失败：${url}`, error?.message);
    throw `请求资源失败：${url}`;
  }
};
export function fetchAssets(url) {
  return new Promise((resolve, reject) => {
    const _url = prefixUrl(url);
    // log.info("log-fetchImage start", _url);
    fetchResourceWithCache(_url)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function prefixUrl(url) {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}
export function getCmykImgPath(url) {
  return `${extractPath(url)}_cmyk.jpg`;
}
export function getAlphaImgPath(url) {
  return `${extractPath(url)}_alpha.jpg`;
}
function extractPath(filename) {
  const regex = /(.*)(\.[^.]+)$/; // 匹配路径及文件名，直到最后一个点（.）
  const match = filename.match(regex);
  return match ? match[1] : "";
}

export function queryResource(jsonData) {
  const srcValues = new Set();
  const pngSrcValues = new Set();
  const imgSrcValues = new Set();
  const base64ImgValues = new Set();
  function traverse(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item));
    } else if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (key === "src") {
          const srcValue = obj[key];
          // TODO: 不处理base64资源，这是错误数据
          if (!isBase64(srcValue)) {
            srcValues.add(srcValue);
          }

          if (isPng(srcValue)) {
            pngSrcValues.add(srcValue);
          }
          // else if (isBase64(srcValue)) {
          //   base64ImgValues.add(srcValue);
          // }
          else if (isImg(srcValue)) {
            imgSrcValues.add(srcValue);
          }
        }
        traverse(obj[key]);
      }
    }
  }

  traverse(jsonData);
  return [srcValues, imgSrcValues, pngSrcValues, base64ImgValues];
}

export async function cacheResource(jsonData, isDevMode = false) {
  return new Promise<any>(async (resolve, reject) => {
    if (isDevMode) {
      _cacheDirName = "default";
    } else {
      _cacheDirName = Math.random().toString(36).substring(7);
    }
    const [srcValues, imgSrcValues, pngSrcValues, base64ImgValues] =
      queryResource(jsonData);

    const promiseTask: any[] = [];

    srcValues.forEach((src) => {
      promiseTask.push(fetchAssets(src));
    });
    await Promise.all(promiseTask)
      .then(async (res) => {
        console.log("所有资源缓存完成");
        const result = {
          assetsMap,
          pngUrlArr: Array.from(pngSrcValues),
          imgUrlArr: Array.from(imgSrcValues),
          base64ImgUrlArr: Array.from(base64ImgValues),
        };
        resolve(result);
      })
      .catch((err) => {
        console.error("资源下载失败", err);
        reject(err);
      });
  });
}

export function clearCache() {
  const CACHE_DIR = path.join(cacheRootDir, _cacheDirName);
  assetsMap.clear();
  initAssetsMap();
  fs.rm(CACHE_DIR, { recursive: true, force: true }, () =>
    console.log("缓存已清空")
  );
}
