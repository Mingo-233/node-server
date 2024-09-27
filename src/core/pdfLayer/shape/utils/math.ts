export interface Point {
  x: number;
  y: number;
}
export interface Vector {
  x: number;
  y: number;
}
export function vectorMultiply(v1: Vector, v2: Vector) {
  return v1.x * v2.x + v1.y * v2.y;
}
/**
 * 向量的绝对值
 * @param v1
 * @returns
 */
export function absVector(v1: Vector) {
  return Math.sqrt(v1.x * v1.x + v1.y * v1.y);
}
/**
 * 获取两个向量360度的夹角
 * @param from
 * @param to
 */
export function get360AngleOfVectors(from: Vector, to: Vector) {
  const value = vectorMultiply(from, to);
  const cosX = value / (absVector(from) * absVector(to));
  const angle = Math.acos(cosX);
  const sinV = from.x * to.y - to.x * from.y;
  if (sinV < 0) {
    return 2 * Math.PI - angle;
  }
  return angle;
}
/**
 * 截取线段
 * @param line
 * @param ratio
 */
export function getRatioSegment(line: [Point, Point], ratio: number) {
  const r = ratio / 2;
  const p0 = {
    x: line[0].x * (1 - r) + r * line[1].x,
    y: line[0].y * (1 - r) + r * line[1].y,
  };
  const p1 = {
    x: line[0].x * r + line[1].x * (1 - r),
    y: line[0].y * r + line[1].y * (1 - r),
  };
  return [p0, p1];
}
/**
 * 获取两个线段的角平分线
 * @param line0
 * @param line1
 */
export function getAngleLine(line0: [Point, Point], line1: [Point, Point]) {
  const line0Vector = {
    x: line0[1].x - line0[0].x,
    y: line0[1].y - line0[0].y,
  };
  const line1Vector = {
    x: line1[1].x - line1[0].x,
    y: line1[1].y - line1[0].y,
  };
  const dist0 = absVector(line0Vector);
  const dist1 = absVector(line1Vector);
  const angle = get360AngleOfVectors(line1Vector, line0Vector);
  const t = dist0 / dist1;
  const x = line1[0].x - (1 / (1 + t)) * (line1[0].x - line0[0].x);
  const y = line1[0].y - (1 / (1 + t)) * (line1[0].y - line0[0].y);
  const v = { x, y };
  return v;
}

/**
 * 获取两个线段的切圆
 * @param line0
 * @param line1
 */
/**
 * 获取两个线段的切圆
 * @param line0
 * @param line1
 */
export function getCircleByLines(
  line0: [Point, Point],
  line1: [Point, Point],
  ratio: number
) {
  const angleLinePoint = getAngleLine(line0, line1);
  const angleLineVector = {
    x: angleLinePoint.x - line0[1].x,
    y: angleLinePoint.y - line0[1].y,
  };

  // 计算两个线段的夹角
  const line0Vector = {
    x: line0[1].x - line0[0].x,
    y: line0[1].y - line0[0].y,
  };
  const line1Vector = {
    x: line1[1].x - line1[0].x,
    y: line1[1].y - line1[0].y,
  };
  const line0Dist = absVector(line0Vector);
  const line1Dist = absVector(line1Vector);

  const angle = get360AngleOfVectors(line1Vector, line0Vector);
  const angleLineDist = Math.min(line0Dist, line1Dist) / Math.cos(angle / 2);
  const targetDist = angleLineDist * ratio;
  const sideDist = targetDist * Math.cos(angle / 2);
  const r = targetDist * Math.sin(angle / 2);
  const line0Ratio = 1 - sideDist / absVector(line0Vector);
  const line1Ratio = 1 - sideDist / absVector(line1Vector);

  const fromVector = {
    x: line0Ratio * line0Vector.x + line0[0].x,
    y: line0Ratio * line0Vector.y + line0[0].y,
  };
  const toVector = {
    x: line1Ratio * line1Vector.x + line1[0].x,
    y: line1Ratio * line1Vector.y + line1[0].y,
  };
  // 圆弧的夹角
  const circleAngle = Math.PI - angle;
  return {
    radius: r,
    angle: circleAngle,
    from: fromVector,
    to: toVector,
    control: {
      x: angleLineVector.x * ratio * (1 - Math.sin(angle / 2)) + line0[1].x,
      y: angleLineVector.y * ratio * (1 - Math.sin(angle / 2)) + line0[1].y,
    },
  };
}

/**
 * 获取两个线段的交点
 * @param line0
 * @param line1
 */
export function getIntersectionPoint(
  line0: [Point, Point],
  line1: [Point, Point]
) {
  const x1 = line0[0].x;
  const y1 = line0[0].y;
  const x2 = line0[1].x;
  const y2 = line0[1].y;

  const x3 = line1[0].x;
  const y3 = line1[0].y;
  const x4 = line1[1].x;
  const y4 = line1[1].y;

  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (denominator === 0) {
    // 两条线段平行或共线，无交点
    return null;
  }

  const intersectionX =
    ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
    denominator;
  const intersectionY =
    ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) /
    denominator;

  // 检查交点是否在两个线段之内
  // if (
  //   intersectionX < Math.min(x1, x2) ||
  //   intersectionX > Math.max(x1, x2) ||
  //   intersectionY < Math.min(y1, y2) ||
  //   intersectionY > Math.max(y1, y2) ||
  //   intersectionX < Math.min(x3, x4) ||
  //   intersectionX > Math.max(x3, x4) ||
  //   intersectionY < Math.min(y3, y4) ||
  //   intersectionY > Math.max(y3, y4)
  // ) {
  //   // 交点不在两个线段之内，无交点
  //   return null;
  // }

  return { x: intersectionX, y: intersectionY };
}
