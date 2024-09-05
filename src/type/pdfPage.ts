import { knifeLayer, designLayer, annotationLayer } from "./pdfLayer";
export type IFaceType = "facePaper" | "greyBoard" | "traditional";
export type IFaceSide = "outside" | "inside";
interface IFace {
  faceName: string;
  type: IFaceType;
  // side: IFaceSide;
  side: string;
  knifeLayer: knifeLayer;
  designLayer: designLayer;
  annotationLayer: annotationLayer;
  drawKnife: (knifeData, config) => void;
  drawDesign: (designData, config) => void;
  drawAnnotate: (annotateData, config) => void;
}

interface IFaceData {
  knifeData: any;
  designData: any;
  annotateData: any;
  boardConfig: any;
}
export type IPdfPages = IFace[];

export type IColorMode = "RGB" | "CMYK";
export type IUnit = "mm" | "inch";
export interface IDrawingBoardConfig {
  pageSize: {
    width: number;
    height: number;
  };
  rootSvgSize: {
    width: number;
    height: number;
  };
  pageMargin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  colorMode: IColorMode;
  unit: IUnit;
  strokeWidth: 1;
  bleedLineWidth: number;
}

export interface IPageApp {
  pageSize: {
    width: number;
    height: number;
  };
  pages: IPage[];
}
export interface IPage {
  pageNum: number;
  face: IFace;
  faceData: IFaceData;
}
