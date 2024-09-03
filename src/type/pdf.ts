import { IProject } from "./projectData";
import { IKnifeData } from "./knifeData";
interface ICreatePdfParams {
  projectData: IProject;
  knifeData: IKnifeData;
  config: {
    side: "outside" | "inside";
    unit: "mm";
    color_mode: "RGB" | "CMYK";
  };
}
