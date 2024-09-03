// @ts-nocheck
const pathPartType = {
  zh: 1,
  en: 2,
};

function createWordPathContext() {
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
function getPath(fontApp, text, fontSize) {
  return fontApp.getPath(text, 0, 0, fontSize);
}
export function getTextPaths(fontApp, config) {
  if (config.vertical && hasCnWords(config.text)) {
    return getVerticalTextPaths(fontApp, config);
  }
  const textArr = config.text.split("");
  console.log("字符拆分 en", textArr);
  const context = createWordPathContext();
  const position = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };
  const svgSize = {
    width: 0,
    height: 0,
  };
  const lineHeightRatio = config.textLineHeight / config.fontSize;
  let lineHeightTop = 0;
  let lineHeight = 0;
  const isVertical = !!config.vertical;
  //   编辑器中的选框大小
  const MAX_WIDTH = isVertical ? config.MaxHeight : config.MaxWidth;
  const MAX_HIGHT = isVertical ? config.MaxWidth : config.MaxHeight;
  for (let i = 0; i < textArr.length; i++) {
    const text = textArr[i];
    if (text === "\n") {
      settlePath(context, false);
      context.nextLine();
      // 跳过 换行字符的处理
      // i++;
      continue;
    }
    context.addWord(text);
    const path = getPath(fontApp, context.word, config.fontSize);
    const pathBoundingBox = path.getBoundingBox();
    if (i === 0) {
      position.x1 = pathBoundingBox.x1;
      position.y1 = pathBoundingBox.y1;
    }
    const currentWidth = pathBoundingBox.x2 - pathBoundingBox.x1;
    if (currentWidth > svgSize.width) {
      svgSize.width = currentWidth;
    }
    const currentHeight = pathBoundingBox.y2 - pathBoundingBox.y1;
    if (currentHeight > svgSize.height) {
      svgSize.height = currentHeight;
      lineHeight = currentHeight * lineHeightRatio;
      lineHeightTop = (lineHeight - currentHeight) / 2;
    }
    // 超出选框边界
    if (pathBoundingBox.x2 > MAX_WIDTH) {
      context.backWord();
      settlePath(context, false);
      context.addWord(text);
      context.nextLine();
    }
    //   end 最后一个字符
    if (i === textArr.length - 1) {
      settlePath(context, false);
    }
  }
  //   结算当前路径
  function settlePath(context, isBreak = true) {
    const path = getPath(fontApp, context.word, config.fontSize);
    const pathBoundingBox = path.getBoundingBox();
    const transform = computedAlignTransform(
      config.textAlign,
      MAX_WIDTH,
      MAX_HIGHT,
      pathBoundingBox
    );
    context.addPath(path);
    context.addAlignTransform(transform);
    const translateY = lineHeight * context.line + lineHeightTop;
    const pathTransform = `translate(0,${translateY})`;
    context.addTransform(pathTransform);

    context.resetWord();
    if (isBreak) {
      let currentHeight = position.y2 - position.y1;
      svgSize.height = svgSize.height + currentHeight;
    }
  }
  function computedAlignTransform(textAlign, width, height, pathBoundingBox) {
    const pathWidth = pathBoundingBox.x2 - pathBoundingBox.x1;
    let translateX;
    switch (textAlign) {
      case "center":
        translateX = (width - pathWidth) / 2;
        return `translate(${translateX},0)`;
      case "right":
        translateX = width - pathWidth;
        return `translate(${translateX},0)`;

      default:
        return "";
    }
  }
  return {
    pathParts: context.pathParts,
    pathPartsAlignTransform: context.pathPartsAlignTransform,
    pathPartsTransform: context.pathPartsTransform,
    position,
    svgSize,
    lineHeight,
    isVertical,
    hasCnChar: false,
    domBoxSize: {
      width: config.MaxWidth,
      height: config.MaxHeight,
    },
  };
}

function getVerticalTextPaths(fontApp, config) {
  const context = createWordPathContext();
  const position = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };
  const svgSize = {
    width: 0,
    height: 0,
  };
  let lineHeight = 26.46;
  const isVertical = !!config.vertical;
  //   编辑器中的选框大小
  const MAX_WIDTH = config.MaxWidth;
  const MAX_HIGHT = config.MaxHeight;

  const { textInfoArr, maxItemHeight, maxItemWidth, line } = mapText(
    fontApp,
    config
  );
  console.log("line", line);
  const { lineNum, breakLineIndex, maxContentHeightArr } = line;
  let currentLine = 1;
  let colHandleNum = 0;
  textInfoArr.forEach((textInfo, index) => {
    if (currentLine > lineNum) return;
    if (breakLineIndex.includes(index)) {
      // 当前命中换行索引
      context.nextLine();
      currentLine++;
      colHandleNum = 0;
    }
    if (!textInfo.path) return;
    context.addPath(textInfo.path);
    if (textInfo.type === pathPartType.zh) {
      const translateX = MAX_WIDTH - maxItemWidth * currentLine;
      //当前这列上这个字是第几个,计算垂直方向偏移量
      const translateY = maxItemHeight * colHandleNum;
      const transform = `translate(${translateX},${translateY})`;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentHeightArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);
      colHandleNum++;
    } else {
      console.log("英文", textInfo);
      const translateX = MAX_WIDTH - maxItemWidth * currentLine;
      //当前这列上这个字是第几个,计算垂直方向偏移量
      const translateY = maxItemHeight * colHandleNum;
      // 先平移到目标位置 然后绕svg左上角圆点旋转90度，然后再平移修复旋转移动的距离
      const transform = `translate(${translateX},${translateY}) rotate(90,${position.x1},${position.y1}) translate(0,-${maxItemWidth})`;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentHeightArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);
      colHandleNum++;
    }
  });
  //   计算整体的偏移量
  function computedPathTransform(textAlign, maxContentHeigh) {
    switch (textAlign) {
      case "center":
        offsetY = (MAX_HIGHT - maxContentHeigh) / 2;
        return `translate(0,${offsetY})`;
      case "right":
        offsetY = MAX_HIGHT - maxContentHeigh;
        return `translate(0,${offsetY})`;

      default:
        return "";
    }
  }
  function mapText(fontApp, config) {
    const textInfoArr = [];
    const textArr = config.text.split("");
    console.log("字符拆分", textArr);

    // 每列都水平位移，要找出最大的宽度
    let maxItemWidth = 0;

    // 每个字都垂直位移，要找出最大的高度
    let maxItemHeight = 0;
    // 已经识别的索引
    let identifiedIndex = -9999;
    for (let i = 0; i < textArr.length; i++) {
      if (i <= identifiedIndex) {
        continue;
      }
      const textItem = textArr[i];
      if (textItem === "\n") {
        textInfoArr.push({
          path: null,
          pathBoundingBox: {},
          text: textItem,
          isBreak: true,
          type: pathPartType.zh,
        });
        continue;
      }
      if (isChinese(textItem)) {
        const path = getPath(fontApp, textItem, config.fontSize);
        const pathBoundingBox = path.getBoundingBox();
        const currentPathWidth = pathBoundingBox.x2 - pathBoundingBox.x1;
        if (currentPathWidth > maxItemWidth) {
          maxItemWidth = currentPathWidth;
        }
        const currentPathHeight = pathBoundingBox.y2 - pathBoundingBox.y1;
        if (currentPathHeight > maxItemHeight) {
          maxItemHeight = currentPathHeight;
        }

        textInfoArr.push({
          path,
          pathBoundingBox,
          text: textItem,
          isBreak: false,
          type: pathPartType.zh,
        });
        if (i === 0) {
          position.x1 = pathBoundingBox.x1;
          position.y1 = pathBoundingBox.y1;
        }
      } else {
        const result = identifyNext(textItem, i, textArr);
        identifiedIndex = result.lastIndex;
        // 因为英文要旋转过来，所以它的宽度就是高度
        const currentPathHeight =
          result.pathBoundingBox.x2 - result.pathBoundingBox.x1;

        textInfoArr.push({
          path: result.path,
          pathBoundingBox: result.pathBoundingBox,
          text: result.text,
          isBreak: false,
          type: pathPartType.en,
          height: currentPathHeight,
          chilePath: result.chilePath,
        });
        if (i === 0) {
          position.x1 = result.pathBoundingBox.x1;
          position.y1 = result.pathBoundingBox.y1;
        }
      }
    }
    const line = computedLine(textInfoArr, maxItemHeight);

    return { textInfoArr, maxItemWidth, maxItemHeight, line };
  }
  function computedLine(textInfoArr, height) {
    let lineNum = 1;
    // 换行标记索引
    let breakLineIndex = [];
    let maxContentHeightArr = [];
    let accumulatorPathHeight = 0;
    console.log("textInfoArr", textInfoArr);
    for (let index = 0; index < textInfoArr.length; index++) {
      const textInfo = textInfoArr[index];
      if (textInfo.isBreak) {
        doBreak(index);
        continue;
      }
      const _height = textInfo.height || height;
      accumulatorPathHeight = accumulatorPathHeight + _height;
      if (accumulatorPathHeight > MAX_HIGHT) {
        if (textInfo.chilePath) {
          let preAccumulatorPathHeight = accumulatorPathHeight - _height;
          let lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
          let lastPathHeight =
            lastPath.path.getBoundingBox().x2 -
            lastPath.path.getBoundingBox().x1;
          console.log("while");
          // 从children找到能刚好能排列下的子路径
          while (preAccumulatorPathHeight + lastPathHeight > MAX_HIGHT) {
            textInfo.chilePath.pop();
            lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
            lastPathHeight =
              lastPath.path.getBoundingBox().x2 -
              lastPath.path.getBoundingBox().x1;
          }
          console.log("textInfo.chilePath", textInfo.chilePath);
          //   原本的path 拆分成2个
          const newFirstTextInfo = {
            ...textInfo.chilePath[textInfo.chilePath.length - 1],
            type: pathPartType.en,
          };
          newFirstTextInfo.pathBoundingBox =
            newFirstTextInfo.path.getBoundingBox();
          const newSecondText = textInfo.text.slice(
            newFirstTextInfo.text.length
          );
          const newSecondTextInfoPath = getPath(
            fontApp,
            newSecondText,
            config.fontSize
          );
          const newSecondTextInfoBoundingBox =
            newSecondTextInfoPath.getBoundingBox();
          const newSecondTextInfo = {
            text: newSecondText,
            path: newSecondTextInfoPath,
            type: pathPartType.en,
            pathBoundingBox: newSecondTextInfoBoundingBox,
            height:
              newSecondTextInfoBoundingBox.x2 - newSecondTextInfoBoundingBox.x1,
          };

          const newPaths = [newFirstTextInfo, newSecondTextInfo];
          textInfoArr.splice(index, 1, ...newPaths);
          console.warn("preAccumulatorPathHeight", preAccumulatorPathHeight);
          accumulatorPathHeight = preAccumulatorPathHeight + lastPathHeight;
          doBreak(index + 1);

          continue;
        } else {
          accumulatorPathHeight = accumulatorPathHeight - _height;
          doBreak(index);
          //   最后一个字符，高度即它本身
          if (index === textInfoArr.length - 1) {
            maxContentHeightArr.push(_height);
          }
          continue;
        }
      }
    }
    if (maxContentHeightArr.length !== lineNum) {
      maxContentHeightArr.push(accumulatorPathHeight);
    }
    function doBreak(index) {
      lineNum++;
      maxContentHeightArr.push(accumulatorPathHeight);
      console.warn("maxContentHeightArr", maxContentHeightArr);
      accumulatorPathHeight = 0;
      breakLineIndex.push(index);
    }
    return { lineNum, breakLineIndex, maxContentHeightArr };
  }
  //   结算当前路径
  function settlePath() {}

  function identifyNext(char, index, textInfoArr) {
    let nextText = textInfoArr[index + 1];
    let path = null;
    const chilePath = [];
    while (!isEnd(nextText)) {
      index++;
      char = `${char}${nextText}`;
      nextText = textInfoArr[index + 1];
      path = getPath(fontApp, char, config.fontSize);
      chilePath.push({
        text: char,
        path: path,
      });
    }
    if (isEnglish(char)) {
      path = getPath(fontApp, char, config.fontSize);
    }
    const pathBoundingBox = path.getBoundingBox();
    return {
      lastIndex: index,
      path: path,
      text: char,
      pathBoundingBox: pathBoundingBox,
      chilePath,
    };
  }

  return {
    pathParts: context.pathParts,
    pathPartsAlignTransform: context.pathPartsAlignTransform,
    pathPartsTransform: context.pathPartsTransform,
    position,
    svgSize,
    lineHeight,
    isVertical,
    domBoxSize: {
      width: config.MaxWidth,
      height: config.MaxHeight,
    },
    hasCnChar: true,
  };
}
function isChinese(char) {
  if (char === " ") return true;
  // [\u4e00-\u9fff]：匹配中文汉字。
  // [\u3000-\u303f]：匹配CJK符号和标点（例如全角逗号、句号等）。
  // [\uff00-\uffef]：匹配全角字符和标点符号（例如全角括号、感叹号、引号等）。
  return /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char);
}

function isEnglish(char) {
  // 英文字母的 Unicode 范围是 A-Z 或 a-z
  return /^[A-Za-z]$/.test(char);
}
function hasCnWords(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}
//   截止判断
function isEnd(char) {
  // 1. 遇到中文
  if (isChinese(char)) return true;
  // 2. 字符结束
  if (char === undefined || char === null) return true;
}
