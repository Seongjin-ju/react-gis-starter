import { Feature, Map } from "ol";
import { Extent } from "ol/extent";
import { LineString } from "ol/geom";

import { FitExtentOptions, MoveMapOptions } from "../interfaces/util.interface";

import { getExtentFromLonLat, getFromLonLat } from "./coordinates.util";

/**
 * @private
 * @name moveMap
 * @function
 * @description 지도 좌표 이동
 * @param {Map} mapObject 지도 객체
 * @param {MoveMapOptions} options 지도 좌표 이동에 필요한 옵션 정보
 * @param {number[]} options.coordinate 이동 위치의 좌표
 * @param {boolean=} options.animate 지도 이동 시 animation 추가 여부(부드러운 이동)
 * @param {number=} options.zoomLevel 이동 시 zoom 레벨 설정, 기본 값은 현재 화면의 zoom 레벨
 * @param {Function=} options.moveMapCallback 좌표 이동 후 처리 콜백
 * @return {void}
 */
export const moveMap = (mapObject: Map, options: MoveMapOptions): void => {
    // 1. 좌표가 없거나, 좌표가 0,0 인 경우 return
    const coordinate = options.coordinate;
    if (!coordinate || coordinate[0] === 0 || coordinate[1] === 0) {
        return;
    }
    const mapView = mapObject.getView();
    mapView.animate(
        {
            center: getFromLonLat(coordinate),
            duration: options.animate ? 300 : 0,
        },
        {
            zoom: options.zoomLevel ? options.zoomLevel : mapView.getZoom(),
            duration: options.animate ? 300 : 0,
        },
        options.moveMapCallback || {}
    );
};

/**
 * @private
 * @name fitExtentCoordinates
 * @function
 * @description 다중 좌표를 통해 생성된 extent 범위로 지도를 이동
 * @param {Map} mapObject 지도 객체
 * @param {FitExtentOptions} options extent 이동에 필요한 옵션 정보
 * @param {number[]} options.coordinates extent 범위를 만들 좌표 목록
 * @param {boolean=} options.animate extent 이동 시 animation 추가 여부(부드러운 이동)
 * @param {Function=} options.fitExtentCallback extent 이동 후 처리 콜백
 * @return {void}
 */
export const fitExtentCoordinates = (mapObject: Map, options: FitExtentOptions): void => {
    const lineStringFeature = new Feature({
        geometry: new LineString(options.coordinates),
    });
    if (lineStringFeature) {
        const extent: Extent | undefined = lineStringFeature.getGeometry()?.getExtent();
        if (extent) {
            mapObject.getView().fit(getExtentFromLonLat(extent), {
                duration: options.animate ? 300 : 0,
                callback: options.fitExtentCallback,
            });
        }
    }
};
