const opentype = require("opentype.js");
const wawoff = require("wawoff2");
const fs = require("fs");
const path = require("path");
const fontPath = path.join(__dirname, "./fonts/NotoSansCJK-Regular.ttf");
const fontPath2 = path.join(__dirname, "./fonts/en.woff2");
const tempFontPath = path.join(__dirname, "tempFont.ttf"); // 可以根据需要调整路径

async function main() {
  const data = fs.readFileSync(fontPath2);
  const font2Data = await wawoff.decompress(data);
  // 创建一个临时文件路径

  // 将解压后的字体数据写入临时文件
  fs.writeFileSync(tempFontPath, Buffer.from(font2Data));

  const font2 = await opentype.load(tempFontPath);

  const font1 = await opentype.load(fontPath);
  console.log(font2.glyphs);

  // 创建一个新的字体对象
  const glyphs = [];
  return;
  // 从第一个字体中提取所需的字形
  font1.glyphs.glyphs.forEach(function (glyph) {
    glyphs.push(glyph);
  });

  // 从第二个字体中提取所需的字形
  font2.glyphs.glyphs.forEach(function (glyph) {
    glyphs.push(glyph);
  });

  // 创建新字体
  const newFont = new opentype.Font({
    familyName: "MergedFont",
    styleName: "Regular",
    unitsPerEm: font1.unitsPerEm,
    ascender: font1.ascender,
    descender: font1.descender,
    glyphs: glyphs,
  });

  // 导出新字体文件
  //   const arrayBuffer = newFont.toArrayBuffer();
  //   const blob = new Blob([arrayBuffer], { type: "font/ttf" });

  // 使用新字体绘制文字轮廓
  const path = newFont.getPath("Hello", 0, 150, 72);
  console.log("path", path);

  //   path.draw(ctx); // 假设你已经有了一个canvas上下文 `ctx`
}

main();
