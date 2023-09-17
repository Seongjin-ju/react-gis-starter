/**
 * 경로(route) 레이어 Feature Properties 정보
 * @typedef {Object} RouterFeatureProperties
 * @property {number} routePointIndex 경로 레이어의 각 지점 구분용 index 정보
 * @property {string} routePointLabel 경로 레이어의 각 지점 텍스트 표시용 label 정보
 */
export interface RouterFeatureProperties {
    [key: string]: string | number;
    routePointIndex: number;
    routePointLabel: string;
}

/**
 * 경로(route) 레이어 Feature 정보
 * @typedef {Object} RouteFeature
 * @property {number[][]} coordinates 경로 생성 좌표
 * @property {RouterFeatureProperties} properties 경로(route) 레이어 Feature Properties 정보
 * @property {RouteFeature[]} clusterFeatures 좌표가 중복되는 cluster 처리용 feature 정보
 */
export interface RouteFeature {
    coordinates: number[];
    properties: RouterFeatureProperties;
    clusterFeatures?: RouteFeature[];
}

/**
 * 원형 레이어 Feature Properties 정보
 * @typedef {Object} CircleFeatureProperties
 * @property {number} circlePointIndex 원형 레이어의 각 지점 구분용 index 정보
 * @property {string} circlePointLabel 원형 레이어의 각 지점 텍스트 표시용 label 정보
 * @property {string} circlePointLabel 원형 레이어의 각 원형 반경 크기 설정
 */
export interface CircleFeatureProperties {
    [key: string]: string | number;
    circlePointIndex: number;
    circlePointLabel: string;
    circleRadius: number;
}

/**
 * 원형 레이어 Feature 정보
 * @typedef {Object} CircleFeatureProperties
 * @property {number[]} coordinates 경로 생성 좌표
 * @property {CircleFeatureProperties} properties 원형 생성 옵션 중 필요 properties 정보
 */
export interface CircleFeature {
    coordinates: number[];
    properties: CircleFeatureProperties;
}
