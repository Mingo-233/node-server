import Node, { NodeOption } from "./node";
interface RectangleOption extends NodeOption {
  radius: number;
}

export default class extends Node {
  private radius: number;
  constructor(option: RectangleOption) {
    super(option);
    this.radius = option.radius;
  }
  private getPath() {
    const strokeLen = this.strokeWidth * this.radius;
    const path = `
      M${strokeLen} 0
      L${this.width - strokeLen} 0
      C${this.width} 0 ${this.width} 0 ${this.width} ${strokeLen}
      L${this.width} ${this.height - strokeLen}
      C${this.width} ${this.height} ${this.width} ${this.height} ${
      this.width - strokeLen
    } ${this.height}
      L${strokeLen} ${this.height}
      C0 ${this.height} 0 ${this.height} 0 ${
      this.height - strokeLen
    } L0 ${strokeLen}
      C0 0 0 0 ${strokeLen} 0 Z
    `;
    return path;
  }

  public edit(dom: SVGSVGElement, option: any) {
    super.edit(dom, option);
    if (option.radius) {
      this.radius = option.radius;
    }
    const radius = (Math.min(this.width, this.height) / 2) * this.radius;
    const pathEles = dom.querySelectorAll("rect");
    for (let i = 0; i < pathEles.length; i++) {
      const path = pathEles[i];
      path.setAttribute("rx", `${radius}`);
      path.setAttribute("ry", `${radius}`);
      path.setAttribute("width", `${this.width}`);
      path.setAttribute("height", `${this.height}`);
    }
  }

  static build(dom: SVGSVGElement) {
    const width = parseFloat(dom.style.width ?? 0);
    const height = parseFloat(dom.style.height ?? 0);
    const fill = dom.getAttribute("fill") ?? "none";
    const stroke = dom.getAttribute("stroke") ?? "none";
    const strokeWidth = Number(dom.getAttribute("stroke-width") ?? 0);
    const radius =
      (Number(dom.querySelector("rect")?.getAttribute("rx") ?? 0) * 2) /
      Math.min(width, height);
    const uuid = (
      dom.querySelector("clipPath")?.getAttribute("id") ?? ""
    ).replace("clip-", "");
    return new this({ width, height, fill, stroke, strokeWidth, radius, uuid });
  }

  paint() {
    const radius = (Math.min(this.width, this.height) / 2) * this.radius;
    return `
      <defs><clipPath id="clip-${this.uuid}"><rect width="${this.width}" height="${this.height}" rx="${radius}" ry="${radius}" /></clipPath></defs>
      <rect width="${this.width}" height="${this.height}" rx="${radius}" ry="${radius}" clip-path="url(#clip-${this.uuid})" stroke-linecap="butt" />
    `;
  }
}
