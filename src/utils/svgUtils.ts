import { Face, SvgOpt } from "@/type/knifeData";
import { IUserDataClipItem } from "@/type/pdfLayer";
/**
 * 输入："dlist": [ { "mtd": "M", "x": 13, "y": 49.25 } ]
 * 输出：d: 'M13,49.25'
 */
// function _dlist_to_d(dlist: SvgOpt[], reverse?: boolean, width?: number) {
function _dlist_to_d(dlist: any[], reverse?: boolean, width?: number) {
  if (!dlist || !dlist.length) {
    return "";
  }
  const scaleX = reverse ? -1 : 1;
  const curWidth = width ?? 0;
  let str = "";
  let correctY = 0;
  // 矫正距离
  // const yPoints = dlist.map((item) => item.y || 0);
  // console.log("yPoints", yPoints);

  // let minY = Math.min(...yPoints);
  // let maxY = Math.max(...yPoints);
  // console.log("minY", minY);
  // console.log("maxY", maxY);
  // if (minY < 0) correctY = Math.abs(minY);
  // console.log("correctY", correctY);

  dlist.forEach((item) => {
    switch (item.mtd) {
      case "M":
        str += ` ${item.mtd}${reverse ? curWidth - item.x : item.x},${
          item.y + correctY
        } `;
        break;
      case "L":
        str += ` ${item.mtd}${reverse ? curWidth - item.x : item.x},${
          item.y + correctY
        } `;
        break;
      case "Q":
        str += ` ${item.mtd}${reverse ? curWidth - (item.cx ?? 0) : item.cx},${
          item.cy + correctY
        },${reverse ? curWidth - item.x : item.x},${item.y + correctY} `;
        break;
      case "A":
        str += ` ${item.mtd}${reverse ? curWidth - (item.rx ?? 0) : item.rx},${
          item.ry + correctY
        } ${item.ang} ${item.arc},${reverse ? 1 - (item.dir ?? 0) : item.dir} ${
          reverse ? curWidth - item.x : item.x
        },${item.y + correctY} `;
        break;
      case "C":
        const cx = item.cx ?? 0;
        const cy = item.cy ?? 0;
        const cx1 = item.cx1 ?? 0;
        const cy1 = item.cy1 ?? 0;
        const x = item.x;
        const y = item.y;
        str += ` ${item.mtd}${reverse ? curWidth - cx : cx}, ${cy},${
          reverse ? curWidth - cx1 : cx1
        },${cy1},${reverse ? curWidth - x : x},${y}`;
        break;
      case "Z":
        str += ` ${item.mtd} `;
        break;
    }
  });
  return str;
}

export default {
  dlist_to_d(dlist: SvgOpt[], reverse?: boolean, width?: number) {
    return _dlist_to_d(dlist, reverse, width);
  },
  folds_to_d(folds: any[]) {
    let pathData = folds
      .map((segment) => {
        if (!segment.path && !segment.blank) {
          return `M ${segment.x1} ${segment.y1} L ${segment.x2} ${segment.y2}`;
        } else {
          return segment.d;
        }
      })
      .join(" ");

    return pathData;
  },
  cut_to_d(cuts, holes: any[] = []) {
    const cutsForSvg = _dlist_to_d(cuts);
    const holesForSvg = holes.map((e) => {
      return _dlist_to_d(e);
    });

    const temp = cutsForSvg + holesForSvg.join("Z");
    return temp;
  },
  face_to_d_list(faces: Face[]) {
    const list = faces.map((e) => {
      const { name } = e;
      const d = _dlist_to_d(e.dlist);
      return {
        name,
        d,
      };
    });

    return list;
  },
};

export function rect_clips_to_path(
  clips: IUserDataClipItem[],
  rate: number = 1,
  bleedLineWidth: number = 0
) {
  const path = clips.map((e) => {
    return `M ${(e.x + bleedLineWidth) * rate} ${
      (e.y + bleedLineWidth) * rate
    } h ${e.w * rate} v ${e.h * rate} h -${e.w * rate} z`;
  });

  return path.join(" ");
}
