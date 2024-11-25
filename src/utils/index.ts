import {
  DPI,
  PDFLayoutDPI,
  PAGE_MARGIN,
  PAGE_MARK_MARGIN,
  MIN_TOTAL_WIDTH,
} from "@/utils/constant";
import { ICreatePageAppOptions } from "@/type/pdf";
import {
  IDrawingBoardConfig,
  IUnit,
  IColorMode,
  IAnnotationUnit,
} from "@/type/pdfPage";
// export type IDrawingBoardConfig = ReturnType<typeof getDrawingBoardConfig>;
export function getDrawingBoardConfig(
  knifeData: any,
  projectData,
  params: ICreatePageAppOptions
): IDrawingBoardConfig & ICreatePageAppOptions {
  // 原先pdf导出项目中就这样设定的
  const strokeWidth = 0.2;
  const PAGE_MARGIN_TOP = PDFLayoutDPI * PAGE_MARGIN.top;
  const PAGE_MARGIN_BOTTOM = PDFLayoutDPI * PAGE_MARGIN.bottom;
  const PAGE_MARGIN_LEFT = PDFLayoutDPI * PAGE_MARGIN.left;
  const PAGE_MARGIN_RIGHT = PDFLayoutDPI * PAGE_MARGIN.right;
  const PAGE_MARGIN_Y = PAGE_MARGIN_TOP + PAGE_MARGIN_BOTTOM;
  const PAGE_MARGIN_X = PAGE_MARGIN_LEFT + PAGE_MARGIN_RIGHT;
  const PAGE_MARKER_TOP = PDFLayoutDPI * PAGE_MARK_MARGIN.top;
  let MaxTotalX = knifeData.totalX;
  let MaxTotalY = knifeData.totalY;
  if (MaxTotalX < MIN_TOTAL_WIDTH) MaxTotalX = MIN_TOTAL_WIDTH;
  const layerList = knifeData.modeCate.layerList;
  const defaultKnifeColor = {
    bleed: "#69bd4e",
    fold: "#ed322f",
    cut: "#2e2671",
  };
  const _knifeColor = {
    bleed: params.knifeColor?.bleed || defaultKnifeColor.bleed,
    fold: params.knifeColor?.fold || defaultKnifeColor.fold,
    cut: params.knifeColor?.cut || defaultKnifeColor.cut,
  };
  if (!isTraditional(layerList)) {
    // 精品盒
    layerList.forEach((facePaper) => {
      const layerKnifeData = knifeData.layer[facePaper.name];
      if (layerKnifeData.totalX > MaxTotalX) {
        MaxTotalX = layerKnifeData.totalX;
      }
      if (layerKnifeData.totalY > MaxTotalY) {
        MaxTotalY = layerKnifeData.totalY;
      }
    });
  }
  const pageSize = {
    width: (MaxTotalX + 2 * knifeData.bleedline) * PDFLayoutDPI + PAGE_MARGIN_X,
    height:
      (MaxTotalY + 2 * knifeData.bleedline) * PDFLayoutDPI + PAGE_MARGIN_Y,
  };
  const rootSvgWidth = MaxTotalX + 2 * knifeData.bleedline;
  // + 2 * strokeWidth;

  const rootSvgHeight = MaxTotalY + 2 * knifeData.bleedline;
  // + 2 * strokeWidth;

  return {
    pageSize,
    rootSvgSize: {
      width: rootSvgWidth,
      height: rootSvgHeight,
    },
    pageMargin: {
      top: PAGE_MARGIN_TOP,
      bottom: PAGE_MARGIN_BOTTOM,
      left: PAGE_MARGIN_LEFT,
      right: PAGE_MARGIN_RIGHT,
    },
    pageMarkerMargin: {
      top: PAGE_MARKER_TOP,
    },
    strokeWidth,
    bleedLineWidth: knifeData.bleedline,
    isMockups: projectData.cate?.complex_type === 1, // 是否是样机
    ...params,
    knifeColor: _knifeColor,
  };
}
export function isTraditional(layerList) {
  return layerList.every((layer) => layer.name === "traditional");
}
