import type { Path } from "opentype.js";
enum IFontShape {
  glyph = 1,
  letter = 2,
}

export interface IPosition {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface IPathPart {
  path: Path;
  translate: string;
  alignTranslate: string;
}
export type IPathCollection = IPathPart[];

export interface IGenSvgConfig {
  position: IPosition;
  isVertical: boolean;
  domBoxSize: {
    width: number;
    height: number;
  };
  DPI: number;
  hasSymbolChar: boolean;
  pageTranslate: string;
}
