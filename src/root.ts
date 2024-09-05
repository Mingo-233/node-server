import { usePdfDoc } from "./core/pdfDoc/index";
import { usePdfLayer } from "./core/pdfLayer/index";
import { getDrawingBoardConfig } from "./utils";
import { createPageApp } from "./core/pdfPage";
import util from "util";
// import projectData from "./store/info.json";
// import knifeData from "./store/knife.json";

import projectData from "./store/proInfo.json";
import knifeData from "./store/proKnife.json";
function getMockData() {
  return {
    projectData,
    knifeData,
    params: {},
  };
}
// const drawingBoardConfig = getDrawingBoardConfig(
//   getMockData().knifeData,
//   getMockData().params
// );

const pageApp = createPageApp(knifeData, {
  unit: "mm",
  colorMode: "CMYK",
});
pageApp.registerFace(getMockData().knifeData, getMockData().projectData);
console.log(pageApp);
// console.log(
//   util.inspect(pageApp.pages[0], {
//     depth: null,
//     colors: true,
//   })
// );
pageApp.paint();
const pdfDoc = usePdfDoc(pageApp.pageSize, pageApp.pageMargin);

pdfDoc.pdfInit();
pageApp.pages.forEach((page, index) => {
  let knifeSvgArr = page.face?.knifeLayer.getSvgChildren();
  if (knifeSvgArr) {
    knifeSvgArr.forEach((knifeSvg) => {
      pdfDoc.addSVG(knifeSvg.svgString);
    });
  }
  // knifeSvg && pdfDoc.addSVG(knifeSvg);
  let designSvg = page.face?.designLayer.getSvgString();
  designSvg && pdfDoc.addSVG(designSvg);
  let annotateSvg = page.face?.annotationLayer.getSvgString();
  annotateSvg && pdfDoc.addSVG(annotateSvg);
  if (index !== pageApp.pages.length - 1) {
    pdfDoc.addPage();
  }
});
pdfDoc.end();
export function pdfMain() {}
