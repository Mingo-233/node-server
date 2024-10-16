import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import log, { isDevMode } from "@/utils/log";
import { convertAndInvertImage } from "@/utils/color";
import sharp from "sharp";
export const assetsMap = new Map();

let _cacheDirName = "default";
axios.defaults.timeout = 20000;
const cacheRootDir = path.resolve(__dirname, `../../../../cache`);
const DEFAULT_CACHE_DIR = path.join(cacheRootDir, "NotoSansCJK-Regular.ttf");
// const DEFAULT_CACHE_DIR = path.resolve(
//   __dirname,
//   `../../../../cache/NotoSansCJK-Regular.ttf`
// );
assetsMap.set(
  "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf",
  DEFAULT_CACHE_DIR
);
const defaultAssetsArr = [
  "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf",
];

const generateHash = (url) => {
  return crypto.createHash("md5").update(url).digest("hex");
};

/**
 * 获取缓存文件的路径
 * @param {string} url - 资源 URL
 * @returns {string} - 缓存文件路径
 */
const getCacheFilePath = (url) => {
  const CACHE_DIR = path.join(cacheRootDir, _cacheDirName);
  // 确保缓存目录存在
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR);
  }
  const hash = generateHash(url);
  const extension = path.extname(url).split("?")[0] || ""; // 根据 URL 的扩展名生成文件名
  return path.join(CACHE_DIR, `${hash}${extension}`);
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
  assetsMap.set(url, cacheFilePath);
  // // 检查缓存文件是否存在
  // if (fs.existsSync(cacheFilePath)) {
  //   return fs.readFileSync(cacheFilePath);
  // }

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
  } catch (error) {
    console.error(`请求资源失败：${url}`);
    throw `请求资源失败：${url}`;
  }
};
export function fetchAssets(url) {
  return new Promise((resolve, reject) => {
    log.info("log-fetchImage start", url);
    const _url = prefixUrl(url);
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
  // return `${extractPath(url)}_cmyk.jpg`;
  return `${extractPath(url)}_cmyk.jpg`;
}
function extractPath(filename) {
  const regex = /(.*)(\.[^.]+)$/; // 匹配路径及文件名，直到最后一个点（.）
  const match = filename.match(regex);
  return match ? match[1] : "";
}
export function isSvgUrl(url) {
  return url.toLowerCase().endsWith(".svg");
}
function isImage(url) {
  return url.match(/\.(jpeg|jpg|png)$/);
}
export function queryResource(jsonData) {
  const srcValues = new Set();
  const imgSrcValues = new Set();
  function traverse(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item));
    } else if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (key === "src") {
          const srcValue = obj[key];
          srcValues.add(srcValue);
          if (isImage(srcValue)) {
            imgSrcValues.add(srcValue);
          }
        }
        traverse(obj[key]);
      }
    }
  }

  traverse(jsonData);
  return [srcValues, imgSrcValues];
}

export async function cacheResource(jsonData) {
  return new Promise<void>(async (resolve, reject) => {
    if (isDevMode) {
      _cacheDirName = "default";
    } else {
      _cacheDirName = Math.random().toString(36).substring(7);
    }
    const [srcValues, imgsSrcValues] = queryResource(jsonData);

    const promiseTask: any[] = [];
    defaultAssetsArr.forEach((src) => {
      promiseTask.push(fetchAssets(src));
    });
    srcValues.forEach((src) => {
      promiseTask.push(fetchAssets(src));
    });
    await Promise.all(promiseTask)
      .then(async (res) => {
        console.log("所有资源缓存完成");
        // const imgSrcArr = Array.from(imgsSrcValues);
        // for (let i = 0; i < imgSrcArr.length; i++) {
        // const url = prefixUrl(imgSrcArr[i]);
        // const inputFilePath = assetsMap.get(url);
        // /a/b/c/123.png => /a/b/c/cmyk_123.png
        // const outputFilePath = getCmykImgPath(inputFilePath);
        // await convertAndInvertImage(inputFilePath, outputFilePath);
        // }
        resolve();
      })
      .catch((err) => {
        console.error("资源下载失败", err);
        reject(err);
      });
  });
}

export function clearCache() {
  const CACHE_DIR = path.join(cacheRootDir, _cacheDirName);
  fs.rm(CACHE_DIR, { recursive: true, force: true }, () =>
    console.log("缓存已清空")
  );
}

export function convertToPng(input, options) {
  return new Promise<string>((resolve, reject) => {
    const { width = 0, height = 0 } = options;
    // 读取 SVG 文件
    const svgBuffer = fs.readFileSync(input);
    const outputPath = input.replace(/\.svg$/, ".png");
    // 使用 sharp 将 SVG 转换为 PNG
    sharp(svgBuffer)
      // 4倍图
      .resize(parseInt(width) * 4, parseInt(height) * 4)
      .png()
      .toFile(outputPath)
      .then(() => {
        console.log("转换成功！");
        resolve(outputPath);
      })
      .catch((err) => {
        console.error("转换失败：", err);
        reject(err);
      });
  });
}
