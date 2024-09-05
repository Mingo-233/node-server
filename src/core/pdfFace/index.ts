import { usePdfLayer } from "@/core/pdfLayer/index";

export function createFace(name, type, side) {
  const layer = usePdfLayer();
  const face = {
    faceName: name,
    type: type,
    side: side,
    knifeLayer: layer.getKnifeLayer(),
    designLayer: layer.getDesignLayer(),
    annotationLayer: layer.getAnnotationLayer(),
    drawKnife: (knifeData, config) => layer.drawKnife(knifeData, config),
    drawDesign: (designData, config) => layer.drawDesign(designData, config),
    drawAnnotate: (annotateData, config) =>
      layer.drawAnnotation(annotateData, config),
  };

  return face;
}
