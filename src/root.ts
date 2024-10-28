import { usePdfDoc } from "./core/pdfDoc/index";
import {
  fetchAssets,
  prefixUrl,
  clearCache,
  getCmykImgPath,
} from "./utils/request";
import { createPageApp } from "./core/pdfPage";
import log, { enableDevMode, isDevMode } from "@/utils/log";
import {
  fetchResourceWithCache,
  assetsMap,
  cacheResource,
} from "@/utils/request";
import type { ICreatePdfOptions } from "@/type/pdf";
import {
  TYPE_OUTSIDE_DESIGN,
  TYPE_INSIDE_DESIGN,
  TYPE_MARK,
} from "@/nodes/layerNode";
// import projectData from "./mock/info2.json";
// import projectData from "./mock/info.json";
// import knifeData from "./mock/knife.json";

import projectData from "./mock/tempInfo.json";
import knifeData from "./mock/tempKnife.json";
// enableDevMode();
// mockRequest();

export async function pdfMain(
  knifeData,
  projectData,
  options: ICreatePdfOptions
) {
  try {
    console.time("export task");
    // TODO: 暂时只支持RGB
    options.colorMode = "RGB";
    if (!options.isOnlyKnife) {
      await cacheResource(projectData);
    }
    const _project = {
      cate: projectData.cate,
    };
    const pageApp = createPageApp(knifeData, _project, {
      unit: "mm",
      ...options,
    });
    log.info("log-", "registerFace start");
    pageApp.registerFace(knifeData, projectData);
    await pageApp.paint();
    const pdfDoc = usePdfDoc({
      pageSize: pageApp.pageSize,
      pageMargin: pageApp.pageMargin,
      pageMarkerMargin: pageApp.pageMakerMargin,
      filePath: options.filePath,
      colorMode: options.colorMode,
    });

    pdfDoc.pdfInit();
    for (let i = 0; i < pageApp.pages.length; i++) {
      const page = pageApp.pages[i];
      log.info("log-pdf doc add start");
      if (
        page.pageType & TYPE_OUTSIDE_DESIGN ||
        page.pageType & TYPE_INSIDE_DESIGN
      ) {
        let annotateSvg = page.face?.annotationLayer.getSvgString(pageApp);
        if (annotateSvg) {
          const recover = pdfDoc.SetPaintAnnotationLabelMargin();
          pdfDoc.addSVG(annotateSvg);
          recover.call(pdfDoc.doc);
        }
        let designSvg = page.face?.designLayer.getSvgString(pageApp);
        designSvg &&
          pdfDoc.addSVG(designSvg, 0, 0, {
            imageCallback: function (link) {
              return imageCallbackFn(link, options);
            },
          });

        let knifeSvgArr = page.face?.knifeLayer.getSvgChildren();
        if (knifeSvgArr) {
          knifeSvgArr.forEach((knifeSvg) => {
            pdfDoc.addSVG(knifeSvg.svgString);
          });
        }
        pdfDoc.addPage();
        // 只画设计
        pdfDoc.addSVG(designSvg, 0, 0, {
          imageCallback: function (link) {
            return imageCallbackFn(link, options);
          },
        });
        pdfDoc.addPage();
        // 只画刀线
        knifeSvgArr.forEach((knifeSvg) => {
          pdfDoc.addSVG(knifeSvg.svgString);
        });
      }
      if (page.pageType & TYPE_MARK) {
        let annotateSvg = page.face?.annotationLayer.getSvgString(pageApp);
        if (annotateSvg) {
          const recover = pdfDoc.SetPaintAnnotationLabelMargin();
          pdfDoc.addSVG(annotateSvg);
          recover.call(pdfDoc.doc);
        }
        let knifeSvgArr = page.face?.knifeLayer.getSvgChildren();
        if (knifeSvgArr) {
          knifeSvgArr.forEach((knifeSvg) => {
            pdfDoc.addSVG(knifeSvg.svgString);
          });
        }
      }

      if (i !== pageApp.pages.length - 1) {
        pdfDoc.addPage();
      }
    }

    await pdfDoc.end();
    isDevMode ? null : clearCache();
    console.timeEnd("export task");
  } catch (error) {
    console.error("出现错误", error);
    throw error;
  }
}
function imageCallbackFn(link, options) {
  if (link.includes("data:image/")) return link;
  const _link = prefixUrl(link);
  const imgUrl =
    options.colorMode === "CMYK"
      ? getCmykImgPath(assetsMap.get(_link))
      : assetsMap.get(_link);

  return imgUrl;
}
async function mockRequest() {
  // let outputPath = path.resolve(__dirname, "../../output/a.ai");
  await pdfMain(knifeData, projectData, {
    isOnlyKnife: false,
    colorMode: "RGB",
    filePath: "",
    knifeColor: {},
    // filePath: outputPath,
  });
}
