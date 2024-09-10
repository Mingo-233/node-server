import Node, { NodeOption } from "./node";
import { getIntersectionPoint, Point, getCircleByLines } from "../utils/math";
interface StarOption extends NodeOption {
  radius: number;
}

export default class extends Node {
  private radius: number;
  constructor(option: StarOption) {
    super(option);
    this.radius = option.radius;
  }
  /**
   *        p0
   *       .  .
   *p8...p9    p1....p2
   * .             .
   *   p7        p3
   *   .  . p5 .  .
   *  p6.        .p4
   */
  private getPath() {
    const p0 = { x: this.width / 2, y: 0 };
    const p2 = {
      x: this.width,
      y:
        (1 - (0.5 + Math.tan(0.1 * Math.PI)) * Math.tan(0.2 * Math.PI)) *
        this.height,
    };
    const p4 = {
      x: (0.5 + Math.tan(0.1 * Math.PI)) * this.width,
      y: this.height,
    };
    const p6 = {
      x: (0.5 - Math.tan(0.1 * Math.PI)) * this.width,
      y: this.height,
    };
    const p8 = {
      x: 0,
      y:
        (1 - (0.5 + Math.tan(0.1 * Math.PI)) * Math.tan(0.2 * Math.PI)) *
        this.height,
    };
    const p1 = getIntersectionPoint([p0, p4], [p2, p8]) as Point;
    const p3 = getIntersectionPoint([p2, p6], [p0, p4]) as Point;
    const p5 = getIntersectionPoint([p4, p8], [p2, p6]) as Point;
    const p7 = getIntersectionPoint([p0, p6], [p4, p8]) as Point;
    const p9 = getIntersectionPoint([p0, p6], [p2, p8]) as Point;
    const points = [p9, p0, p1, p2, p3, p4, p5, p6, p7, p8];
    let path = ``;
    for (let i = 0; i < points.length; i += 2) {
      const start0 = points[i];
      const end0 = points[(i + 1) % points.length];
      const start1 = points[(i + 2) % points.length];
      // const segment0 = getRatioSegment([start0, end0], this.radius * 2);
      // const segment1 = getRatioSegment([end0, start1], this.radius * 2);
      // console.log('ratio===>', this.radius, segment0, start0, start1);
      const circle = getCircleByLines(
        [start0, end0] as [Point, Point],
        [start1, end0] as [Point, Point],
        this.radius
      );
      path += ` ${i === 0 ? "M" : "L"}${start0.x} ${start0.y} L${
        circle.from.x
      } ${circle.from.y}`;
      path += ` A${circle.radius} ${circle.radius} ${
        (circle.angle / Math.PI) * 360
      } 0 1 ${circle.to.x} ${circle.to.y}`;
    }
    path += "Z";
    return path;
  }

  public edit(dom: SVGSVGElement, option: any) {
    super.edit(dom, option);
    if (option.radius) {
      this.radius = option.radius;
    }
    const d = this.getPath();
    const pathEles = dom.querySelectorAll("path");
    const rx = (this.radius * Math.min(this.width, this.height)) / 3;
    for (let i = 0; i < pathEles.length; i++) {
      const path = pathEles[i];
      path.setAttribute("rx", `${rx}`);
      path.setAttribute("data-radius", `${this.radius}`);
      path.setAttribute("d", d);
    }
  }

  static build(dom: SVGSVGElement) {
    const width = parseFloat(dom.style.width ?? 0);
    const height = parseFloat(dom.style.height ?? 0);
    const fill = dom.getAttribute("fill") ?? "none";
    const stroke = dom.getAttribute("stroke") ?? "none";
    const strokeWidth = Number(dom.getAttribute("stroke-width") ?? 0);
    const radius = Number(
      dom.querySelector("path")?.getAttribute("data-radius") ?? 0
    );
    const uuid = (
      dom.querySelector("clipPath")?.getAttribute("id") ?? ""
    ).replace("clip-", "");
    return new this({ width, height, fill, stroke, strokeWidth, radius, uuid });
  }
  protected paint(): string {
    const path = this.getPath();
    const rx = (this.radius * Math.min(this.width, this.height)) / 3;
    return `
      <defs><clipPath id="clip-${this.uuid}"><path data-radius="${this.radius}" d="${path}" rx="${rx}"></path></clipPath></defs>
      <path data-radius="${this.radius}" rx="${rx}"  d="${path}" clip-path="url(#clip-${this.uuid})" stroke-linecap="butt"></path>
    `;
  }
}
