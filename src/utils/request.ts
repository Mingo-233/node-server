import axios from "axios";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import log, { isDevMode } from "@/utils/log";
import sharp from "sharp";
import { magickCMD } from "./imageMagick";
import {
  ICmykConvertResult,
  IImgDescItem,
  ISplitPngResult,
} from "@/type/cymkImg";
export const assetsMap = new Map();
const spawn = require("await-spawn");

// function spawn(a, b) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("test");
//     }, 1000);
//   });
// }

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
  } catch (error) {
    console.error(`请求资源失败：${url}`);
    throw `请求资源失败：${url}`;
  }
};
export function fetchAssets(url) {
  return new Promise((resolve, reject) => {
    // log.info("log-fetchImage start", url);
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
export function isSvgUrl(url) {
  return url.toLowerCase().endsWith(".svg");
}
function isPng(url) {
  return url.match(/\.(png)$/);
}
export function isBase64(url) {
  return url.startsWith("data:image/");
}
export function getBase64ImgKey(url) {
  const hashKey = generateHash(url.slice(20, 50));
  return hashKey;
}
function isImg(url) {
  return url.match(/\.(png|jpg|jpeg)$/);
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
  assetsMap.set(
    "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf",
    DEFAULT_CACHE_DIR
  );
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

export async function splitPng(pngList: string[]) {
  let resultArr: ISplitPngResult[] = [];
  const taskPromise: Promise<any>[] = [];
  pngList.forEach((url, index: number) => {
    const _url = prefixUrl(url)
    resultArr[index] = {
      remoteUrl: _url,
      rgbUrl: "",
      alphaUrl: "",
    };
    const localUrl = getCacheFilePath(_url);
    const rgbOutputUrl = localUrl.replace(".png", "_rgb.jpg");
    const [cmd, arg] = magickCMD("splitRGB", localUrl, rgbOutputUrl);
    const rgbTask = new Promise<void>((resolve, reject) => {
      spawn(cmd, arg)
        .then((res) => {
          resultArr[index].rgbUrl = rgbOutputUrl;
          resolve();
        })
        .catch((err) => reject(err));
    });
    taskPromise.push(rgbTask);

    const alphaOutputUrl = localUrl.replace(".png", "_alpha.jpg");
    const [cmd2, arg2] = magickCMD("splitAlpha", localUrl, alphaOutputUrl);
    const alphaTask = new Promise<void>((resolve, reject) => {
      spawn(cmd2, arg2)
        .then((res) => {
          resultArr[index].alphaUrl = alphaOutputUrl;
          resolve();
        })
        .catch((err) => reject(err));
    });
    taskPromise.push(alphaTask);
  });
  await Promise.all(taskPromise)
    .then((res) => {
      console.log("magick splitPng 命令执行成功");
    })
    .catch((err) => {
      console.error("magick splitPng 命令执行出错", err);
      throw err;
    });
  return resultArr;
}

export async function convertCMYKImg(imgList: IImgDescItem[]) {
  let resultArr: ICmykConvertResult[] = [];

  const taskPromise: any[] = [];
  imgList.forEach((imgDescItem, index) => {
    let remoteUrl = prefixUrl(`${imgDescItem.remoteUrl}`);
    const localCacheFile = getCacheFilePath(remoteUrl);
    const localCmykJpgUrl = getCmykImgPath(localCacheFile);
    let localRgbJpgUrl = "";
    if (imgDescItem.format === "png") {
      // png 会先拆分，所以_rgb.jpg这个文件已经存在了
      localRgbJpgUrl = localCmykJpgUrl.replace("_cmyk.jpg", "_rgb.jpg");
    } else {
      // 其他情况不会拆分，直接取缓存到本地的文件
      localRgbJpgUrl = localCacheFile;
    }
    const [cmd, arg] = magickCMD(
      "convertCMYK",
      localRgbJpgUrl,
      localCmykJpgUrl
    );

    const task = new Promise<void>((resolve, reject) => {
      spawn(cmd, arg)
        .then((res) => {
          resultArr[index] = {
            remoteUrl: remoteUrl,
            cmykUrl: localCmykJpgUrl,
          };
          resolve();
        })
        .catch((err) => reject(err));
    });
    taskPromise.push(task);
  });
  await Promise.all(taskPromise)
    .then((res) => {
      console.log("magick cmyk convert 命令执行成功");
    })
    .catch((err) => {
      console.error("magick cmyk convert 命令执行出错", err);
      throw err;
    });

  return resultArr;
}

export async function generateCmykImg(cacheResult) {
  const { pngUrlArr, imgUrlArr, assetsMap, base64ImgUrlArr } = cacheResult;
  const _imgUrlArr: IImgDescItem[] = imgUrlArr.map((url) => ({
    remoteUrl: prefixUrl(url),
    format: "jpg",
  }));
  // bae64要放在最前面处理，因为可能存在jpg也可能存在png格式
  if (base64ImgUrlArr?.length > 0) {
    for (let i = 0; i < base64ImgUrlArr.length; i++) {
      const url = base64ImgUrlArr[i];
      const saveResult = await saveBase64(url);
      const imgDescItem = {
        remoteUrl: saveResult.remoteUrl,
        format: saveResult.format,
      };
      if (saveResult?.format === "png") {
        pngUrlArr.push(saveResult.remoteUrl);
      } else {
        _imgUrlArr.push(imgDescItem);
      }
    }
  }
  // 是否有PNG 拆分PNG生成一个deviceGrey通道的图片和一个rgb通道的图片
  if (pngUrlArr?.length > 0) {
    const splitResult = await splitPng(pngUrlArr);
    splitResult.forEach((item) => {
      const alphaUrlKey = item.remoteUrl.replace(".png", "_alpha.jpg");
      // 创建一个远程的alpha图片地址  指向本地的alpha图片地址
      assetsMap.set(alphaUrlKey, item.alphaUrl);
      _imgUrlArr.push({
        remoteUrl: item.remoteUrl,
        format: "png",
      });
    });
  }

  if (_imgUrlArr.length > 0) {
    const cmykImgResult = await convertCMYKImg(_imgUrlArr);
    cmykImgResult.forEach((item) => {
      // 更新原先的png图片地址 指向本地的cmyk图片地址
      assetsMap.set(item.remoteUrl, item.cmykUrl);
    });
  }
}

async function saveBase64(base64Data) {
  const { format, remoteUrl, localUrl } = extractBase64(base64Data);
  const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, "");
  await fs.promises.writeFile(localUrl, base64Image, {
    encoding: "base64",
  });
  return {
    format,
    remoteUrl,
    localUrl,
  };
}

export function extractBase64(base64Data) {
  const match = base64Data.match(/^data:image\/(\w+);base64,/);
  if (!match) {
    console.error("无效的 Base64 图片数据");
    throw "无效的 Base64 图片数据";
  }
  // 提取文件扩展名
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const uniqueKey = getBase64ImgKey(base64Data);
  // 模拟创建一个远程地址
  const remoteUrl = `base64-${uniqueKey}.${ext}`;
  const localCacheFile = getCacheFilePath(remoteUrl);
  return {
    format: ext,
    remoteUrl: remoteUrl,
    localUrl: localCacheFile,
  };
}
