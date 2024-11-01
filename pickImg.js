const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { DOMParser } = require("xmldom");
const xpath = require("xpath");

/**
 * 从 SVG 中提取 Base64 图片并保存到本地
 * @param {string} svgPath - SVG 文件路径
 * @param {string} outputDir - 输出 PNG 文件的目录
 * @returns {Promise<void>}
 */
async function processSvg(svgPath, outputDir) {
  // 1. 读取 SVG 文件内容
  const svgContent = fs.readFileSync(svgPath, "utf-8");

  // 2. 解析 SVG 文件，考虑命名空间
  const doc = new DOMParser().parseFromString(svgContent, "text/xml");

  // 创建带命名空间的 XPath 解析器
  const select = xpath.useNamespaces({
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink",
  });

  // 使用带命名空间的 XPath 表达式查找 <image> 标签
  const imageNodes = select(
    '//svg:image[contains(@xlink:href, "base64")]',
    doc
  );

  // 检查是否找到 <image> 标签
  if (imageNodes.length === 0) {
    console.log("没有找到包含 Base64 图片的 <image> 标签。");
    return;
  }

  // 3. 创建输出目录
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 4. 遍历所有 Base64 图像节点
  for (let i = 0; i < imageNodes.length; i++) {
    const imageNode = imageNodes[i];
    const href = imageNode.getAttribute("xlink:href");

    // 提取 Base64 数据
    const base64Data = href.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // 定义 PNG 文件名并保存
    const fileName = `image${i + 1}.png`;
    const filePath = path.join(outputDir, fileName);
    console.log("filePath:", filePath);

    await sharp(buffer).toFile(filePath);

    // 5. 更新 SVG 中的 href 属性为新的本地文件路径
    imageNode.setAttribute("xlink:href", "./" + filePath);
  }

  // 6. 将更新后的 SVG 内容保存到本地
  const updatedSvgContent = doc.toString();
  const updatedSvgPath = path.join(outputDir, "updated.svg");
  fs.writeFileSync(updatedSvgPath, updatedSvgContent, "utf-8");

  console.log(`SVG 文件处理完成。更新后的文件保存在：${updatedSvgPath}`);
}

// 调用示例
processSvg("./temp.svg", "./output").catch(console.error);
