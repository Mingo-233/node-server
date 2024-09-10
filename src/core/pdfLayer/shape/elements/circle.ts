import Node, { NodeOption } from "./node";

export default class extends Node {
  static build(dom: SVGSVGElement) {
    const width = Number(dom.getAttribute("width") ?? 0);
    const height = Number(dom.getAttribute("height") ?? 0);
    const fill = dom.getAttribute("fill") ?? "none";
    const stroke = dom.getAttribute("stroke") ?? "none";
    const strokeWidth = Number(dom.getAttribute("stroke-width") ?? 0);
    const uuid = (
      dom.querySelector("clipPath")?.getAttribute("id") ?? ""
    ).replace("clip-", "");
    return new this({ width, height, fill, stroke, strokeWidth, uuid });
  }
  public edit(dom: SVGSVGElement, option: any) {
    super.edit(dom, option);
    const ellipses = dom.querySelectorAll("ellipse");
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = this.width / 2;
    const ry = this.height / 2;
    for (let i = 0; i < ellipses.length; i++) {
      const ellipse = ellipses[i];
      ellipse?.setAttribute("cx", `${cx}`);
      ellipse?.setAttribute("cy", `${cy}`);
      ellipse?.setAttribute("rx", `${rx}`);
      ellipse?.setAttribute("ry", `${ry}`);
    }
  }
  protected paint(): string {
    const cx = this.width / 2;
    const cy = this.height / 2;
    const rx = this.width / 2;
    const ry = this.height / 2;
    return `
    <defs><clipPath id="clip-${this.uuid}"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" /></clipPath></defs>
    <ellipse clip-path="url(#clip-${this.uuid})" stroke-linecap="butt" cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" />
    `;
  }
}
