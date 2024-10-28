const fs = require("fs");
// const PDFDocument = require("pdfkit");
const sharp = require("sharp");

// 将图片转换为 CMYK 格式
function pngSharp() {
  sharp("./cmyk-1.png")
    .toColourspace("cmyk") // 转换为 CMYK 颜色空间
    // .withMetadata({ icc: "./cmyk-adobe-japan-2001-coated.icc" })
    .toFile("output-cmyk-color.jpg")
    .then((info) => {
      console.log(info);
      // pdf("output-cmyk-color.jpg");
    })
    .catch((err) => {
      console.error(err);
    });
}

function pdf(url) {
  // 创建 PDF 文档
  const doc = new PDFDocument({
    pdfVersion: "1.7",
  });
  const writeStream = fs.createWriteStream("output2.pdf");
  doc.pipe(writeStream);

  // 插入 CMYK 图片
  // doc.image(url, { width: 80 });
  //   doc.image("./t-img.tiff", { width: 300, x: 200, y: 200 });
  // doc.image("./output-cmyk-color-yu.jpg", { width: 300 });
  doc.image("./output.jpg", { width: 300 });

  doc.end();
}

// pdf();

pngSharp();
