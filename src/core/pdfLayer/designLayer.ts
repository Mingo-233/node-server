import { IPdfSvgContainer } from "@/type/pdfLayer";
import {
  createKnifeSvgElement,
  createElement,
  createSvgElement,
} from "@/nodes/index";
import { fetchAssets, isSvgUrl } from "@/utils/request";
import { getTransformSvg, svgCmykHandle } from "@/utils/svgImgUtils";
import { IDrawingBoardConfig, IDrawingConfigPlus } from "@/type/pdfPage";
import { IFontParseParams } from "@/type/parse";
import SvgUtil from "@/utils/svgUtils";
import { DPI, PDFLayoutDPI } from "@/utils/constant";
import { getShapeContent } from "./shape/index";
import { getDefaultFontApp } from "@/core/fontPaint/index";
import wawoff from "wawoff2";
import opentype from "opentype.js";
import {
  parseText,
  transformText,
  genTextSvg,
  matchSymbol,
  isCharSupported,
} from "@/core/fontPaint/index";
import { fitColor } from "@/utils/color";
export async function drawImgElement(designItem, config: IDrawingConfigPlus) {
  const { style } = designItem;
  // 如果是group 类型，外层容器就移动了出血线的距离，内部不用额外移动这部分距离
  const translateX = config.isGroup
    ? style.left * DPI
    : (style.left + config.bleedLineWidth) * DPI;
  const translateY = config.isGroup
    ? style.top * DPI
    : (style.top + config.bleedLineWidth) * DPI;
  const rotateTransform = style.rotate
    ? `rotate(${style.rotate},${translateX + (style.width / 2) * DPI},${
        translateY + (style.height / 2) * DPI
      })`
    : "";
  const _opacity = (style.opacity && style.opacity / 100) || 1;
  let _flip = "";
  if (style.rotateX) {
    _flip = `scale(-1,1) translate(${-style.width * DPI},0)`;
  } else if (style.rotateY) {
    _flip = `scale(1,-1) translate(0,${-style.height * DPI})`;
  }
  if (isSvgUrl(designItem.src)) {
    const svgString = (await fetchAssets(designItem.src)) as string;
    let transformSvg = getTransformSvg(svgString, designItem.fills, {
      colorMode: config.colorMode,
      transform: _flip ? _flip : "",
    });
    if (config.colorMode === "CMYK") {
      transformSvg = svgCmykHandle(transformSvg);
    }
    const imgSvg = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        x: "0",
        y: "0",
        width: style.width + config.unit,
        height: style.height + config.unit,
        opacity: _opacity.toString(),
        transform: `${rotateTransform} translate(${translateX}, ${translateY}) `,
      },
      transformSvg
    );

    const context: IPdfSvgContainer<"design-layer"> = {
      type: "img",
      svgString: imgSvg,
    };
    return context;
  } else {
    const imageBuffer = await fetchAssets(designItem.src);
    // 这里内部图片大小大于外侧svg尺寸的时候，会形成clip

    const imgSvg = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        x: "0",
        y: "0",
        width: style.width + config.unit,
        height: style.height + config.unit,
        // 在pdf导出旋转中心默认是原点，所以这里要指定旋转中心
        // 先旋转 后平移 ，可以少减少一次移动
        transform: `${rotateTransform} translate(${translateX}, ${translateY}) `,
      },
      [
        createElement("image", {
          "xlink:href": designItem.src,
          opacity: _opacity.toString(),
          width: designItem.bg.width + config.unit,
          height: designItem.bg.height + config.unit,
          transform: `${_flip ? _flip : ""} translate(${
            designItem.bg.x * DPI
          },${designItem.bg.y * DPI})`,
        }),
      ]
    );

    const context: IPdfSvgContainer<"design-layer"> = {
      type: "img",
      svgString: imgSvg,
    };
    return context;
  }
}

export async function drawShape(designItem, config: IDrawingConfigPlus) {
  const { style } = designItem;
  const _opacity = (style.opacity && style.opacity / 100) || 1;

  const shapeContent =
    getShapeContent({
      width: style.width,
      height: style.height,
      uuid: designItem.uuid,
      type: designItem.shapeType ?? "rectangle",
      radius: style.radius ?? 0,
      fill: fitColor(style.color, config.colorMode) ?? "none",
      stroke: fitColor(style.stroke, config.colorMode),
      strokeWidth: style.strokeWidth ?? 0,
      strokeDashArray: style.strokeDashArray ?? 0,
    }) || "";
  const translateX = config.isGroup
    ? style.left * DPI
    : (style.left + config.bleedLineWidth) * DPI;
  const translateY = config.isGroup
    ? style.top * DPI
    : (style.top + config.bleedLineWidth) * DPI;
  const rotateTransform = style.rotate
    ? `rotate(${style.rotate},${translateX + (style.width / 2) * DPI},${
        translateY + (style.height / 2) * DPI
      })`
    : "";
  const shapeSvg = createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      transform: `${rotateTransform} translate(${translateX}, ${translateY})`,
      width: style.width + config.unit,
      height: style.height + config.unit,
      opacity: _opacity.toString(),
    },
    shapeContent
  );

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "shape",
    svgString: shapeSvg,
  };
  return context;
}
export function drawFace(
  designData: any,
  knifeFaces: any,
  config: IDrawingConfigPlus
) {
  const faceBackground = designData.faceBackground || {};
  const faceNames = Object.keys(faceBackground);
  const filterFaces = knifeFaces.filter((item) =>
    faceNames.includes(item.name)
  );
  const facePathList = SvgUtil.face_to_d_list(filterFaces);
  const pathSvgList = facePathList.map((facePath) => {
    const backgroundOfFace = faceBackground[facePath.name];
    const fill = fitColor(backgroundOfFace?.rgba, config.colorMode);

    return createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      fill: fill,
      d: facePath.d,
      transform: `translate(${config.bleedLineWidth}, ${config.bleedLineWidth})`,
    });
  });
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
      side: config.side,
      pageSize: config.pageSize,
      pageMargin: config.pageMargin,
    },
    pathSvgList
  );
  const context: IPdfSvgContainer<"design-layer"> = {
    type: "knifeFace",
    svgString,
  };
  return context;
}
export function drawBackground(color, knifeData, config) {
  const svgString = createSvgElement(
    {
      width: knifeData.totalX + config.unit,
      height: knifeData.totalY + config.unit,
    },
    createElement("rect", {
      fill: fitColor(color, config.colorMode),
      width: "100%",
      height: "100%",
    })
  );
  const clipPathSvg = drawBleedClipPath(knifeData, config);
  const transform =
    config.side === "inside"
      ? `scale(-1, 1) translate(-${config.rootSvgSize.width * DPI},0)`
      : "";
  const groupSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
  data-clip="${clipPathSvg}"
  transform="${transform}"
    >
  ${svgString}
  </svg>`;
  const context: IPdfSvgContainer<"design-layer"> = {
    type: "knifeFace",
    svgString: groupSvg,
  };
  return context;
}
export async function drawGroup(
  designItem,
  config: IDrawingBoardConfig,
  knifeData?
) {
  const list = designItem.designs;
  const storeList: IPdfSvgContainer<"design-layer">[] = [];
  //  是否存在Pattern 全局图案
  let hasPattern = false;
  const { style } = designItem;

  for (let i = 0; i < list.length; i++) {
    const designElement = list[i];

    if (designElement._is_texture) hasPattern = true;
    if (designElement.type === "img") {
      const imgElement = await drawImgElement(designElement, {
        ...config,
        isGroup: true,
      });
      storeList.push(imgElement);
    } else if (designElement.type === "shape") {
      const shapeElement = await drawShape(designElement, {
        ...config,
        isGroup: true,
      });
      storeList.push(shapeElement);
    } else if (designElement.type === "font") {
      const fontElement = await drawFont(designElement, {
        ...config,
        isGroup: true,
      });
      storeList.push(fontElement);
    }
  }
  const svgString = storeList.map((item) => item.svgString).join("");
  const clipPathSvg = hasPattern ? drawBleedClipPath(knifeData, config) : "";

  const groupSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
  data-clip="${clipPathSvg}"
  width="${style.width + config.unit}" 
  height="${style.height + config.unit}"
   transform="translate(${style.left * DPI}, ${style.top * DPI})"
    >
  ${svgString}
  </svg>`;

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "group",
    svgString: groupSvg,
  };
  return context;
}
// 生成刀线的剪切路径
export function drawBleedClipPath(knifeData: any, config: IDrawingBoardConfig) {
  const _bleeds = JSON.parse(JSON.stringify(knifeData.bleeds));
  const bleedsScaleArr = _bleeds.map((item) => {
    if (item.x) {
      item.x = item.x * DPI;
    }
    if (item.y) {
      item.y = item.y * DPI;
    }
    return item;
  });
  const bleedPath = SvgUtil.dlist_to_d(bleedsScaleArr);
  return bleedPath;
}

export async function drawFont(designItem, config: IDrawingConfigPlus) {
  const { style } = designItem;
  const fontBuffer = await fetchAssets(designItem.src);
  const data = await wawoff.decompress(fontBuffer);
  const arrayBuffer = data.buffer.slice(
    data.byteOffset,
    data.byteOffset + data.byteLength
  );
  let fontApp = opentype.parse(arrayBuffer);
  // 主字体文件是否支持中文
  //TODO: 当前判断条件是字体文件的字形数量是否大于5000 ，待完善
  let isSupCnMainFontApp = fontApp.glyphs?.length > 5000;
  if (fontApp.glyphs?.length < 26) {
    // 如果当前字体文件连26个字母都没有，切换备用字体文件
    fontApp = await getDefaultFontApp();
  }
  let defaultFontApp: any = undefined;
  const matchResult = matchSymbol(designItem.value);

  if (matchResult) {
    const matchChar = matchResult[0];
    const isSup = isCharSupported(fontApp, matchChar);
    if (!isSup) {
      defaultFontApp = await getDefaultFontApp();
    }
  }

  const unitsPerEm = fontApp.unitsPerEm; // 字体设计单位
  const ascent = fontApp.ascender; // 字体的上升高度
  const descent = fontApp.descender; // 字体的下降高度
  const parseParams: IFontParseParams = {
    text: designItem.value,
    fontSize: style.fontSize,
    textLineHeight: style.lineHeight,
    textAlign: style.textAlign,
    vertical: !!style.vertical,
    rotate: style.rotate,
    MaxWidth: style.width,
    MaxHeight: style.height,
    color: style.color,
    fontOption: {
      unitsPerEm,
      ascent,
      descent,
      fontName: designItem.example,
      isSupCnMainFontApp: isSupCnMainFontApp,
    },
  };
  const parseResult = parseText(fontApp, parseParams, defaultFontApp);
  const textConfig = transformText(parseResult, {
    bleedLineWidth: config.bleedLineWidth,
    color: style.color,
    colorMode: config.colorMode,
    unit: config.unit,
    style: {
      left: style.left,
      top: style.top,
    },
    isGroup: config.isGroup,
  });
  const svgDom = genTextSvg(textConfig);
  const context: IPdfSvgContainer<"design-layer"> = {
    type: "font",
    svgString: svgDom,
  };
  return context;
}

// function fsSaveFile(context, name = "test.svg") {
//   const fs = require("fs");
//   const path = require("path");
//   const pwdPath = process.cwd();
//   const filePath = path.resolve(pwdPath, "./dist/output");
//   fs.writeFileSync(`${filePath}/${name}`, context);
//   console.log("file saved");
// }
