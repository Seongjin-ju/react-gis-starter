import { Map } from "ol";

import { KAKAO_BG, GOOGLE_BG, VWORLD_BG } from "./components/TmsMapContainer";
import { RouteLayerOptions, CircleLayerOptions, HighlightCircleLayerOptions } from "./interfaces/layer.interface";
import { TmsMapRefObject } from "./interfaces/map.interface";
import { FitExtentOptions, MoveMapOptions } from "./interfaces/util.interface";
import { getKaKaoTileLayer, getGoogleTileLayer, getVWorldTileLayer } from "./layer/base";
import { circleLayer, removeCircleLayer, highlightCirclePoint, removeHighlightCirclePoint } from "./layer/circle";
import { routeLayer, removeRouteLayer, highlightRoutePoint, removeHighlightRoutePoint } from "./layer/route";
import { getTransForm } from "./utils";
import { moveMap, fitExtentCoordinates } from "./utils/map.util";

/**
 * @private
 * @name refProperties
 * @function
 * @description 지도 ref 객체의 커스텀 함수 정의
 * @param {Map} refCurrent 지도 객체
 * @return {TmsMapRefObject}
 */
export const refProperties = (refCurrent: Map): TmsMapRefObject => {
    return {
        getInstance() {
            return refCurrent;
        },
        getCenter() {
            const center = refCurrent?.getView().getCenter();
            if (center) {
                return getTransForm(center);
            } else {
                return undefined;
            }
        },
        setZoom(zoomLevel: number) {
            if (refCurrent) {
                refCurrent.getView().setZoom(zoomLevel);
            }
        },
        moveMap(options: MoveMapOptions) {
            if (refCurrent) {
                moveMap(refCurrent, options);
            }
        },
        fitExtentCoordinates(options: FitExtentOptions) {
            if (refCurrent) {
                fitExtentCoordinates(refCurrent, options);
            }
        },
        changeBaseMap(mapType: string) {
            if (mapType === KAKAO_BG) {
                refCurrent?.setLayers(getKaKaoTileLayer());
            }
            if (mapType === GOOGLE_BG) {
                refCurrent?.setLayers(getGoogleTileLayer());
            }
            if (mapType === VWORLD_BG) {
                refCurrent?.setLayers(getVWorldTileLayer());
            }
        },
        routeLayer(options: RouteLayerOptions) {
            if (refCurrent) {
                routeLayer(refCurrent, options);
            }
        },
        removeRouteLayer() {
            if (refCurrent) {
                removeRouteLayer(refCurrent);
            }
        },
        highlightRoutePoint(index: number, radius: number) {
            if (refCurrent) {
                highlightRoutePoint(refCurrent, index, radius);
            }
        },
        removeHighlightRoutePoint() {
            if (refCurrent) {
                removeHighlightRoutePoint(refCurrent);
            }
        },
        circleLayer(options: CircleLayerOptions) {
            if (refCurrent) {
                circleLayer(refCurrent, options);
            }
        },
        removeCircleLayer() {
            if (refCurrent) {
                removeCircleLayer(refCurrent);
            }
        },
        highlightCirclePoint(index: number, radius: number, options?: HighlightCircleLayerOptions) {
            if (refCurrent) {
                highlightCirclePoint(refCurrent, index, radius, options);
            }
        },
        removeHighlightCirclePoint() {
            if (refCurrent) {
                removeHighlightCirclePoint(refCurrent);
            }
        },
    };
};
