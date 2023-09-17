import { Map } from "ol";
import { CircleLayerOptions, HighlightCircleLayerOptions } from "../interfaces/layer.interface";
export declare const removeHighlightCirclePoint: (mapObject: Map) => void;
export declare const highlightCirclePoint: (mapObject: Map, index: number, radius: number, options?: HighlightCircleLayerOptions) => void;
export declare const removeCircleLayer: (mapObject: Map) => void;
export declare const circleLayer: (mapObject: Map, options: CircleLayerOptions) => void;
