import { Feature, Map } from "ol";
import { Circle, Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Style, Fill, Stroke } from "ol/style";

import { CircleFeature } from "../interfaces/feature.interface";
import { CircleLayerOptions, HighlightCircleLayerOptions } from "../interfaces/layer.interface";
import { getFromLonLat } from "../utils";

import { getCircleFeature, getFindFeature, removeDuplicateFeatures, setFeatureStyle } from "./feature";
import { removeDuplicateLayer, getVectorLayer, getFindVectorLayer } from "./vectorLayer";

/**
 * 삭제 및 구분,관리용 Properties 정보 인 KEY, VALUE
 */
const LAYER_TYPE_KEY = "layerType";
const CIRCLE_LAYER = "tmsCircleLayer";
const CIRCLE_HIGHLIGHT_POINT_LAYER = "tmsHighlightCirclePointLayer";

const FEATURE_TYPE_KEY = "featureType";
const CIRCLE_HIGHLIGHT_POINT_FEATURE = "tmsHighlightCirclePointFeature";
const CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY = "circlePointIndex";

/**
 * 상수
 */
const DEFAULT_RADIUS = 50;
const DEFAULT_FILL_COLOR = "rgba(0, 0, 0, 0.1)";
const DEFAULT_STROKE_WIDTH = 1;
const DEFAULT_STROKE_COLOR = "rgba(0, 0, 0, 0.5)";
const DEFAULT_SELECT_FILL_COLOR = "rgba(0, 0, 0, 0.1)";
const DEFAULT_SELECT_STROKE_WIDTH = 2;
const DEFAULT_SELECT_STROKE_COLOR = "rgba(0, 104, 180, 0.8)";

/**
 * @private
 * @name removeHighlightCirclePoint
 * @function
 * @description 원형 하이라이트 레이어를 삭제 한다.
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
export const removeHighlightCirclePoint = (mapObject: Map): void => {
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
};

/**
 * @private
 * @name highlightCirclePoint
 * @function
 * @description 원형 레이어의 특정 지점을 하이라이트 처리 한다.
 * @param {Map} mapObject 지도 객체
 * @param {number} index 하이라이트 대상 원형의 index 번호
 * @param {number} radius 하이라이트 대상 원형의 반경
 * @return {void}
 */
export const highlightCirclePoint = (
    mapObject: Map,
    index: number,
    radius: number,
    options?: HighlightCircleLayerOptions
): void => {
    /** 1. 원형 표시 레이어 추출 */
    const circlePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);

    if (circlePointLayer) {
        /** 2. 원형 표시 레이어 벡터 소스 추출 */
        const circlePointVectorSource: VectorSource<Geometry> | null = (
            circlePointLayer as VectorLayer<VectorSource<Geometry>>
        ).getSource();

        /** 3. parameter index에 해당하는 feature(포인트) 정보 추출(하이라이트 대상) */
        const findFeature = circlePointVectorSource?.getFeatures().find((feature: Feature) => {
            return feature.getProperties().circlePointIndex === index;
        });

        if (findFeature) {
            /** 4. 하이라이트용 레이어가 없는 경우 신규 레이어 생성 */
            let highlightCirclePointLayer: VectorLayer<VectorSource<Geometry>> | undefined;
            highlightCirclePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);

            if (!highlightCirclePointLayer) {
                highlightCirclePointLayer = getVectorLayer(new VectorSource({}), 2);
                highlightCirclePointLayer.set(LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
                mapObject.addLayer(highlightCirclePointLayer);
            }

            highlightCirclePointLayer.getSource()?.clear();

            /** 5. 하이라이트용 레이어 벡터 소스 추출 */
            const highlightCirclePointVectorSource: VectorSource<Geometry> | null = (
                highlightCirclePointLayer as VectorLayer<VectorSource<Geometry>>
            ).getSource();

            /** 6. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
            let isDuplicateFeature: Feature | undefined;
            if (highlightCirclePointVectorSource) {
                isDuplicateFeature = getFindFeature(
                    highlightCirclePointVectorSource,
                    CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY,
                    index
                );
            }

            /** 7. 중복 feature 제거 or feature 추가 */
            if (isDuplicateFeature) {
                /** 8-1. 하이라이트용 feature 삭제 */
                highlightCirclePointVectorSource?.removeFeature(isDuplicateFeature);
            } else {
                /** 8-2. 하이라이트용 feature 생성 및 추가 */
                if (findFeature && highlightCirclePointVectorSource) {
                    const circeCenter = (findFeature as Feature<Circle>).getGeometry()?.getCenter();
                    if (circeCenter) {
                        removeDuplicateFeatures(
                            highlightCirclePointVectorSource,
                            FEATURE_TYPE_KEY,
                            CIRCLE_HIGHLIGHT_POINT_FEATURE
                        );
                        const circleFeature: Feature = getCircleFeature(circeCenter, radius || DEFAULT_RADIUS);
                        setFeatureStyle(
                            circleFeature,
                            new Style({
                                fill: new Fill({ color: options?.selectFillColor || DEFAULT_SELECT_FILL_COLOR }),
                                stroke: new Stroke({
                                    width: options?.selectStrokeWidth || DEFAULT_SELECT_STROKE_WIDTH,
                                    color: options?.selectStrokeColor || DEFAULT_SELECT_STROKE_COLOR,
                                }),
                            })
                        );
                        circleFeature.set(FEATURE_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_FEATURE);
                        circleFeature.set(CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
                        highlightCirclePointVectorSource?.addFeature(circleFeature);
                    }
                }
            }
        }
    }
};

/**
 * @private
 * @name removeCircleLayer
 * @function
 * @description 원형 레이어 삭제
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
export const removeCircleLayer = (mapObject: Map): void => {
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
};

/**
 * @private
 * @name circleLayer
 * @function
 * @description 원형 레이어 생성
 * @param {Map} mapObject 지도 객체
 * @param {CircleLayerOptions} options 원형 레이어를 생성하기 위한 옵션
 * @param {CircleFeature[]} options.features 원형 레이어 생성에 필요한 feature 정보, 좌표 및 properties 정보를 가진 배열
 * @property {string=} options.strokeColor 원형의 바깥 라인 색상
 * @property {number=} options.strokeWidth 원형의 바깥 라인 색상
 * @property {string=} options.fillColor 원형의 채움 색상
 * @property {string=} options.selectStrokeColor 원형의 바깥 라인 색상
 * @property {string=} options.selectFillColor 원형의 바깥 라인 색상
 * @property {Function=} selectCallback 각 원형 선택 시 index를 반환하는 콜백
 * @return {void}
 */
export const circleLayer = (mapObject: Map, options: CircleLayerOptions): void => {
    // 1. 이미 생성 된 동일 레이어 및 Interaction 도구 중복 방지를 위한 제거
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);

    // 2. 원형 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
    const circleVectorLayer: VectorLayer<VectorSource<Geometry>> = getVectorLayer(new VectorSource({}), 1);
    circleVectorLayer.set(LAYER_TYPE_KEY, CIRCLE_LAYER);
    mapObject.addLayer(circleVectorLayer);

    // 3. Vector 레이어 Feature 추가
    const circleVectorSource: VectorSource<Geometry> | null = circleVectorLayer.getSource();

    /** 4. 원형 Feature 객체 생성 및 추가 */
    const circleFeatures: Feature[] = [];
    options.features.forEach((feature: CircleFeature) => {
        const circleFeature: Feature = getCircleFeature(
            getFromLonLat(feature.coordinates),
            feature.properties.circleRadius
        );
        Object.keys(feature.properties).forEach((key: string) => {
            circleFeature.set(key, feature.properties[key]);
        });
        setFeatureStyle(
            circleFeature,
            new Style({
                fill: new Fill({ color: options.fillColor || DEFAULT_FILL_COLOR }),
                stroke: new Stroke({
                    width: options.strokeWidth || DEFAULT_STROKE_WIDTH,
                    color: options.strokeColor || DEFAULT_STROKE_COLOR,
                }),
            })
        );
        circleFeatures.push(circleFeature);
    });
    circleVectorSource?.addFeatures(circleFeatures);
};
