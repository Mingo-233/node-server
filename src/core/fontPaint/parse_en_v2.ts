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
const pathPartType = {
  zh: 1,
  en: 2,
  space: 3,
};

export function parseTextV2(
  fontApp,
  config: IFontParseParams,
  defaultFontApp?
): IFontParse {
  const context = createWordPathContext();
  const position = {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  };

  const { lineHeight, lineHeightTop } = computedFontLineHeight({
    unitsPerEm: config.fontOption.unitsPerEm,
    ascent: config.fontOption.ascent,
    fontSize: config.fontSize,
    lineHeight: config.textLineHeight,
    descent: config.fontOption.descent,
  });

  const isVertical = !!config.vertical;
  //   编辑器中的选框大小
  const MAX_WIDTH = isVertical ? config.MaxHeight : config.MaxWidth;
  const MAX_HIGHT = isVertical ? config.MaxWidth : config.MaxHeight;

  const { textInfoArr, maxItemHeight, maxItemWidth, line } = mapText(
    fontApp,
    config
  );
  const { lineNum, breakLineIndex, maxContentWidthArr } = line;

  let currentLine = 1;
  let colAccumulatorWidth = 0;
  textInfoArr.forEach((textInfo, index) => {
    if (currentLine > lineNum) return;
    if (breakLineIndex.includes(index)) {
      // 当前命中换行索引
      context.nextLine();
      currentLine++;
      colAccumulatorWidth = 0;
    }
    if (textInfo.type === pathPartType.space) {
      const selfWidth = maxItemWidth / 4;
      colAccumulatorWidth = colAccumulatorWidth + selfWidth;
    }
    if (!textInfo.path) return;
    context.addPath(textInfo.path);
    if (textInfo.type === pathPartType.zh) {
      const translateX = colAccumulatorWidth;

      // const translateX = MAX_WIDTH - maxItemWidth * currentLine - lineHeightTop;

      const translateY = lineHeight * (currentLine - 1) + lineHeightTop;
      const transform = `translate(${translateX},${translateY})`;
      context.addTransform(transform);

      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentWidthArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);

      colAccumulatorWidth = colAccumulatorWidth + maxItemWidth;
    } else {
      const translateX = colAccumulatorWidth;
      const translateY = lineHeight * (currentLine - 1) + lineHeightTop;

      const transform = `translate(${translateX},${translateY}) `;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        maxContentWidthArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);

      let selfPathWidth = textInfo.height;
      if (!selfPathWidth) {
        const _pathBoundingBox = textInfo.path.getBoundingBox();
        selfPathWidth = _pathBoundingBox.x2 - _pathBoundingBox.x1;
      }
      colAccumulatorWidth = colAccumulatorWidth + selfPathWidth;
    }
  });
  //   计算整体的偏移量
  function computedPathTransform(textAlign, maxContentWidth) {
    let offsetX = 0;
    switch (textAlign) {
      case "center":
        offsetX = (MAX_WIDTH - maxContentWidth) / 2;
        return `translate(${offsetX},0)`;
      case "right":
        offsetX = MAX_WIDTH - maxContentWidth;
        return `translate(${offsetX},0)`;

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
        const path = getPath(defaultFontApp, textItem, config.fontSize);
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
        const currentPathWidth =
          result.pathBoundingBox.x2 - result.pathBoundingBox.x1;

        textInfoArr.push({
          path: result.path,
          pathBoundingBox: result.pathBoundingBox,
          text: result.text,
          isBreak: false,
          type: pathPartType.en,
          width: currentPathWidth,
          chilePath: result.chilePath,
        });
        if (i === 0) {
          position.x1 = result.pathBoundingBox.x1;
          position.y1 = result.pathBoundingBox.y1;
        }
      }
    }
    const line = computedLine(textInfoArr, maxItemWidth);

    return { textInfoArr, maxItemWidth, maxItemHeight, line };
  }
  function computedLine(textInfoArr, width) {
    let lineNum = 1;
    // 换行标记索引
    let breakLineIndex: number[] = [];
    let maxContentWidthArr: number[] = [];
    let accumulatorPathWidth = 0;
    for (let index = 0; index < textInfoArr.length; index++) {
      const textInfo = textInfoArr[index];
      if (textInfo.isBreak) {
        doBreak(index);
        continue;
      }
      const _width = textInfo.width || width;
      const _height = textInfo.height;

      if (textInfo.type === pathPartType.space) {
        accumulatorPathWidth = accumulatorPathWidth + width / 4;
        continue;
      }
      accumulatorPathWidth = accumulatorPathWidth + _width;

      if (accumulatorPathWidth > MAX_WIDTH) {
        if (textInfo.chilePath) {
          let preAccumulatorPathWidth = accumulatorPathWidth - _width;
          let lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
          let lastPathWidth =
            lastPath.path.getBoundingBox().x2 -
            lastPath.path.getBoundingBox().x1;
          // 从children找到能刚好能排列下的子路径
          while (preAccumulatorPathWidth + lastPathWidth > MAX_WIDTH) {
            textInfo.chilePath.pop();
            lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
            lastPathWidth =
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
          accumulatorPathWidth = preAccumulatorPathWidth + lastPathWidth;
          doBreak(index + 1);

          continue;
        } else {
          accumulatorPathWidth = accumulatorPathWidth - _width;
          doBreak(index);
          //   最后一个字符，高度即它本身
          if (index === textInfoArr.length - 1) {
            maxContentWidthArr.push(_width);
          }
          // 刚才扣除的高度再累加回去
          accumulatorPathWidth = accumulatorPathWidth + _width;
          continue;
        }
      }
    }
    if (maxContentWidthArr.length !== lineNum) {
      maxContentWidthArr.push(accumulatorPathWidth);
    }
    function doBreak(index) {
      lineNum++;
      maxContentWidthArr.push(accumulatorPathWidth);
      accumulatorPathWidth = 0;
      breakLineIndex.push(index);
    }

    return { lineNum, breakLineIndex, maxContentWidthArr };
  }

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
    hasSymbolChar: false,
    color: config.color || "red",
    colorMode: config.colorMode || "RGB",
    rotate: config.rotate,
  };
}
