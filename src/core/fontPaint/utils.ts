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
  if (char === "\n" || char === "\r") return true;
}
// [\u4e00-\u9fff]：匹配中文汉字。
// [\u0800-\u4e00]：匹配日文汉字。
// [\uac00-\ud7ff]：匹配韩文汉字。
// [\u3000-\u303f]：匹配CJK符号和标点（例如全角逗号、句号等）。
// [\uff00-\uffef]：匹配全角字符和标点符号（例如全角括号、感叹号、引号等）。
const symbolCharRule =
  /[\u4e00-\u9fff\u0800-\u4e00\uac00-\ud7ff\u3000-\u303f\uff00-\uffef]/;
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
  let path = fontApp.getPath(text, 0, 0, fontSize);
  path.advanceWidth = fontApp.getAdvanceWidth(text, fontSize);
  return path;
}
const fontFamilyLineSpaceRatio = {
  // default: 0.643,
  default: 0.8,
  "soul-handwriting_free-version": 0.01,
};
export function computedFontLineHeight(option) {
  const { unitsPerEm, ascent, descent, fontSize, lineHeight, fontName } =
    option;

  const ascentRatio = ascent / unitsPerEm;
  const lineHeightRatio = lineHeight / fontSize;

  const lineHeightBase = ascentRatio * fontSize;
  const lineHeightResult = lineHeightBase * lineHeightRatio;

  const r =
    fontFamilyLineSpaceRatio[fontName] || fontFamilyLineSpaceRatio.default;
  // 基线位置比例
  const baseLineRatio = ascent / (ascent + Math.abs(descent));

  const ascentRatioV2 = ascent / Math.abs(descent);

  const lineHeightTop = (lineHeight - fontSize) * r;

  return {
    lineHeight: lineHeightResult,
    lineHeightTop: lineHeightTop,
    baseLineRatio: baseLineRatio,
    ascentRatioV2,
  };
}

export async function getDefaultFontApp() {
  const defaultFontURL = "https://cdn.pacdora.com/font/NotoSansCJK-Regular.ttf";
  const data: any = await fetchAssets(defaultFontURL);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  let fontApp = opentype.parse(arrayBuffer);
  return fontApp;
}
export const pathPartType = {
  zh: 1,
  en: 2,
  space: 3,
};

export function identifyNext(fontApp, char, index, textInfoArr, config) {
  let nextText = textInfoArr[index + 1];
  let path: any = null;
  const chilePath: any = [];
  while (!isEnd(nextText)) {
    index++;
    char = `${char}${nextText}`;
    nextText = textInfoArr[index + 1];
    path = getPath(fontApp, char, config.fontSize);
    if (path) {
      chilePath.push({
        text: char,
        path: path,
      });
    }
  }
  if (isEnglish(char)) {
    path = getPath(fontApp, char, config.fontSize);
  }
  const pathBoundingBox = path?.getBoundingBox() || { x1: 0, x2: 0 };
  return {
    lastIndex: index,
    path: path,
    text: char,
    pathBoundingBox: pathBoundingBox,
    chilePath,
    type: pathPartType.en,
    height: pathBoundingBox.x2 - pathBoundingBox.x1,
  };
}
export function genChildPath(fontApp, chars, config) {
  const chilePath: any = [];
  let str = "";
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    str += char;
    const path = getPath(fontApp, str, config.fontSize);
    chilePath.push({
      text: str,
      path: path,
    });
  }
  return chilePath;
}
export function computedPathTransform(textAlign, Max, maxContent, isVer?) {
  let offset = 0;
  if (isVer) {
    switch (textAlign) {
      case "center":
        offset = (Max - maxContent) / 2;
        return `translate(0,${offset})`;
      case "right":
        offset = textAlign - maxContent;
        return `translate(0,${offset})`;

      default:
        return "";
    }
  } else {
    switch (textAlign) {
      case "center":
        offset = (Max - maxContent) / 2;
        return `translate(${offset},0)`;
      case "right":
        offset = Max - maxContent;
        return `translate(${offset},0)`;

      default:
        return "";
    }
  }
}

export function isBreakChar(char) {
  return char === "\n" || char === "\r";
}
