import layerKnifeData from "./knife.json";
import projectInfoData from "./info.json";
export let projectApiData = {
  value: null,
};
export let layerKnifeApiData = {
  value: null,
};

export function getProjectsInfo() {
  return projectApiData.value || projectInfoData;
}

export function getLayerKnifeData() {
  return layerKnifeApiData.value || layerKnifeData;
}
