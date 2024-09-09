import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createKnifeSvgElement, createElement } from "@/nodes/index";
import { imgMap, fetchImage, isSvgUrl } from "@/utils/imgUtils";
import { getTransformSvg } from "@/utils/svgImgUtils";
import { IDrawingBoardConfig } from "@/type/pdfPage";
import SvgUtil from "@/utils/svgUtils";
import { DPI, PDFLayoutDPI } from "@/utils/constant";

export async function drawImgElement(designItem, config: IDrawingBoardConfig) {
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
  const svgString = (await fetchImage(designItem.src, false)) as string;
  const transformSvg = getTransformSvg(svgString, []);
  const imgSvg = createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      transform: `translate(${designItem.style.left}, ${designItem.style.top})`,
    },
    transformSvg
  );

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "shape",
    svgString: imgSvg,
  };
  return context;
}
export function drawFace(
  designData: any,
  knifeFaces: any,
  config: IDrawingBoardConfig
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
    },
    pathSvgList
  );
  const context: IPdfSvgContainer<"design-layer"> = {
    type: "knifeFace",
    svgString,
  };
  return context;
}

export function drawGroup(designItem, config: IDrawingBoardConfig) {
  const list = designItem.designs;
  const storeList = [];
  for (let i = 0; i < list.length; i++) {
    const designElement = list[i];
    if (designElement.type === "img") {
      const imgElement = drawImgElement(designElement, config);
    } else if (designElement.type === "shape") {
      const shapeElement = drawShape(designElement, config);
    }
  }

  const context: IPdfSvgContainer<"design-layer"> = {
    type: "group",
    svgString: "",
  };
  return context;
}
