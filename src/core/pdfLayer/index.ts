import {
  IPdfLayerMap,
  ILayerType,
  IPdfSvgContainer,
  IPdfLayer,
} from "@/type/pdfLayer";
import type { IKnifeData } from "@/type/knifeData";
import type { IProject } from "@/type/projectData";
import { DPI } from "@/utils/constant";
import { drawBleedLine } from "./knifeLayer";
export function usePdfLayer(
  knifeData: IKnifeData,
  projectData: IProject,
  drawingBoardConfig: any
) {
  let _pdfLayer: IPdfLayerMap = {
    "knife-layer": _createPdfLayer("knife-layer"),
    "design-layer": _createPdfLayer("design-layer"),
    "other-layer": _createPdfLayer("other-layer"),
  };
  function drawKnife() {
    // draw knife
    const bleedLine = drawBleedLine(knifeData, drawingBoardConfig);
    _pdfLayer["knife-layer"].children.push(bleedLine);
    return _pdfLayer["knife-layer"];
  }
  function drawDesign() {}
  function drawOther() {}
  function getPdfLayer() {
    return _pdfLayer;
  }
  return {
    drawKnife,
    drawDesign,
    drawOther,
    getPdfLayer,
    getKnifeLayer: () => _pdfLayer["knife-layer"],
    getDesignLayer: () => _pdfLayer["design-layer"],
    getOtherLayer: () => _pdfLayer["other-layer"],
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
  };
}
