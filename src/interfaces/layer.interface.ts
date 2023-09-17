import { RouteFeature, CircleFeature } from "./feature.interface";

/**
 * 경로(route) 레이어 생성 옵션 정보
 * @typedef {Object} RouteLayerOptions
 * @property {RouteFeature[]} features 경로 생성을 위한 각 지점에 대한 feature 배열 정보
 * @property {string} routeIcon 각 경로 지점에 표현 될 base64 이미지
 * @property {string=} lineColor 경로 표현 라인의 색상
 * @property {string=} lineWidth 경로 표현 라인의 굵기
 * @property {string=} labelOffsetY 라벨의 세로 위치 (음수: 위로, 양수: 아래로)
 * @property {string=} labelSize label 크기 (pixel)
 * @property {string=} labelColor label 색상
 * @property {string=} selectRadius 경로 지점 선택 시 강조 표시가 될 원형 반경
 * @property {Function=} selectCallback 각 지점 선택 시 index를 반환하는 콜백
 */
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

/**
 * 원형 레이어 생성 옵션 정보
 * @typedef {Object} CircleLayerOptions
 * @property {features} features 원형을 표시 할 각 지점에 대한 feature 정보
 * @property {string=} strokeColor 원형의 바깥 라인 색상
 * @property {number=} strokeWidth 원형의 바깥 라인 색상
 * @property {string=} fillColor 원형의 채움 색상
 * @property {string=} selectStrokeColor 원형의 바깥 라인 색상
 * @property {string=} selectFillColor 원형의 바깥 라인 색상
 * @property {Function=} selectCallback 각 원형 선택 시 index를 반환하는 콜백
 */
export interface CircleLayerOptions {
    features: CircleFeature[];
    strokeWidth?: number;
    strokeColor?: string;
    fillColor?: string;
    selectCallback?: (pointIndex: number) => void;
}

/**
 * 원형 하이라이트 처리 옵션 정보
 * @typedef {Object} HighlightCircleLayerOptions
 * @property {features} features 원형을 표시 할 각 지점에 대한 feature 정보
 * @property {string=} strokeColor 원형의 바깥 라인 색상
 * @property {number=} strokeWidth 원형의 바깥 라인 색상
 * @property {string=} fillColor 원형의 채움 색상
 * @property {string=} selectStrokeColor 원형의 바깥 라인 색상
 * @property {string=} selectFillColor 원형의 바깥 라인 색상
 * @property {Function=} selectCallback 각 원형 선택 시 index를 반환하는 콜백
 */
export interface HighlightCircleLayerOptions {
    selectStrokeWidth: number;
    selectStrokeColor?: string;
    selectFillColor?: string;
}
