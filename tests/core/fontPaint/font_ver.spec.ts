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
describe("英文字体转曲测试 垂直书写", () => {
  let fontApp: any = null;
  beforeAll(async () => {
    try {
      const fontPath = path.join(
        __dirname,
        "../../../example/fonts/font.woff2"
      );
      const buffer = await fs.promises.readFile(fontPath);
      const data = await wawoff.decompress(buffer);
      const arrayBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
      );
      fontApp = opentype.parse(arrayBuffer);
    } catch (error) {
      console.error("Error reading file:", error);
      throw error; // 重新抛出错误以便 Vitest 能够报告它
    }
  });
  it("英文 /n换行情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "hello\nworld",
      fontSize: 30,
      textAlign: "left",
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    expect(svgDom).toMatchSnapshot();
  });
  it("英文 单行居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "hello",
      fontSize: 30,
      textAlign: "center",
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(1);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it("英文 超出换行 居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "hello abcdefgh",
      fontSize: 30,
      textAlign: "center",
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
});
