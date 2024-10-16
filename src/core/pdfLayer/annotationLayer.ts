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
import { fitColor } from "@/utils/color";

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
  const sizeLabelSvgString = createSvgTable(
    {
      rows: 5,
      cols: 2,
      cellWidth: 220,
      cellHeight,
      textArray,
    },
    {
      textColor: fitColor("#000000", config.colorMode),
    }
  );
  const idLabelSvgString = createSvgTable(
    {
      rows: 2,
      cols: 2,
      cellWidth: 150,
      cellHeight,
      textArray: [
        "Design area",
        `${params.designArea.width}${unit} X ${params.designArea.height}${unit}`,
        "Model ID",
        params.dielineID,
      ],
    },
    {
      textColor: fitColor("#000000", config.colorMode),
    }
  );
  const lineLabelSvgString = createSvgTable(
    {
      rows: 3,
      cellWidth: 100,
      cellHeight: 30,
      textArray: ["BLEED", "TRIM", "CREASE"],
      textColor: fitColor("#000000", config.colorMode),
    },
    {
      type: "line",
      lineArray: [
        {
          color: fitColor(config.knifeColor.bleed, config.colorMode),
          width: 5,
        },
        { color: fitColor(config.knifeColor.cut, config.colorMode), width: 5 },
        { color: fitColor(config.knifeColor.fold, config.colorMode), width: 5 },
      ],
      textColor: fitColor("#000000", config.colorMode),
    }
  );

  const svgString = ` <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="translate(0,0)">
    ${sizeLabelSvgString}
    </g>
    <g transform="translate(500,0)">
    ${idLabelSvgString}
    </g>
    <g transform="translate(850,0)">
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
export function drawLocalMarker(
  params: IAnnotationParams,
  config: IDrawingConfigPlus
) {
  let svgString = "";
  const markerLength = 20;
  const topMargin = (PAGE_MARGIN.top - PAGE_MARK_MARGIN.top) * DPI;

  const rootSvgWidth =
    (Number(params.designArea.width) + 2 * config.bleedLineWidth) * DPI;
  const rootSvgHeight =
    (Number(params.designArea.height) + 2 * config.bleedLineWidth) * DPI;
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
    stroke: fitColor("#000000", config.colorMode),
    strokeWidth: "0.2",
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
        transform: `translate(${rootSvgWidth},${topMargin})`,
      },
      createElement("path", { d: getMarkerPath(rightTopMarker) })
    );
  markerSvg =
    markerSvg +
    createSvgElement(
      {
        ...markerSvgProps,
        transform: `translate(${rootSvgWidth},${topMargin + rootSvgHeight})`,
      },
      createElement("path", { d: getMarkerPath(rightBottomMarker) })
    );
  markerSvg =
    markerSvg +
    createSvgElement(
      {
        ...markerSvgProps,
        transform: `translate(0,${topMargin + rootSvgHeight})`,
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

export function drawFooterLabel(params, config: IDrawingConfigPlus) {
  const footerLabelWidth = params.text.length * 12.5 || 100;
  const rootSvgWidth =
    Number(params.designArea.width) + 2 * config.bleedLineWidth;
  const rootSvgHeight =
    Number(params.designArea.height) + 2 * config.bleedLineWidth;
  const translateX = (rootSvgWidth * DPI - footerLabelWidth) / 2;
  const translateY = (rootSvgHeight + PAGE_MARGIN.top) * DPI;
  let svgString = createSvgElement(
    {
      width: footerLabelWidth.toString(),
      height: "50",
      transform: `translate(${translateX},${translateY})`,
    },
    createElement(
      "text",
      {
        x: "0",
        y: "25",
        "font-size": "24",
        fill: fitColor("#000000", config.colorMode),
      },
      params.text
    )
  );
  const context: IPdfSvgContainer<"annotation-layer"> = {
    type: "footer",
    svgString,
  };
  return context;
}
