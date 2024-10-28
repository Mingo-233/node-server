import Node, { NodeOption } from "./node";

export default class extends Node {
  private getPath() {
    const path = `
      M0 0 L${this.width} 0
    `;
    return path;
  }

  public edit(dom: SVGSVGElement, option: any) {
    super.edit(dom, option);
    const d = this.getPath();
    const pathEles = dom.querySelectorAll("line");
    for (let i = 0; i < pathEles.length; i++) {
      const path = pathEles[i];
      path.setAttribute("y1", `${this.height / 2}`);
      path.setAttribute("y2", `${this.height / 2}`);
      path.setAttribute("x2", `${this.width}`);
    }
  }
  static build(dom: SVGSVGElement) {
    const width = parseFloat(dom.style.width ?? 0);
    const height = parseFloat(dom.style.height ?? 0);
    const fill = dom.getAttribute("fill") ?? "none";
    const stroke = dom.getAttribute("stroke") ?? "none";
    const strokeWidth = Number(dom.getAttribute("stroke-width") ?? 0);
    const uuid = dom.dataset.uuid as string;
    return new this({ width, height, fill, stroke, strokeWidth, uuid });
  }
  protected paint(): string {
    const path = this.getPath();
    return `
      <line x1="0" y1="${this.height / 2}" x2="${this.width}" y2="${
      this.height / 2
    }" stroke-linecap="butt"></line>
    `;
  }
  render() {
    const svgHTML = this.paint();
    return `<svg xmlns="http://www.w3.org/2000/svg" data-uuid="${
      this.uuid
    }" stroke-dasharray="${
      this.strokeDashArray === 1 ? this.strokeWidth : 0
    }" stroke-dashoffset="${
      this.strokeDashArray === 1 ? this.width / 24 : 0
    }" stroke-width="${this.strokeWidth}" fill="none" stroke="${
      this.stroke
    }" viewBox="0 0 ${this.width} ${
      this.height
    }" style="position: absolute;left:0; top: 0;overflow: hidden;width:${
      this.width
    }mm;height:${this.height}mm;">
      ${svgHTML}  
    </svg>
    `;
  }
}
