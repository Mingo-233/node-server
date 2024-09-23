import opentype from "opentype.js";
import { fetchAssets } from "@/utils/request";
import { IPathPart } from "@/type/parse";
export function createWordPathContext() {
  const context = {
    word: "",
    line: 0, //层数
    pathPart: {
      0: {
        part: [],
        transform: [],
        alignTransform: [],
      },
    } as any,
    resetWord() {
      context.word = "";
    },
    addWord(text) {
      context.word += text;
    },
    backWord() {
      context.word = context.word.slice(0, -1);
    },
    addPath(path) {
      context.pathPart[context.line].part.push(path);
    },
    nextLine() {
      context.line = context.line + 1;
      context.pathPart[context.line] = {
        part: [],
        transform: [],
        alignTransform: [],
      };
    },
    addTransform(transform) {
      context.pathPart[context.line].transform.push(transform);
    },
    addAlignTransform(transform) {
      context.pathPart[context.line].alignTransform.push(transform);
    },
  };
  return context;
}
//   截止判断
export function isEnd(char) {
  // 1. 遇到中文
  if (isSymbolChar(char)) return true;
  // 2. 字符结束
  if (char === undefined || char === null) return true;
  if (char === "\n") return true;
}
// [\u4e00-\u9fff]：匹配中文汉字。
// [\u3000-\u303f]：匹配CJK符号和标点（例如全角逗号、句号等）。
// [\uff00-\uffef]：匹配全角字符和标点符号（例如全角括号、感叹号、引号等）。
const symbolCharRule = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/;
export function isSymbolChar(char) {
  return symbolCharRule.test(char);
}
export function matchSymbol(char) {
  return char.match(symbolCharRule);
}
// 检查该字体文件是否支持当前字符
export function isCharSupported(font, chineseChar) {
  const glyph = font.charToGlyph(chineseChar);
  return glyph.unicode !== undefined;
}

export function isSpace(char) {
  return char === " ";
}
export function isEnglish(char) {
  // 英文字母的 Unicode 范围是 A-Z 或 a-z
  return /^[A-Za-z]$/.test(char);
}

export function getPath(fontApp, text, fontSize) {
  return fontApp.getPath(text, 0, 0, fontSize);
}
const fontFamilyLineSpaceRatio = {
  default: 0.5,
  "soul-handwriting_free-version": 0.2,
};
export function computedFontLineHeight(option) {
  const { unitsPerEm, ascent, descent, fontSize, lineHeight, fontName } =
    option;

  const ascentRatio = ascent / unitsPerEm;
  // const descentRatio = Math.abs(descent) / unitsPerEm;
  const lineHeightRatio = lineHeight / fontSize;
  // 为保证渲染效果 是基线对齐，这里应该忽略下降高度
  // const lineHeightBase = (ascentRatio + descentRatio) * fontSize;
  const lineHeightBase = ascentRatio * fontSize;
  const lineHeightResult = lineHeightBase * lineHeightRatio;
  // 这个top高度的偏移，是用来模拟首行文字上面的间隙。否则首行文字会直接顶在最上面
  // const top = lineHeight - ascenderHeight;
  // const r = (ascent + Math.abs(descent)) / unitsPerEm - 1;
  // const lineHeightTop = (lineHeightResult - lineHeightBase) / 2;
  const r =
    fontFamilyLineSpaceRatio[fontName] || fontFamilyLineSpaceRatio.default;
  const lineHeightTop = (lineHeightResult - lineHeightBase) * r;

  // 基线位置比例
  // const baseLineRatio = ascent / (ascent + Math.abs(descent));
  // 溢出高度 比如 ascent>unitsPerEm 的情况， 假设得到数字为5.3 fontsize 16，如果行高倍数为1，那么文字反而要往上缩5.3高度
  // 如果行高倍数为2 ，那么存在冗余高度，平均分配一下，上面空出 (32-16)/2 = 8 ,那么此时文字是往下移动 8-5.3 = 2.7
  // const overflowTop =
  //   // ((ascent - baseLineRatio * unitsPerEm) / unitsPerEm) * fontSize;
  //   ((ascent - baseLineRatio * ascent) / ascent) * fontSize;
  // const emptyTopSpace = (lineHeight - fontSize) / 2;
  // const top = emptyTopSpace - overflowTop;

  // console.log("top", top);
  // console.log("overflowTop", overflowTop);

  //  v4
  // const emptyTopSpace = lineHeight - fontSize;
  // const top = (1 - baseLineRatio) * emptyTopSpace;
  return {
    lineHeight: lineHeightResult,
    lineHeightTop: lineHeightTop,
  };
}

export async function getDefaultFontApp() {
  const defaultFontURL = "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf";
  const data = await fetchAssets(defaultFontURL);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  let fontApp = opentype.parse(arrayBuffer);
  return fontApp;
}
