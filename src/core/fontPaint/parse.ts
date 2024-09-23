import {
  createWordPathContext,
  getPath,
  computedFontLineHeight,
} from "./utils";
import { getVerticalTextPaths } from "./parse_zh";
import { parseTextV2 } from "./parse_en_v2";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";

export function parseText(
  fontApp,
  config: IFontParseParams,
  defaultFontApp?
): IFontParse {
  if (config.vertical && hasCnWords(config.text)) {
    return getVerticalTextPaths(fontApp, config);
  } else {
    return parseTextV2(fontApp, config, defaultFontApp);
  }
  const textArr = config.text.split("");
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
    descent: config.fontOption.descent,
    fontName: config.fontOption.fontName,
    fontSize: config.fontSize,
    lineHeight: config.textLineHeight,
  });

  const isVertical = !!config.vertical;
  //   编辑器中的选框大小
  const MAX_WIDTH = isVertical ? config.MaxHeight : config.MaxWidth;
  const MAX_HIGHT = isVertical ? config.MaxWidth : config.MaxHeight;
  let rowAccumulatorWeight = 0;
  let offsetX = 0;
  for (let i = 0; i < textArr.length; i++) {
    const text = textArr[i];
    if (text === "\n") {
      settleRow(context);
      context.nextLine();
      // 跳过 换行字符的处理
      continue;
    }
    context.addWord(text);
    const path = getPath(fontApp, context.word, config.fontSize);
    const pathBoundingBox = path.getBoundingBox();
    if (i === 0) {
      position.x1 = pathBoundingBox.x1;
      position.y1 = pathBoundingBox.y1;
    }
    const currentPathWidth = pathBoundingBox.x2 - pathBoundingBox.x1;
    rowAccumulatorWeight = rowAccumulatorWeight + currentPathWidth;
    // 超出选框边界
    if (rowAccumulatorWeight > MAX_WIDTH) {
      settleRow(context);
      context.nextLine();
      // 回退一步
      i--;
      continue;
    }
    //   end 最后一个字符
    if (i === textArr.length - 1) {
      settleRow(context);
      continue;
    }
    context.addPath(path);
    context.addTransform(`translate(${offsetX},0)`);
    offsetX = offsetX + currentPathWidth;
  }
  //   结算当前行
  function settleRow(context) {
    const transform = computedAlignTransform(
      config.textAlign,
      MAX_WIDTH,
      rowAccumulatorWeight
    );
    context.addAlignTransform(transform);

    const translateY = lineHeight * context.line + lineHeightTop;
    // const translateY = lineHeight * context.line;

    const pathTransform = `translate(0,${translateY})`;
    context.addTransform(pathTransform);

    context.resetWord();
    rowAccumulatorWeight = 0;
  }
  function computedAlignTransform(textAlign, maxWidth, currentWidth) {
    let translateX = 0;
    switch (textAlign) {
      case "center":
        translateX = (maxWidth - currentWidth) / 2;
        return `translate(${translateX},0)`;
      case "right":
        translateX = maxWidth - currentWidth;
        return `translate(${translateX},0)`;

      default:
        return "";
    }
  }
  return {
    pathPart: context.pathPart,
    position,
    isVertical,
    hasSymbolChar: false,
    svgDomSize: {
      width: config.MaxWidth,
      height: config.MaxHeight,
    },
    color: config.color || "red",
    colorMode: config.colorMode || "RGB",
    rotate: config.rotate,
  };
}

function hasCnWords(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}
