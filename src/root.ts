import { usePdfDoc } from "./core/pdfDoc/index";
import { prefixUrl, clearCache } from "./utils/request";
import { createPageApp } from "./core/pdfPage";
import log, { enableDevMode, fsSaveFile, isDevMode } from "@/utils/log";
import { assetsMap, cacheResource } from "@/utils/request";
import type { ICreatePdfOptions } from "@/type/pdf";
import {
  TYPE_OUTSIDE_DESIGN,
  TYPE_INSIDE_DESIGN,
  TYPE_MARK,
} from "@/nodes/layerNode";
export * from "./index";
import { generateCmykImg } from "./index";
import { isBase64 } from "./utils/imgUtils";
import { loadIccProfile } from "@/utils/color";
import { setLang } from "./utils/i18n";

/** 本地调试区域 ----- */
import projectData from "./mock/info.json";
import knifeData from "./mock/knife.json";

// import projectData from "./mock/tempInfo.json";
// import knifeData from "./mock/tempKnife.json";
mockRequest();
async function mockRequest() {
  enableDevMode();
  const _colorMode: any = "RGB";
  const result = await cacheResource(projectData, true);
  if (_colorMode === "CMYK") {
    await generateCmykImg(result);
    // console.log("assetsMap", assetsMap);
  }
  await pdfMain(knifeData, projectData, {
    isOnlyKnife: false,
    colorMode: _colorMode,
    filePath: "",
    knifeColor: {},
    lang: "zh-cn",
    annotationUnit: "mm",
    // filePath: outputPath,
  });
}

/** 本地调试区域 ----- */

export async function pdfMain(
  knifeData,
  projectData,
  options: ICreatePdfOptions
) {
  try {
    console.time("export task");
    setLang(options.lang || "en-us");
    if (options.colorMode === "CMYK") {
      loadIccProfile();
    }
    const _project = {
      cate: projectData.cate,
    };
    const pageApp = createPageApp(knifeData, _project, {
      unit: "mm",
      filePath: options.filePath,
      isOnlyKnife: options.isOnlyKnife,
      colorMode: options.colorMode,
      knifeColor: options.knifeColor,
      annotationUnit: options.annotationUnit || "mm",
      lang: options.lang,
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
      lang: options.lang,
    });

    pdfDoc.pdfInit();
    for (let i = 0; i < pageApp.pages.length; i++) {
      const page = pageApp.pages[i];
      console.log("page", page);

      log.info("log-pdf doc add start");
      if (
        page.pageType & TYPE_OUTSIDE_DESIGN ||
        page.pageType & TYPE_INSIDE_DESIGN
      ) {
        let annotateSvg = page.face?.annotationLayer.getSvgString(pageApp);
        if (annotateSvg) {
          const recover = pdfDoc.SetPaintAnnotationLabelMargin();
          pdfDoc.addSVG(annotateSvg, 0, 0, {
            fontCallback: function () {
              return options.lang === "zh-cn" ? "my-font" : "Helvetica";
            },
          });
          recover.call(pdfDoc.doc);
        }
        let designSvg = page.face?.designLayer.getSvgString(pageApp, {
          clips: projectData?.user_data?.clips,
        });
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
          pdfDoc.addSVG(annotateSvg, 0, 0, {
            fontCallback: function () {
              return options.lang === "zh-cn" ? "my-font" : "Helvetica";
            },
          });
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
    clearCache();
    throw error;
  }
}
function imageCallbackFn(link, options) {
  if (isBase64(link)) {
    return link;
    // if (options.colorMode === "RGB") return link;
    // const { remoteUrl } = extractBase64(link);
    // link = remoteUrl;
  }
  const imgUrl = assetsMap.get(prefixUrl(link)) || link;
  return imgUrl;
}
