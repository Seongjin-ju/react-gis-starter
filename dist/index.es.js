import React, { forwardRef, useRef, useEffect, useImperativeHandle } from 'react';
import { Feature, View, Map } from 'ol';
import { defaults } from 'ol/control';
import { Select, defaults as defaults$1 } from 'ol/interaction';
import PinchZoom from 'ol/interaction/PinchZoom';
import TileLayer from 'ol/layer/Tile';
import { Projection, fromLonLat, transform, transformExtent } from 'ol/proj';
import { register } from 'ol/proj/proj4';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import proj4 from 'proj4';
import VectorSource from 'ol/source/Vector';
import { Style as Style$1, Fill, Stroke, Icon, Text } from 'ol/style';
import { Point, LineString, Circle } from 'ol/geom';
import Style from 'ol/style/Style';
import VectorLayer from 'ol/layer/Vector';
import { click } from 'ol/events/condition';

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
  register(proj4);
  var customProjection = new Projection({
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

var DEFAULT_PROJECTION$1 = "EPSG:5179";
var DEFAULT_DISPLAY_PROJECTION = "EPSG:4326";
var getTransForm = function getTransForm(coordinates) {
  return transform(coordinates, DEFAULT_PROJECTION$1, DEFAULT_DISPLAY_PROJECTION);
};
var getFromLonLat = function getFromLonLat(coordinates) {
  return fromLonLat(coordinates, DEFAULT_PROJECTION$1);
};
var getExtentFromLonLat = function getExtentFromLonLat(coordinates) {
  return transformExtent(coordinates, DEFAULT_DISPLAY_PROJECTION, DEFAULT_PROJECTION$1);
};

function _iterableToArrayLimit(arr, i) {
  var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"];
  if (null != _i) {
    var _s,
      _e,
      _x,
      _r,
      _arr = [],
      _n = !0,
      _d = !1;
    try {
      if (_x = (_i = _i.call(arr)).next, 0 === i) {
        if (Object(_i) !== _i) return;
        _n = !1;
      } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0);
    } catch (err) {
      _d = !0, _e = err;
    } finally {
      try {
        if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return;
      } finally {
        if (_d) throw _e;
      }
    }
    return _arr;
  }
}
function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

/**
 * @private
 * @name getPointFeature
 * @function
 * @description 포인트 feature 객체 반환
 * @param {number[]} coordinates 포인트 feature 생성 좌표
 * @return {Feature}
 */
var getPointFeature = function getPointFeature(coordinates) {
  return new Feature({
    geometry: new Point(coordinates)
  });
};

/**
 * @private
 * @name getLineFeature
 * @function
 * @description 라인 feature 객체 반환
 * @param {number[][]} coordinates 라인 feature 생성 좌표
 * @return {Feature}
 */
var getLineFeature = function getLineFeature(coordinates) {
  return new Feature({
    geometry: new LineString(coordinates)
  });
};

/**
 * @private
 * @name getCircleFeature
 * @function
 * @description 원형 feature 객체 반환
 * @param {number[]} coordinates 원형 feature 생성 좌표
 * @param {number} radius 원형 feature 생성 시 radius 값
 * @return {Feature}
 */
var getCircleFeature = function getCircleFeature(coordinates, radius) {
  return new Feature({
    geometry: new Circle(coordinates, radius)
  });
};

/**
 * @private
 * @name getCircleGradientFeature
 * @function
 * @description 원형 Gradient feature 객체 반환
 * @param {number[]} coordinates 원형 feature 생성 좌표
 * @param {number} radius 원형 feature 생성 시 radius 값
 * @return {Feature}
 */
var getCircleGradientFeature = function getCircleGradientFeature(coordinates, radius) {
  var circleFeature = new Feature({
    geometry: new Circle(coordinates, radius)
  });
  var circleGradientStyle = new Style({
    renderer: function renderer(coordinates, state) {
      var convertCoordinates = coordinates;
      var _convertCoordinates = _slicedToArray(convertCoordinates, 2),
        _convertCoordinates$ = _slicedToArray(_convertCoordinates[0], 2),
        x = _convertCoordinates$[0],
        y = _convertCoordinates$[1],
        _convertCoordinates$2 = _slicedToArray(_convertCoordinates[1], 2),
        x1 = _convertCoordinates$2[0],
        y1 = _convertCoordinates$2[1];
      var ctx = state.context;
      var dx = x1 - x;
      var dy = y1 - y;
      var radius = Math.sqrt(dx * dx + dy * dy);
      var innerRadius = 0;
      var outerRadius = radius * 1;
      var gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
      gradient.addColorStop(0, "rgba(255,0,0,0.8)");
      gradient.addColorStop(0.6, "rgba(255,0,0,0.3)");
      gradient.addColorStop(1, "rgba(255,0,0,0)");
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
    },
    zIndex: 1
  });
  setFeatureStyle(circleFeature, circleGradientStyle);
  return circleFeature;
};

/**
 * @private
 * @name setFeatureStyle
 * @function
 * @description feature 객체 스타일 추가
 * @param {Feature} feature 스타일 추가 대상 feature
 * @param {Style | StyleLike} style 스타일 객체
 * @return {void}
 */
var setFeatureStyle = function setFeatureStyle(feature, style) {
  feature.setStyle(style);
};

/**
 * @private
 * @name getFindFeature
 * @function
 * @description 특정 feature를 추출 하여 반환
 * @param {VectorSource} vectorSource feature 삭제 대상 vector 소스
 * @param {string} featurePropKey 중복 된 feature를 탐색 할 properties key
 * @param {string | number} featurePropValue 중복 된 feature를 탐색 할 properties value
 * @return {void}
 */
var getFindFeature = function getFindFeature(vectorSource, featurePropKey, featurePropValue) {
  var features = vectorSource.getFeatures();
  var isDuplicateFeature = features.find(function (feature) {
    return feature.get(featurePropKey) === featurePropValue;
  });
  return isDuplicateFeature;
};

/**
 * @private
 * @name getFindFeatures
 * @function
 * @description 특정 feature를 추출 하여 반환(배열)
 * @param {VectorSource} vectorSource feature 삭제 대상 vector 소스
 * @param {string} featurePropKey 중복 된 feature를 탐색 할 properties key
 * @param {string | number} featurePropValue 중복 된 feature를 탐색 할 properties value
 * @return {void}
 */
var getFindFeatures = function getFindFeatures(vectorSource, featurePropKey, featurePropValue) {
  var features = vectorSource.getFeatures();
  var isDuplicateFeatures = features.filter(function (feature) {
    return feature.get(featurePropKey) === featurePropValue;
  });
  return isDuplicateFeatures;
};

/**
 * @private
 * @name removeDuplicateFeatures
 * @function
 * @description feature 중복 제거
 * @param {VectorSource} vectorSource feature 삭제 대상 vector 소스
 * @param {string} key 중복 된 feature를 탐색 할 properties key
 * @param {string} value 중복 된 feature를 탐색 할 properties value
 * @return {void}
 */
var removeDuplicateFeatures = function removeDuplicateFeatures(vectorSource, key, value) {
  var features = vectorSource.getFeatures();
  var isDuplicateFeature = features.filter(function (feature) {
    return feature.get(key) === value;
  });
  if (isDuplicateFeature && isDuplicateFeature.length > 0) {
    isDuplicateFeature.forEach(function (feature) {
      return vectorSource.removeFeature(feature);
    });
  }
};

/**
 * @private
 * @name getVectorLayer
 * @function
 * @description 벡터 레이어 반환
 * @param {VectorSource} source 벡터 레이어 생성 대상 벡터 소스
 * @param {number} zIndex 레이어의 z-index (우선순위) 값
 * @return {VectorLayer<VectorSource<Geometry>>}
 */
var getVectorLayer = function getVectorLayer(source, zIndex) {
  return new VectorLayer({
    source: source,
    zIndex: zIndex || 1
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
var getFindVectorLayer = function getFindVectorLayer(mapObject, layerTypeKey, layerType) {
  var findVectorLayer = mapObject.getAllLayers().find(function (layer) {
    var layerProps = layer.getProperties();
    if (layerProps[layerTypeKey] && layerProps[layerTypeKey] === layerType) {
      return layer;
    }
  });
  return findVectorLayer;
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
var removeDuplicateLayer = function removeDuplicateLayer(mapObject, key, value) {
  var isRouteLayers = mapObject.getAllLayers().filter(function (layer) {
    var layerProps = layer.getProperties();
    if (layerProps[key] && layerProps[key] === value) {
      return layer;
    }
  });
  if (isRouteLayers && isRouteLayers.length > 0) {
    isRouteLayers.forEach(function (layer) {
      mapObject.removeLayer(layer);
    });
  }
};

/**
 * 삭제 및 구분,관리용 Properties 정보 인 KEY, VALUE
 */
var LAYER_TYPE_KEY$1 = "layerType";
var CIRCLE_LAYER = "tmsCircleLayer";
var CIRCLE_HIGHLIGHT_POINT_LAYER = "tmsHighlightCirclePointLayer";
var FEATURE_TYPE_KEY$1 = "featureType";
var CIRCLE_HIGHLIGHT_POINT_FEATURE = "tmsHighlightCirclePointFeature";
var CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY = "circlePointIndex";

/**
 * 상수
 */
var DEFAULT_RADIUS = 50;
var DEFAULT_FILL_COLOR = "rgba(0, 0, 0, 0.1)";
var DEFAULT_STROKE_WIDTH = 1;
var DEFAULT_STROKE_COLOR = "rgba(0, 0, 0, 0.5)";
var DEFAULT_SELECT_FILL_COLOR = "rgba(0, 0, 0, 0.1)";
var DEFAULT_SELECT_STROKE_WIDTH = 2;
var DEFAULT_SELECT_STROKE_COLOR = "rgba(0, 104, 180, 0.8)";

/**
 * @private
 * @name removeHighlightCirclePoint
 * @function
 * @description 원형 하이라이트 레이어를 삭제 한다.
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
var removeHighlightCirclePoint = function removeHighlightCirclePoint(mapObject) {
  removeDuplicateLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_LAYER);
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
var highlightCirclePoint = function highlightCirclePoint(mapObject, index, radius, options) {
  /** 1. 원형 표시 레이어 추출 */
  var circlePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_LAYER);
  if (circlePointLayer) {
    /** 2. 원형 표시 레이어 벡터 소스 추출 */
    var circlePointVectorSource = circlePointLayer.getSource();

    /** 3. parameter index에 해당하는 feature(포인트) 정보 추출(하이라이트 대상) */
    var findFeature = circlePointVectorSource === null || circlePointVectorSource === void 0 ? void 0 : circlePointVectorSource.getFeatures().find(function (feature) {
      return feature.getProperties().circlePointIndex === index;
    });
    if (findFeature) {
      var _highlightCirclePoint;
      /** 4. 하이라이트용 레이어가 없는 경우 신규 레이어 생성 */
      var highlightCirclePointLayer;
      highlightCirclePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_LAYER);
      if (!highlightCirclePointLayer) {
        highlightCirclePointLayer = getVectorLayer(new VectorSource({}), 2);
        highlightCirclePointLayer.set(LAYER_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_LAYER);
        mapObject.addLayer(highlightCirclePointLayer);
      }
      (_highlightCirclePoint = highlightCirclePointLayer.getSource()) === null || _highlightCirclePoint === void 0 ? void 0 : _highlightCirclePoint.clear();

      /** 5. 하이라이트용 레이어 벡터 소스 추출 */
      var highlightCirclePointVectorSource = highlightCirclePointLayer.getSource();

      /** 6. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
      var isDuplicateFeature;
      if (highlightCirclePointVectorSource) {
        isDuplicateFeature = getFindFeature(highlightCirclePointVectorSource, CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
      }

      /** 7. 중복 feature 제거 or feature 추가 */
      if (isDuplicateFeature) {
        /** 8-1. 하이라이트용 feature 삭제 */
        highlightCirclePointVectorSource === null || highlightCirclePointVectorSource === void 0 ? void 0 : highlightCirclePointVectorSource.removeFeature(isDuplicateFeature);
      } else {
        /** 8-2. 하이라이트용 feature 생성 및 추가 */
        if (findFeature && highlightCirclePointVectorSource) {
          var _getGeometry;
          var circeCenter = (_getGeometry = findFeature.getGeometry()) === null || _getGeometry === void 0 ? void 0 : _getGeometry.getCenter();
          if (circeCenter) {
            removeDuplicateFeatures(highlightCirclePointVectorSource, FEATURE_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_FEATURE);
            var circleFeature = getCircleFeature(circeCenter, radius || DEFAULT_RADIUS);
            setFeatureStyle(circleFeature, new Style$1({
              fill: new Fill({
                color: (options === null || options === void 0 ? void 0 : options.selectFillColor) || DEFAULT_SELECT_FILL_COLOR
              }),
              stroke: new Stroke({
                width: (options === null || options === void 0 ? void 0 : options.selectStrokeWidth) || DEFAULT_SELECT_STROKE_WIDTH,
                color: (options === null || options === void 0 ? void 0 : options.selectStrokeColor) || DEFAULT_SELECT_STROKE_COLOR
              })
            }));
            circleFeature.set(FEATURE_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_FEATURE);
            circleFeature.set(CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
            highlightCirclePointVectorSource === null || highlightCirclePointVectorSource === void 0 ? void 0 : highlightCirclePointVectorSource.addFeature(circleFeature);
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
var removeCircleLayer = function removeCircleLayer(mapObject) {
  removeDuplicateLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_LAYER);
  removeDuplicateLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_HIGHLIGHT_POINT_LAYER);
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
var circleLayer = function circleLayer(mapObject, options) {
  // 1. 이미 생성 된 동일 레이어 및 Interaction 도구 중복 방지를 위한 제거
  removeDuplicateLayer(mapObject, LAYER_TYPE_KEY$1, CIRCLE_LAYER);

  // 2. 원형 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
  var circleVectorLayer = getVectorLayer(new VectorSource({}), 1);
  circleVectorLayer.set(LAYER_TYPE_KEY$1, CIRCLE_LAYER);
  mapObject.addLayer(circleVectorLayer);

  // 3. Vector 레이어 Feature 추가
  var circleVectorSource = circleVectorLayer.getSource();

  /** 4. 원형 Feature 객체 생성 및 추가 */
  var circleFeatures = [];
  options.features.forEach(function (feature) {
    var circleFeature = getCircleFeature(getFromLonLat(feature.coordinates), feature.properties.circleRadius);
    Object.keys(feature.properties).forEach(function (key) {
      circleFeature.set(key, feature.properties[key]);
    });
    setFeatureStyle(circleFeature, new Style$1({
      fill: new Fill({
        color: options.fillColor || DEFAULT_FILL_COLOR
      }),
      stroke: new Stroke({
        width: options.strokeWidth || DEFAULT_STROKE_WIDTH,
        color: options.strokeColor || DEFAULT_STROKE_COLOR
      })
    }));
    circleFeatures.push(circleFeature);
  });
  circleVectorSource === null || circleVectorSource === void 0 ? void 0 : circleVectorSource.addFeatures(circleFeatures);
};

/**
 * @private
 * @name removeDuplicateInteraction
 * @function
 * @description 상호작용 기능 중복 제거
 * @param {Map} mapObject 지도 객체
 * @param {string} key 중복 된 상호작용(interaction)을 탐색 할 properties key
 * @param {string} value 중복 된 상호작용(interaction)을 탐색 할 properties value
 * @return {void}
 */
var removeDuplicateInteraction = function removeDuplicateInteraction(mapObject, key, value) {
  var isRouteLayerInteractions = mapObject.getInteractions().getArray().filter(function (interaction) {
    var interactionProps = interaction.getProperties();
    if (interactionProps[key] && interactionProps[key] === value) {
      return interaction;
    }
  });
  if (isRouteLayerInteractions && isRouteLayerInteractions.length > 0) {
    isRouteLayerInteractions.forEach(function (interaction) {
      mapObject.removeInteraction(interaction);
    });
  }
};

/**
 * 삭제 및 구분,관리용 Properties 정보 인 KEY, VALUE
 */
var LAYER_TYPE_KEY = "layerType";
var ROUTE_LAYER = "tmsRouteLayer";
var ROUTE_POINT_LAYER = "tmsRoutePointLayer";
var ROUTE_HIGHLIGHT_POINT_LAYER = "tmsHighlightRoutePointLayer";
var FEATURE_TYPE_KEY = "featureType";
var ROUTE_POINT_FEATURE = "tmsRoutePointFeature";
var ROUTE_HIGHLIGHT_POINT_FEATURE = "tmsHighlightRoutePointFeature";
var ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY = "routePointIndex";
var CLUSTER_FEATURES = "clusterFeatures";

/**
 * 상수
 */
var POINT_SELECTION_RADIUS = 50;

/**
 * @private
 * @name removeHighlightRoutePoint
 * @function
 * @description 경로 표시 레이어의 특정 지점을 하이라이트 레이어를 삭제 한다.
 * @param {Map} mapObject 지도 객체
 * @return {void}
 */
var removeHighlightRoutePoint = function removeHighlightRoutePoint(mapObject) {
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
var highlightRoutePoint = function highlightRoutePoint(mapObject, index, radius) {
  /** 1. 경로 포인트 표시 레이어 추출 */
  var routePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
  if (routePointLayer) {
    /** 2. 레이어 생성 옵션 추출 */
    var routeLayerOptions = routePointLayer.get("layerOptions");

    /** 3. 경로 포인트 표시 레이어 벡터 소스 추출 */
    var routePointVectorSource = routePointLayer.getSource();

    /** 4. parameter index에 해당하는 feature(포인트) 정보 추출(하이라이트 대상) */
    var findRouterPointLabel = "";
    var findPointFeature = routePointVectorSource === null || routePointVectorSource === void 0 ? void 0 : routePointVectorSource.getFeatures().find(function (feature) {
      var featureProps = feature.getProperties();
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
          var findClusterFeature = feature.getProperties().clusterFeatures.find(function (clusterFeature) {
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
      var highlightRoutePointLayer;
      highlightRoutePointLayer = getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
      if (!highlightRoutePointLayer) {
        highlightRoutePointLayer = getVectorLayer(new VectorSource({}), 5);
        highlightRoutePointLayer.set(LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
        mapObject.addLayer(highlightRoutePointLayer);
      }

      /** 7. 하이라이트용 레이어 벡터 소스 추출 */
      var highlightRoutePointVectorSource = highlightRoutePointLayer.getSource();

      /** 8. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
      if (highlightRoutePointVectorSource) {
        var routeHighlightPointFeatures = getFindFeatures(highlightRoutePointVectorSource, ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        if (routeHighlightPointFeatures && routeHighlightPointFeatures.length > 0) {
          /** 8-1. 하이라이트용 feature 삭제 */
          routeHighlightPointFeatures.forEach(function (duplicateFeature) {
            highlightRoutePointVectorSource === null || highlightRoutePointVectorSource === void 0 ? void 0 : highlightRoutePointVectorSource.removeFeature(duplicateFeature);
          });
        }

        /** 8-2. 하이라이트용 feature 생성 및 추가 */
        var highlightRoutePointCoordinates = findPointFeature.getGeometry().getCoordinates();

        /** 8-3. 기존 생성된 하이라이트용 feature 삭제 */
        removeDuplicateFeatures(highlightRoutePointVectorSource, FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);

        // 원형 강조 표시
        var circleGradientFeature = getCircleGradientFeature(highlightRoutePointCoordinates, radius || POINT_SELECTION_RADIUS);
        circleGradientFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
        circleGradientFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        highlightRoutePointVectorSource === null || highlightRoutePointVectorSource === void 0 ? void 0 : highlightRoutePointVectorSource.addFeature(circleGradientFeature);

        // cluster 아이콘 추가
        var clusterPointFeature = getPointFeature(highlightRoutePointCoordinates);
        clusterPointFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
        clusterPointFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        var style = new Style$1({
          image: new Icon({
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            crossOrigin: "anonymous",
            src: routeLayerOptions.clusterIcon,
            rotateWithView: true
          }),
          text: new Text({
            text: String(findRouterPointLabel ? findRouterPointLabel : findPointFeature.getProperties().routePointLabel),
            font: "".concat(routeLayerOptions.labelSize || 13, "px Noto Sans KR, Malgun Gothic, sans-serif"),
            fill: new Fill({
              color: routeLayerOptions.labelColor || "#ffffff"
            }),
            stroke: new Stroke({
              color: routeLayerOptions.labelColor || "#ffffff"
            }),
            textAlign: "center",
            justify: "center",
            textBaseline: "middle",
            offsetY: routeLayerOptions.labelOffsetY || 0
          }),
          zIndex: 2
        });
        setFeatureStyle(clusterPointFeature, style);
        highlightRoutePointVectorSource === null || highlightRoutePointVectorSource === void 0 ? void 0 : highlightRoutePointVectorSource.addFeature(clusterPointFeature);
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
var routePointLayer = function routePointLayer(mapObject, options) {
  /** 1. 포인트 벡터 레이어 생성 및 벡터 소스 선언 */
  var pointVectorLayer = getVectorLayer(new VectorSource({}), 3);
  pointVectorLayer.set(LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
  pointVectorLayer.set("layerOptions", options);
  mapObject.addLayer(pointVectorLayer);
  var pointVectorSource = pointVectorLayer.getSource();

  /** 2. 포인트 스타일 함수 객체 생성 */
  var pointStyleFunction = function pointStyleFunction(feature) {
    var featureProps = feature.getProperties();
    var style = new Style$1({
      image: new Icon({
        anchor: [0.5, 1],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        crossOrigin: "anonymous",
        src: options.routeIcon,
        rotateWithView: true
      }),
      text: new Text({
        text: String(featureProps.routePointLabel),
        font: "".concat(options.labelSize || 13, "px Noto Sans KR, Malgun Gothic, sans-serif"),
        fill: new Fill({
          color: options.labelColor || "#ffffff"
        }),
        stroke: new Stroke({
          color: options.labelColor || "#ffffff"
        }),
        textAlign: "center",
        justify: "center",
        textBaseline: "middle",
        offsetY: options.labelOffsetY || 0
      }),
      zIndex: 2
    });
    return style;
  };

  /** 3. 포인트 Feature 객체 생성 및 추가 */
  var pointFeatures = [];
  options.features.forEach(function (feature) {
    var pointFeature = getPointFeature(getFromLonLat(feature.coordinates));
    Object.keys(feature.properties).forEach(function (key) {
      pointFeature.set(key, feature.properties[key]);
    });
    if (feature.clusterFeatures) {
      pointFeature.set(CLUSTER_FEATURES, feature.clusterFeatures);
    }
    setFeatureStyle(pointFeature, pointStyleFunction);
    pointFeatures.push(pointFeature);
  });
  pointVectorSource === null || pointVectorSource === void 0 ? void 0 : pointVectorSource.addFeatures(pointFeatures);

  /** 4. 포인트 선택 interaction 추가 */
  var pointSelectInteraction = new Select({
    condition: click,
    style: pointStyleFunction,
    layers: [pointVectorLayer]
  });
  pointSelectInteraction.set(LAYER_TYPE_KEY, ROUTE_LAYER);

  /** 5. 포인트 선택 interaction 이벤트 처리 */
  var returnIndex;
  pointSelectInteraction.on("select", function (e) {
    console.log(e);
    // 선택 항목이 있는 경우
    if (e.selected.length > 0) {
      var selectedPointIndex = e.selected[0].getProperties().routePointIndex;
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
  var hoverEventHandler = function hoverEventHandler(e) {
    if (e.dragging) {
      return;
    }
    var hit = mapObject.forEachFeatureAtPixel(e.pixel, function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var layer = args[1];
      var layerProperties = layer.getProperties();
      if (layerProperties[LAYER_TYPE_KEY] === ROUTE_POINT_LAYER) {
        return true;
      }
      return false;
    });
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
var removeRouteLayer = function removeRouteLayer(mapObject) {
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
var routeLayer = function routeLayer(mapObject, options) {
  try {
    // 1. 이미 생성 된 동일 레이어 및 Interaction 도구 중복 방지를 위한 제거
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
    removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
    removeDuplicateInteraction(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);

    // 2. 경로 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
    var lineVectorLayer = getVectorLayer(new VectorSource({}), 2);
    lineVectorLayer.set(LAYER_TYPE_KEY, ROUTE_LAYER);
    mapObject.addLayer(lineVectorLayer);

    // 3. 라인 Feature 생성용 좌표 변환 (좌표 4326 -> 5179 좌표 변환 및 이중 배열 생성)
    var lineCoordinates = options.features.map(function (feature) {
      return getFromLonLat(feature.coordinates);
    });
    // 4. 라인 Feature 생성
    var lineFeature = getLineFeature(lineCoordinates);
    // 5. 라인 스타일 추가
    var lineFeatureStyle = new Style$1({
      stroke: new Stroke({
        color: options.lineColor || "#ff0000",
        width: options.lineWidth || 3
      })
    });
    setFeatureStyle(lineFeature, lineFeatureStyle);

    // 6. Vector 레이어 Feature 추가
    var lineVectorSource = lineVectorLayer.getSource();
    lineVectorSource === null || lineVectorSource === void 0 ? void 0 : lineVectorSource.addFeature(lineFeature);

    // 7. 경로 포인트 레이어 생성
    routePointLayer(mapObject, options);
  } catch (e) {
    console.log("routeLayer Error : " + e);
  }
};

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
var moveMap = function moveMap(mapObject, options) {
  // 1. 좌표가 없거나, 좌표가 0,0 인 경우 return
  var coordinate = options.coordinate;
  if (!coordinate || coordinate[0] === 0 || coordinate[1] === 0) {
    return;
  }
  var mapView = mapObject.getView();
  mapView.animate({
    center: getFromLonLat(coordinate),
    duration: options.animate ? 300 : 0
  }, {
    zoom: options.zoomLevel ? options.zoomLevel : mapView.getZoom(),
    duration: options.animate ? 300 : 0
  }, options.moveMapCallback || {});
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
var fitExtentCoordinates = function fitExtentCoordinates(mapObject, options) {
  var lineStringFeature = new Feature({
    geometry: new LineString(options.coordinates)
  });
  if (lineStringFeature) {
    var _lineStringFeature$ge;
    var extent = (_lineStringFeature$ge = lineStringFeature.getGeometry()) === null || _lineStringFeature$ge === void 0 ? void 0 : _lineStringFeature$ge.getExtent();
    if (extent) {
      mapObject.getView().fit(getExtentFromLonLat(extent), {
        duration: options.animate ? 300 : 0,
        callback: options.fitExtentCallback
      });
    }
  }
};

/**
 * @private
 * @name refProperties
 * @function
 * @description 지도 ref 객체의 커스텀 함수 정의
 * @param {Map} refCurrent 지도 객체
 * @return {TmsMapRefObject}
 */
var refProperties = function refProperties(refCurrent) {
  return {
    getInstance: function getInstance() {
      return refCurrent;
    },
    getCenter: function getCenter() {
      var center = refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.getView().getCenter();
      if (center) {
        return getTransForm(center);
      } else {
        return undefined;
      }
    },
    setZoom: function setZoom(zoomLevel) {
      if (refCurrent) {
        refCurrent.getView().setZoom(zoomLevel);
      }
    },
    moveMap: function moveMap$1(options) {
      if (refCurrent) {
        moveMap(refCurrent, options);
      }
    },
    fitExtentCoordinates: function fitExtentCoordinates$1(options) {
      if (refCurrent) {
        fitExtentCoordinates(refCurrent, options);
      }
    },
    changeBaseMap: function changeBaseMap(mapType) {
      if (mapType === KAKAO_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(getKaKaoTileLayer());
      }
      if (mapType === GOOGLE_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(getGoogleTileLayer());
      }
      if (mapType === VWORLD_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(getVWorldTileLayer());
      }
    },
    routeLayer: function routeLayer$1(options) {
      if (refCurrent) {
        routeLayer(refCurrent, options);
      }
    },
    removeRouteLayer: function removeRouteLayer$1() {
      if (refCurrent) {
        removeRouteLayer(refCurrent);
      }
    },
    highlightRoutePoint: function highlightRoutePoint$1(index, radius) {
      if (refCurrent) {
        highlightRoutePoint(refCurrent, index, radius);
      }
    },
    removeHighlightRoutePoint: function removeHighlightRoutePoint$1() {
      if (refCurrent) {
        removeHighlightRoutePoint(refCurrent);
      }
    },
    circleLayer: function circleLayer$1(options) {
      if (refCurrent) {
        circleLayer(refCurrent, options);
      }
    },
    removeCircleLayer: function removeCircleLayer$1() {
      if (refCurrent) {
        removeCircleLayer(refCurrent);
      }
    },
    highlightCirclePoint: function highlightCirclePoint$1(index, radius, options) {
      if (refCurrent) {
        highlightCirclePoint(refCurrent, index, radius, options);
      }
    },
    removeHighlightCirclePoint: function removeHighlightCirclePoint$1() {
      if (refCurrent) {
        removeHighlightCirclePoint(refCurrent);
      }
    }
  };
};

/**
 * 지도 생성 타입을 결정 하는 지도 종류 관련 상수 정의
 */
var KAKAO_BG = "kakao";
var GOOGLE_BG = "google";
var VWORLD_BG = "vworld";

/**
 * 상수
 */
var DEFAULT_PROJECTION = "EPSG:5179";
var DEFAULT_ZOOM = 17;
var DEFAULT_MIN_ZOOM = 1;
var DEFAULT_MAX_ZOOM = 22;
var TmsMapContainer = /*#__PURE__*/forwardRef(function (props, ref) {
  var options = props.options;
  var divRef = useRef(null);
  var mapRef = useRef(null);
  useEffect(function () {
    if (divRef.current && !mapRef.current) {
      var tileLayers = null;
      if (options.type === KAKAO_BG) {
        tileLayers = getKaKaoTileLayer();
      }
      if (options.type === GOOGLE_BG) {
        tileLayers = getGoogleTileLayer();
      }
      if (options.type === VWORLD_BG) {
        tileLayers = getVWorldTileLayer();
      }
      if (tileLayers) {
        var _options$zoom, _options$minZoom, _options$maxZoom;
        var transformCoordinates = getFromLonLat([options.lng, options.lat]);
        var view = new View({
          center: transformCoordinates,
          zoom: (_options$zoom = options.zoom) !== null && _options$zoom !== void 0 ? _options$zoom : DEFAULT_ZOOM,
          minZoom: (_options$minZoom = options.minZoom) !== null && _options$minZoom !== void 0 ? _options$minZoom : DEFAULT_MIN_ZOOM,
          maxZoom: (_options$maxZoom = options.maxZoom) !== null && _options$maxZoom !== void 0 ? _options$maxZoom : DEFAULT_MAX_ZOOM,
          projection: DEFAULT_PROJECTION,
          constrainResolution: true,
          // zoom 레벨 정수 처리 (소수점 X)
          smoothResolutionConstraint: false,
          smoothExtentConstraint: false
        });
        mapRef.current = new Map({
          controls: defaults({
            zoom: false,
            rotate: false
          }),
          interactions: defaults$1({
            doubleClickZoom: false
          }).extend([new PinchZoom()]),
          layers: tileLayers,
          target: divRef.current,
          view: view
        });
        mapRef.current.once("postrender", function (e) {
          var _options$events;
          (_options$events = options.events) === null || _options$events === void 0 ? void 0 : _options$events.postRendered();
        });
        /* mapRef.current.on("click", (e) => {
            console.log("클릭 지점 >>>>  ", getTransForm(e.coordinate));
        }); */
      }
    }
  }, [options, ref]);

  /**
   * `useImperativeHandle`은 다음을 사용할 때 상위 구성요소에 노출되는 인스턴스 값을 사용자 정의합니다.
   * 'ref'. 항상 그렇듯이 대부분의 경우 ref를 사용하는 명령형 코드는 피해야 합니다
   * `useImperativeHandle`은 `React.forwardRef`와 함께 사용해야 합니다.
   *
   * 부모 컴포넌트에 노출되는 인스턴스 값을 사용자화, 라이브러리를 사용하는 외부에서 forwardRef로 지정된
   * 지도 컴포넌트의 함수를 사용하기 위함
   *
   * 두번쨰 인수는 객체를 리턴하는 함수, 해당 객체에 추가하고 싶은 프로퍼티를 정의 (함수 또는 변수)
   * @see https://reactjs.org/docs/hooks-reference.html#useimperativehandle
   */
  useImperativeHandle(ref, function () {
    return mapRef.current ? refProperties(mapRef.current) : {};
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: divRef,
    style: {
      position: "relative",
      width: "100%",
      height: "100%",
      overflow: "hidden"
    }
  });
});
TmsMapContainer.displayName = "TmsMapContainer";

var TmsMap = function TmsMap(props) {
  return /*#__PURE__*/React.createElement(TmsMapContainer, {
    options: props.options,
    ref: props.options.ref
  });
};

export { TmsMap };
