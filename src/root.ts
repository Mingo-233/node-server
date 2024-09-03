import { usePdfDoc } from "./core/pdfDoc/index";
import { usePdfLayer } from "./core/pdfLayer/index";
import { getDrawingBoardConfig } from "./utils";
import projectData from "./store/info.json";
import knifeData from "./store/knife.json";
function getMockData() {
  return {
    projectData,
    knifeData,
    params: {},
  };
}
const drawingBoardConfig = getDrawingBoardConfig(
  getMockData().knifeData,
  getMockData().projectData,
  getMockData().params
);
const { pdfInit, addSVG, end } = usePdfDoc(drawingBoardConfig);
pdfInit();
const pdfLayer = usePdfLayer(
  getMockData().knifeData,
  getMockData().projectData,
  drawingBoardConfig
);
const knifeLayer = pdfLayer.drawKnife();
function pageOne() {
  addSVG(knifeLayer.getSvgString());
  end();
}

export function pdfMain() {
  pageOne();
}

pageOne();
