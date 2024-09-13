import { usePdfDoc } from "./core/pdfDoc/index";
import { fetchAssets, prefixUrl } from "./utils/imgUtils";
import { createPageApp } from "./core/pdfPage";
import log from "@/utils/log";
import { fetchResourceWithCache, assetsMap } from "@/utils/request";

import {
  TYPE_OUTSIDE_DESIGN,
  TYPE_INSIDE_DESIGN,
  TYPE_MARK,
} from "@/nodes/layerNode";
import util from "util";
import projectData from "./store/info.json";
import knifeData from "./store/knife.json";
// import projectData from "./store/proInfo.json";
// import knifeData from "./store/proKnife.json";

// import projectData from "./store/tempInfo.json";
// import knifeData from "./store/tempKnife.json";

function getMockData() {
  return {
    projectData,
    knifeData,
    params: {},
  };
}
export async function pdfMain() {
  try {
    console.time("export task");

    const pageApp = createPageApp(knifeData, {
      unit: "mm",
      colorMode: "RGB",
    });
    log.info("log-", "registerFace start");
    pageApp.registerFace(getMockData().knifeData, getMockData().projectData);
    console.log(pageApp);
    // console.log(
    //   util.inspect(pageApp.pages[0], {
    //     depth: null,
    //     colors: true,
    //   })
    // );
    await pageApp.paint();
    const pdfDoc = usePdfDoc(pageApp.pageSize, pageApp.pageMargin);

    pdfDoc.pdfInit();
    for (let i = 0; i < pageApp.pages.length; i++) {
      const page = pageApp.pages[i];
      log.info("log-pdf doc add start");
      if (
        page.pageType & TYPE_OUTSIDE_DESIGN ||
        page.pageType & TYPE_INSIDE_DESIGN
      ) {
        let knifeSvgArr = page.face?.knifeLayer.getSvgChildren();
        if (knifeSvgArr) {
          knifeSvgArr.forEach((knifeSvg) => {
            pdfDoc.addSVG(knifeSvg.svgString);
            // fsSaveFile(knifeSvg.svgString, `svgString-${i}.svg`);
          });
        }

        let designSvg = page.face?.designLayer.getSvgString({
          pageMargin: pageApp.pageMargin,
        });
        designSvg &&
          pdfDoc.addSVG(designSvg, 0, 0, {
            imageCallback: function (link) {
              const _link = prefixUrl(link);
              return assetsMap.get(_link);
            },
          });
        let annotateSvg = page.face?.annotationLayer.getSvgString();
        annotateSvg && pdfDoc.addSVG(annotateSvg);
        pdfDoc.addPage();
        // 只画设计
        pdfDoc.addSVG(designSvg, 0, 0, {
          imageCallback: function (link) {
            const _link = prefixUrl(link);
            return assetsMap.get(_link);
          },
        });
        pdfDoc.addPage();
        // 只画刀线
        knifeSvgArr.forEach((knifeSvg) => {
          pdfDoc.addSVG(knifeSvg.svgString);
        });
      }
      if (page.pageType & TYPE_MARK) {
        let knifeSvgArr = page.face?.knifeLayer.getSvgChildren();
        if (knifeSvgArr) {
          knifeSvgArr.forEach((knifeSvg) => {
            pdfDoc.addSVG(knifeSvg.svgString);
          });
        }
        let annotateSvg = page.face?.annotationLayer.getSvgString();
        annotateSvg && pdfDoc.addSVG(annotateSvg);
      }

      if (i !== pageApp.pages.length - 1) {
        pdfDoc.addPage();
      }
    }

    pdfDoc.end();
    console.timeEnd("export task");
  } catch (error) {
    console.error("出现错误", error);
  }
}
pdfMain();
function fsSaveFile(context, name = "test.svg") {
  const fs = require("fs");
  const path = require("path");
  const filePath = path.resolve(__dirname, "../../output");
  fs.writeFileSync(`${filePath}/${name}`, context);
  console.log("file saved");
}
