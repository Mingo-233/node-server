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
  const font2GlyphsNum = font1.glyphs.numGlyphs;
  // 创建一个新的字体对象
  const glyphsMerge = font1.glyphs.glyphs;
  let font2GlyphsArr = Object.keys(font2.glyphs.glyphs);
  console.log("font1GlyphsArr", font2GlyphsArr);
  font2GlyphsArr.forEach((i) => {
    let newIndex = Number(i) + Number(font2GlyphsNum) + 1;
    glyphsMerge[newIndex] = font2.glyphs.glyphs[i];
  });
  console.log("font1.unitsPerEm", font1.unitsPerEm);
  function objToArray(obj) {
    let arr = [];
    for (let i in obj) {
      arr.push(obj[i]);
    }
    return arr;
  }
  // 假设 font1 和 font2 都有 kerningPairs 属性
  const mergedKerningPairs = { ...font1.kerningPairs, ...font2.kerningPairs };

  for (const [pair, value] of Object.entries(font2.kerningPairs)) {
    // 根据需要调整字距对的键
    // 这里假设 simple merging
    mergedKerningPairs[pair] = value;
  }
  // 创建新字体
  const newFont = new opentype.Font({
    familyName: "MergedFont",
    styleName: "Regular",
    unitsPerEm: font1.unitsPerEm,
    ascender: font1.ascender,
    descender: font1.descender,
    glyphs: [objToArray(glyphsMerge)].flat(),
    kerningPairs: mergedKerningPairs,
  });

  // 导出新字体文件
  //   const arrayBuffer = newFont.toArrayBuffer();
  //   const blob = new Blob([arrayBuffer], { type: "font/ttf" });

  // Ensure all characters are present
  const text = "啊你嗯";
  const missingGlyphs = [];
  // 使用新字体绘制文字轮廓
  for (const char of text) {
    const glyph = newFont.charToGlyph(char);
    if (!glyph) {
      missingGlyphs.push(char);
    }
  }

  if (missingGlyphs.length > 0) {
    console.error("Missing glyphs for characters:", missingGlyphs.join(", "));
  } else {
    // Use the new font to draw the text path
    const path = newFont.getPath(text, 0, 150, 72);
    console.log("path", path.toSVG());
  }
  //   path.draw(ctx); // 假设你已经有了一个canvas上下文 `ctx`
}

main();
