import { Ref } from "react";
import { Map } from "ol";
import { KAKAO_BG, GOOGLE_BG, VWORLD_BG } from "../components/TmsMapContainer";
import { CircleLayerOptions, HighlightCircleLayerOptions, RouteLayerOptions } from "./layer.interface";
import { MoveMapOptions, FitExtentOptions } from "./util.interface";
type MAP_TYPES = typeof KAKAO_BG | typeof GOOGLE_BG | typeof VWORLD_BG | "";
export interface TmsMapRefObject {
    getInstance: () => Map | null;
    getCenter: () => number[] | undefined;
    setZoom: (zoomLevel: number) => void;
    moveMap: (options: MoveMapOptions) => void;
    fitExtentCoordinates: (options: FitExtentOptions) => void;
    changeBaseMap: (mapType: string) => void;
    routeLayer: (options: RouteLayerOptions) => void;
    removeRouteLayer: () => void;
    highlightRoutePoint: (index: number, radius: number) => void;
    removeHighlightRoutePoint: () => void;
    circleLayer: (options: CircleLayerOptions) => void;
    removeCircleLayer: () => void;
    highlightCirclePoint: (index: number, radius: number, options: HighlightCircleLayerOptions) => void;
    removeHighlightCirclePoint: () => void;
}
export interface TmsMapOptions {
    type: MAP_TYPES;
    lng: number;
    lat: number;
    ref: Ref<Partial<TmsMapRefObject>>;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    events?: {
        postRendered: () => void;
    };
}
export interface TmsMapProps {
    options: TmsMapOptions;
}
export interface MapProjections {
    kakao: {
        resolution: number[];
        extent: number[];
        projection: string;
    };
}
export interface KakaoMapVersions {
    BICYCLE?: string;
    HYBRID?: string;
    ROADMAP?: string;
    ROADMAP_SUFFIX?: string;
    ROADVIEW?: string;
    ROADVIEW_FLASH?: string;
    SKYVIEW_HD_VERSION?: string;
    SKYVIEW_VERSION?: string;
    SR?: string;
    USE_DISTRICT?: string;
}
export {};
