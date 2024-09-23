import { beforeAll, describe, expect, it } from "vitest";
import { parseText } from "@/core/fontPaint/parse";
import { transformText } from "@/core/fontPaint/transform";
import { genTextSvg } from "@/core/fontPaint/generate";
import { getDefaultFontApp } from "@/core/fontPaint/utils";
import { defaultTransformParams, fsSaveFile } from "./config";
import wawoff from "wawoff2";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
// vitest 在解析opentype.js的时候，会对内容重写。 而opentype.js内部做了 object.frozen，导致会报错。
describe("英文字体转曲测试 水平书写", () => {
  let fontApp: any = null;
  let unitsPerEm = 0;
  let ascent = 0;
  let descent = 0;
  beforeAll(async () => {
    try {
      const fontPath = path.join(
        __dirname,
        "../../../example/fonts/en.woff2"
        // "../../../dist/cache/54d95ea433703297b262df78ff9905c3.woff2"
      );

      const buffer = await fs.promises.readFile(fontPath);
      const data = await wawoff.decompress(buffer);
      const arrayBuffer = data.buffer.slice(
        data.byteOffset,
        data.byteOffset + data.byteLength
      );
      fontApp = opentype.parse(arrayBuffer);
      // let copy = Object.assign({}, fontApp);
      // delete copy.cffEncoding;
      // delete copy.subrs;
      // delete copy.gsubrs;

      // console.log("fontApp", copy);

      unitsPerEm = fontApp.unitsPerEm;
      ascent = fontApp.ascender;
    } catch (error) {
      console.error("Error reading file:", error);
      throw error; // 重新抛出错误以便 Vitest 能够报告它
    }
  });
  it.only("英文 /n换行情况", async () => {
    const defaultFontApp = await getDefaultFontApp();
    const parseResult = parseText(
      fontApp,
      {
        text: "hello\nworld 啊",
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
      },
      defaultFontApp
    );
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    fsSaveFile(svgDom);

    expect(svgDom).toMatchSnapshot();
  });
  it("英文 单行居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "hello",
      fontSize: 30,
      textAlign: "center",
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
});
