import { Map } from "ol";
import { Geometry } from "ol/geom";
import Layer from "ol/layer/Layer";
import VectorLayer from "ol/layer/Vector";
import LayerRenderer from "ol/renderer/Layer";
import Source from "ol/source/Source";
import VectorSource from "ol/source/Vector";

/**
 * @private
 * @name getVectorLayer
 * @function
 * @description 벡터 레이어 반환
 * @param {VectorSource} source 벡터 레이어 생성 대상 벡터 소스
 * @param {number} zIndex 레이어의 z-index (우선순위) 값
 * @return {VectorLayer<VectorSource<Geometry>>}
 */
export const getVectorLayer = (source: VectorSource, zIndex: number): VectorLayer<VectorSource<Geometry>> => {
    return new VectorLayer({
        source: source,
        zIndex: zIndex || 1,
    });
};

/**
 * @private
 * @name getVectorLayer
 * @function
 * @description 특정 벡터레이어를 추출 하여 반환
 * @param {Map} mapObject 벡터 레이어 생성 대상 벡터 소스
 * @param {string} layerTypeKey 탐색할 레이어의 properties key
 * @param {string} layerType 탐색할 레이어의 properties value(타입)
 * @return {VectorLayer<VectorSource<Geometry>>}
 */
export const getFindVectorLayer = (
    mapObject: Map,
    layerTypeKey: string,
    layerType: string
): VectorLayer<VectorSource<Geometry>> | undefined => {
    const findVectorLayer: Layer<Source, LayerRenderer<any>> | undefined = mapObject
        .getAllLayers()
        .find((layer: Layer<Source, LayerRenderer<any>>) => {
            const layerProps = layer.getProperties();
            if (layerProps[layerTypeKey] && layerProps[layerTypeKey] === layerType) {
                return layer;
            }
        });
    return findVectorLayer as VectorLayer<VectorSource<Geometry>> | undefined;
};

/**
 * @private
 * @name removeDuplicateLayer
 * @function
 * @description 레이어 중복 제거
 * @param {Map} mapObject 지도 객체
 * @param {string} key 중복 된 레이어를 탐색 할 properties key
 * @param {string} value 중복 된 레이어를 탐색 할 properties value
 * @return {void}
 */
export const removeDuplicateLayer = (mapObject: Map, key: string, value: string): void => {
    const isRouteLayers: Layer<Source, LayerRenderer<any>>[] | undefined = mapObject
        .getAllLayers()
        .filter((layer: Layer<Source, LayerRenderer<any>>) => {
            const layerProps = layer.getProperties();
            if (layerProps[key] && layerProps[key] === value) {
                return layer;
            }
        });

    if (isRouteLayers && isRouteLayers.length > 0) {
        isRouteLayers.forEach((layer: Layer<Source, LayerRenderer<any>>) => {
            mapObject.removeLayer(layer as Layer);
        });
    }
};
