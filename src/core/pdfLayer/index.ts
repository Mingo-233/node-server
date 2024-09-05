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

  function drawDesign(designData, config) {}
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
    getSvgString: function () {
      if (this.svgString) return this.svgString;
      const tempString = this.children.map((item) => item.svgString).join("");
      this.svgString = tempString;
      return this.svgString;
    },
    getSvgChildren: function () {
      return this.children;
    },
  };
}
