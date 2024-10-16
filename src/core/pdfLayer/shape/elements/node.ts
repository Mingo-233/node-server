export interface NodeOption {
  uuid: string;
  width: number;
  height: number;
  fill?: string;
  strokeWidth?: number;
  strokeDashArray?: number;
  stroke?: string;
}
export default abstract class Node {
  protected uuid: string;
  protected width: number;
  protected height: number;
  protected children: Node[] = [];
  protected fill?: string;
  protected stroke?: string;
  protected strokeWidth = 0;
  protected strokeDashArray = 0;
  constructor(option: NodeOption) {
    this.uuid = option.uuid;
    this.width = option.width;
    this.height = option.height;
    this.fill = option.fill;
    this.stroke = option.stroke;
    this.strokeWidth = option.strokeWidth ?? 0;
    this.strokeDashArray = option.strokeDashArray ?? 0;
  }

  public edit(svg: SVGSVGElement, option: any) {
    this.width = option.width ?? this.width;
    this.height = option.height ?? this.height;
    this.fill = option.fill ?? this.fill;
    this.stroke = option.stroke ?? this.stroke;
    this.strokeWidth = option.strokeWidth ?? this.strokeWidth;
    svg.setAttribute("viewBox", `0 0 ${this.width} ${this.height}`);
    svg.setAttribute("stroke-width", `${this.strokeWidth}`);
    svg.setAttribute("fill", this.fill ?? "none");
    svg.setAttribute("stroke", this.stroke ?? "none");
    svg.style.width = `${this.width}mm`;
    svg.style.height = `${this.height}mm`;
  }

  protected abstract paint(): string;

  render() {
    const svgHTML = this.paint();
    return `<svg xmlns="http://www.w3.org/2000/svg" data-uuid="${
      this.uuid
    }" stroke-dasharray="${
      this.strokeDashArray === 1 ? this.strokeWidth : 0
    }" stroke-dashoffset="${
      this.strokeDashArray === 1 ? this.width / 24 : 0
    }" stroke-width="${this.strokeWidth}" fill="${
      this.fill ?? "none"
    }" stroke="${this.stroke}" viewBox="0 0 ${this.width} ${
      this.height
    }" style="position: absolute;left:0; top: 0;overflow: hidden;width:${
      this.width
    }mm;height:${this.height}mm;">
      ${svgHTML}  
    </svg>
    `;
  }
}
