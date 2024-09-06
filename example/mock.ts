// const PDFDocument = require("pdfkit");
// const fs = require("fs");

import PDFDocument from "pdfkit";
import fs from "fs";
import SVGtoPDF from "svg-to-pdfkit";
import opentype from "opentype.js";
import path from "path";
import { fileURLToPath } from "url";
import { getTextPaths } from "../src/core/fontPaint/parse.js";
import { genSvgCode } from "../src/core/fontPaint/generate.js";
import wawoff from "wawoff2";

const __filename = fileURLToPath(import.meta.url); // 转换为文件路径
const __dirname = path.dirname(__filename); // 获取目录名

const fontPath = path.join(__dirname, "./fonts/font.woff2");
async function loadFont() {
  const buffer = await fs.promises.readFile(fontPath);
  wawoff.decompress(buffer).then((out) => {
    opentypeParse(out);
  });
}
// loadFont();

function opentypeParse(data) {
  // const decompressed = Module.decompress(data);
  // const font = opentype.parse(decompressed);
  // 将 Buffer 转换为 ArrayBuffer
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );

  const font = opentype.parse(arrayBuffer);
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
  } = getTextPaths(font, {
    text: "hello\nworld",
    fontSize: 30,
    textAlign: "left",
    vertical: 0,
    MaxWidth: 200,
    MaxHeight: 80,
    textLineHeight: 45,
  });

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
  nodeWrite(svgDom);
  (doc as any).addSVG(svgDom, 0, 0);
  //   doc.addPage();

  //   doc.text("Hello world!", 100, 100);
  //   doc
  //     .circle(100, 50, 50)
  //     .lineWidth(3)
  //     .fillOpacity(0.8)
  //     .fill("cmyk(55%, 30%, 10%, 5%)");
  end();
}
PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options);
};

const doc = new PDFDocument();

function end() {
  const randomName = Math.random().toString(36).substring(7);
  doc.pipe(fs.createWriteStream(`./${randomName}.pdf`));
  doc.end();
}

// node本地输出文件 svg 内容
function nodeWrite(svg: string) {
  const randomName = Math.random().toString(36).substring(7);
  fs.writeFileSync(`./${randomName}.svg`, svg);
}
