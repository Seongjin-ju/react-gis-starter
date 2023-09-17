/**
 * moveMap 기능 옵션 인터페이스
 * @typedef {Object} MoveMapOptions
 * @property {number[]} coordinate 이동 위치의 좌표
 * @property {boolean=} animate 지도 이동 시 animation 추가 여부(부드러운 이동)
 * @property {number=} zoomLevel 이동 시 zoom 레벨 설정, 기본 값은 현재 화면의 zoom 레벨
 * @property {Function=} moveMapCallback 좌표 이동 후 처리 콜백
 */
export interface MoveMapOptions {
    coordinate: number[];
    animate?: boolean;
    zoomLevel?: number;
    moveMapCallback?: () => void;
}

/**
 * FitExtentOptions 기능 옵션 인터페이스
 * @typedef {Object} FitExtentOptions
 * @property {number[][]} coordinates 이동 위치의 좌표 목록
 * @property {boolean=} animate 지도 이동 시 animation 추가 여부(부드러운 이동)
 * @property {Function=} fitExtentCallback extent 이동 후 처리 콜백
 */
export interface FitExtentOptions {
    coordinates: number[][];
    animate?: boolean;
    fitExtentCallback?: () => void;
}
