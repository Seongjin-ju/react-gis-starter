import { Map } from "ol";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
export declare const getVectorLayer: (source: VectorSource, zIndex: number) => VectorLayer<VectorSource<Geometry>>;
export declare const getFindVectorLayer: (mapObject: Map, layerTypeKey: string, layerType: string) => VectorLayer<VectorSource<Geometry>> | undefined;
export declare const removeDuplicateLayer: (mapObject: Map, key: string, value: string) => void;
