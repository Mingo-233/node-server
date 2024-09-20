const PDFDocument = require("pdfkit");
const fs = require("fs");
const SVGtoPDF = require("../public/svg-to-pdfkit");
const { getDefaultFontApp } = require("../dist/src/core/fontPaint/index");
const wawoff = require("wawoff2");
const path = require("path");
const opentype = require("opentype.js");
// import PDFDocument from "pdfkit";
// import fs from "fs";
// import SVGtoPDF from "svg-to-pdfkit";
// import opentype from "opentype.js";
// import { fileURLToPath } from "url";
// import { getTextPaths } from "../src/core/fontPaint/parse.js";
// import { genSvgCode } from "../src/core/fontPaint/generate.js";

// const __filename = fileURLToPath(import.meta.url); // 转换为文件路径
// const __dirname = path.dirname(__filename); // 获取目录名

const fontPath = path.join(__dirname, "./fonts/NotoSansMonoCJKkr-Regular.ttf");
// const fontPath = path.join(__dirname, "./fonts/NotoSansMonoCJKkr-Regular.otf");

async function opentypeParse() {
  const data = fs.readFileSync(fontPath);
  // const data = await wawoff.decompress(fontFile);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  let fontApp = opentype.parse(arrayBuffer);

  // fontApp = await getDefaultFontApp();
  const path = fontApp.getPath("啊", 0, 0, 12);
  // console.log(path);
  const svgString = path.toSVG();
  console.log(svgString);
}
opentypeParse();
PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options);
};

const doc = new PDFDocument();
doc.fontSize(12).text("Hello world!", 100, 100);
// doc.fontSize(6).text("Hello world!", 200, 100);
// doc
//   .circle(100, 50, 50)
//   .lineWidth(3)
//   .fillOpacity(0.8)
//   .fill("cmyk(55%, 30%, 10%, 5%)");
// // .fill("#ff0000");

// doc.addSVG(mockSvg, 0, 0);
// end();
function end() {
  const randomName = Math.random().toString(36).substring(7);
  doc.pipe(fs.createWriteStream(`./${randomName}.pdf`));
  doc.end();
}

// node本地输出文件 svg 内容
function nodeWrite(svg) {
  const randomName = Math.random().toString(36).substring(7);
  fs.writeFileSync(`./${randomName}.svg`, svg);
}
