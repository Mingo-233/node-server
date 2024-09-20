import {
  createWordPathContext,
  getPath,
  computedFontLineHeight,
} from "./utils";
import { getVerticalTextPaths } from "./parse_zh";
import type { ITextInfoItem, IFontParseParams, IFontParse } from "@/type/parse";

export function parseText(
  fontApp,
  config: IFontParseParams,
  defaultFontApp?
): IFontParse {
  console.log("hasCnWords(config.text", hasCnWords(config.text));

  if (config.vertical && hasCnWords(config.text)) {
    return getVerticalTextPaths(fontApp, config);
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
    // const translateY = lineHeight * context.line;

    const pathTransform = `translate(0,${translateY})`;
    context.addTransform(pathTransform);

    context.resetWord();
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
