const sharp = require("sharp");
const fs = require("fs");
const axios = require("axios");
// 输出的 PNG 文件路径
const outputPath = "svgExample.png";
const PNG = require("pngjs").PNG;
async function imgHandle(svgPath) {
  // 读取 SVG 文件
  const svgBuffer = fs.readFileSync(svgPath);

  // 使用 sharp 将 SVG 转换为 PNG
  const metadata = await sharp(svgBuffer).metadata();
  console.log("G尺寸信息:", {
    width: metadata.width,
    height: metadata.height,
  });
  // sharp(svgBuffer)
  //   .resize(metadata.width * 12, metadata.height * 12)
  //   .png()
  //   .toFile(outputPath)
  //   .then(() => {
  //     console.log("转换成功！");
  //   })
  //   .catch((err) => {
  //     console.error("转换失败：", err);
  //   });
}
imgHandle("dd.png");
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  return sizeMB;
}

function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    axios({
      url,
      method: "GET",
      responseType: "stream", // 获取流数据
    })
      .then((response) => {
        const writer = fs.createWriteStream(outputPath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      })
      .catch(reject);
  });
}
function convertToPng(input, options) {
  return new Promise((resolve, reject) => {
    const { width = 0, height = 0 } = options;
    // 读取 SVG 文件
    // const svgBuffer = fs.readFileSync(input);
    // const outputPath = input.replace(/\.svg$/, ".png");
    const svgBuffer = Buffer.from(input);
    const outputPath = "./output.jpg";
    // 使用 sharp 将 SVG 转换为 PNG
    sharp(svgBuffer)
      // 300 DPI- 300/25.4 ≈ 12
      .resize(parseInt(width) * 12, parseInt(height) * 12)
      .png({ quality: 100 })
      .toFile(outputPath)
      .then(() => {
        console.log("转换成功！");
        resolve(outputPath);
      })
      .catch((err) => {
        console.error("转换失败：", err);
        reject(err);
      });
  });
}
async function splitPng() {
  // 输入PNG文件路径
  const inputPath = "face.png";
  // 输出RGB和透明度信息的JPG文件路径
  const outputRGBPath = "output_rgb.jpg";
  const outputAlphaPath = "output_alpha.jpg";

  sharp(inputPath)
    .metadata() // 获取元数据，检查图像是否包含alpha通道
    .then((metadata) => {
      // 打印元数据信息，了解图像的通道情况
      console.log(metadata);
    });
  // 读取PNG图像
  sharp(inputPath)
    .ensureAlpha() // 确保包含透明度通道
    .toBuffer()
    .then((data) => {
      const image = sharp(data);

      // 提取RGB通道，忽略Alpha通道
      image
        // .removeAlpha() // 移除透明度通道
        .jpeg({ quality: 100 }) // 转换为高质量的JPG
        .toFile(outputRGBPath)
        .then(() => {
          console.log(`RGB信息保存为 ${outputRGBPath}`);
        })
        .catch((err) => console.error("RGB处理出错：", err));

      // 提取Alpha通道并转换为灰度图
      // image
      //   .extractChannel("alpha") // 提取透明度通道
      //   // .extractChannel(3) // 索引3 代表 Alpha 通道
      //   // .toColourspace("b-w") // 转换为灰度
      //   .jpeg({ quality: 100 }) // 转换为高质量的JPG
      //   .toFile(outputAlphaPath)
      //   .then(() => {
      //     console.log(`透明度信息保存为 ${outputAlphaPath}`);
      //   })
      //   .catch((err) => console.error("Alpha通道处理出错：", err));
    })
    .catch((err) => console.error("读取PNG图像出错：", err));
}
async function convertToCMYK(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      // 嵌入输入ICC配置文件（如果输入是RGB）
      .withMetadata({
        icc: "sRGB2014.icc", // 例如：sRGB.icc
      })
      // 应用CMYK ICC配置文件进行转换
      .toColorspace("cmyk")
      .withMetadata({
        icc: "cmyk-adobe-japan-2001-coated.icc", // 例如：USWebCoatedSWOP.icc
        intent: "absolute",
      })
      // 输出为JPEG（CMYK通常使用JPEG格式）
      // .jpeg({
      //   quality: 100,
      //   chromaSubsampling: "4:4:4", // 保持最高色彩质量
      // })
      .negate()
      .toFile(outputPath);

    console.log("转换完成");
  } catch (error) {
    console.error("转换失败:", error);
  }
}
// downloadImage(
//   "https://cdn.pacdora.com/user-materials-mockup_mockup/2ea63256-7f7f-40dd-983c-1f9cdd5e61fa.svg",
//   "svgExample.svg"
// );

// imgHandle();
// splitPng();

const mockSvg = `
    <svg data-uuid="b90b3af6-f0be-440f-9786-73756172ae29" stroke-dasharray="0" stroke-dashoffset="0"
        stroke-width="3.911458333333334" fill="#8db0ae" stroke="#000000" viewBox="0 0 29.5234 29.5234"
        style="position: absolute;left:0; top: 0;overflow: hidden;width:29.5234mm;height:29.5234mm;">

        <defs>
            <clipPath id="clip-b90b3af6-f0be-440f-9786-73756172ae29-76">
                <rect width="29.5234" height="29.5234" rx="10.037956" ry="10.037956"></rect>
            </clipPath>
        </defs>
        <rect width="29.5234" height="29.5234" rx="10.037956" ry="10.037956"
            clip-path="url(#clip-b90b3af6-f0be-440f-9786-73756172ae29-76)" stroke-linecap="butt"></rect>

    </svg>`;
// convertToPng(mockSvg, {
//   width: 29.5234,
//   height: 29.5234,
// });

const targetImg = "pp3.png";

const LIMIT_WIDTH = 4000;

function checkImgSize(imgPath) {
  return sharp(imgPath)
    .metadata()
    .then((metadata) => {
      if (metadata?.width) {
        return metadata.width > LIMIT_WIDTH;
      }
      return false;
    });
}

// 预处理大图片
async function preProcessLargeImg(imgPath) {
  const isLargeImg = await checkImgSize(imgPath);
  if (isLargeImg) {
    await resizeImg(imgPath);
  }
}
function resizeImg(imgPath) {
  return new Promise((resolve, reject) => {
    const imgPathDir = path.dirname(imgPath);
    const tempFile = `${imgPathDir}/temp_${Date.now()}${path.extname(imgPath)}`;
    sharp(imgPath)
      .resize({
        width: LIMIT_WIDTH,
        fit: "contain",
      })
      .toFile(tempFile) // 先输出到临时文件
      .then(() => {
        // 处理成功后,用临时文件替换原文件
        console.log("图片resize处理完成,原文件已更新");
        fs.promises.rename(tempFile, imgPath).then(() => {
          resolve();
        });
      })
      .catch((err) => {
        console.error("resize处理出错:", err);
        // 发生错误时,清理临时文件
        fs.unlink(tempFile, () => {});
        reject(err);
      });
  });
}
