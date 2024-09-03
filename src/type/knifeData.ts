export interface IKnifeData {
  totalX: number;
  totalY: number;
  bleedline: number;
  bleeds: SvgOpt[];
  cuts: SvgOpt[];
  faces: Face[];
  folds: IFolds[];
  holes: SvgOpt[][];
  transform?: any;
  sizeArrowData: any[];
  size: { W: number; H: number; L: number };
  knifeSize: { W: number; H: number; L: number };
  outSize: { W: number; H: number; L: number };
  thickness: number;
  positionX?: number;
  positionY?: number;
}
// TODO: folds有2种数据类型
export type IFolds = {
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};
export interface SvgOpt {
  mtd: string;
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
  cx?: number;
  cy?: number;
  ang?: number;
  arc?: number;
  dir?: number;
  path?: any;
  [key: string]: any;
}
export interface Face {
  dlist: SvgOpt[];
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  holes?: SvgOpt[][] | null;
}
