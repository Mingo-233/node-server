import { knifeLayer, designLayer } from "./pdfLayer";
export type IFaceType = "facePaper" | "greyBoard" | "normal";

interface IFace {
  faceName: string;
  type: IFaceType;
  knifeLayer: knifeLayer;
  designLayer: designLayer;
  annotationLayer: any;
}

interface IFaceData {
  faceName: string;
  knifeData: any;
  designData: any;
  projectData: any;
}
export type IPdfPages = IFace[];
