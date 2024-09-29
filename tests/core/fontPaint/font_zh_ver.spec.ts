import { beforeAll, describe, expect, it } from "vitest";
import { parseText } from "@/core/fontPaint/parse";
import { transformText } from "@/core/fontPaint/transform";
import { genTextSvg } from "@/core/fontPaint/generate";
import { defaultTransformParams } from "./config";
import wawoff from "wawoff2";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
import { getDefaultFontApp } from "@/core/fontPaint";
// vitest 在解析opentype.js的时候，会对内容重写。 而opentype.js内部做了 object.frozen，导致会报错。
describe("中文字体转曲测试 垂直书写", () => {
  let fontApp: any = null;
  let unitsPerEm = 0;
  let ascent = 0;
  let descent = 0;
  beforeAll(async () => {
    try {
      // const fontPath = path.join(
      //   __dirname,
      //   "../../../example/fonts/HarmonyOS_Regular.ttf"
      // );
      const fontPath = path.join(
        __dirname,
        "../../../example/fonts/Gilroy-Regular.otf"
      );
      const buffer = await fs.promises.readFile(fontPath);

      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      fontApp = opentype.parse(arrayBuffer);
      unitsPerEm = fontApp.unitsPerEm;
      ascent = fontApp.ascender;
      descent = fontApp.descender;
      console.log("");
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
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        ascent,
        descent,
        isSupCnMainFontApp: true,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);

    expect(svgDom).toMatchSnapshot();
  });
  it("中文 单行居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "单行居中",
      fontSize: 30,
      textAlign: "center",
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        ascent,
        descent,
        isSupCnMainFontApp: true,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(1);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it("中文 超出换行 居中情况", async () => {
    const parseResult = parseText(fontApp, {
      text: "你好 超出换行啊啊啊啊啊",
      fontSize: 30,
      textAlign: "center",
      vertical: true,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
      rotate: 0,
      fontOption: {
        unitsPerEm,
        ascent,
        descent,
        isSupCnMainFontApp: true,
      },
    });
    expect(Object.keys(Object.keys(parseResult.pathPart)).length).toBe(2);
    const config = transformText(parseResult, defaultTransformParams);
    const svgDom = genTextSvg(config);
    expect(svgDom).toMatchSnapshot();
  });
  it.only("中文英文都存在 超出换行 居左情况", async () => {
    const defaultFontApp = await getDefaultFontApp();

    const parseResult = parseText(
      fontApp,
      {
        text: "Your text here啊啊啊是",
        fontSize: 16,
        textAlign: "left",
        vertical: true,
        MaxWidth: 48,
        MaxHeight: 150,
        textLineHeight: 24,
        rotate: 0,
        fontOption: {
          unitsPerEm,
          ascent,
          descent,
          isSupCnMainFontApp: false,
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
});

function fsSaveFile(context, name = "test.svg") {
  const fs = require("fs");
  const path = require("path");
  const pwdPath = process.cwd();
  const filePath = path.resolve(pwdPath, "./output");
  fs.writeFileSync(`${filePath}/${name}`, context);
  console.log("file saved");
}
