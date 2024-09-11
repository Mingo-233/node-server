import { beforeAll, describe, expect, it } from "vitest";
import { getTextPaths } from "@/core/fontPaint/parse";
import { genSvgCode } from "@/core/fontPaint/generate";
import wawoff from "wawoff2";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
// vitest 在解析opentype.js的时候，会对内容重写。 而opentype.js内部做了 object.frozen，导致会报错。
describe("中文字体转曲测试 垂直书写", () => {
  let fontApp: any = null;
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
    } catch (error) {
      console.error("Error reading file:", error);
      throw error; // 重新抛出错误以便 Vitest 能够报告它
    }
  });
  it("中文 /n换行情况", async () => {
    const {
      pathParts: paths,
      pathPartsTransform,
      pathPartsAlignTransform,
      position,
      svgSize,
      lineHeight,
      isVertical,
      domBoxSize,
      hasCnChar,
    } = getTextPaths(fontApp, {
      text: "汉字\n世界",
      fontSize: 30,
      textAlign: "left",
      vertical: 1,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
    });
    expect(Object.keys(paths).length).toBe(2);
    const svgDom = genSvgCode(paths, {
      position,
      svgSize,
      lineHeight,
      isVertical,
      pathPartsTransform,
      pathPartsAlignTransform,
      domBoxSize,
      hasCnChar,
    });
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it("中文 单行居中情况", async () => {
    const {
      pathParts: paths,
      pathPartsTransform,
      pathPartsAlignTransform,
      position,
      svgSize,
      lineHeight,
      isVertical,
      domBoxSize,
      hasCnChar,
    } = getTextPaths(fontApp, {
      text: "单行居中",
      fontSize: 30,
      textAlign: "center",
      vertical: 1,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
    });
    expect(Object.keys(paths).length).toBe(1);
    const svgDom = genSvgCode(paths, {
      position,
      svgSize,
      lineHeight,
      isVertical,
      pathPartsTransform,
      pathPartsAlignTransform,
      domBoxSize,
      hasCnChar,
    });
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it("中文 超出换行 居中情况", async () => {
    const {
      pathParts: paths,
      pathPartsTransform,
      pathPartsAlignTransform,
      position,
      svgSize,
      lineHeight,
      isVertical,
      domBoxSize,
      hasCnChar,
    } = getTextPaths(fontApp, {
      text: "你好 超出换行啊啊啊啊啊",
      fontSize: 30,
      textAlign: "center",
      vertical: 1,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 45,
    });
    expect(Object.keys(paths).length).toBe(2);
    const svgDom = genSvgCode(paths, {
      position,
      svgSize,
      lineHeight,
      isVertical,
      pathPartsTransform,
      pathPartsAlignTransform,
      domBoxSize,
      hasCnChar,
    });
    // 生成快照
    expect(svgDom).toMatchSnapshot();
  });
  it.only("中文英文都存在 超出换行 居中情况", async () => {
    const {
      pathParts: paths,
      pathPartsTransform,
      pathPartsAlignTransform,
      position,
      svgSize,
      lineHeight,
      isVertical,
      domBoxSize,
      hasCnChar,
    } = getTextPaths(fontApp, {
      text: "你好 超出 ABCDEFG又是",
      fontSize: 30,
      textAlign: "left",
      vertical: 1,
      MaxWidth: 80,
      MaxHeight: 200,
      textLineHeight: 36,
    });
    expect(Object.keys(paths).length).toBe(2);
    const svgDom = genSvgCode(paths, {
      position,
      svgSize,
      lineHeight,
      isVertical,
      pathPartsTransform,
      pathPartsAlignTransform,
      domBoxSize,
      hasCnChar,
    });
    // 生成快照
    expect(svgDom).toMatchSnapshot();
    fsSaveFile(svgDom);
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
