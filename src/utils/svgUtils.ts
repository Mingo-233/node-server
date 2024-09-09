import { Face, SvgOpt } from "@/type/knifeData";
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

  dlist.forEach((item) => {
    switch (item.mtd) {
      case "M":
        str += ` ${item.mtd}${reverse ? curWidth - item.x : item.x},${item.y} `;
        break;
      case "L":
        str += ` ${item.mtd}${reverse ? curWidth - item.x : item.x},${item.y} `;
        break;
      case "Q":
        str += ` ${item.mtd}${reverse ? curWidth - (item.cx ?? 0) : item.cx},${
          item.cy
        },${reverse ? curWidth - item.x : item.x},${item.y} `;
        break;
      case "A":
        str += ` ${item.mtd}${reverse ? curWidth - (item.rx ?? 0) : item.rx},${
          item.ry
        } ${item.ang} ${item.arc},${reverse ? 1 - (item.dir ?? 0) : item.dir} ${
          reverse ? curWidth - item.x : item.x
        },${item.y} `;
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
