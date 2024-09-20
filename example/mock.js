const PDFDocument = require("pdfkit");
const fs = require("fs");
const SVGtoPDF = require("../public/svg-to-pdfkit");

// import PDFDocument from "pdfkit";
// import fs from "fs";
// import SVGtoPDF from "svg-to-pdfkit";
// import opentype from "opentype.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import { getTextPaths } from "../src/core/fontPaint/parse.js";
// import { genSvgCode } from "../src/core/fontPaint/generate.js";
// import wawoff from "wawoff2";

// const __filename = fileURLToPath(import.meta.url); // 转换为文件路径
// const __dirname = path.dirname(__filename); // 获取目录名

// const fontPath = path.join(__dirname, "./fonts/font.woff2");
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

  // const font = opentype.parse(arrayBuffer);
  // const {
  //   pathParts: paths,
  //   pathPartsTransform,
  //   pathPartsAlignTransform,
  //   position,
  //   svgSize,
  //   lineHeight,
  //   isVertical,
  //   domBoxSize,
  //   hasCnChar,
  // } = getTextPaths(font, {
  //   text: "hello\nworld",
  //   fontSize: 30,
  //   textAlign: "left",
  //   vertical: 0,
  //   MaxWidth: 200,
  //   MaxHeight: 80,
  //   textLineHeight: 45,
  // });

  // const svgDom = genSvgCode(paths, {
  //   position,
  //   svgSize,
  //   lineHeight,
  //   isVertical,
  //   pathPartsTransform,
  //   pathPartsAlignTransform,
  //   domBoxSize,
  //   hasCnChar,
  // });
  // nodeWrite(svgDom);
  // (doc as any).addSVG(svgDom, 0, 0);
  //   doc.addPage();
}
PDFDocument.prototype.addSVG = function (svg, x, y, options) {
  return SVGtoPDF(this, svg, x, y, options);
};

const doc = new PDFDocument();

doc.text("Hello world!", 100, 100);
// doc
//   .circle(100, 50, 50)
//   .lineWidth(3)
//   .fillOpacity(0.8)
//   .fill("cmyk(55%, 30%, 10%, 5%)");
// // .fill("#ff0000");

const mockSvg = ` <svg xmlns="http://www.w3.org/2000/svg" x="0" y="0" width="78.6863mm" height="78.6863mm" 
transform=" translate(0, 5.3710317034472154e-14) ">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 109.66 109.66" width="100%" height="100%"><defs></defs><g id="图层_2" data-name="图层 2"><g id="图层_1-2" data-name="图层 1"><circle class="cls-1" cx="54.83" cy="54.83" r="54.83" style="fill: rgba(83, 36, 115, 1);">
</circle></g></g>
<style>.cls-1{fill:#405b2f;}</style>
</svg></svg>`;
doc.addSVG(mockSvg, 0, 0);
end();
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
