export interface RouterFeatureProperties {
    [key: string]: string | number;
    routePointIndex: number;
    routePointLabel: string;
}
export interface RouteFeature {
    coordinates: number[];
    properties: RouterFeatureProperties;
    clusterFeatures?: RouteFeature[];
}
export interface CircleFeatureProperties {
    [key: string]: string | number;
    circlePointIndex: number;
    circlePointLabel: string;
    circleRadius: number;
}
export interface CircleFeature {
    coordinates: number[];
    properties: CircleFeatureProperties;
}
