import { beforeAll, describe, expect, it } from "vitest";
import { getTextPaths } from "@/core/fontPaint/parse";
import { genSvgCode } from "@/core/fontPaint/generate";
import wawoff from "wawoff2";
import opentype from "opentype.js";
import path from "path";
import fs from "fs";
// vitest 在解析opentype.js的时候，会对内容重写。 而opentype.js内部做了 object.frozen，导致会报错。
describe("字体转曲测试", () => {
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
      text: "hello\nworld",
      fontSize: 30,
      textAlign: "left",
      vertical: 0,
      MaxWidth: 200,
      MaxHeight: 80,
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
});
