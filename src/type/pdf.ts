import { IProject } from "./projectData";
import { IKnifeData } from "./knifeData";
interface ICreatePdfParams {
  projectData: IProject;
  knifeData: IKnifeData;
  config: {
    unit: "mm";
    colorMode: "RGB" | "CMYK";
    filePath: string;
  };
}
