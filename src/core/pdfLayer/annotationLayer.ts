import { IPdfSvgContainer, IAnnotationParams } from "@/type/pdfLayer";
import {
  createKnifeSvgElement,
  createElement,
  createSvgElement,
} from "@/nodes/index";
import { createSvgTable } from "./annotation/index";
import type { IKnifeData } from "@/type/knifeData";
import { IDrawingConfigPlus } from "@/type/pdfPage";
import { DPI, PAGE_MARGIN, PAGE_MARK_MARGIN } from "@/utils/constant";
import { height } from "pdfkit/js/page";

export function drawAnnotateLabel(
  params: IAnnotationParams,
  config: IDrawingConfigPlus
) {
  const cellHeight = 30;
  const unit = params.unit;
  const textArray = [
    "Inside dimensions",
    `${params.insideSize.L}(L)x${params.insideSize.W}(W)x${params.insideSize.H}(H) ${unit}`,
    "Outside dimensions",
    `${params.outsideSize.L}(L)x${params.outsideSize.W}(W)x${params.outsideSize.H}(H) ${unit}`,
    "Manufacture dimensions",
    `${params.manufactureSize.L}(L)x${params.manufactureSize.W}(W)x${params.manufactureSize.H}(H) ${unit}`,
    "Material",
    params.material,
    "Thickness",
    `${params.thickness}${unit}`,
  ];
  const sizeLabelSvgString = createSvgTable({
    rows: 5,
    cols: 2,
    cellWidth: 220,
    cellHeight,
    textArray,
  });
  const idLabelSvgString = createSvgTable({
    rows: 2,
    cols: 2,
    cellWidth: 150,
    cellHeight,
    textArray: [
      "Design Area",
      `${params.designArea.width}${unit} X ${params.designArea.height}${unit}`,
      "Dieline ID",
      params.dielineID,
    ],
  });
  const lineLabelSvgString = createSvgTable(
    {
      rows: 3,
      cellWidth: 100,
      cellHeight: 30,
      textArray: ["BLEED", "TRIM", "CREASE"],
    },
    {
      type: "line",
      lineArray: [
        { color: "green", width: 5 },
        { color: "blue", width: 5 },
        { color: "red", width: 5 },
      ],
    }
  );

  const svgString = ` <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="translate(0,0)">
      ${sizeLabelSvgString}
    </g>
    <g transform="translate(500,0)">
      ${idLabelSvgString}
    </g>
    <g transform="translate(800,0)">
      ${lineLabelSvgString}
    </g>
  </svg>
  `;
  const context: IPdfSvgContainer<"annotation-layer"> = {
    type: "annotation",
    svgString,
  };
  return context;
}
// 定位标记
export function drawLocalMarker(params, config: IDrawingConfigPlus) {
  let svgString = "";
  const markerLength = 20;
  const topMargin = (PAGE_MARGIN.top - PAGE_MARK_MARGIN.top) * DPI;
  const leftTopMarker = [
    { x: 0, y: -markerLength },
    { x: 0, y: 0 },
    { x: -markerLength, y: 0 },
  ];
  const rightTopMarker = [
    { x: 0, y: -markerLength },
    { x: 0, y: 0 },
    { x: markerLength, y: 0 },
  ];
  const leftBottomMarker = [
    { x: -markerLength, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: markerLength },
  ];
  const rightBottomMarker = [
    { x: 0, y: markerLength },
    { x: 0, y: 0 },
    { x: markerLength, y: 0 },
  ];
  function getMarkerPath(marker) {
    return marker
      .map((item, index) => {
        return `${index === 0 ? "M" : "L"} ${item.x} ${item.y}`;
      })
      .join(" ");
  }
  const markerSvgProps = {
    width: "20",
    height: "20",
    fill: "none",
    stroke: "black",
    strokeWidth: "1",
    overflow: "visible",
  };
  let markerSvg = createSvgElement(
    {
      ...markerSvgProps,
      transform: `translate(0,${topMargin})`,
    },
    createElement("path", { d: getMarkerPath(leftTopMarker) })
  );
  markerSvg =
    markerSvg +
    createSvgElement(
      {
        ...markerSvgProps,
        transform: `translate(${config.rootSvgSize.width * DPI},${topMargin})`,
      },
      createElement("path", { d: getMarkerPath(rightTopMarker) })
    );
  markerSvg =
    markerSvg +
    createSvgElement(
      {
        ...markerSvgProps,
        transform: `translate(${config.rootSvgSize.width * DPI},${
          topMargin + config.rootSvgSize.height * DPI
        })`,
      },
      createElement("path", { d: getMarkerPath(rightBottomMarker) })
    );
  markerSvg =
    markerSvg +
    createSvgElement(
      {
        ...markerSvgProps,
        transform: `translate(0,${
          topMargin + config.rootSvgSize.height * DPI
        })`,
      },
      createElement("path", { d: getMarkerPath(leftBottomMarker) })
    );
  svgString += markerSvg;
  const context: IPdfSvgContainer<"annotation-layer"> = {
    type: "locale",
    svgString,
  };
  return context;
}

export function drawFooterLabel(
  params: IAnnotationParams,
  config: IDrawingConfigPlus
) {
  let svgString = createSvgElement(
    {
      width: "100",
      height: "100",
      transform: `translate(0,${config.rootSvgSize.height * DPI})`,
    },
    createElement("text", {}, "footer")
  );
  const context: IPdfSvgContainer<"annotation-layer"> = {
    type: "footer",
    svgString,
  };
  return context;
}
