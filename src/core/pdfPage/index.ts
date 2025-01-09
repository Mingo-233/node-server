import { getDrawingBoardConfig, isTraditional } from "@/utils/index";
import { createFace } from "@/core/pdfFace/index";
import { IPage } from "@/type/pdfPage";
import log from "@/utils/log";
import type { IAnnotationParams } from "@/type/pdfLayer";

import {
  LAYER_KNIFE,
  LAYER_MARK,
  LAYER_DESIGN,
  LAYER_INSIDE_DESIGN,
  TYPE_MARK,
  TYPE_INSIDE_DESIGN,
  TYPE_OUTSIDE_DESIGN,
} from "@/nodes/layerNode";
import { ICreatePageAppOptions } from "@/type/pdf";
import { $t } from "@/utils/i18n";

export function createPageApp(
  knifeData,
  projectData,
  params: ICreatePageAppOptions
) {
  const app = {
    pageSize: {
      width: 0,
      height: 0,
    },
    pageMargin: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
    pageMakerMargin: {
      top: 0,
    },
    pages: [] as IPage[],
    isOnlyKnife: true,
  };
  const boardConfig = getDrawingBoardConfig(knifeData, projectData, params);
  app.pageSize = boardConfig.pageSize;
  app.pageMargin = boardConfig.pageMargin;
  app.pageMakerMargin = boardConfig.pageMarkerMargin;
  app.isOnlyKnife = params.isOnlyKnife;
  function registerFace(knifeData, projectData) {
    const layerList = knifeData.modeCate.layerList;
    if (isTraditional(layerList)) {
      log.info("log-registerFace traditional");
      const facePaper = {
        name: "traditional",
        friendlyName: "",
      };
      const params = {
        boardType: "traditional",
      };
      _registerFaceItem(facePaper, params);
    } else {
      log.info("log-registerFace 精品盒");
      // 精品盒
      layerList.forEach((facePaper) => {
        const isGrey = facePaper.isGrey;
        const boardType = isGrey ? "greyBoard" : "facePaper";

        const params = {
          boardType,
        };
        _registerFaceItem(facePaper, params);
      });
    }
    function _registerFaceItem(facePaper, params) {
      const { boardType } = params;
      const layerKnifeData = knifeData.layer[facePaper.name];
      const layerProjectData = projectData.layer[facePaper.name];
      const _knifeData = {
        cuts: layerKnifeData?.cuts || [],
        holes: layerKnifeData?.holes || [],
        folds: layerKnifeData?.folds || [],
        bleeds: layerKnifeData?.bleeds || [],
        faces: layerKnifeData?.faces || [],
        totalX: layerKnifeData.totalX,
        totalY: layerKnifeData.totalY,
      };
      const _designData = {
        list: layerProjectData.design_list || [],
        faceBackground: layerProjectData.face_background || {},
        background: layerProjectData.background || null,
      };
      const _insideDesignData = {
        list: projectData.layer[facePaper.name].inside_design_list || [],
        faceBackground: layerProjectData.inside_face_background || {},
        background: layerProjectData.inside_background || null,
      };
      const faceName =
        boardConfig.lang === "zh-cn"
          ? facePaper.friendlyName
          : facePaper.friendlyName_en || facePaper.friendlyName;
      // TODO: 临时解决中文字符无法显示的问题，后续需要开发中文字体支持
      const _faceName = faceName.replace(/（/g, "(").replace(/）/g, ")");
      let _annotateData: IAnnotationParams = {
        unit: boardConfig.annotationUnit,
        insideSize: {
          L: knifeData.size.L,
          W: knifeData.size.W,
          H: knifeData.size.H,
        },
        outsideSize: {
          L: knifeData.outSize.L,
          W: knifeData.outSize.W,
          H: knifeData.outSize.H,
        },
        manufactureSize: {
          L: knifeData.knifeSize.L,
          W: knifeData.knifeSize.W,
          H: knifeData.knifeSize.H,
        },
        material: layerProjectData.science_name,
        thickness: layerProjectData.thickness,
        dielineID: knifeData.cate_no,
        designArea: {
          width: layerKnifeData.totalX,
          height: layerKnifeData.totalY,
        },
        faceName: _faceName,
      };
      let pageType = 0;
      const hasDesignOutside = checkDesignElementExist(_designData, {
        isMockups: boardConfig.isMockups,
      });
      const hasDesignInside = checkDesignElementExist(_insideDesignData, {
        isMockups: boardConfig.isMockups,
      });
      if (hasDesignOutside && !app.isOnlyKnife) {
        pageType |= LAYER_DESIGN;
      }
      if (hasDesignInside && !app.isOnlyKnife) {
        pageType |= LAYER_INSIDE_DESIGN;
      }
      if (app.isOnlyKnife || !hasDesignOutside) {
        pageType |= LAYER_MARK;
      }

      if (pageType & TYPE_MARK) {
        const face = createFace(facePaper.name, boardType, "outside");
        console.log("处理存在刀线层、标注层的逻辑", pageType);
        pagePush(_knifeData, null, _annotateData, face, TYPE_MARK);
      }
      if (pageType & TYPE_OUTSIDE_DESIGN) {
        console.log(
          "处理存在外侧刀线层、设计层、标注层的逻辑",
          TYPE_OUTSIDE_DESIGN
        );
        const _annotateDataOuter =
          facePaper.name === "traditional"
            ? { ..._annotateData, faceName: $t("Outer") }
            : _annotateData;
        const face = createFace(facePaper.name, boardType, "outside");
        pagePush(_knifeData, _designData, _annotateDataOuter, face, pageType);
      }
      if (pageType & TYPE_INSIDE_DESIGN) {
        console.log(
          "处理存在内层刀线层、设计层、标注层的逻辑",
          TYPE_INSIDE_DESIGN
        );
        const face = createFace(facePaper.name, boardType, "inside");
        const _annotateDataInner =
          facePaper.name === "traditional"
            ? { ..._annotateData, faceName: $t("Inner") }
            : _annotateData;

        pagePush(
          _knifeData,
          _insideDesignData,
          _annotateDataInner,
          face,
          pageType
        );
      }
    }
    function pagePush(knifeData, designData, annotateData, face, pageType) {
      app.pages.push({
        face,
        pageType,
        faceData: {
          knifeData: knifeData,
          designData: designData,
          annotateData: annotateData,
          boardConfig: boardConfig,
        },
      });
    }
  }
  async function paint() {
    for (let i = 0; i < app.pages.length; i++) {
      const page = app.pages[i];
      const { knifeData, designData, annotateData, boardConfig } =
        page.faceData;
      const _config = {
        ...boardConfig,
        side: page.face.side,
      };
      page.face.drawKnife(knifeData, _config);
      await page.face.drawDesign(designData, knifeData, _config);
      page.face.drawAnnotate(annotateData, boardConfig);
    }
  }
  return { ...app, ...boardConfig, registerFace, paint };
}

function checkDesignElementExist(data, options) {
  if (options.isMockups) {
    return Boolean(
      data.list.length > 0 ||
        data.background !== "#ffffff" ||
        Object.keys(data.faceBackground).length
    );
  } else {
    return Boolean(
      data.list.length > 0 ||
        data.background ||
        Object.keys(data.faceBackground).length
    );
  }
}
