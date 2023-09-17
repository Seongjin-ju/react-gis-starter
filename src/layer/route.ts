import { Map, Feature, MapBrowserEvent } from "ol";
import { click } from "ol/events/condition";
import { FeatureLike } from "ol/Feature";
import { Geometry, Point } from "ol/geom";
import { Select } from "ol/interaction";
import { SelectEvent } from "ol/interaction/Select";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import LayerRenderer from "ol/renderer/Layer";
import Source from "ol/source/Source";
import VectorSource from "ol/source/Vector";
import { Style, Stroke, Icon, Text, Fill } from "ol/style";
import { StyleLike } from "ol/style/Style";

import { RouterFeatureProperties, RouteFeature } from "../interfaces/feature.interface";
import { RouteLayerOptions } from "../interfaces/layer.interface";
import { getFromLonLat } from "../utils";

import {
    getCircleGradientFeature,
    getFindFeatures,
    getLineFeature,
    getPointFeature,
    removeDuplicateFeatures,
    setFeatureStyle,
} from "./feature";
import { removeDuplicateInteraction } from "./interaction";
import { getFindVectorLayer, getVectorLayer, removeDuplicateLayer } from "./vectorLayer";

/**
 * 삭제 및 구분,관리용 Properties 정보 인 KEY, VALUE
 */
const LAYER_TYPE_KEY = "layerType";
const ROUTE_LAYER = "tmsRouteLayer";
const ROUTE_POINT_LAYER = "tmsRoutePointLayer";
const ROUTE_HIGHLIGHT_POINT_LAYER = "tmsHighlightRoutePointLayer";

const FEATURE_TYPE_KEY = "featureType";
const ROUTE_POINT_FEATURE = "tmsRoutePointFeature";
const ROUTE_HIGHLIGHT_POINT_FEATURE = "tmsHighlightRoutePointFeature";

const ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY = "routePointIndex";

const CLUSTER_FEATURES = "clusterFeatures";

/**
 * 상수
 */
const POINT_SELECTION_RADIUS = 50;

/**
 * @private
 * @name removeHighlightRoutePoint
 * @function
 * @description 경로 표시 레이어의 특정 지점을 하이라이트 레이어를 삭제 한다.
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
export const removeHighlightRoutePoint = (mapObject: Map): void => {
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
};

/**
 * @private
 * @name highlightRoutePoint
 * @function
 * @description 경로 표시 레이어의 특정 지점을 하이라이트 처리 한다.
 * @param {Map} mapObject 지도 객체
 * @param {number} index 하이라이트 대상 경로 지점의 index 번호
 * @return {void}
 */
export const highlightRoutePoint = (mapObject: Map, index: number, radius: number): void => {
    /** 1. 경로 포인트 표시 레이어 추출 */
    const routePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
    if (routePointLayer) {
        /** 2. 레이어 생성 옵션 추출 */
        const routeLayerOptions: RouteLayerOptions = routePointLayer.get("layerOptions");

        /** 3. 경로 포인트 표시 레이어 벡터 소스 추출 */
        const routePointVectorSource: VectorSource<Geometry> | null = (
            routePointLayer as VectorLayer<VectorSource<Geometry>>
        ).getSource();

        /** 4. parameter index에 해당하는 feature(포인트) 정보 추출(하이라이트 대상) */
        let findRouterPointLabel = "";
        const findPointFeature = routePointVectorSource?.getFeatures().find((feature: Feature) => {
            const featureProps = feature.getProperties();
            /** 4-1. cluster(겹쳐진) feature 가 없는 경우 */
            if (!featureProps.clusterFeatures) {
                if (featureProps.routePointIndex === index) {
                    findRouterPointLabel = featureProps.routePointLabel;
                    return feature;
                }
            } else {
                /** 4-2. cluster(겹쳐진) feature 가 있는 경우 */
                if (featureProps.routePointIndex === index) {
                    findRouterPointLabel = featureProps.routePointLabel;
                    return feature;
                } else {
                    const findClusterFeature: RouteFeature = feature
                        .getProperties()
                        .clusterFeatures.find((clusterFeature: RouteFeature) => {
                            return clusterFeature.properties.routePointIndex === index;
                        });

                    if (findClusterFeature) {
                        findRouterPointLabel = findClusterFeature.properties.routePointLabel;
                        return feature;
                    }
                }
            }
        });

        /** 5. parameter index에 해당하는 feature를 찾은 경우 처리 */
        if (findPointFeature) {
            /** 6. 하이라이트 레이어가 없는 경우 신규 레이어 생성 */
            let highlightRoutePointLayer: VectorLayer<VectorSource<Geometry>> | undefined;
            highlightRoutePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);

            if (!highlightRoutePointLayer) {
                highlightRoutePointLayer = getVectorLayer(new VectorSource({}), 5);
                highlightRoutePointLayer.set(LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
                mapObject.addLayer(highlightRoutePointLayer);
            }

            /** 7. 하이라이트용 레이어 벡터 소스 추출 */
            const highlightRoutePointVectorSource: VectorSource<Geometry> | null = (
                highlightRoutePointLayer as VectorLayer<VectorSource<Geometry>>
            ).getSource();

            /** 8. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
            if (highlightRoutePointVectorSource) {
                const routeHighlightPointFeatures = getFindFeatures(
                    highlightRoutePointVectorSource,
                    ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY,
                    index
                );
                if (routeHighlightPointFeatures && routeHighlightPointFeatures.length > 0) {
                    /** 8-1. 하이라이트용 feature 삭제 */
                    routeHighlightPointFeatures.forEach((duplicateFeature: Feature) => {
                        highlightRoutePointVectorSource?.removeFeature(duplicateFeature);
                    });
                }

                /** 8-2. 하이라이트용 feature 생성 및 추가 */
                const highlightRoutePointCoordinates: number[] = (
                    findPointFeature.getGeometry() as Point
                ).getCoordinates();

                /** 8-3. 기존 생성된 하이라이트용 feature 삭제 */
                removeDuplicateFeatures(
                    highlightRoutePointVectorSource,
                    FEATURE_TYPE_KEY,
                    ROUTE_HIGHLIGHT_POINT_FEATURE
                );

                // 원형 강조 표시
                const circleGradientFeature: Feature = getCircleGradientFeature(
                    highlightRoutePointCoordinates,
                    radius || POINT_SELECTION_RADIUS
                );
                circleGradientFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
                circleGradientFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
                highlightRoutePointVectorSource?.addFeature(circleGradientFeature);

                // cluster 아이콘 추가
                const clusterPointFeature: Feature = getPointFeature(highlightRoutePointCoordinates);
                clusterPointFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
                clusterPointFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);

                const style = new Style({
                    image: new Icon({
                        anchor: [0.5, 1],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                        crossOrigin: "anonymous",
                        src: routeLayerOptions.clusterIcon,
                        rotateWithView: true,
                    }),
                    text: new Text({
                        text: String(
                            findRouterPointLabel
                                ? findRouterPointLabel
                                : findPointFeature.getProperties().routePointLabel
                        ),
                        font: `${routeLayerOptions.labelSize || 13}px Noto Sans KR, Malgun Gothic, sans-serif`,
                        fill: new Fill({ color: routeLayerOptions.labelColor || "#ffffff" }),
                        stroke: new Stroke({ color: routeLayerOptions.labelColor || "#ffffff" }),
                        textAlign: "center",
                        justify: "center",
                        textBaseline: "middle",
                        offsetY: routeLayerOptions.labelOffsetY || 0,
                    }),
                    zIndex: 2,
                });
                setFeatureStyle(clusterPointFeature, style);
                highlightRoutePointVectorSource?.addFeature(clusterPointFeature);
            }
        }
    }
};

/**
 * @private
 * @name routePointLayer
 * @function
 * @description 경로 레이어 생성시 각 지점에 대한 포인트 마커 생성 전용 레이어
 * @param {Map} mapObject 지도 객체
 * @param {RouteLayerOptions} options 경로 레이어를 생성하기 위한 옵션
 * @param {RouteFeature[]} options.features 경로 레이어 생성에 필요한 feature 정보, 좌표 및 properties 정보를 가진 배열
 * @param {string} options.routeIcon 각 경로 포인트에 표시할 base64 포인트 아이콘
 * @param {string=} options.lineColor 경로 라인 색상
 * @param {string=} options.lineWidth 경로 라인 굵기
 * @param {string=} options.labelOffsetY 포인트 지점에 보여질 label의 Y 위치 조정, -: 위, +: 아래 ex) -14, 14px만큼 위로 이동
 * @param {string=} options.labelSize 포인트 지점에 보여질 label의 크기, px 단위
 * @return {void}
 */
const routePointLayer = (mapObject: Map, options: RouteLayerOptions): void => {
    /** 1. 포인트 벡터 레이어 생성 및 벡터 소스 선언 */
    const pointVectorLayer: VectorLayer<VectorSource<Geometry>> = getVectorLayer(new VectorSource({}), 3);
    pointVectorLayer.set(LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
    pointVectorLayer.set("layerOptions", options);
    mapObject.addLayer(pointVectorLayer);

    const pointVectorSource: VectorSource<Geometry> | null = pointVectorLayer.getSource();

    /** 2. 포인트 스타일 함수 객체 생성 */
    const pointStyleFunction = (feature: Feature) => {
        const featureProps = feature.getProperties() as RouterFeatureProperties;
        const style = new Style({
            image: new Icon({
                anchor: [0.5, 1],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                crossOrigin: "anonymous",
                src: options.routeIcon,
                rotateWithView: true,
            }),
            text: new Text({
                text: String(featureProps.routePointLabel),
                font: `${options.labelSize || 13}px Noto Sans KR, Malgun Gothic, sans-serif`,
                fill: new Fill({ color: options.labelColor || "#ffffff" }),
                stroke: new Stroke({ color: options.labelColor || "#ffffff" }),
                textAlign: "center",
                justify: "center",
                textBaseline: "middle",
                offsetY: options.labelOffsetY || 0,
            }),
            zIndex: 2,
        });
        return style;
    };

    /** 3. 포인트 Feature 객체 생성 및 추가 */
    const pointFeatures: Feature[] = [];
    options.features.forEach((feature: RouteFeature) => {
        const pointFeature: Feature = getPointFeature(getFromLonLat(feature.coordinates));
        Object.keys(feature.properties).forEach((key: string) => {
            pointFeature.set(key, feature.properties[key]);
        });
        if (feature.clusterFeatures) {
            pointFeature.set(CLUSTER_FEATURES, feature.clusterFeatures);
        }
        setFeatureStyle(pointFeature, pointStyleFunction as StyleLike);
        pointFeatures.push(pointFeature);
    });
    pointVectorSource?.addFeatures(pointFeatures);

    /** 4. 포인트 선택 interaction 추가 */
    const pointSelectInteraction = new Select({
        condition: click,
        style: pointStyleFunction as StyleLike,
        layers: [pointVectorLayer],
    });
    pointSelectInteraction.set(LAYER_TYPE_KEY, ROUTE_LAYER);

    /** 5. 포인트 선택 interaction 이벤트 처리 */
    let returnIndex: number | undefined;
    pointSelectInteraction.on("select", (e: SelectEvent) => {
        console.log(e);
        // 선택 항목이 있는 경우
        if (e.selected.length > 0) {
            const selectedPointIndex: number = e.selected[0].getProperties().routePointIndex;
            highlightRoutePoint(mapObject, selectedPointIndex, options.selectRadius || POINT_SELECTION_RADIUS);
            pointSelectInteraction.getFeatures().clear();
            returnIndex = selectedPointIndex;
        }
        // 선택 항목이 없고, 선택이 해제 된 경우
        if (e.selected.length === 0 && e.deselected.length > 0) {
            if (pointVectorSource) {
                removeDuplicateFeatures(pointVectorSource, FEATURE_TYPE_KEY, ROUTE_POINT_FEATURE);
            }
            returnIndex = undefined;
            pointSelectInteraction.getFeatures().clear();
        }

        // 콜백 index 반환
        if (options.selectCallback && returnIndex !== undefined) {
            options.selectCallback(returnIndex);
        }
    });
    mapObject.addInteraction(pointSelectInteraction);

    /** 5. hover 기능 추가 */
    const hoverEventHandler = (e: MapBrowserEvent<UIEvent>) => {
        if (e.dragging) {
            return;
        }
        const hit = mapObject.forEachFeatureAtPixel(
            e.pixel,
            (...args: [feature: FeatureLike, layer: Layer<Source, LayerRenderer<any>>]) => {
                const [, layer] = args;
                const layerProperties = layer.getProperties();
                if (layerProperties[LAYER_TYPE_KEY] === ROUTE_POINT_LAYER) {
                    return true;
                }
                return false;
            }
        );
        mapObject.getTargetElement().style.cursor = hit ? "pointer" : "default";
    };
    mapObject.on("pointermove", hoverEventHandler);
};

/**
 * @private
 * @name removeRouteLayer
 * @function
 * @description 경로 레이어 삭제
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
export const removeRouteLayer = (mapObject: Map): void => {
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
};

/**
 * @private
 * @name routeLayer
 * @function
 * @description 경로 레이어 생성
 * @param {Map} mapObject 지도 객체
 * @param {RouteLayerOptions} options 경로 레이어를 생성하기 위한 옵션
 * @param {RouteFeature[]} options.features 경로 레이어 생성에 필요한 feature 정보, 좌표 및 properties 정보를 가진 배열
 * @param {string} options.routeIcon 각 경로 포인트에 표시할 base64 포인트 아이콘
 * @param {string=} options.lineColor 경로 라인 색상
 * @param {string=} options.lineWidth 경로 라인 굵기
 * @param {string=} options.labelOffsetY 포인트 지점에 보여질 label의 Y 위치 조정, -: 위, +: 아래 ex) -14, 14px만큼 위로 이동
 * @param {string=} options.labelSize 포인트 지점에 보여질 label의 크기, px 단위
 * @return {void}
 */
export const routeLayer = (mapObject: Map, options: RouteLayerOptions): void => {
    try {
        // 1. 이미 생성 된 동일 레이어 및 Interaction 도구 중복 방지를 위한 제거
        removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);
        removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
        removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
        removeDuplicateInteraction(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);

        // 2. 경로 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
        const lineVectorLayer: VectorLayer<VectorSource<Geometry>> = getVectorLayer(new VectorSource({}), 2);
        lineVectorLayer.set(LAYER_TYPE_KEY, ROUTE_LAYER);
        mapObject.addLayer(lineVectorLayer);

        // 3. 라인 Feature 생성용 좌표 변환 (좌표 4326 -> 5179 좌표 변환 및 이중 배열 생성)
        const lineCoordinates: number[][] = options.features.map((feature: RouteFeature) =>
            getFromLonLat(feature.coordinates)
        );
        // 4. 라인 Feature 생성
        const lineFeature: Feature = getLineFeature(lineCoordinates);
        // 5. 라인 스타일 추가
        const lineFeatureStyle: Style = new Style({
            stroke: new Stroke({
                color: options.lineColor || "#ff0000",
                width: options.lineWidth || 3,
            }),
        });
        setFeatureStyle(lineFeature, lineFeatureStyle);

        // 6. Vector 레이어 Feature 추가
        const lineVectorSource: VectorSource<Geometry> | null = lineVectorLayer.getSource();
        lineVectorSource?.addFeature(lineFeature);

        // 7. 경로 포인트 레이어 생성
        routePointLayer(mapObject, options);
    } catch (e: unknown) {
        console.log("routeLayer Error : " + e);
    }
};
