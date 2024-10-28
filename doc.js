const fs = require("fs");
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
    pdfVersion: "1.7",
  });
  const randomName = Math.random().toString(36).substring(3);
  // const outputName = `output-${randomName}.pdf`;
  const outputName = `svg-pdf.pdf`;
  const writeStream = fs.createWriteStream(outputName);
  // <svg xmlns="http://www.w3.org/2000/svg"
  // viewBox="0 0 61.5217 3" style="position: absolute;left:0; top: 0;overflow: hidden;width:61.5217mm;height:3mm;">

  //     <line x1="0" y1="1.5" x2="61.5217" y2="1.5" fill="#000000" stroke="#000000"   stroke-dasharray="3" stroke-dashoffset="2.563404166666667"
  //     stroke-width="3" stroke-linecap="butt"></line>

  //   </svg>

  //   <svg xmlns="http://www.w3.org/2000/svg"
  //   viewBox="0 0 61.5217 3" style="position: absolute;left:0; top: 0;overflow: hidden;width:61.5217mm;height:3mm;">

  //     <path d="M 0 1.5 H 61.5217" fill="none" stroke="#000000" stroke-dasharray="3" stroke-dashoffset="2.563404166666667" stroke-width="3" stroke-linecap="butt" />

  // </svg>

  doc.pipe(writeStream);
  const mockSvg = `

        <svg width="100mm" height="100mm" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <mask id="imageMask">
                <image  href="./assets/output_alpha.jpg" width="100mm" height="100mm" />
          </mask>
        </defs> 

        <image href="./assets/songzi_cmyk_rgb.jpg" width="100mm" height="100mm" mask="url(#imageMask)" />
      </svg>
    
  `;

  doc.addSVG(mockSvg, 0, 0, {
    colorMode: "CMYK",
  });

  doc.fill([0, 0, 0, 100]).text("Here is some text...", 100, 300);

  // doc.image("./assets/output_alpha.jpg", 0, 0, {});
  doc.end();
}
init();
pdf();
