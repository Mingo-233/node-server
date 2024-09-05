import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createKnifeSvgElement, createElement } from "@/nodes/index";
import SvgUtil from "@/utils/svgUtils";
import type { IKnifeData } from "@/type/knifeData";
import { IDrawingBoardConfig } from "@/type/pdfPage";

export function drawBleedLine(
  knifeData: IKnifeData,
  config: IDrawingBoardConfig
) {
  const bleedPath = SvgUtil.dlist_to_d(knifeData.bleeds);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
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

export function drawFoldLine(
  knifeData: IKnifeData,
  config: IDrawingBoardConfig
) {
  const foldPath = SvgUtil.folds_to_d(knifeData.folds);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      stroke: "#ff0000",
      fill: "none",
      d: foldPath,
      transform: `translate(${config.bleedLineWidth}, ${config.bleedLineWidth})`,
    })
  );
  const context: IPdfSvgContainer<"knife-layer"> = {
    type: "foldLine",
    svgString,
  };
  return context;
}

export function drawCutLine(
  knifeData: IKnifeData,
  config: IDrawingBoardConfig
) {
  const cutPath = SvgUtil.cut_to_d(knifeData.cuts, knifeData.holes);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      stroke: "#0000ff",
      fill: "none",
      d: cutPath,
      transform: `translate(${config.bleedLineWidth}, ${config.bleedLineWidth})`,
    })
  );
  const context: IPdfSvgContainer<"knife-layer"> = {
    type: "bleedLine",
    svgString,
  };
  return context;
}
