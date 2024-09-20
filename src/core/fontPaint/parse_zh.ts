import { fetchAssets } from "@/utils/request";
import {
  createWordPathContext,
  isSymbolChar,
  isEnd,
  isEnglish,
  isSpace,
  getPath,
  computedFontLineHeight,
} from "./utils";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";
import opentype from "opentype.js";
const pathPartType = {
  zh: 1,
  en: 2,
  space: 3,
};

export function getVerticalTextPaths(
  fontApp,
  config: IFontParseParams
): IFontParse {
  const context = createWordPathContext();
  const position = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };

  // 文字间隙 在浏览器环境中默认值为normal
  // const letterSpace = 0;
  const letterSpace = config.fontSize * 0.1;
  const { lineHeight, lineHeightTop } = computedFontLineHeight({
    unitsPerEm: config.fontOption.unitsPerEm,
    ascent: config.fontOption.ascent,
    fontSize: config.fontSize,
    lineHeight: config.textLineHeight,
    descent: config.fontOption.descent,
  });

  const isVertical = !!config.vertical;
  //   编辑器中的选框大小
  const MAX_WIDTH = config.MaxWidth;
  const MAX_HIGHT = config.MaxHeight;

  const { textInfoArr, maxItemHeight, maxItemWidth, line } = mapText(
    fontApp,
    config
  );
  const { lineNum, breakLineIndex, maxContentHeightArr } = line;
  let currentLine = 1;
  let colAccumulatorHeight = 0;
  let isFirstWord = true;
  textInfoArr.forEach((textInfo, index) => {
    if (currentLine > lineNum) return;
    if (breakLineIndex.includes(index)) {
      // 当前命中换行索引
      context.nextLine();
      currentLine++;
      colAccumulatorHeight = 0;
      isFirstWord = true;
    }
    if (textInfo.type === pathPartType.space) {
      const selfHeight = maxItemHeight / 4;
      colAccumulatorHeight = colAccumulatorHeight + selfHeight;
    }
    if (!textInfo.path) return;
    context.addPath(textInfo.path);
    if (textInfo.type === pathPartType.zh) {
      const translateX = MAX_WIDTH - maxItemWidth * currentLine - lineHeightTop;
      //当前这列上这个字是第几个,计算垂直方向偏移量
      const translateY = isFirstWord
        ? colAccumulatorHeight
        : colAccumulatorHeight + letterSpace;
      const transform = `translate(${translateX},${translateY})`;
      context.addTransform(transform);

      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentHeightArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);
      const selfHeight = isFirstWord
        ? maxItemHeight
        : maxItemHeight + letterSpace;
      colAccumulatorHeight = colAccumulatorHeight + selfHeight;
      isFirstWord = false;
    } else {
      const translateX = MAX_WIDTH - maxItemWidth * currentLine - lineHeightTop;
      const translateY = isFirstWord
        ? colAccumulatorHeight
        : colAccumulatorHeight + letterSpace;
      // 先平移到目标位置 然后绕svg左上角圆点旋转90度，然后再平移修复旋转移动的距离
      const transform = `translate(${translateX},${translateY}) rotate(90,${position.x1},${position.y1}) translate(0,-${maxItemWidth})`;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentHeightArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);

      let selfPathHeight = textInfo.height;
      if (!selfPathHeight) {
        const _pathBoundingBox = textInfo.path.getBoundingBox();
        selfPathHeight = _pathBoundingBox.x2 - _pathBoundingBox.x1;
      }
      const selfHeight = isFirstWord
        ? selfPathHeight
        : selfPathHeight + letterSpace;
      colAccumulatorHeight = colAccumulatorHeight + selfHeight;
      isFirstWord = false;
    }
  });
  //   计算整体的偏移量
  function computedPathTransform(textAlign, maxContentHeigh) {
    let offsetY = 0;
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
    const textInfoArr: ITextInfoItem[] = [];
    const textArr = config.text.split("");
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
          pathBoundingBox: null,
          text: textItem,
          isBreak: true,
          type: pathPartType.zh,
        });
        continue;
      }

      if (isSymbolChar(textItem)) {
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
      } else if (isSpace(textItem)) {
        textInfoArr.push({
          path: null,
          pathBoundingBox: null,
          text: textItem,
          isBreak: false,
          type: pathPartType.space,
        });
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
    let breakLineIndex: number[] = [];
    let maxContentHeightArr: number[] = [];
    let isFirstWord = true;
    let accumulatorPathHeight = 0;
    for (let index = 0; index < textInfoArr.length; index++) {
      const textInfo = textInfoArr[index];
      if (textInfo.isBreak) {
        doBreak(index);
        continue;
      }

      const _height = textInfo.height || height;
      const _heightAddLetterSpace = isFirstWord
        ? _height
        : _height + letterSpace;
      isFirstWord = false;
      if (textInfo.type === pathPartType.space) {
        // 如果是空格，高度是字体的1/4
        accumulatorPathHeight = accumulatorPathHeight + _height / 4;
        continue;
      }
      accumulatorPathHeight = accumulatorPathHeight + _heightAddLetterSpace;
      if (accumulatorPathHeight > MAX_HIGHT) {
        if (textInfo.chilePath) {
          let preAccumulatorPathHeight =
            accumulatorPathHeight - _heightAddLetterSpace;
          let lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
          let lastPathHeight =
            lastPath.path.getBoundingBox().x2 -
            lastPath.path.getBoundingBox().x1;
          // 从children找到能刚好能排列下的子路径
          while (preAccumulatorPathHeight + lastPathHeight > MAX_HIGHT) {
            textInfo.chilePath.pop();
            lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
            lastPathHeight =
              lastPath.path.getBoundingBox().x2 -
              lastPath.path.getBoundingBox().x1;
          }
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
          accumulatorPathHeight = preAccumulatorPathHeight + lastPathHeight;
          doBreak(index + 1);

          continue;
        } else {
          accumulatorPathHeight = accumulatorPathHeight - _heightAddLetterSpace;
          doBreak(index);
          //   最后一个字符，高度即它本身
          if (index === textInfoArr.length - 1) {
            maxContentHeightArr.push(_height);
          }
          // 刚才扣除的高度再累加回去
          accumulatorPathHeight = accumulatorPathHeight + _heightAddLetterSpace;
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
      accumulatorPathHeight = 0;
      isFirstWord = true;
      breakLineIndex.push(index);
    }
    return { lineNum, breakLineIndex, maxContentHeightArr };
  }
  //   结算当前路径
  function settlePath() {}

  function identifyNext(char, index, textInfoArr) {
    let nextText = textInfoArr[index + 1];
    let path: any = null;
    const chilePath = [
      {
        text: char,
        path: getPath(fontApp, char, config.fontSize),
      },
    ];
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
    const pathBoundingBox = path?.getBoundingBox();
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

  return {
    pathPart: context.pathPart,
    position,
    isVertical,
    svgDomSize: {
      width: config.MaxWidth,
      height: config.MaxHeight,
    },
    hasSymbolChar: true,
    color: config.color || "red",
    colorMode: config.colorMode || "RGB",
    rotate: config.rotate,
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
