const {
  Profile,
  Transform,
  eIntent,
  convert,
  color,
} = require("./public/jsColorEngine");
const sharp = require("sharp");
async function main() {
  let rgbProfile = new Profile();
  rgbProfile.load("*sRGB");
  let cmykProfile = new Profile();
  await cmykProfile.loadPromise(
    "file:/Users/mingo/Documents/github-demo/node-server/cmyk-adobe-japan-2001-coated.icc"
  );
  let rgb2cmykTransform = new Transform();
  rgb2cmykTransform.create(rgbProfile, cmykProfile, eIntent.perceptual);
  let rgbColor = color.RGB(102, 46, 32); // Example RGB color

  let cmykColor = rgb2cmykTransform.transform(rgbColor);
  console.log(
    `CMYK: ${cmykColor.C}, ${cmykColor.M}, ${cmykColor.Y}, ${cmykColor.K}`
  );
}
// main();

async function convertImageColor(inputPath, outputPath) {
  try {
    // 1. 创建颜色转换实例
    const transform = new Transform({
      dataFormat: "int8", // 使用8位整数格式
      builtLut: true, // 使用查找表优化
      optimise: true, // 启用优化
    });
    let rgbProfile = new Profile();
    rgbProfile.load("*sRGB");
    let cmykProfile = new Profile();
    await cmykProfile.loadPromise(
      "file:/Users/mingo/Documents/github-demo/node-server/cmyk-adobe-japan-2001-coated.icc"
    );
    // 2. 创建颜色转换配置
    // 这里以 RGB -> CMYK 为例
    transform.create(
      rgbProfile, // 输入配置文件
      cmykProfile, // 输出配置文件
      0 // 意图(0=知觉, 1=相对比色, 2=饱和度, 3=绝对比色)
    );

    // 3. 读取图像
    const { data, info } = await sharp(inputPath)
      .raw() // 获取原始像素数据
      .toBuffer({
        resolveWithObject: true,
      });

    // 将 Buffer 转换为 Uint8Array
    const inputArray = new Uint8Array(data);
    const channels = info.channels; // 通常是 3 (RGB) 或 4 (RGBA)
    const pixelCount = info.width * info.height;

    console.log("图像信息:", {
      width: info.width,
      height: info.height,
      channels: channels,
      pixelCount: pixelCount,
    });

    // 4. 进行颜色转换
    const convertedData = transform.transformArray(
      inputArray, // 输入数据
      channels === 4, // 输入包含alpha通道
      false, // 输出不需要alpha通道
      false, // 不保留alpha通道
      pixelCount, // 自动计算像素数
      "int8" // 输出格式为8位整数
    );
    console.log("convertedData", convertedData);

    // 5. 创建新图像并保存
    await sharp(convertedData, {
      raw: {
        width: info.width,
        height: info.height,
        channels: 4, // CMYK有4个通道
      },
    }).toFile(outputPath);

    console.log("颜色转换完成!");
  } catch (error) {
    console.error("转换过程中出错:", error);
  }
}
convertImageColor("Snipaste1.png", "output.png");
