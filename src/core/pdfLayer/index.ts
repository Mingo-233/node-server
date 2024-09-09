import {
  IPdfLayerMap,
  ILayerType,
  IPdfSvgContainer,
  IPdfLayer,
} from "@/type/pdfLayer";
import type { IKnifeData } from "@/type/knifeData";
import type { IProject } from "@/type/projectData";
import { DPI } from "@/utils/constant";
import { drawBleedLine, drawCutLine, drawFoldLine } from "./knifeLayer";
import { drawImgElement, drawShape, drawFace } from "./designLayer";
import log from "@/utils/log";
export function usePdfLayer() {
  let _pdfLayer: IPdfLayerMap = {
    "knife-layer": _createPdfLayer("knife-layer"),
    "design-layer": _createPdfLayer("design-layer"),
    "annotation-layer": _createPdfLayer("annotation-layer"),
  };
  function drawKnife(knifeData, config) {
    if (!knifeData) return _pdfLayer["knife-layer"];
    const bleedLine = drawBleedLine(knifeData, config);
    _pdfLayer["knife-layer"].children.push(bleedLine);
    const cutLine = drawCutLine(knifeData, config);
    _pdfLayer["knife-layer"].children.push(cutLine);
    const foldLine = drawFoldLine(knifeData, config);
    _pdfLayer["knife-layer"].children.push(foldLine);
    return _pdfLayer["knife-layer"];
  }

  async function drawDesign(designData, knifeData, config) {
    if (!designData) return _pdfLayer["design-layer"];
    const designList = designData.list;

    for (let i = 0; i < designList.length; i++) {
      const designElement = designList[i];
      if (designElement.type === "img") {
        log.info("log-drawImgElement start");
        const imgElement = await drawImgElement(designElement, config);
        _pdfLayer["design-layer"].children.push(imgElement);
      } else if (designElement.type === "shape") {
        log.info("log-drawShape start");
        const shapeElement = await drawShape(designElement, config);
        _pdfLayer["design-layer"].children.push(shapeElement);
      }
    }

    if (Object.keys(designData?.faceBackground).length > 0) {
      log.info("log-drawFace start");
      const faceElement = await drawFace(designData, knifeData.faces, config);
      _pdfLayer["design-layer"].children.push(faceElement);
    }
  }
  function drawAnnotation(annotateData, config) {}
  function getPdfLayer() {
    return _pdfLayer;
  }
  return {
    drawKnife,
    drawDesign,
    drawAnnotation,
    getPdfLayer,
    getKnifeLayer: () => _pdfLayer["knife-layer"],
    getDesignLayer: () => _pdfLayer["design-layer"],
    getAnnotationLayer: () => _pdfLayer["annotation-layer"],
  };
}

function _createPdfLayer<T extends ILayerType>(type: T) {
  return {
    type: type,
    svgString: "",
    children: [] as IPdfSvgContainer<T>[],
    getSvgString: function (config) {
      if (this.svgString) return this.svgString;
      const tempString = this.children.map((item) => item.svgString).join("");
      if (!tempString) return this.svgString;
      const { pageMargin } = config;
      // const transform = pageMargin
      //   ? `transform="translate(${pageMargin.left},${pageMargin.top})"`
      //   : "";
      const containerSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">${tempString}</svg>`;

      this.svgString = containerSvg;
      return this.svgString;
    },
    getSvgChildren: function () {
      return this.children;
    },
  };
}
