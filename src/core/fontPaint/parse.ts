// @ts-nocheck
import { createWordPathContext, getPath } from "./utils";
import { getVerticalTextPaths } from "./parse_zh";
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

function hasCnWords(str) {
  return /[\u4e00-\u9fa5]/.test(str);
}
