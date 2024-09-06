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
import { drawImgElement } from "./designLayer";
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

  async function drawDesign(designData, config) {
    if (!designData) return _pdfLayer["design-layer"];
    for (let i = 0; i < designData.length; i++) {
      const designElement = designData[i];
      if (designElement.type === "img") {
        const imgElement = await drawImgElement(designElement, config);
        _pdfLayer["design-layer"].children.push(imgElement);
      }
    }
    // designData.forEach((item) => {
    //   if (item.type === "img") {
    //     const imgElement = drawImgElement(item);
    //     _pdfLayer["design-layer"].children.push(imgElement);
    //   }
    // });
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
    getSvgString: function () {
      if (this.svgString) return this.svgString;
      const tempString = this.children.map((item) => item.svgString).join("");
      const containerSvg = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1">${tempString}</svg>`;
      this.svgString = containerSvg;
      return this.svgString;
    },
    getSvgChildren: function () {
      return this.children;
    },
  };
}
