import { Map } from "ol";
import { RouteLayerOptions } from "../interfaces/layer.interface";
export declare const removeHighlightRoutePoint: (mapObject: Map) => void;
export declare const highlightRoutePoint: (mapObject: Map, index: number, radius: number) => void;
export declare const removeRouteLayer: (mapObject: Map) => void;
export declare const routeLayer: (mapObject: Map, options: RouteLayerOptions) => void;
