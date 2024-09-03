import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createKnifeSvgElement, createElement } from "@/nodes/index";
import SvgUtil from "@/utils/svgUtils";
import type { IKnifeData } from "@/type/knifeData";

export function drawBleedLine(knifeData: IKnifeData, config) {
  const bleedPath = SvgUtil.dlist_to_d(knifeData.bleeds);
  const svgString = createKnifeSvgElement(
    {
      width: config.globalSvgWidth,
      height: config.globalSvgHeight,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth,
      stroke: "#00ff00",
      fill: "none",
      d: bleedPath,
    })
  );
  const context: IPdfSvgContainer<"knife-layer"> = {
    type: "bleedLine",
    svgString,
  };
  return context;
}
