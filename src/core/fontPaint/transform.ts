import type {
  IFontTransformParams,
  IFontGenerateParams,
  IFontParse,
} from "@/type/parse";
import { DPI } from "@/utils/constant";
import { hexToCMYK } from "@/utils/color";
export function transformText(
  config: IFontParse,
  params: IFontTransformParams
): IFontGenerateParams {
  // TODO: scale
  const originLeft = params.isGroup
    ? params.style.left
    : params.style.left + params.bleedLineWidth;
  const originTop = params.isGroup
    ? params.style.top
    : params.style.top + params.bleedLineWidth;
  const left = originLeft * DPI;
  const top = originTop * DPI;
  const renderColor =
    params.colorMode === "CMYK" ? hexToCMYK(params.color) : params.color;

  return {
    ...config,
    pageMargin: {
      left: left,
      top: top,
    },
    sideScale: "",
    DPI: DPI,
    renderColor: renderColor,
    unit: params.unit,
  };
}
