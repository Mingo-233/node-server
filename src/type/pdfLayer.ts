export interface IPdfLayerMap {
  "knife-layer": knifeLayer;
  "design-layer": designLayer;
  "annotation-layer": annotationLayer;
}

export type ILayerType = "knife-layer" | "design-layer" | "annotation-layer";
type IBaseLayer<T extends ILayerType> = {
  type: T;
  svgString: string;
  children: IPdfSvgContainer<T>[];
  getSvgString: (config?: any) => string;
  getSvgChildren: () => IPdfSvgContainer<T>[];
};
export type knifeLayer = IBaseLayer<"knife-layer">;
export type designLayer = IBaseLayer<"design-layer">;
export type annotationLayer = IBaseLayer<"annotation-layer">;

export type IPdfSvgContainer<T extends ILayerType> = {
  type: IPdfNode<T>;
  svgString: string;
};

interface IPdfLayerNode {
  "knife-layer": "bleedLine" | "cutLine" | "foldLine" | "holeLine";
  "design-layer": "font" | "img" | "shape" | "group" | "knifeFace";
  "annotation-layer": "annotation" | "footer" | "locale";
}
export type IPdfNode<T extends ILayerType = "knife-layer"> = IPdfLayerNode[T];
export interface IPdfLayer {
  drawKnife: (knifeData) => void;
  drawDesign: (knifeData) => void;
  drawOther: (knifeData) => void;
  getPdfLayer: () => IPdfLayerMap;
}

interface IAnnotationParams {
  unit: "mm" | "in";
  insideSize: {
    //size
    L: number;
    W: number;
    H: number;
  };
  outsideSize: {
    //outSize
    L: number;
    W: number;
    H: number;
  };
  manufactureSize: {
    //knifeSize
    L: number;
    W: number;
    H: number;
  };
  material: string;
  thickness: number;
  dielineID: string; //cate_no
  designArea: {
    width: number;
    height: number;
  };
}
