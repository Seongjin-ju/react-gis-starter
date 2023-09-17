export interface MoveMapOptions {
    coordinate: number[];
    animate?: boolean;
    zoomLevel?: number;
    moveMapCallback?: () => void;
}
export interface FitExtentOptions {
    coordinates: number[][];
    animate?: boolean;
    fitExtentCallback?: () => void;
}
