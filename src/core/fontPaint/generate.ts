// @ts-nocheck
import { createElement } from "@/nodes/index";

export function genSvgCode(pathWhole, config) {
  const {
    position,
    isVertical,
    pathPartsTransform,
    pathPartsAlignTransform,
    domBoxSize,
    hasCnChar,
    adobeAiTransform = "",
    DPI = 1,
  } = config;
  let svgPathString = "";
  //   判断是个对象
  if (Object.prototype.toString.call(pathWhole) === "[object Object]") {
    // console.log(
    //   "paths",
    //   pathWhole,
    //   pathPartsTransform,
    //   pathPartsAlignTransform
    // );
    const lines = Object.keys(pathWhole);

    for (let i = 0; i < lines.length; i++) {
      let paths = pathWhole[lines[i]];
      const currentLineTransform = pathPartsTransform[i];
      const currentAlignTransform = pathPartsAlignTransform[i];
      paths.forEach((path, index) => {
        if (!path) return;
        let pathString = path.toSVG(6);
        const pathTransform = currentLineTransform[index];
        if (pathTransform) {
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
  }

  // const svgDom = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  let svgDom = "";
  let G_Template = "";
  //   中英文都存在垂直情况
  if (isVertical && hasCnChar) {
    G_Template = `
      <g >
      ${svgPathString}
      </g>
      `;
    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        id: "preview",
        width: domBoxSize.width + "mm",
        height: domBoxSize.height + "mm",
        viewBox: `${position.x1} ${position.y1} ${
          position.x2 + domBoxSize.width
        } ${position.y2 + domBoxSize.height}`,
        transform: `${adobeAiTransform}`,
        fill: "red",
      },
      G_Template
    );
  } else if (isVertical) {
    let originWidth = domBoxSize.width;
    let originHeight = domBoxSize.height;
    // 在Ai中
    const _transform = `${adobeAiTransform}  rotate(90)
translate(0,-${domBoxSize.width * DPI})
      `;
    const G_Transform = ``;
    G_Template = `
      <g ${G_Transform}>
      ${svgPathString}
      </g>
      `;
    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        id: "preview",
        width: domBoxSize.height + "mm",
        height: domBoxSize.width + "mm",
        viewBox: `${position.x1} ${position.y1} ${originHeight} ${originWidth}`,
        transform: `${_transform}`,
        fill: "red",
      },
      G_Template
    );
  } else {
    const G_Transform = ``;
    G_Template = `
      <g ${G_Transform}>
      ${svgPathString}
      </g>
      `;
    svgDom = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        id: "preview",
        width: domBoxSize.width + "mm",
        height: domBoxSize.height + "mm",
        viewBox: `${position.x1} ${position.y1} ${
          position.x2 + domBoxSize.width
        } ${position.y2 + domBoxSize.height}`,
        transform: `${adobeAiTransform}`,
        fill: "red",
      },
      G_Template
    );
  }

  return svgDom;
}
