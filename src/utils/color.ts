import sharp from "sharp";
import fs from "fs";
import path from "path";
import { IColorMode } from "@/type/pdfPage";

// jsColorEngine 这个库 npm上的包在node环境加载有问题，public引用的是改造过本地编译后版本
const jsColorEngine = require("../../public/jsColorEngine");
let rgbProfile: any = null;
let cmykProfile: any = null;
export async function loadIccProfile() {
  rgbProfile = new jsColorEngine.Profile();
  rgbProfile.load("*sRGB");
  cmykProfile = new jsColorEngine.Profile();
  const iccPath = path.join(
    __dirname,
    "../../public/cmyk-adobe-japan-2001-coated.icc"
  );
  const iccFilePath = "file:" + iccPath;
  await cmykProfile.loadPromise(iccFilePath);
}
export function hexToCMYK(hex) {
  // 去掉 '#' 符号
  hex = hex.trim().replace(/^#/, "");
  // 将十六进制转换为 RGB

  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  return rgbToCmykByIcc(r, g, b);
}

export function fitColor(color: string, colorMode: IColorMode) {
  return colorMode === "CMYK" ? convertCMYK(color) : color;
}

export function convertCMYK(value) {
  if (value.startsWith("rgb")) {
    const rgbValues = value.match(/\d+/g).map(Number);
    return rgbToCmykByIcc(rgbValues[0], rgbValues[1], rgbValues[2]);
  } else {
    return hexToCMYK(value);
  }
}

export function rgbToCmykByIcc(r, g, b) {
  try {
    let rgb2cmykTransform = new jsColorEngine.Transform();
    rgb2cmykTransform.create(
      rgbProfile,
      cmykProfile,
      jsColorEngine.eIntent.perceptual
    );
    // let rgbColor = jsColorEngine.color.RGB(174, 151, 204);
    let rgbColor = jsColorEngine.color.RGB(r, g, b);
    let cmykColor = rgb2cmykTransform.transform(rgbColor);
    return `cmyk(${cmykColor.C}, ${cmykColor.M}, ${cmykColor.Y}, ${cmykColor.K})`;
  } catch (error) {
    console.error("cmyk颜色转化出错-icc", error);
    throw error;
  }
}
