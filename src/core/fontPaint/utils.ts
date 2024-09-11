export function createWordPathContext() {
  const context = {
    word: "",
    line: 0, //层数
    pathParts: {
      0: [],
    },
    pathPartsTransform: {
      0: [],
    },
    pathPartsAlignTransform: {
      0: [],
    },
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
      context.pathParts[context.line].push(path);
    },
    nextLine() {
      context.line = context.line + 1;
      context.pathParts[context.line] = [];
      context.pathPartsTransform[context.line] = [];
      context.pathPartsAlignTransform[context.line] = [];
    },
    addTransform(transform) {
      context.pathPartsTransform[context.line].push(transform);
    },
    addAlignTransform(transform) {
      context.pathPartsAlignTransform[context.line].push(transform);
    },
  };
  return context;
}
//   截止判断
export function isEnd(char) {
  // 1. 遇到中文
  if (isChinese(char)) return true;
  // 2. 字符结束
  if (char === undefined || char === null) return true;
}

export function isChinese(char) {
  if (char === " ") return true;
  // [\u4e00-\u9fff]：匹配中文汉字。
  // [\u3000-\u303f]：匹配CJK符号和标点（例如全角逗号、句号等）。
  // [\uff00-\uffef]：匹配全角字符和标点符号（例如全角括号、感叹号、引号等）。
  return /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char);
}

export function isEnglish(char) {
  // 英文字母的 Unicode 范围是 A-Z 或 a-z
  return /^[A-Za-z]$/.test(char);
}

export function getPath(fontApp, text, fontSize) {
  return fontApp.getPath(text, 0, 0, fontSize);
}
