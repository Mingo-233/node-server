const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const SVGtoPDF = require("./public/svg-to-pdfkit.js");

function init() {
  PDFDocument.prototype.addSVG = function (svg, x, y, options) {
    return SVGtoPDF(this, svg, x, y, options);
  };
}
function pdf() {
  // 创建 PDF 文档
  const doc = new PDFDocument({
    pdfVersion: "1.4",
  });
  // const randomName = Math.random().toString(36).substring(3);
  const fontPath = path.join(__dirname, "assets/NotoSansCJK-Regular.ttf");
  console.log("fontPath", fontPath);
  doc.registerFont("my-font", fontPath, "my-font-regular");

  const outputName = `svg-pdf.pdf`;
  const writeStream = fs.createWriteStream(outputName);

  doc.pipe(writeStream);

  // const mockSvgImg = `
  //   <svg xmlns="http://www.w3.org/2000/svg">
  //       <style>
  //           text {
  //               fill: #ff0000;
  //           }
  //       </style>
  //       <text x="25" y="15" fill="#0000ff" style="fill: #00ff00;" font-size="16">
  //           Hello, out there
  //       </text>
  //   </svg>
  // `;
  const mockSvgImg = fs.readFileSync("./mocksvg.svg", "utf8");
  // style="fill: rgba(81, 89, 54, 1);"></path>

  doc.addSVG(mockSvgImg, 100, 100, {
    colorMode: "RGB",
    // fontCallback: function () {
    //   // return "my-font";
    //   return undefined;
    // },
  });
  // doc.font("my-font").text("This aaa is啊啊!").moveDown(0.5);
  // doc.font("assets/NotoSansCJK-Regular.ttf").text("This is啊啊!").moveDown(0.5);
  // doc.fill([0, 0, 0, 100]).text("Here is some text...", 100, 300);
  // doc.image("./assets/output_alpha.jpg", 0, 0, {});
  doc.end();
}
init();
pdf();
