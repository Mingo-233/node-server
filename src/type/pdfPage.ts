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
  drawDesign: (designData, knifeData, config) => void;
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
export type IUnit = "mm";
export type IAnnotationUnit = "mm" | "in";
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
  pageMarkerMargin: {
    top: number;
  };
  colorMode: IColorMode;
  unit: IUnit;
  strokeWidth: number;
  bleedLineWidth: number;
  isMockups: boolean;
  knifeColor: {
    bleed: string;
    fold: string;
    cut: string;
  };
  annotationUnit: IAnnotationUnit;
}
export type IDrawingConfigPlus = IDrawingBoardConfig & Record<string, any>;

export interface IPageApp {
  pageSize: {
    width: number;
    height: number;
  };
  pages: IPage[];
}
export interface IPage {
  face: IFace;
  faceData: IFaceData;
  pageType: number;
}
