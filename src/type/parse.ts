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
interface IPathPart {
  path: Path;
  translate: string;
  alignTranslate: string;
}
interface IFontParseParams {
  fontFamilyUrl: string;
  text: string;
  fontSize: number;
  textLineHeight: number;
  textAlign: string;
  vertical: boolean;
  color: string;
  colorMode: IColorMode;
  rotate: number;
  MaxWidth: number;
  MaxHeight: number;
}
interface IFontParse {
  pathPart: IPathPart[];
  position: IPosition;
  svgDomSize: {
    width: number;
    height: number;
  };
  isVertical: boolean;
  hasSymbolChar: boolean;
  color: string;
  colorMode: IColorMode;
}
export type IPathCollection = IPathPart[];

type IFontTransform = IFontParse & {
  pageMarginTranslate: string;
  sideScale: string;
  DPI: number;
  unit: IUnit;
  renderColor: string;
};

// type IFontGenerateParams = IFontTransform;
export interface IFontGenerateParams {
  pathPart: IPathPart[];
  position: IPosition;
  isVertical: boolean;
  domBoxSize: {
    width: number;
    height: number;
  };
  hasSymbolChar: boolean;
  pageMarginTranslate: string;
  sideScale: string;
  DPI: number;
  unit: IUnit;
  renderColor: string;
}
