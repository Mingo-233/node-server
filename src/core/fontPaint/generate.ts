import { createElement } from "@/nodes/index";
import type { IFontGenerateParams } from "@/type/parse";

export function genTextSvg(config: IFontGenerateParams) {
  const {
    pathPart,
    position,
    isVertical,
    svgDomSize,
    hasSymbolChar,
    pageMargin,
    rotate = 0,
    DPI = 1,
  } = config;
  let svgPathString = "";
  const pageMarginTranslate = `translate(${pageMargin.left}, ${pageMargin.top})`;
  // 旋转中心点
  const rotateCenter = rotate
    ? `${pageMargin.left + (svgDomSize.width / 2) * DPI},${
        pageMargin.top + (svgDomSize.height / 2) * DPI
      }`
    : `0,0`;
  const lines = Object.keys(pathPart);
  for (let i = 0; i < lines.length; i++) {
    let pathInfo = pathPart[lines[i]];
    let paths = pathInfo.part;
    const currentLineTransform = pathInfo.transform;
    const currentAlignTransform = pathInfo.alignTransform;
    paths.forEach((path, index) => {
      if (!path) return;
      let pathString = path.toSVG(6);
      const pathTransform = currentLineTransform[index];
      if (pathTransform) {
        //  <path 后面插入 transform
        pathString = `${pathString.slice(
          0,
          5
        )} transform="${pathTransform}" ${pathString.slice(5)}`;
      }
      const alignTransform = currentAlignTransform[index];
      const template = `
                  <g transform="${alignTransform ? alignTransform : ""}">
                      ${pathString}
                  </g>
                  `;
      svgPathString += template;
    });
  }

  let svgDom = "";
  let G_Template = "";
  //   中英文都存在垂直情况
  if (isVertical && hasSymbolChar) {
    G_Template = `
      <g >
      ${svgPathString}
      </g>
      `;
    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: svgDomSize.width + config.unit,
        height: svgDomSize.height + config.unit,
        viewBox: `${position.x1} ${position.y1} ${
          position.x2 + svgDomSize.width
        } ${position.y2 + svgDomSize.height}`,
        transform: `rotate(${rotate},${rotateCenter}) ${pageMarginTranslate}`,
        fill: config.renderColor,
      },
      G_Template
    );
  } else if (isVertical) {
    // 纯英文 垂直情况
    let originWidth = svgDomSize.width;
    let originHeight = svgDomSize.height;
    const _transform = `${pageMarginTranslate}  rotate(90)
translate(0,-${svgDomSize.width * DPI})
      `;
    G_Template = `
      ${svgPathString}
      `;

    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: svgDomSize.height + config.unit,
        height: svgDomSize.width + config.unit,
        viewBox: `${position.x1} ${position.y1} ${originHeight} ${originWidth}`,
        transform: `rotate(${rotate},${rotateCenter}) ${_transform}`,
        fill: config.renderColor,
      },
      G_Template
    );
  } else {
    G_Template = `
      ${svgPathString}
      `;

    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: svgDomSize.width + config.unit,
        height: svgDomSize.height + config.unit,
        viewBox: `${position.x1} ${position.y1} ${
          position.x2 + svgDomSize.width
        } ${position.y2 + svgDomSize.height}`,
        transform: `rotate(${rotate},${rotateCenter}) ${pageMarginTranslate}`,
        fill: config.renderColor,
      },
      G_Template
    );
  }

  return svgDom;
}
