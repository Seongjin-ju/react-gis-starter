import { Collection } from "ol";
import * as OlExtent from "ol/extent";
import BaseLayer from "ol/layer/Base";
import TileLayer from "ol/layer/Tile";
import { Projection } from "ol/proj";
import { register } from "ol/proj/proj4";
import XYZ from "ol/source/XYZ";
import { TileCoord } from "ol/tilecoord";
import TileGrid from "ol/tilegrid/TileGrid";
import proj4 from "proj4";

import { MapProjections, KakaoMapVersions } from "../interfaces/map.interface";

/**
 * @private
 * @constant
 * 지도 생성 시 투영 정보 설정, 지도 별 투영 정보가 상이함
 */
const MAP_PROJECTIONS: MapProjections = {
    kakao: {
        resolution: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
        extent: [-30000, -60000, 494288, 988576],
        projection:
            "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
    },
};

/**
 * @private
 * @constant
 * 카카오 최신 버전 유지를 위한 SDK 버전 정보
 * @see https://apis.map.kakao.com/web/documentation/#MapTypeId
 */
const KAKAO_MAP_VERSIONS: KakaoMapVersions = {
    BICYCLE: "6.00",
    HYBRID: "2303ksn",
    ROADMAP: "2303ksn",
    ROADMAP_SUFFIX: "",
    ROADVIEW: "7.00",
    ROADVIEW_FLASH: "200402",
    SKYVIEW_HD_VERSION: "160107",
    SKYVIEW_VERSION: "160114",
    SR: "3.00",
    USE_DISTRICT: "2303ksn",
};

/**
 * @private
 * @name getKaKaoTileLayer
 * @function
 * @description 카카오 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
export const getKaKaoTileLayer = (): BaseLayer[] | Collection<BaseLayer> => {
    proj4.defs("EPSG:5179", MAP_PROJECTIONS.kakao.projection);
    register(proj4);

    const customProjection = new Projection({
        code: "EPSG:5181",
        extent: MAP_PROJECTIONS.kakao.extent as OlExtent.Extent,
        units: "m",
    });

    const kakaoTileLayer = new TileLayer({
        preload: Infinity,
        source: new XYZ({
            projection: customProjection,
            tileGrid: new TileGrid({
                origin: [MAP_PROJECTIONS.kakao.extent[0], MAP_PROJECTIONS.kakao.extent[1]],
                resolutions: MAP_PROJECTIONS.kakao.resolution,
            }),
            tileUrlFunction: (tileCoord: TileCoord) => {
                if (tileCoord === null) return undefined;
                const s = Math.floor(Math.random() * 4); // 0 ~ 3
                const z = MAP_PROJECTIONS.kakao.resolution.length - tileCoord[0];
                const x = tileCoord[1];
                const y = -tileCoord[2] - 1;
                return `/dms-gis-proxy/http/map${s}.daumcdn.net/map_2d_hd/${KAKAO_MAP_VERSIONS.ROADMAP}/L${z}/${y}/${x}.png`;
            },
            crossOrigin: "anonymous",
        }),
        visible: true,
    });
    return [kakaoTileLayer] as BaseLayer[] | Collection<BaseLayer>;
};

/**
 * @private
 * @name getGoogleTileLayer
 * @function
 * @description 구글 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
export const getGoogleTileLayer = (): BaseLayer[] | Collection<BaseLayer> => {
    // 구글맵 타일 레이어 생성
    const googleTileLayer = new TileLayer({
        preload: Infinity,
        source: new XYZ({
            url: "/dms-gis-proxy/http/mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
            crossOrigin: "anonymous",
        }),
    });
    // 구글맵 위성(위성+하이브리드) 레이어 생성
    const googleSatelliteLayer = new TileLayer({
        preload: Infinity,
        source: new XYZ({
            url: "/dms-gis-proxy/http/mt.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
            crossOrigin: "anonymous",
        }),
        visible: false,
        zIndex: 1,
    });
    return [googleTileLayer, googleSatelliteLayer] as BaseLayer[] | Collection<BaseLayer>;
};

/**
 * @private
 * @name getVWorldTileLayer
 * @function
 * @description 브이월드 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
export const getVWorldTileLayer = (): BaseLayer[] | Collection<BaseLayer> => {
    const vWorldTileLayer = new TileLayer({
        // 일반 지도
        preload: Infinity,
        source: new XYZ({
            url: "/dms-gis-proxy/http/api.vworld.kr/req/wmts/1.0.0/FBFE86BD-40D0-3C70-AD4B-57F79D9B381C/Base/{z}/{y}/{x}.png",
            crossOrigin: "anonymous",
        }),
    });
    return [vWorldTileLayer] as BaseLayer[] | Collection<BaseLayer>;
};
