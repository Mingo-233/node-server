import Node, { NodeOption } from "./node";
import { getCircleByLines, Point } from "../utils/math";
interface TriangleOption extends NodeOption {
  radius: number;
}
export default class extends Node {
  private radius: number;
  constructor(option: TriangleOption) {
    super(option);
    this.radius = option.radius;
  }
  public edit(dom: SVGSVGElement, option: any) {
    super.edit(dom, option);
    if (option.radius) {
      this.radius = option.radius ?? 0;
    }
    const d = this.getPath();
    const pathEles = dom.querySelectorAll("path");
    for (let i = 0; i < pathEles.length; i++) {
      const path = pathEles[i];
      path.setAttribute("d", d);
    }
  }
  static build(dom: SVGSVGElement) {
    const width = Number(dom.getAttribute("width") ?? 0);
    const height = Number(dom.getAttribute("height") ?? 0);
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
  private getPath() {
    const p1 = { x: 0, y: this.height };
    const p12 = { x: this.width / 4, y: this.height / 2 };
    const p2 = { x: this.width / 2, y: 0 };
    const p23 = { x: (this.width * 3) / 4, y: this.height / 2 };
    const p3 = { x: this.width, y: this.height };
    const p31 = { x: this.width / 2, y: this.height };
    const circle0 = getCircleByLines(
      [p12, p2] as [Point, Point],
      [p23, p2] as [Point, Point],
      this.radius
    );
    const circle1 = getCircleByLines(
      [p23, p3] as [Point, Point],
      [p31, p3] as [Point, Point],
      this.radius
    );
    const circle2 = getCircleByLines(
      [p31, p1] as [Point, Point],
      [p12, p1] as [Point, Point],
      this.radius
    );
    const path = `
      M${p12.x} ${p12.y} L${circle0.from.x} ${circle0.from.y}
      A${circle0.radius} ${circle0.radius} ${
      (circle0.angle / Math.PI) * 360
    } 0 1 ${circle0.to.x} ${circle0.to.y}
      L${p23.x} ${p23.y} L${circle1.from.x} ${circle1.from.y}
      A${circle1.radius} ${circle1.radius} ${
      (circle1.angle / Math.PI) * 360
    } 0 1 ${circle1.to.x} ${circle1.to.y}
      L${p31.x} ${p31.y} L${circle2.from.x} ${circle2.from.y}
      A${circle2.radius} ${circle2.radius} ${
      (circle2.angle / Math.PI) * 360
    } 0 1 ${circle2.to.x} ${circle2.to.y}
      Z
    `;
    return path;
  }
  paint() {
    const path = this.getPath();
    return `
    <defs><clipPath id="clip-${this.uuid}"><path data-radius="${this.radius}" d="${path}"></path></clipPath></defs>
      <path data-radius="${this.radius}"  d="${path}" clip-path="url(#clip-${this.uuid})" stroke-linecap="butt"></path>
    `;
  }
}
