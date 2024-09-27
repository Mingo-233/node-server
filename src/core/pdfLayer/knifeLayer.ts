import { IPdfSvgContainer } from "@/type/pdfLayer";
import { createKnifeSvgElement, createElement } from "@/nodes/index";
import SvgUtil from "@/utils/svgUtils";
import type { IKnifeData } from "@/type/knifeData";
import {
  IColorMode,
  IDrawingBoardConfig,
  IDrawingConfigPlus,
} from "@/type/pdfPage";
import { fitColor } from "@/utils/color";

export function drawBleedLine(
  knifeData: IKnifeData,
  config: IDrawingConfigPlus
) {
  const bleedPath = SvgUtil.dlist_to_d(knifeData.bleeds);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
      side: config.side,
      pageSize: config.pageSize,
      pageMargin: config.pageMargin,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      stroke: fitColor("#00ff00", config.colorMode),
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
  config: IDrawingConfigPlus
) {
  const foldPath = SvgUtil.folds_to_d(knifeData.folds);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
      side: config.side,
      pageSize: config.pageSize,
      pageMargin: config.pageMargin,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      stroke: fitColor("#ff0000", config.colorMode),
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

export function drawCutLine(knifeData: IKnifeData, config: IDrawingConfigPlus) {
  const cutPath = SvgUtil.cut_to_d(knifeData.cuts, knifeData.holes);
  const svgString = createKnifeSvgElement(
    {
      width: config.rootSvgSize.width,
      height: config.rootSvgSize.height,
      unit: config.unit,
      side: config.side,
      pageSize: config.pageSize,
      pageMargin: config.pageMargin,
    },
    createElement("path", {
      "stroke-width": config.strokeWidth.toString(),
      stroke: fitColor("#0000ff", config.colorMode),
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
