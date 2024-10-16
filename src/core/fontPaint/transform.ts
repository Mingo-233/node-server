import type {
  IFontTransformParams,
  IFontGenerateParams,
  IFontParse,
} from "@/type/parse";
import { DPI } from "@/utils/constant";
import { convertCMYK } from "@/utils/color";
export function transformText(
  config: IFontParse,
  params: IFontTransformParams
): IFontGenerateParams {
  const originLeft = params.isGroup
    ? params.style.left
    : params.style.left + params.bleedLineWidth;
  const originTop = params.isGroup
    ? params.style.top
    : params.style.top + params.bleedLineWidth;
  const left = originLeft * DPI;
  const top = originTop * DPI;
  const renderColor =
    params.colorMode === "CMYK" ? convertCMYK(params.color) : params.color;
  // const temp =
  //   37.260829162262944 -
  //   (Number(-position.y1) / Number(config.tempTopV2) + Number(-position.y1)) +
  //   9.315207290565738;
  const contextDistance = (params.textLineHeight - params.fontSize) / 2;

  const y1 = Math.abs(config.position.y1);
  // 计算文字顶部偏移 文字顶部到当前行顶部的距离
  const topTranslateLen =
    params.fontSize - y1 / config.ascentRatioV2 - y1 + contextDistance;

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
    topTranslateLen,
  };
}
