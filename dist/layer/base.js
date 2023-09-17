'use strict';

var TileLayer = require('ol/layer/Tile');
var proj = require('ol/proj');
var proj4$1 = require('ol/proj/proj4');
var XYZ = require('ol/source/XYZ');
var TileGrid = require('ol/tilegrid/TileGrid');
var proj4 = require('proj4');

/**
 * @private
 * @constant
 * 지도 생성 시 투영 정보 설정, 지도 별 투영 정보가 상이함
 */
var MAP_PROJECTIONS = {
  kakao: {
    resolution: [2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25],
    extent: [-30000, -60000, 494288, 988576],
    projection: "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  }
};

/**
 * @private
 * @constant
 * 카카오 최신 버전 유지를 위한 SDK 버전 정보
 * @see https://apis.map.kakao.com/web/documentation/#MapTypeId
 */
var KAKAO_MAP_VERSIONS = {
  BICYCLE: "6.00",
  HYBRID: "2303ksn",
  ROADMAP: "2303ksn",
  ROADMAP_SUFFIX: "",
  ROADVIEW: "7.00",
  ROADVIEW_FLASH: "200402",
  SKYVIEW_HD_VERSION: "160107",
  SKYVIEW_VERSION: "160114",
  SR: "3.00",
  USE_DISTRICT: "2303ksn"
};

/**
 * @private
 * @name getKaKaoTileLayer
 * @function
 * @description 카카오 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
var getKaKaoTileLayer = function getKaKaoTileLayer() {
  proj4.defs("EPSG:5179", MAP_PROJECTIONS.kakao.projection);
  proj4$1.register(proj4);
  var customProjection = new proj.Projection({
    code: "EPSG:5181",
    extent: MAP_PROJECTIONS.kakao.extent,
    units: "m"
  });
  var kakaoTileLayer = new TileLayer({
    preload: Infinity,
    source: new XYZ({
      projection: customProjection,
      tileGrid: new TileGrid({
        origin: [MAP_PROJECTIONS.kakao.extent[0], MAP_PROJECTIONS.kakao.extent[1]],
        resolutions: MAP_PROJECTIONS.kakao.resolution
      }),
      tileUrlFunction: function tileUrlFunction(tileCoord) {
        if (tileCoord === null) return undefined;
        var s = Math.floor(Math.random() * 4); // 0 ~ 3
        var z = MAP_PROJECTIONS.kakao.resolution.length - tileCoord[0];
        var x = tileCoord[1];
        var y = -tileCoord[2] - 1;
        return "/dms-gis-proxy/http/map".concat(s, ".daumcdn.net/map_2d_hd/").concat(KAKAO_MAP_VERSIONS.ROADMAP, "/L").concat(z, "/").concat(y, "/").concat(x, ".png");
      },
      crossOrigin: "anonymous"
    }),
    visible: true
  });
  return [kakaoTileLayer];
};

/**
 * @private
 * @name getGoogleTileLayer
 * @function
 * @description 구글 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
var getGoogleTileLayer = function getGoogleTileLayer() {
  // 구글맵 타일 레이어 생성
  var googleTileLayer = new TileLayer({
    preload: Infinity,
    source: new XYZ({
      url: "/dms-gis-proxy/http/mt.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      crossOrigin: "anonymous"
    })
  });
  // 구글맵 위성(위성+하이브리드) 레이어 생성
  var googleSatelliteLayer = new TileLayer({
    preload: Infinity,
    source: new XYZ({
      url: "/dms-gis-proxy/http/mt.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
      crossOrigin: "anonymous"
    }),
    visible: false,
    zIndex: 1
  });
  return [googleTileLayer, googleSatelliteLayer];
};

/**
 * @private
 * @name getVWorldTileLayer
 * @function
 * @description 브이월드 배경 지도 타일 레이어를 반환 한다.
 * @return {BaseLayer[] | Collection<BaseLayer>}
 */
var getVWorldTileLayer = function getVWorldTileLayer() {
  var vWorldTileLayer = new TileLayer({
    // 일반 지도
    preload: Infinity,
    source: new XYZ({
      url: "/dms-gis-proxy/http/api.vworld.kr/req/wmts/1.0.0/FBFE86BD-40D0-3C70-AD4B-57F79D9B381C/Base/{z}/{y}/{x}.png",
      crossOrigin: "anonymous"
    })
  });
  return [vWorldTileLayer];
};

exports.getGoogleTileLayer = getGoogleTileLayer;
exports.getKaKaoTileLayer = getKaKaoTileLayer;
exports.getVWorldTileLayer = getVWorldTileLayer;
