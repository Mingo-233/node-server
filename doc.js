const fs = require("fs");
const PDFDocument = require("pdfkit");
function pdf() {
  // 创建 PDF 文档
  const doc = new PDFDocument({
    pdfVersion: "1.7",
  });
  const writeStream = fs.createWriteStream("output3.pdf");
  doc.pipe(writeStream);

  doc.fill([0, 0, 0, 100]).text("Here is some text...", 100, 300);
  doc.end();
}

pdf();
