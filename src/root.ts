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
import util from "util";
// import projectData from "./store/info.json";
// import knifeData from "./store/knife.json";
// import projectData from "./store/proInfo.json";
// import knifeData from "./store/proKnife.json";

import projectData from "./store/tempInfo.json";
import knifeData from "./store/tempKnife.json";
const path = require("path");
const fs = require("fs");
// enableDevMode();
function getMockData() {
  return {
    projectData,
    knifeData,
    params: {},
  };
}
export async function pdfMain(
  knifeData,
  projectData,
  options: ICreatePdfOptions
) {
  try {
    console.time("export task");
    await cacheResource(projectData);
    const pageApp = createPageApp(knifeData, {
      unit: "mm",
      ...options,
    });
    log.info("log-", "registerFace start");
    pageApp.registerFace(knifeData, projectData);
    // console.log(
    //   util.inspect(pageApp.pages[0], {
    //     depth: null,
    //     colors: true,
    //   })
    // );
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
        let annotateSvg = page.face?.annotationLayer.getSvgString();
        if (annotateSvg) {
          const recover = pdfDoc.SetPaintAnnotationLabelMargin();
          pdfDoc.addSVG(annotateSvg);
          recover.call(pdfDoc.doc);
        }
        let designSvg = page.face?.designLayer.getSvgString({
          pageMargin: pageApp.pageMargin,
        });
        designSvg &&
          pdfDoc.addSVG(designSvg, 0, 0, {
            imageCallback: function (link) {
              const _link = prefixUrl(link);
              const imgUrl =
                options.colorMode === "CMYK"
                  ? getCmykImgPath(assetsMap.get(_link))
                  : assetsMap.get(_link);

              return imgUrl;
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
            const _link = prefixUrl(link);
            const imgUrl =
              options.colorMode === "CMYK"
                ? getCmykImgPath(assetsMap.get(_link))
                : assetsMap.get(_link);
            return imgUrl;
          },
        });
        pdfDoc.addPage();
        // 只画刀线
        knifeSvgArr.forEach((knifeSvg) => {
          pdfDoc.addSVG(knifeSvg.svgString);
        });
      }
      if (page.pageType & TYPE_MARK) {
        let annotateSvg = page.face?.annotationLayer.getSvgString();
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
  }
}

async function mockRequest() {
  let outputPath = path.resolve(__dirname, "../../output/a.pdf");
  await pdfMain(getMockData().knifeData, getMockData().projectData, {
    isOnlyKnife: false,
    colorMode: "CMYK",
    filePath: "",
    // filePath: outputPath,
  });
}

// mockRequest();
