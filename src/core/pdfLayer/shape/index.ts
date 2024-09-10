import Circle from "./elements/circle";
import Rectangle from "./elements/rectangle";
import Triangle from "./elements/triangle";
import Star from "./elements/star";
import Line from "./elements/line";
interface ShapeOption {
  uuid: string;
  type: string;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth: number;
  strokeDashArray: number;
  radius: number;
}

interface ShapeEditOption {
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: string;
  strokeDashArray?: number;
  radius?: string;
}
export function getShapeContent(option: ShapeOption) {
  switch (option.type) {
    case "rectangle":
      return new Rectangle(option).render();
    case "circle":
      return new Circle(option).render();
    case "triangle":
      return new Triangle(option).render();
    case "star":
      return new Star(option).render();
    case "line":
      return new Line(option).render();
  }
}

export function editShapeContent(
  shapeType: string,
  option: ShapeEditOption,
  svg: SVGSVGElement
) {
  switch (shapeType) {
    case "rectangle":
      Rectangle.build(svg).edit(svg, option);
      break;
    case "circle":
      Circle.build(svg).edit(svg, option);
      break;
    case "triangle":
      Triangle.build(svg).edit(svg, option);
      break;
    case "star":
      Star.build(svg).edit(svg, option);
      break;
    case "line":
      Line.build(svg).edit(svg, option);
      break;
  }
}
