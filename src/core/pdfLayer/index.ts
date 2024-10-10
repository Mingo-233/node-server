import {
  IPdfLayerMap,
  ILayerType,
  IPdfSvgContainer,
  IPdfLayer,
  IAnnotationParams,
} from "@/type/pdfLayer";
import type { IKnifeData } from "@/type/knifeData";
import type { IProject } from "@/type/projectData";
import { DPI } from "@/utils/constant";
import { drawBleedLine, drawCutLine, drawFoldLine } from "./knifeLayer";
import {
  drawImgElement,
  drawShape,
  drawFace,
  drawGroup,
  drawBleedClipPath,
  drawFont,
  drawBackground,
} from "./designLayer";
import {
  drawAnnotateLabel,
  drawLocalMarker,
  drawFooterLabel,
} from "./annotationLayer";
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
    // 画统一背景 因为会覆盖其他的背景，所以放最前面画，层级就在下面
    if (designData.background) {
      const element = drawBackground(designData.background, knifeData, config);
      _pdfLayer["design-layer"].children.push(element);
    }
    if (Object.keys(designData?.faceBackground).length > 0) {
      log.info("log-drawFace start");
      const faceElement = await drawFace(designData, knifeData.faces, config);
      _pdfLayer["design-layer"].children.push(faceElement);
    }
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
      } else if (designElement.type === "group") {
        log.info("log-drawGroup start");
        const groupElement = await drawGroup(designElement, config, knifeData);
        _pdfLayer["design-layer"].children.push(groupElement);
      } else if (designElement.type === "font") {
        log.info("log-drawFont start");
        const fontElement = await drawFont(designElement, config);
        _pdfLayer["design-layer"].children.push(fontElement);
      }
    }
  }
  function drawAnnotation(annotateData, config) {
    const annotationLabel = drawAnnotateLabel(annotateData, config);
    _pdfLayer["annotation-layer"].children.push(annotationLabel);
    const marker = drawLocalMarker(annotateData, config);
    _pdfLayer["annotation-layer"].children.push(marker);
    const footer = drawFooterLabel(
      { designArea: annotateData.designArea, text: annotateData.faceName },
      config
    );
    _pdfLayer["annotation-layer"].children.push(footer);
  }
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
      let clipLength: any = "";
      if (type === "annotation-layer") {
        clipLength = 50;
      }
      const containerSvg = `<svg xmlns="http://www.w3.org/2000/svg"  
      data-clip-len="${clipLength}" 
      data-type="${type}" version="1.1">
      ${tempString}</svg>`;

      this.svgString = containerSvg;
      return this.svgString;
    },
    getSvgChildren: function () {
      return this.children;
    },
  };
}
