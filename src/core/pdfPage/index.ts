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
    if (isTraditional(layerList)) {
    } else {
      // 精品盒
      let pageNum = 0;
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

        let pageLevel = 0;
        if (_designData.length > 0) {
          pageLevel |= LAYER_DESIGN;
        }
        if (_insideDesignData.length > 0) {
          pageLevel |= LAYER_INSIDE_DESIGN;
        }
        if (_designData.length === 0 || _insideDesignData.length === 0) {
          pageLevel |= LAYER_MARK;
        }
        if (pageLevel & TYPE_MARK) {
          const face = createFace(facePaper.name, boardType, "outside");
          console.log("处理存在刀线层、标注层的逻辑");
          pagePush(_knifeData, null, _annotateData, face);
        }
        if (pageLevel & TYPE_OUTSIDE_DESIGN) {
          console.log("处理存在刀线层、设计层、标注层的逻辑");
          const face = createFace(facePaper.name, boardType, "outside");
          // 三层都存在
          pagePush(_knifeData, _designData, _annotateData, face);
          // 只存在设计
          pagePush(null, _designData, null, face);
          // 只存在刀线
          pagePush(_knifeData, null, null, face);
        }
        if (pageLevel & TYPE_INSIDE_DESIGN) {
          console.log("处理存在内层刀线层、设计层、标注层的逻辑");
          const face = createFace(facePaper.name, boardType, "inside");
          pagePush(_knifeData, _insideDesignData, _annotateData, face);
          pagePush(null, _insideDesignData, null, face);
          pagePush(_knifeData, null, null, face);
        }

        function pagePush(knifeData, designData, annotateData, face) {
          pageNum++;
          app.pages.push({
            pageNum: pageNum,
            face,
            faceData: {
              knifeData: knifeData,
              designData: designData,
              annotateData: annotateData,
              boardConfig: boardConfig,
            },
          });
        }
      });
    }
  }
  function paint() {
    app.pages.forEach((page) => {
      const { knifeData, designData, annotateData, boardConfig } =
        page.faceData;
      page.face.drawKnife(knifeData, boardConfig);
      page.face.drawDesign(designData, boardConfig);
      page.face.drawAnnotate(annotateData, boardConfig);
    });
  }

  return { ...app, registerFace, paint };
}
