import {
  createWordPathContext,
  isSymbolChar,
  computedPathTransform,
  isSpace,
  getPath,
  computedFontLineHeight,
  identifyNext,
  pathPartType,
  genChildPath,
  isBreakChar,
  isReturnChar,
} from "./utils";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";

export function getVerticalTextPaths(
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

  // 文字间隙 在浏览器环境中默认值为normal
  const { lineHeight, baseLineRatio, ascentRatioV2 } = computedFontLineHeight({
    unitsPerEm: config.fontOption.unitsPerEm,
    ascent: config.fontOption.ascent,
    fontSize: config.fontSize,
    lineHeight: config.textLineHeight,
    descent: config.fontOption.descent,
    fontName: config.fontOption.fontName,
  });
  const baseLineHeight = lineHeight * baseLineRatio;
  const isVertical = !!config.vertical;
  const letterSpace = isVertical
    ? config.fontSize * 0.05
    : config.fontSize * 0.1;

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
    let translateX;
    // 如果是第一列,移动一个基线位置的距离即可
    if (currentLine === 1) {
      translateX = MAX_WIDTH - baseLineHeight;
    } else {
      translateX =
        MAX_WIDTH - baseLineHeight - config.textLineHeight * (currentLine - 1);
    }
    //当前这列上这个字是第几个,计算垂直方向偏移量
    const translateY = isFirstWord
      ? colAccumulatorHeight
      : colAccumulatorHeight + letterSpace;
    if (textInfo.type === pathPartType.zh) {
      const transform = `translate(${translateX},${translateY})`;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        MAX_HIGHT,
        maxContentHeightArr[currentLine - 1],
        "ver"
      );
      context.addAlignTransform(alignTransform);
      const selfHeight = isFirstWord
        ? maxItemHeight
        : maxItemHeight + letterSpace;
      colAccumulatorHeight = colAccumulatorHeight + selfHeight;
      isFirstWord = false;
    } else {
      // 先平移到目标位置 然后绕svg左上角圆点旋转90度，然后再平移修复旋转移动的距离
      const transform = `translate(${translateX},${translateY}) rotate(90,${position.x1},${position.y1}) translate(0,-${maxItemWidth})`;
      context.addTransform(transform);
      const alignTransform = computedPathTransform(
        config.textAlign,
        MAX_HIGHT,
        maxContentHeightArr[currentLine - 1],
        "ver"
      );
      context.addAlignTransform(alignTransform);

      let selfPathHeight: any = textInfo.height;
      if (!selfPathHeight) {
        selfPathHeight = textInfo.path.advanceWidth;
      }
      const selfHeight = isFirstWord
        ? selfPathHeight
        : selfPathHeight + letterSpace;
      colAccumulatorHeight = colAccumulatorHeight + selfHeight;
      isFirstWord = false;
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
    for (let i = 0; i < textArr.length; i++) {
      if (i <= identifiedIndex) {
        continue;
      }
      const textItem = textArr[i];
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
        const app = config.fontOption.isSupCnMainFontApp
          ? fontApp
          : defaultFontApp;
        const path = getPath(app, textItem, config.fontSize);
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
        // 如果先解析英文，英文的高度是低于中文字符的。放一起显示viewbox就会有问题
        // 所以当前优先使用汉字的位置
        if (i === 0 || position.y1 > pathBoundingBox.y1) {
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
        const result = identifyNext(fontApp, textItem, i, textArr, config);
        if (!result.path) continue;
        identifiedIndex = result.lastIndex;
        // 因为英文要旋转过来，所以它的宽度就是高度
        const currentPathHeight = result.path.advanceWidth;

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
    outerLoop: for (let index = 0; index < textInfoArr.length; index++) {
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
        if (textInfo.chilePath?.length) {
          let preAccumulatorPathHeight =
            accumulatorPathHeight - _heightAddLetterSpace;
          let storeChild = textInfo.chilePath;
          let lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
          let lastPathHeight = lastPath.path.advanceWidth;
          // 从children找到能刚好能排列下的子路径
          while (
            preAccumulatorPathHeight + lastPathHeight > MAX_HIGHT &&
            textInfo.chilePath.length >= 1
          ) {
            // 英文字符拆解到一个字母的时候，加进去也超出宽度的情况，即一个字母也加不了，应直接换行
            if (textInfo.chilePath.length === 1) {
              accumulatorPathHeight = preAccumulatorPathHeight;
              textInfo.chilePath = storeChild;
              doBreak(index);
              index--;
              continue outerLoop; // 跳到外层的 for 循环的下一次迭代
            }
            textInfo.chilePath.pop();
            lastPath = textInfo.chilePath[textInfo.chilePath.length - 1];
            lastPathHeight = lastPath.path.advanceWidth;
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
            height: newSecondTextInfoPath.advanceWidth,
            chilePath: newChilePath,
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
    ascentRatioV2,
  };
}
