import { Ref } from "react";

import { Map } from "ol";

import { KAKAO_BG, GOOGLE_BG, VWORLD_BG } from "../components/TmsMapContainer";
import { CircleLayerOptions, HighlightCircleLayerOptions, RouteLayerOptions } from "./layer.interface";
import { MoveMapOptions, FitExtentOptions } from "./util.interface";

/**
 * 지도 타입 정의
 * @typedef {KAKAO_BG | GOOGLE_BG | VWORLD_BG | string} MAP_TYPES
 */
type MAP_TYPES = typeof KAKAO_BG | typeof GOOGLE_BG | typeof VWORLD_BG | "";

/**
 * 지도 ref 인스턴스 정보
 * @typedef {Object} TmsMapRefObject
 * @property {Function} getInstance 지도 객체의 instance 를 반환
 * @property {Function} getCenter 지도의 중심 좌표를 반환
 * @property {Function} setZoom 지도의 줌레벨 변경
 * @property {Function} moveMap 좌표를 통한 지도 이동
 * @property {Function} fitExtentCoordinates 좌표 목록을 이용해 해당 좌표들의 extent 범위로 이동
 * @property {Function} changeBaseMap 지도의 Base 타일 레이어 타입 전환
 * @property {Function} routeLayer 경로 레이어 생성
 * @property {Function} removeRouteLayer 경로 레이어의 특정 지점을 하이라이트 처리
 * @property {Function} highlightRoutePoint 경로 레이어의 특정 지점을 하이라이트 처리
 * @property {Function} removeHighlightRoutePoint 경로 레이어의 특정 지점을 하이라이트 처리
 * @property {Function} circleLayer 원형 레이어 생성
 * @property {Function} removeCircleLayer 원형 레이어 생성
 * @property {Function} highlightCirclePoint 원형 레이어의 특정 지점을 하이라이트 처리
 * @property {Function} removeHighlightCirclePoint 원형 레이어 생성
 */
export interface TmsMapRefObject {
    getInstance: () => Map | null;
    getCenter: () => number[] | undefined;
    setZoom: (zoomLevel: number) => void;
    moveMap: (options: MoveMapOptions) => void;
    fitExtentCoordinates: (options: FitExtentOptions) => void;
    changeBaseMap: (mapType: string) => void;
    routeLayer: (options: RouteLayerOptions) => void;
    removeRouteLayer: () => void;
    highlightRoutePoint: (index: number, radius: number) => void;
    removeHighlightRoutePoint: () => void;
    circleLayer: (options: CircleLayerOptions) => void;
    removeCircleLayer: () => void;
    highlightCirclePoint: (index: number, radius: number, options: HighlightCircleLayerOptions) => void;
    removeHighlightCirclePoint: () => void;
}

/**
 * 지도 생성 속성 정보
 * @typedef {Object} TmsMapOptions
 * @property {string} type 지도 종류 (카카오, 구글, vworld)
 * @property {number} lng 지도 생성시 보여줄 위치의 경도, EPSG:4326 형태로 입력 (127.xxxx);
 * @property {number} lat 지도 생성시 보여줄 위치의 위도 EPSG:4326 형태로 입력 (36.xxxx);
 * @property {number=} mapOption.zoom 지도 생성시 초기 zoom level
 * @property {number=} mapOption.minZoom 최소 zoom level
 * @property {number=} mapOption.maxZoom 최대 zoom level
 */
export interface TmsMapOptions {
    type: MAP_TYPES /* "kakao" | "google" | "vworld"; */;
    lng: number;
    lat: number;
    ref: Ref<Partial<TmsMapRefObject>>;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    events?: {
        postRendered: () => void;
    };
}

/**
 * 지도 properties 정보
 * @typedef {Object} TmsMapProps
 * @property {TmsMapOptions} options 지도 생성 정보를 담고 있는 옵션 객체
 */
export interface TmsMapProps {
    options: TmsMapOptions;
}

/**
 * 지도 종류 별 Projection 정보
 * @typedef {Object} MapProjections
 * @property {Object} kakao 카카오 지도 Projection 정보
 * @property {number[]} kakao.resolution 카카오 지도, Resolution(해상도) 정보
 * @property {number[]} kakao.extent 카카오 지도, Extent(범위) 정보
 * @property {number[]} kakao.projection 카카오 지도, projection(투영) 정보
 */
export interface MapProjections {
    kakao: {
        resolution: number[];
        extent: number[];
        projection: string;
    };
}

/**
 * 카카오 SDK, kakao.maps 객체 및 버전 정보
 * @typedef {Object}
 * @property {string=} BICYCLE 자전거
 * @property {string=} HYBRID 하이브리드(스카이뷰 + 레이블)
 * @property {string=} ROADMAP 일반 지도
 * @property {string=} ROADMAP_SUFFIX 일반 지도 접미사
 * @property {string=} ROADVIEW 로드뷰
 * @property {string=} ROADVIEW_FLASH 로드뷰 관련
 * @property {string=} SKYVIEW_HD_VERSION 스카이뷰 HD
 * @property {string=} SKYVIEW_VERSION 스카이뷰
 * @property {string=} SR 지형도
 * @property {string=} USE_DISTRICT 지적 편집도
 */
export interface KakaoMapVersions {
    BICYCLE?: string;
    HYBRID?: string;
    ROADMAP?: string;
    ROADMAP_SUFFIX?: string;
    ROADVIEW?: string;
    ROADVIEW_FLASH?: string;
    SKYVIEW_HD_VERSION?: string;
    SKYVIEW_VERSION?: string;
    SR?: string;
    USE_DISTRICT?: string;
}
