import opentype from "opentype.js";
import { defaultFont, fetchAssets } from "@/utils/request";
import { IPathPart } from "@/type/parse";
import { getLang } from "@/utils/i18n";
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
const langRegex = {
  Russian: /[\u0400-\u04FF]/, //俄罗斯字符
  Arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/, //阿拉伯字符
  // Spanish: /[a-zA-ZñÑáéíóúüÁÉÍÓÚÜ]/,
  Thai: /[\u0E00-\u0E7F]/, //泰语
  Greek: /[\u0370-\u03FF]/, //希腊
  Tamil: /[\u0B80-\u0BFF]/, //泰米尔语
  Telugu: /[\u0C00-\u0C7F]/, //泰卢固语
  Kannada: /[\u0C80-\u0CFF]/, //卡纳达语
  Hindi: /[\u0900-\u097F]/, //印地语
  Bengali: /[\u0980-\u09FF]/, //孟加拉语
};
// 非 常规字体处理
export async function unconventionalFontHandle(char) {
  let result: any = null;
  const keys = Object.keys(langRegex) as (keyof typeof langRegex)[];
  for (let i = 0; i < keys.length; i++) {
    const keyName = keys[i];
    if (isMatchLangChar(char, keyName)) {
      console.log("match char", keyName);
      // @ts-ignore
      result = await getDefaultFontApp(keyName);

      break;
    }
  }
  return result;
}
export function isMatchLangChar(char, langKey: keyof typeof langRegex) {
  const regexRule = langRegex[langKey];
  if (!regexRule) return null;
  return regexRule.test(char);
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
// [\u3040-\u30ff]：匹配日文
// [\uac00-\ud7ff]：匹配韩文汉字。
// [\u3000-\u303f]：匹配CJK符号和标点（例如全角逗号、句号等）。
// [\uff00-\uffef]：匹配全角字符和标点符号（例如全角括号、感叹号、引号等）。
// \u2000-\u206：匹配常用标点
const symbolCharRule =
  /[\u4e00-\u9fff\u3040-\u30ff\uac00-\ud7ff\u3000-\u303f\uff00-\uffef\u2000-\u206f]/;
// [中文省略号,‘,’,“,”]
const excludeSymbolCharCode = [8230, 8216, 8217, 8220, 8221];
// 特殊标点字符 [。]
const specialSymbolCharCode = [12290];
export function isSymbolChar(char) {
  return symbolCharRule.test(char);
}
export function isExcludeSymbolChar(char) {
  if (!char) return false;
  const code = char.charCodeAt();
  return excludeSymbolCharCode.includes(code);
}
export function isSpecialSymbolChar(char) {
  if (!char) return false;
  const code = char.charCodeAt();
  return specialSymbolCharCode.includes(code);
}
export function matchSymbol(char) {
  return char.match(symbolCharRule);
}
// 检查该字体文件是否支持当前字符
export function isCharSupported(font, char) {
  const glyph = font.charToGlyph(char);
  return glyph?.unicode !== undefined && glyph.name !== ".notdef";
}
export function isCharSupportedAll(font, str) {
  const chars = str.replaceAll(/[\n\r]/g, "").split("");
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (!char) continue;
    if (!isCharSupported(font, char)) {
      console.log("unsupported char", char);
      return false;
    }
  }
  return true;
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

  // 基线位置比例
  const baseLineRatio = ascent / (ascent + Math.abs(descent));

  const ascentRatioV2 = ascent / Math.abs(descent);

  return {
    lineHeight: lineHeightResult,
    baseLineRatio: baseLineRatio,
    ascentRatioV2,
  };
}

export async function getDefaultFontApp(fontName?: keyof typeof defaultFont) {
  const defaultOriginalFont =
    getLang() === "zh-cn" ? defaultFont.HarmonyOS : defaultFont.CJK;
  let defaultFontURL =
    fontName && defaultFont[fontName]
      ? defaultFont[fontName]
      : defaultOriginalFont;

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
  const chilePath: any = [
    {
      text: char,
      path: getPath(fontApp, char, config.fontSize),
    },
  ];
  while (!isEnd(nextText) && isCharSupported(fontApp, nextText)) {
    // child太长 占用太多内存资源
    const max = config.vertical ? config.MaxHeight : config.MaxWidth;
    let limit = max * 1.2;
    if (path?.advanceWidth > limit) break;
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
  if (char && !path) {
    path = getPath(fontApp, char, config.fontSize);
  }
  const pathBoundingBox = path?.getBoundingBox() || { x1: 0, y1: 0 };
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
        offset = Max - maxContent;
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
  // return char === "\n" || char === "\r";
  return char === "\n";
}
// （carriage return，回车） 光标移动到当前行的开头，但不换到下一行。
export function isReturnChar(char) {
  return char === "\r";
}
