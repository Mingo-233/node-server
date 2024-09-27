import type { Path } from "opentype.js";
import type { IColorMode, IUnit } from "@/type/pdfPage";
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
export interface IPathPart {
  path: Path;
  translate: string;
  alignTranslate: string;
}
export interface IFontParseParams {
  fontFamilyUrl?: string;
  fontOption: {
    unitsPerEm: number;
    ascent: number;
    descent: number;
    fontName?: string;
    isSupCnMainFontApp: boolean;
  };
  text: string;
  fontSize: number;
  textLineHeight: number;
  textAlign: string;
  vertical: boolean;
  color?: string;
  colorMode?: IColorMode;
  rotate: number;
  MaxWidth: number;
  MaxHeight: number;
}
export interface IFontParse {
  pathPart: Record<number, IPathPart[]>;
  position: IPosition;
  svgDomSize: {
    width: number;
    height: number;
  };
  isVertical: boolean;
  hasSymbolChar: boolean;
  color: string;
  colorMode: IColorMode;
  rotate: number;
}
export type IPathCollection = IPathPart[];

export type IFontTransformParams = {
  style: {
    left: number;
    top: number;
  };
  bleedLineWidth: number;
  color: string;
  colorMode: IColorMode;
  unit: IUnit;
  isGroup?: boolean;
};
export type IFontTransform = {
  pageMargin: {
    left: number;
    top: number;
  };
  sideScale: string;
  DPI: number;
  unit: IUnit;
  renderColor: string;
};

// type IFontGenerateParams = IFontTransform;
type IPathPartObj = Record<number, IPathPart[]>;
export type IFontGenerateParams = {
  pathPart: IPathPartObj;
  position: IPosition;
  isVertical: boolean;
  svgDomSize: {
    width: number;
    height: number;
  };
  hasSymbolChar: boolean;
  rotate: number;
} & IFontTransform;

export interface ITextInfoItem {
  path: any;
  pathBoundingBox: IPosition | null;
  text: string;
  isBreak: boolean;
  type: any;
  height?: number;
  width?: number;
  chilePath?: IChilePath[];
}
interface IChilePath {
  path: any;
  text: string;
}
