import { getDrawingBoardConfig, isTraditional } from "@/utils/index";
import { createFace } from "@/core/pdfFace/index";
import { IPage } from "@/type/pdfPage";
import {
  LAYER_KNIFE,
  LAYER_MARK,
  LAYER_DESIGN,
  LAYER_INSIDE_DESIGN,
  TYPE_MARK,
  TYPE_INSIDE_DESIGN,
  TYPE_OUTSIDE_DESIGN,
} from "@/nodes/layerNode";

export function createPageApp(knifeData, params) {
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
    pages: [] as IPage[],
  };
  const boardConfig = getDrawingBoardConfig(knifeData, params);
  app.pageSize = boardConfig.pageSize;
  app.pageMargin = boardConfig.pageMargin;

  function registerFace(knifeData, projectData) {
    const layerList = knifeData.modeCate.layerList;
    let _knifeData = {};
    let _designData = [];
    let _insideDesignData = [];
    let _annotateData = {};

    if (isTraditional(layerList)) {
      const layerKnifeData = knifeData.layer.traditional;
      _knifeData = {
        cuts: layerKnifeData?.cuts || [],
        holes: layerKnifeData?.holes || [],
        folds: layerKnifeData?.folds || [],
        bleeds: layerKnifeData?.bleeds || [],
      };
      _designData = projectData.layer.traditional.design_list;
      _insideDesignData = projectData.layer.traditional.inside_design_list;
      let pageType = 0;
      if (_designData.length > 0) {
        pageType |= LAYER_DESIGN;
      }
      if (_insideDesignData.length > 0) {
        pageType |= LAYER_INSIDE_DESIGN;
      }
      if (_designData.length === 0 && _insideDesignData.length === 0) {
        pageType |= LAYER_MARK;
      }
      if (pageType & TYPE_MARK) {
        const face = createFace("traditional", "traditional", "outside");
        console.log("处理存在刀线层、标注层的逻辑", pageType);
        pagePush(_knifeData, null, _annotateData, face, pageType);
      }
      if (pageType & TYPE_OUTSIDE_DESIGN) {
        console.log("处理存在外侧刀线层、设计层、标注层的逻辑", pageType);
        const face = createFace("traditional", "traditional", "outside");
        pagePush(_knifeData, _designData, _annotateData, face, pageType);
      }
      if (pageType & TYPE_INSIDE_DESIGN) {
        console.log("处理存在内层刀线层、设计层、标注层的逻辑", pageType);
        const face = createFace("traditional", "traditional", "inside");
        pagePush(_knifeData, _insideDesignData, _annotateData, face, pageType);
      }
    } else {
      // 精品盒
      layerList.forEach((facePaper) => {
        const isGrey = facePaper.isGrey;
        const boardType = isGrey ? "greyBoard" : "facePaper";

        const layerKnifeData = knifeData.layer[facePaper.name];
        const _knifeData = {
          cuts: layerKnifeData?.cuts || [],
          holes: layerKnifeData?.holes || [],
          folds: layerKnifeData?.folds || [],
          bleeds: layerKnifeData?.bleeds || [],
        };
        const _designData = projectData.layer[facePaper.name].design_list;
        const _insideDesignData =
          projectData.layer[facePaper.name].inside_design_list;
        const _annotateData = {};
        let pageType = 0;
        if (_designData.length > 0) {
          pageType |= LAYER_DESIGN;
        }
        if (_insideDesignData.length > 0) {
          pageType |= LAYER_INSIDE_DESIGN;
        }
        if (_designData.length === 0 && _insideDesignData.length === 0) {
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
          pagePush(
            _knifeData,
            _insideDesignData,
            _annotateData,
            face,
            pageType
          );
        }
      });
    }

    function pagePush(knifeData, designData, annotateData, face, pageType) {
      app.pages.push({
        pageNum: 1,
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
      page.face.drawKnife(knifeData, boardConfig);
      await page.face.drawDesign(designData, boardConfig);
      page.face.drawAnnotate(annotateData, boardConfig);
    }
  }

  return { ...app, registerFace, paint };
}
