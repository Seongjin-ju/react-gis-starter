import { RouteFeature, CircleFeature } from "./feature.interface";
export interface RouteLayerOptions {
    features: RouteFeature[];
    routeIcon: string;
    clusterIcon: string;
    lineColor?: string;
    lineWidth?: number;
    labelOffsetY?: number;
    labelSize?: number;
    labelColor?: string;
    selectRadius?: number;
    selectCallback?: (pointIndex: number) => void;
}
export interface CircleLayerOptions {
    features: CircleFeature[];
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
    selectCallback?: (pointIndex: number) => void;
}
export interface HighlightCircleLayerOptions {
    selectStrokeWidth: number;
    selectStrokeColor?: string;
    selectFillColor?: string;
}
