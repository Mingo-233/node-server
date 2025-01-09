import { usePdfLayer } from "@/core/pdfLayer/index";

export function createFace(name, type, side) {
  const layer = usePdfLayer({
    side: side,
  });
  const face = {
    faceName: name,
    type: type,
    side: side,
    knifeLayer: layer.getKnifeLayer(),
    designLayer: layer.getDesignLayer(),
    annotationLayer: layer.getAnnotationLayer(),
    drawKnife: (knifeData, config) => layer.drawKnife(knifeData, config),
    drawDesign: (designData, knifeData, config) =>
      layer.drawDesign(designData, knifeData, config),
    drawAnnotate: (annotateData, config) =>
      layer.drawAnnotation(annotateData, config),
  };

  return face;
}
