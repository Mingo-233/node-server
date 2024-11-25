import {
  createWordPathContext,
  isSymbolChar,
  computedPathTransform,
  isSpace,
  getPath,
  computedFontLineHeight,
  pathPartType,
  identifyNext,
  genChildPath,
  isBreakChar,
  isReturnChar,
} from "./utils";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";

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
  let hasSymbolChar = false;
  // 文字间隙 在浏览器环境中默认值为normal
  const letterSpace = 0;
  // const letterSpace = config.fontSize * 0.1;
  const { lineHeight, ascentRatioV2 } = computedFontLineHeight({
    unitsPerEm: config.fontOption.unitsPerEm,
    ascent: config.fontOption.ascent,
    fontSize: config.fontSize,
    lineHeight: config.textLineHeight,
    descent: config.fontOption.descent,
    fontName: config.fontOption.fontName,
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
  let lastTextType = 0;
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
      // 不同类型字符之间需要有空隙
      if (lastTextType !== pathPartType.zh) {
        colAccumulatorWidth = colAccumulatorWidth + letterSpace;
      }
      const translateX = colAccumulatorWidth;

      const translateY = config.textLineHeight * (currentLine - 1);
      const transform = `translate(${translateX},${translateY})`;
      context.addTransform(transform);

      const alignTransform = computedPathTransform(
        config.textAlign,
        MAX_WIDTH,
        maxContentWidthArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);
      const itemAdvanceWidth = textInfo.path.advanceWidth;
      colAccumulatorWidth =
        colAccumulatorWidth + itemAdvanceWidth + letterSpace;
      lastTextType = pathPartType.zh;
    } else {
      const translateX = colAccumulatorWidth;
      const translateY = config.textLineHeight * (currentLine - 1);

      const transform = `translate(${translateX},${translateY}) `;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        MAX_WIDTH,
        maxContentWidthArr[currentLine - 1]
      );
      context.addAlignTransform(alignTransform);

      let selfPathWidth: any = textInfo.height;
      if (!selfPathWidth) {
        selfPathWidth = textInfo.path.advanceWidth;
      }
      colAccumulatorWidth = colAccumulatorWidth + selfPathWidth;
      lastTextType = pathPartType.en;
    }
  });

  function mapText(fontApp, config) {
    const textInfoArr: ITextInfoItem[] = [];
    const textArr = config.text.split("");
    // 每列都水平位移，要找出最大的宽度
    let maxItemWidth = 0;

    // 每个字都垂直位移，要找出最大的高度
    let maxItemHeight = 0;
    // 已经识别的索引
    let identifiedIndex = -9999;
    let startsWithSpace: number | boolean = 0;
    for (let i = 0; i < textArr.length; i++) {
      if (i <= identifiedIndex) {
        continue;
      }
      let textItem = textArr[i];
      if (isReturnChar(textItem)) {
        continue;
      }

      if (isBreakChar(textItem)) {
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
        hasSymbolChar = true;
        const app = config.fontOption.isSupCnMainFontApp
          ? fontApp
          : defaultFontApp;
        const path = getPath(app, textItem, config.fontSize);
        const pathBoundingBox = path.getBoundingBox();
        const currentPathWidth = path.advanceWidth;
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
          width: currentPathWidth,
          type: pathPartType.zh,
        });
        if (i === 0) {
          let spaceX = 0;
          if (typeof startsWithSpace === "number" && startsWithSpace > 0) {
            spaceX = (startsWithSpace * currentPathWidth) / 4;
          }
          position.x1 = pathBoundingBox.x1 + spaceX;
          position.y1 = pathBoundingBox.y1;
          startsWithSpace = false;
        }
      } else if (isSpace(textItem)) {
        textInfoArr.push({
          path: null,
          pathBoundingBox: null,
          text: textItem,
          isBreak: false,
          type: pathPartType.space,
        });
        if (typeof startsWithSpace === "number") {
          startsWithSpace++;
        }
      } else {
        let spaceX = 0;
        // 如果前面有空格，则需要补上空格
        if (typeof startsWithSpace === "number" && startsWithSpace > 0) {
          let path = getPath(fontApp, " ", config.fontSize);
          spaceX = (path.advanceWidth / 4) * startsWithSpace;
        }

        const result = identifyNext(fontApp, textItem, i, textArr, config);
        if (!result.path) continue;
        identifiedIndex = result.lastIndex;
        // 因为英文要旋转过来，所以它的宽度就是高度
        const currentPathWidth = result.path.advanceWidth;

        textInfoArr.push({
          path: result.path,
          pathBoundingBox: result.pathBoundingBox,
          text: result.text,
          isBreak: false,
          type: pathPartType.en,
          width: currentPathWidth,
          chilePath: result.chilePath,
        });

        if (i === 0 || startsWithSpace) {
          position.x1 = result.pathBoundingBox.x1 - spaceX;
          position.y1 = result.pathBoundingBox.y1;
          startsWithSpace = false;
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
    // 标签
    outerLoop: for (let index = 0; index < textInfoArr.length; index++) {
      const textInfo = textInfoArr[index];
      if (textInfo.isBreak) {
        doBreak(index);
        continue;
      }
      // const _width = textInfo.width || width;
      const _width = textInfo.path?.advanceWidth || width;

      if (textInfo.type === pathPartType.space) {
        accumulatorPathWidth = accumulatorPathWidth + width / 4;
        continue;
      } else if (textInfo.type === pathPartType.zh) {
        accumulatorPathWidth = accumulatorPathWidth + letterSpace;
      }
      accumulatorPathWidth = accumulatorPathWidth + _width;

      if (accumulatorPathWidth > MAX_WIDTH) {
        if (textInfo.chilePath?.length) {
          let preAccumulatorPathWidth = accumulatorPathWidth - _width;
          let storeChild = textInfo.chilePath;
          let lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
          let lastPathWidth = lastPath.path.advanceWidth;
          // 从children找到能刚好能排列下的子路径
          while (
            preAccumulatorPathWidth + lastPathWidth > MAX_WIDTH &&
            textInfo.chilePath.length >= 1
          ) {
            // 英文字符拆解到一个字母的时候，加进去也超出宽度的情况，即一个字母也加不了，应直接换行
            if (textInfo.chilePath.length === 1) {
              accumulatorPathWidth = preAccumulatorPathWidth;
              textInfo.chilePath = storeChild;
              doBreak(index);
              index--;
              continue outerLoop; // 跳到外层的 for 循环的下一次迭代
            }
            textInfo.chilePath.pop();
            lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
            lastPathWidth = lastPath.path.advanceWidth;
          }
          //   原本的path 拆分成2个
          const newFirstTextInfo = {
            ...lastPath,
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
          const newChilePath = genChildPath(fontApp, newSecondText, config);
          const newSecondTextInfo = {
            text: newSecondText,
            path: newSecondTextInfoPath,
            type: pathPartType.en,
            pathBoundingBox: newSecondTextInfoBoundingBox,
            width: newSecondTextInfoPath.advanceWidth,
            chilePath: newChilePath,
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

  return {
    pathPart: context.pathPart,
    position,
    isVertical,
    svgDomSize: {
      width: config.MaxWidth,
      height: config.MaxHeight,
    },
    hasSymbolChar: hasSymbolChar,
    color: config.color || "red",
    colorMode: config.colorMode || "RGB",
    rotate: config.rotate,
    ascentRatioV2: ascentRatioV2,
  };
}
