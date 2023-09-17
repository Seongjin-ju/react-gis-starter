import { Extent } from "ol/extent";
import { transform, fromLonLat, transformExtent } from "ol/proj";

const DEFAULT_PROJECTION = "EPSG:5179";
const DEFAULT_DISPLAY_PROJECTION = "EPSG:4326";

export const getTransForm = (coordinates: number[]) => {
    return transform(coordinates, DEFAULT_PROJECTION, DEFAULT_DISPLAY_PROJECTION);
};

export const getFromLonLat = (coordinates: number[]): number[] => {
    return fromLonLat(coordinates, DEFAULT_PROJECTION);
};

export const getExtentFromLonLat = (coordinates: Extent) => {
    return transformExtent(coordinates, DEFAULT_DISPLAY_PROJECTION, DEFAULT_PROJECTION);
};
