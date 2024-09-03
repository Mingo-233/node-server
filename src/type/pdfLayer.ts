export interface IPdfLayerMap {
  "knife-layer": knifeLayer;
  "design-layer": designLayer;
  "other-layer": otherLayer;
}

export type ILayerType = "knife-layer" | "design-layer" | "other-layer";
type IBaseLayer<T extends ILayerType> = {
  type: T;
  svgString: string;
  children: IPdfSvgContainer<T>[];
  getSvgString: () => string;
};
export type knifeLayer = IBaseLayer<"knife-layer">;
export type designLayer = IBaseLayer<"design-layer">;
export type otherLayer = IBaseLayer<"other-layer">;

export type IPdfSvgContainer<T extends ILayerType> = {
  type: IPdfNode<T>;
  svgString: string;
};

interface IPdfLayerNode {
  "knife-layer": "bleedLine" | "cutLine" | "foldLine" | "holeLine";
  "design-layer": "font" | "img" | "shape" | "group" | "knifeFace";
  "other-layer": "annotation" | "footer" | "locale";
}
export type IPdfNode<T extends ILayerType = "knife-layer"> = IPdfLayerNode[T];
export interface IPdfLayer {
  drawKnife: (knifeData) => void;
  drawDesign: (knifeData) => void;
  drawOther: (knifeData) => void;
  getPdfLayer: () => IPdfLayerMap;
}

interface IDrawingBoardConfig {
  globalSvgWidth: number;
  globalSvgHeight: number;
  strokeWidth: number;
  side: "outside" | "inside";
}
