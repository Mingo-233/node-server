import { beforeAll, describe, expect, it } from "vitest";
import { parseText } from "@/core/fontPaint/parse";
import { transformText } from "@/core/fontPaint/transform";
import { genTextSvg } from "@/core/fontPaint/generate";
import { defaultTransformParams } from "./config";

import wawoff from "wawoff2";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
// vitest 在解析opentype.js的时候，会对内容重写。 而opentype.js内部做了 object.frozen，导致会报错。
describe("中文字体转曲测试 水平书写", () => {
  let fontApp: any = null;
  let unitsPerEm = 0;
  let ascent = 0;
  let descent = 0;
  beforeAll(async () => {
    try {
      const fontPath = path.join(
        __dirname,
        "../../../example/fonts/HarmonyOS_Regular.ttf"
      );
      const buffer = await fs.promises.readFile(fontPath);

      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      fontApp = opentype.parse(arrayBuffer);
      unitsPerEm = fontApp.unitsPerEm;
      ascent = fontApp.ascender;
    } catch (error) {
      console.error("Error reading file:", error);
      throw error; // 重新抛出错误以便 Vitest 能够报告它
    }
  });
  it("中文 /n换行情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "汉字\n世界",
      fontSize: 30,
      textAlign: "left",
      vertical: false,
      MaxWidth: 200,
      MaxHeight: 80,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        ascent,
        descent,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it("中文 单行居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "单行居中",
      fontSize: 30,
      textAlign: "center",
      vertical: false,
      MaxWidth: 200,
      MaxHeight: 80,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        descent,
        ascent,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(1);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    expect(svgDom).toMatchSnapshot();
  });
  it("中文 超出换行 居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "你好 超出换行啊啊啊啊啊",
      fontSize: 30,
      textAlign: "center",
      vertical: false,
      MaxWidth: 200,
      MaxHeight: 80,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        descent,
        ascent,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    expect(svgDom).toMatchSnapshot();
  });
});
