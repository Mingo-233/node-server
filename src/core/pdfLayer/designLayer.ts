import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createKnifeSvgElement, createElement } from "@/nodes/index";
import { imgMap, fetchImage, isSvgUrl } from "@/utils/imgUtils";
import { getTransformSvg } from "@/utils/svgImgUtils";
import { IDrawingBoardConfig, IDrawingConfigPlus } from "@/type/pdfPage";
import SvgUtil from "@/utils/svgUtils";
import { DPI, PDFLayoutDPI } from "@/utils/constant";
import { getShapeContent } from "./shape/index";
export async function drawImgElement(designItem, config: IDrawingConfigPlus) {
  if (isSvgUrl(designItem.src)) {
    const svgString = (await fetchImage(designItem.src, false)) as string;
    const transformSvg = getTransformSvg(svgString, designItem.fills);
    const imgSvg = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        x: "0",
        y: "0",
        width: designItem.style.width + config.unit,
        height: designItem.style.height + config.unit,
        transform: `translate(${
          (designItem.style.left + config.bleedLineWidth) * DPI
        }, ${(designItem.style.top + config.bleedLineWidth) * DPI})`,
        // transform: `translate(${designItem.style.left}, ${designItem.style.top})`,
      },
      transformSvg
    );
    const context: IPdfSvgContainer<"design-layer"> = {
      type: "img",
      svgString: imgSvg,
    };
    return context;
  } else {
    const imageBuffer = await fetchImage(designItem.src);
    imgMap.set(designItem.src, imageBuffer);
    // 这里内部图片大小大于外侧svg尺寸的时候，会形成clip
    // 如果是group 类型，外层容器就移动了出血线的距离，内部不用额外移动这部分距离
    const translateX = config.isGroup
      ? designItem.style.left * DPI
      : (designItem.style.left + config.bleedLineWidth) * DPI;
    const translateY = config.isGroup
      ? designItem.style.top * DPI
      : (designItem.style.top + config.bleedLineWidth) * DPI;
    const imgSvg = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        x: "0",
        y: "0",
        width: designItem.style.width + config.unit,
        height: designItem.style.height + config.unit,
        transform: `translate(${translateX}, ${translateY})`,
      },
      [
        createElement("image", {
          "xlink:href": designItem.src,
          width: designItem.bg.width + config.unit,
          height: designItem.bg.height + config.unit,
          transform: `translate(${designItem.bg.x * DPI},${
            designItem.bg.y * DPI
          })`,
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

export async function drawShape(designItem, config: IDrawingBoardConfig) {
  const shapeContent =
    getShapeContent({
      width: designItem.style.width,
      height: designItem.style.height,
      uuid: designItem.uuid,
      type: designItem.shapeType ?? "rectangle",
      radius: designItem.style.radius ?? 0,
      fill: designItem.style.color ?? "none",
      stroke: designItem.style.stroke,
      strokeWidth: designItem.style.strokeWidth ?? 0,
      strokeDashArray: designItem.style.strokeDashArray ?? 0,
    }) || "";
  const shapeSvg = createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      transform: `translate(${designItem.style.left}, ${designItem.style.top})`,
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
    const colorMode = config.colorMode === "CMYK" ? "cmyk" : "rgba";
    const fill = backgroundOfFace?.[colorMode] || "#ffffff";
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

export async function drawGroup(
  designItem,
  config: IDrawingBoardConfig,
  knifeData?
) {
  const list = designItem.designs;
  const storeList: IPdfSvgContainer<"design-layer">[] = [];
  //  是否存在Pattern 全局图案
  let hasPattern = false;
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
      const shapeElement = await drawShape(designElement, config);
      storeList.push(shapeElement);
    }
  }
  const svgString = storeList.map((item) => item.svgString).join("");
  const clipPathSvg = hasPattern ? drawBleedClipPath(knifeData, config) : "";

  const groupSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" 
  data-clip="${clipPathSvg}"
  width="${designItem.style.width + config.unit}" 
  height="${designItem.style.height + config.unit}"
   transform="translate(${
     (designItem.style.left + config.bleedLineWidth) * DPI
   }, ${(designItem.style.top + config.bleedLineWidth) * DPI})"
    >
  ${svgString}
  </svg>`;

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "group",
    svgString: groupSvg,
  };
  return context;
}

export function drawBleedClipPath(knifeData: any, config: IDrawingBoardConfig) {
  const bleedsScaleArr = knifeData.bleeds.map((item) => {
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
