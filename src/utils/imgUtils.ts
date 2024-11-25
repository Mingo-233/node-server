import { magickCMD } from "./imageMagick";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DOMParser } from "xmldom";
import xpath from "xpath";
import {
  ICmykConvertResult,
  IImgDescItem,
  ISplitPngResult,
} from "@/type/cymkImg";
import { getCacheFilePath, getCmykImgPath, prefixUrl } from "./request";
const spawn = require("await-spawn");

// function spawn(a, b) {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => {
//       resolve("test");
//     }, 1000);
//   });
// }
export function extractImageTags(svgString) {
  const imageTagRegex = /<image\b[^>]*\/>/gi;
  const matches: string[] = [];
  let match;

  // 搜索所有匹配的 <image> 标签
  while ((match = imageTagRegex.exec(svgString)) !== null) {
    matches.push(match[0]);
  }

  return matches;
}

export async function splitPng(pngList: string[], isLocalUrl?) {
  let resultArr: ISplitPngResult[] = [];
  const taskPromise: Promise<any>[] = [];
  pngList.forEach((url, index: number) => {
    const _url = prefixUrl(url);
    resultArr[index] = {
      remoteUrl: _url,
      rgbUrl: "",
      alphaUrl: "",
    };
    const localUrl = isLocalUrl ? _url : getCacheFilePath(_url);
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

export async function convertCMYKImg(imgList: IImgDescItem[], isLocalUrl?) {
  console.time("convertCMYKImg");
  let resultArr: ICmykConvertResult[] = [];

  const taskPromise: any[] = [];
  imgList.forEach((imgDescItem, index) => {
    let remoteUrl = prefixUrl(`${imgDescItem.remoteUrl}`);
    const localCacheFile = isLocalUrl ? remoteUrl : getCacheFilePath(remoteUrl);
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
      console.timeEnd("convertCMYKImg");
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

export async function saveBase64(base64Data) {
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

export async function shapeToPng(svgString, outputPath, option) {
  try {
    const inputBuffer = Buffer.from(svgString);
    const isCMYK = option.isCMYK;
    const width = option.width;
    const height = option.height;
    if (isCMYK) {
      await sharp(inputBuffer)
        .toColorspace("cmyk")
        .withMetadata({ icc: "cmyk-adobe-japan-2001-coated.icc" })
        // 反转颜色
        .negate()
        // 保存为JPEG (CMYK兼容)
        .png()
        .toFile(outputPath);
    } else {
      await sharp(inputBuffer).png().toFile(outputPath);
    }
  } catch (error) {
    console.error("处理shapeToJpg时出错:", error);
  }
}
export function generateHash(url) {
  return crypto.createHash("md5").update(url).digest("hex");
}
export function isSvgUrl(url) {
  return url.toLowerCase().endsWith(".svg");
}
export function isPng(url) {
  return url.match(/\.(png)$/);
}
export function isBase64(url) {
  return url.startsWith("data:image/");
}
export function getBase64ImgKey(url) {
  const hashKey = generateHash(url.slice(20, 50));
  return hashKey;
}
export function isImg(url) {
  return url.match(/\.(png|jpg|jpeg)$/);
}
export function convertToPng(input, options) {
  return new Promise<string>((resolve, reject) => {
    const { width = 0, height = 0, isReadFile = false } = options;
    let inputBuffer;
    let outputPath;
    if (isReadFile) {
      // 读取 SVG 文件
      inputBuffer = fs.readFileSync(input);
      outputPath = input.replace(/\.svg$/, ".png");
    } else {
      inputBuffer = Buffer.from(inputBuffer);
    }

    // 使用 sharp 将 SVG 转换为 PNG
    sharp(inputBuffer)
      // 300 DPI- 300/25.4 ≈ 12
      .resize(parseInt(width) * 12, parseInt(height) * 12)
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

export function replaceBase64Images(svgString, localPath) {
  // 匹配 <image> 标签中 base64 编码的 href 属性
  const base64Regex =
    /<image\b[^>]*href="data:image\/[^;]+;base64,[^"]*"[^>]*\/>/gi;

  // 使用 replace 方法替换匹配的 base64 地址
  return svgString.replace(base64Regex, (match) => {
    // 生成新的 <image> 标签，替换 href 为本地路径
    return match.replace(
      /href="data:image\/[^;]+;base64,[^"]*"/,
      `href="${localPath}"`
    );
  });
}

/**
 * 从 SVG 中提取 Base64 图片并保存到本地
 * @param {string} svgPath - SVG 文件路径
 * @param {string} outputDir - 输出 PNG 文件的目录
 * @returns {Promise<void>}
 */
export async function processSvgIncludeBase64(svgPath, outputDir, hashName) {
  try {
    // 1. 读取 SVG 文件内容
    const svgContent = fs.readFileSync(svgPath, "utf-8");

    // 2. 解析 SVG 文件，考虑命名空间
    const doc = new DOMParser().parseFromString(svgContent, "text/xml");

    // 创建带命名空间的 XPath 解析器
    const select = xpath.useNamespaces({
      svg: "http://www.w3.org/2000/svg",
      xlink: "http://www.w3.org/1999/xlink",
    });

    // 使用带命名空间的 XPath 表达式查找 <image> 标签
    const imageNodes: any = select(
      '//svg:image[contains(@xlink:href, "base64")]',
      doc
    );

    // 检查是否找到 <image> 标签
    if (imageNodes.length === 0) {
      console.log("没有找到包含 Base64 图片的 <image> 标签。");
      return;
    }

    // 3. 创建输出目录
    // if (!fs.existsSync(outputDir)) {
    //   fs.mkdirSync(outputDir, { recursive: true });
    // }
    const pngFilePathArr: string[] = [];
    // 4. 遍历所有 Base64 图像节点
    for (let i = 0; i < imageNodes.length; i++) {
      const imageNode = imageNodes[i];
      const href = imageNode.getAttribute("xlink:href");

      // 提取 Base64 数据
      const base64Data = href.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      // 定义 PNG 文件名并保存
      const fileName = `${hashName}${i + 1}.png`;
      const filePath = path.join(outputDir, fileName);
      const embedName = `${hashName}${i + 1}_cmyk.jpg`;
      const embedPath = path.join(outputDir, embedName);

      pngFilePathArr.push(filePath);
      await sharp(buffer).toFile(filePath);
      // 目前只针对cmyk格式做转化
      // 5. 更新 SVG 中的 href 属性为新的本地文件路径
      imageNode.setAttribute("xlink:href", embedPath);
    }
    const splitResult = await splitPng(pngFilePathArr, true);
    const _imgUrlArr: any[] = [];
    splitResult.forEach((item) => {
      // 创建一个远程的alpha图片地址  指向本地的alpha图片地址
      _imgUrlArr.push({
        remoteUrl: item.remoteUrl,
        format: "png",
      });
    });
    await convertCMYKImg(_imgUrlArr, true);

    // 6. 更新后的 SVG 内容
    const updatedSvgContent: string = doc.toString();
    // const updatedSvgPath = path.join(outputDir, `${hashName}-out.svg`);
    // fs.writeFileSync(updatedSvgPath, updatedSvgContent, "utf-8");
    return updatedSvgContent;
  } catch (error) {
    console.error("base64转cmyk出错", error);
    throw error;
  }
}
