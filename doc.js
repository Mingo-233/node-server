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
    pdfVersion: "1.4",
  });
  // const randomName = Math.random().toString(36).substring(3);
  const outputName = `svg-pdf.pdf`;
  const writeStream = fs.createWriteStream(outputName);

  doc.pipe(writeStream);

  const mockSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30mm" height="30mm">
        <svg xmlns="http://www.w3.org/2000/svg" data-uuid="b90b3af6-f0be-440f-9786-73756172ae29" stroke-dasharray="0"
            stroke-dashoffset="0" stroke-width="4" fill="#17948d" stroke="#000000" viewBox="0 0 30 30"
            style="width:30mm;height:30mm;">
            <defs>

                <mask id="clip-b90b3af6-f0be-440f-9786-73756172ae29">
                    <rect width="30" height="30" rx="12" ry="12" fill="#fff" />
                </mask>
            </defs>

            <rect stroke-width="8" width="30" height="30" rx="12" ry="12"
                mask="url(#clip-b90b3af6-f0be-440f-9786-73756172ae29)" stroke-linecap="butt" />

        </svg>
    </svg>
  `;
  // <rect stroke-width="8"  width="30" height="30" rx="12" ry="12"  mask="url(#clip-b90b3af6-f0be-440f-9786-73756172ae29)"

  // clip-path="url(#clip-b90b3af6-f0be-440f-9786-73756172ae29)" stroke-linecap="butt" />

  const mockSvgImg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="29.5234mm" height="29.5234mm" opacity="0.5">
<image href="./output.png"  width="29.5234mm" height="29.5234mm" />
    </svg>
  `;

  doc.addSVG(mockSvgImg, 0, 0, {
    colorMode: "RGB",
  });
  // doc.fill([0, 0, 0, 100]).text("Here is some text...", 100, 300);
  // doc.image("./assets/output_alpha.jpg", 0, 0, {});
  doc.end();
}
init();
pdf();
