import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const CACHE_DIR = path.resolve(__dirname, "../../cache");
export const assetsMap = new Map();
const generateHash = (url) => {
  return crypto.createHash("md5").update(url).digest("hex");
};

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR);
}

/**
 * 获取缓存文件的路径
 * @param {string} url - 资源 URL
 * @returns {string} - 缓存文件路径
 */
const getCacheFilePath = (url) => {
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

// async function mockRequest() {
//   const url = "https://cloud.pacdora.com/effect/pattern/2000007.svg"; // 替换为实际的资源 URL
//   try {
//     const data = await fetchResourceWithCache(url);
//     console.log(`获取到资源大小：${data.length} 字节`);
//   } catch (err) {
//     console.error("获取资源失败", err);
//   }
// }
