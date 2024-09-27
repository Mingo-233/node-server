const fs = require("fs");
const PDFDocument = require("pdfkit");
const sharp = require("sharp");

// 将图片转换为 CMYK 格式
function pngSharp() {
  sharp("./cmyk-1.png")
    .toColourspace("cmyk") // 转换为 CMYK 颜色空间
    // .withMetadata({ icc: "cmyk-adobe-japan-2001-coated.icc" })
    .toFile("output-cmyk-color.jpg")
    .then((info) => {
      console.log(info);
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
  //   doc.image(url, { width: 300 });
  //   doc.image("./hema.png", { width: 300, x: 100, y: 100, link: "./hema.png" });
  // doc.image("./output-cmyk-color.jpg", { width: 300, x: 200, y: 200 });
  //   doc.image("./t-img.tiff", { width: 300, x: 200, y: 200 });
  doc.image("./invert-cmyk.jpg", { width: 300 });

  doc.end();
}
async function invertCMYKImage(inputImagePath, outputImagePath) {
  const image = sharp(inputImagePath);

  // 提取图像的原始像素数据
  const { data, info } = await image
    .raw()
    .toBuffer({ resolveWithObject: true });

  // 创建一个新的Buffer来存储逆转后的像素数据
  const invertedData = Buffer.alloc(data.length);

  // 遍历每个像素的通道数据，进行逆转
  for (let i = 0; i < data.length; i += 4) {
    // CMYK 通道依次为 C (data[i]), M (data[i + 1]), Y (data[i + 2]), K (data[i + 3])
    invertedData[i] = 255 - data[i]; // 逆转青色 (C)
    invertedData[i + 1] = 255 - data[i + 1]; // 逆转品红色 (M)
    invertedData[i + 2] = 255 - data[i + 2]; // 逆转黄色 (Y)
    invertedData[i + 3] = 255 - data[i + 3]; // 逆转黑色 (K)
  }

  // 使用逆转后的数据创建新的CMYK图像
  await sharp(invertedData, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4, // CMYK有4个通道
    },
  }).toFile(outputImagePath); // 输出逆转颜色的图片

  console.log(`Image has been inverted and saved to ${outputImagePath}`);
}

// 将 RGB 图片转换为 CMYK，逆转 CMYK 通道并保存
async function convertAndInvertImage(inputPath, outputPath) {
  try {
    // 读取输入图片
    const inputBuffer = await fs.promises.readFile(inputPath);

    // 使用Sharp处理图片
    await sharp(inputBuffer)
      // 转换为CMYK
      .toColorspace("cmyk")
      // 反转颜色
      .negate()
      // 保存为JPEG (CMYK兼容)
      .jpeg({ quality: 100 })
      .toFile(outputPath);

    console.log("图片处理完成!");
  } catch (error) {
    console.error("处理图片时出错:", error);
  }
}

pdf();

// pngSharp();

// convertAndInvertImage("./cmyk-1.png", "./invert-cmyk.jpg");
