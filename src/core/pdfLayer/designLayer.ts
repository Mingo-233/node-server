import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createElement } from "@/nodes/index";
import { imgMap, fetchImage, isSvgUrl } from "@/utils/imgUtils";
import { getTransformSvg } from "@/utils/svgImgUtils";
import { IDrawingBoardConfig } from "@/type/pdfPage";

export async function drawImgElement(designItem, config: IDrawingBoardConfig) {
  if (isSvgUrl(designItem.src)) {
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
      type: "img",
      svgString: imgSvg,
    };
    return context;
  } else {
    const imageBuffer = await fetchImage(designItem.src);
    imgMap.set(designItem.src, imageBuffer);
    const imgSvg = createElement(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        transform: `translate(${designItem.style.left}, ${designItem.style.top})`,
      },
      [
        createElement("image", {
          "xlink:href": designItem.src,
          width: designItem.style.width + config.unit,
          height: designItem.style.height + config.unit,
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
