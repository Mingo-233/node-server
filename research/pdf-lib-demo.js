const pdfLib = require("pdf-lib");
const fs = require("fs");

// const imageUrl = "./hema.png";
// const imageUrl = "./yanse.jpg";
const imageUrl = "./output-cmyk-image.jpg";

async function main() {
  // PDF Creation
  const pdfDoc = await pdfLib.PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText("You can create PDFs!");
  const png_uint8Array = fs.readFileSync(imageUrl);
  //   const pngImage = await pdfDoc.embedPng(png_uint8Array);
  const pngImage = await pdfDoc.embedJpg(png_uint8Array);
  const pngDims = pngImage.scale(1);
  page.drawImage(pngImage, {
    x: 50, // X 坐标∂
    y: page.getHeight() - pngDims.height - 50, // Y 坐标
    width: pngDims.width,
    height: pngDims.height,
    blendMode: "Multiply",
  });

  const pdfBytes = await pdfDoc.save();
  // 用node 读取 pdfBytes生成pdf文件 名字为 output.pdf
  fs.writeFileSync("output.pdf", pdfBytes);
}

main();
