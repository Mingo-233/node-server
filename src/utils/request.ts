import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import log from "@/utils/log";

export const assetsMap = new Map();
let _cacheDirName = "default";
const _defaultDirName = "default";
const DEFAULT_CACHE_DIR = path.resolve(
  __dirname,
  `../../cache/${_defaultDirName}/NotoSansCJK-Regular.ttf`
);
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
  const CACHE_DIR = path.resolve(__dirname, `../../cache/${_cacheDirName}`);
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
  if (assetsMap.get(url)) {
    console.log("命中assetsMap缓存", url);

    return fs.promises.readFile(assetsMap.get(url));
  }
  const cacheFilePath = getCacheFilePath(url);
  assetsMap.set(url, cacheFilePath);
  // 检查缓存文件是否存在
  if (fs.existsSync(cacheFilePath)) {
    console.log(`从缓存读取：${url}`);
    return fs.promises.readFile(cacheFilePath);
  }

  try {
    console.log(`请求资源：${url}`);
    const response = await axios({
      url,
      method: "GET",
      responseType: "arraybuffer", // 获取二进制数据
    });

    const data = response.data;

    // 将数据写入缓存文件
    await fs.promises.writeFile(cacheFilePath, data);
    console.log(`资源已缓存：${cacheFilePath}`);

    return data;
  } catch (error) {
    console.error(`请求资源失败：${url}`, error);
    throw error;
  }
};
export function fetchAssets(url, isBuffer = true) {
  log.info("log-fetchImage start", url);
  const _url = prefixUrl(url);
  return fetchResourceWithCache(_url);
}

export function prefixUrl(url) {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}
export function isSvgUrl(url) {
  return url.toLowerCase().endsWith(".svg");
}

export function queryResource(jsonData) {
  const srcValues = new Set();

  function traverse(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item));
    } else if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (key === "src") {
          srcValues.add(obj[key]);
        }
        traverse(obj[key]);
      }
    }
  }

  traverse(jsonData);
  return srcValues;
}

export async function cacheResource(jsonData) {
  // _cacheDirName = Math.random().toString(36).substring(7);
  const srcValues = queryResource(jsonData);

  const promiseTask: any[] = [];
  defaultAssetsArr.forEach((src) => {
    promiseTask.push(fetchAssets(src));
  });
  srcValues.forEach((src) => {
    promiseTask.push(fetchAssets(src));
  });
  await Promise.all(promiseTask)
    .then((res) => {
      console.log("所有资源缓存完成");
    })
    .catch((err) => {
      console.error("资源下载失败", err);
    });
}

export function clearCache() {
  const CACHE_DIR = path.resolve(__dirname, `../../cache/${_cacheDirName}`);
  fs.rm(CACHE_DIR, { recursive: true, force: true }, () =>
    console.log("缓存已清空")
  );
}
