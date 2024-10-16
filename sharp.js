const sharp = require("sharp");
const fs = require("fs");
const axios = require("axios");
// SVG 文件的路径
const svgPath = "svgExample.svg";
// 输出的 PNG 文件路径
const outputPath = "svgExample.png";

function imgHandle() {
  // 读取 SVG 文件
  const svgBuffer = fs.readFileSync(svgPath);

  // 使用 sharp 将 SVG 转换为 PNG
  sharp(svgBuffer)
    .resize(253, 460)
    .png()
    .toFile(outputPath)
    .then(() => {
      console.log("转换成功！");
    })
    .catch((err) => {
      console.error("转换失败：", err);
    });
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

// downloadImage(
//   "https://cdn.pacdora.com/user-materials-mockup_mockup/2ea63256-7f7f-40dd-983c-1f9cdd5e61fa.svg",
//   "svgExample.svg"
// );

imgHandle();
