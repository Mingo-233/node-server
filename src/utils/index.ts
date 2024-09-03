import type { IKnifeData } from "@/type/knifeData";
import type { IProject } from "@/type/projectData";
import { DPI, PDFLayoutDPI, PAGE_MARGIN } from "@/utils/constant";
export type IDrawingBoardConfig = ReturnType<typeof getDrawingBoardConfig>;
export function getDrawingBoardConfig(
  knifeData: IKnifeData,
  projectData: IProject,
  params: { test?: string }
) {
  const scale = 0.37023462996825945;
  const strokeWidth = 0.25 / scale / DPI;
  const PAGE_MARGIN_TOP = PDFLayoutDPI * PAGE_MARGIN.top;
  const PAGE_MARGIN_BOTTOM = PDFLayoutDPI * PAGE_MARGIN.bottom;
  const PAGE_MARGIN_LEFT = PDFLayoutDPI * PAGE_MARGIN.left;
  const PAGE_MARGIN_RIGHT = PDFLayoutDPI * PAGE_MARGIN.right;
  const PAGE_MARGIN_Y = PAGE_MARGIN_TOP + PAGE_MARGIN_BOTTOM;
  const PAGE_MARGIN_X = PAGE_MARGIN_LEFT + PAGE_MARGIN_RIGHT;
  const pageSize = {
    width:
      (knifeData.totalX + 2 * knifeData.bleedline) * PDFLayoutDPI +
      PAGE_MARGIN_X,
    height:
      (knifeData.totalY + 2 * knifeData.bleedline) * PDFLayoutDPI +
      PAGE_MARGIN_Y,
  };
  const globalSvgWidth =
    knifeData.totalX + 2 * knifeData.bleedline + 2 * strokeWidth;
  console.log("globalSvgWidth", globalSvgWidth);

  const globalSvgHeight =
    knifeData.totalY + 2 * knifeData.bleedline + 2 * strokeWidth;
  return {
    pageSize,
    globalSvgWidth,
    globalSvgHeight,
    pageMargin: {
      top: PAGE_MARGIN_TOP,
      bottom: PAGE_MARGIN_BOTTOM,
      left: PAGE_MARGIN_LEFT,
      right: PAGE_MARGIN_RIGHT,
    },
    strokeWidth,
    side: "outside",
    ...params,
  };
}
