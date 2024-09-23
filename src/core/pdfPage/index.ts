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

export function createPageApp(knifeData, params: ICreatePageAppOptions) {
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
  const boardConfig = getDrawingBoardConfig(knifeData, params);
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
        friendlyName: "Outer",
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
      const _knifeData = {
        cuts: layerKnifeData?.cuts || [],
        holes: layerKnifeData?.holes || [],
        folds: layerKnifeData?.folds || [],
        bleeds: layerKnifeData?.bleeds || [],
        faces: layerKnifeData?.faces || [],
      };
      const _designData = {
        list: projectData.layer[facePaper.name].design_list || [],
        faceBackground: projectData.layer[facePaper.name].face_background || {},
      };
      const _insideDesignData = {
        list: projectData.layer[facePaper.name].inside_design_list || [],
        faceBackground:
          projectData.layer[facePaper.name].inside_face_background || {},
      };

      let _annotateData: IAnnotationParams = {
        unit: boardConfig.unit,
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
        material: knifeData.science.name,
        thickness: layerKnifeData.thickness,
        dielineID: knifeData.cate_no,
        designArea: {
          width: layerKnifeData.totalX.toFixed(1),
          height: layerKnifeData.totalY.toFixed(1),
        },
        faceName: facePaper.friendlyName,
      };
      let pageType = 0;
      if (_designData.list.length > 0 && !app.isOnlyKnife) {
        pageType |= LAYER_DESIGN;
      }
      if (_insideDesignData.list.length > 0 && !app.isOnlyKnife) {
        pageType |= LAYER_INSIDE_DESIGN;
      }
      if (
        app.isOnlyKnife ||
        (_designData.list.length === 0 && _insideDesignData.list.length === 0)
      ) {
        pageType |= LAYER_MARK;
      }
      if (pageType & TYPE_MARK) {
        const face = createFace(facePaper.name, boardType, "outside");
        console.log("处理存在刀线层、标注层的逻辑", pageType);
        pagePush(_knifeData, null, _annotateData, face, pageType);
      }
      if (pageType & TYPE_OUTSIDE_DESIGN) {
        console.log("处理存在外侧刀线层、设计层、标注层的逻辑", pageType);
        const face = createFace(facePaper.name, boardType, "outside");
        pagePush(_knifeData, _designData, _annotateData, face, pageType);
      }
      if (pageType & TYPE_INSIDE_DESIGN) {
        console.log("处理存在内层刀线层、设计层、标注层的逻辑", pageType);
        const face = createFace(facePaper.name, boardType, "inside");
        const _annotateDataInner =
          facePaper.name === "traditional"
            ? { ..._annotateData, faceName: "Inner" }
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
      log.info("log-face.drawKnife start", i);
      page.face.drawKnife(knifeData, _config);
      log.info("log-face.drawDesign start", i);
      await page.face.drawDesign(designData, knifeData, _config);
      log.info("log-face.drawAnnotate start", i);
      page.face.drawAnnotate(annotateData, boardConfig);
    }
  }

  return { ...app, registerFace, paint };
}
