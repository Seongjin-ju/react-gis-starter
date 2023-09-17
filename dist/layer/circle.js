'use strict';

var VectorSource = require('ol/source/Vector');
var style = require('ol/style');
var coordinates_util = require('../utils/coordinates.util.js');
var feature = require('./feature.js');
var vectorLayer = require('./vectorLayer.js');

/**
 * 삭제 및 구분,관리용 Properties 정보 인 KEY, VALUE
 */
var LAYER_TYPE_KEY = "layerType";
var CIRCLE_LAYER = "tmsCircleLayer";
var CIRCLE_HIGHLIGHT_POINT_LAYER = "tmsHighlightCirclePointLayer";
var FEATURE_TYPE_KEY = "featureType";
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
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
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
  var circlePointLayer = vectorLayer.getFindVectorLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);
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
      highlightCirclePointLayer = vectorLayer.getFindVectorLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
      if (!highlightCirclePointLayer) {
        highlightCirclePointLayer = vectorLayer.getVectorLayer(new VectorSource({}), 2);
        highlightCirclePointLayer.set(LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
        mapObject.addLayer(highlightCirclePointLayer);
      }
      (_highlightCirclePoint = highlightCirclePointLayer.getSource()) === null || _highlightCirclePoint === void 0 ? void 0 : _highlightCirclePoint.clear();

      /** 5. 하이라이트용 레이어 벡터 소스 추출 */
      var highlightCirclePointVectorSource = highlightCirclePointLayer.getSource();

      /** 6. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
      var isDuplicateFeature;
      if (highlightCirclePointVectorSource) {
        isDuplicateFeature = feature.getFindFeature(highlightCirclePointVectorSource, CIRCLE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
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
            feature.removeDuplicateFeatures(highlightCirclePointVectorSource, FEATURE_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_FEATURE);
            var circleFeature = feature.getCircleFeature(circeCenter, radius || DEFAULT_RADIUS);
            feature.setFeatureStyle(circleFeature, new style.Style({
              fill: new style.Fill({
                color: (options === null || options === void 0 ? void 0 : options.selectFillColor) || DEFAULT_SELECT_FILL_COLOR
              }),
              stroke: new style.Stroke({
                width: (options === null || options === void 0 ? void 0 : options.selectStrokeWidth) || DEFAULT_SELECT_STROKE_WIDTH,
                color: (options === null || options === void 0 ? void 0 : options.selectStrokeColor) || DEFAULT_SELECT_STROKE_COLOR
              })
            }));
            circleFeature.set(FEATURE_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_FEATURE);
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
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_HIGHLIGHT_POINT_LAYER);
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
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, CIRCLE_LAYER);

  // 2. 원형 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
  var circleVectorLayer = vectorLayer.getVectorLayer(new VectorSource({}), 1);
  circleVectorLayer.set(LAYER_TYPE_KEY, CIRCLE_LAYER);
  mapObject.addLayer(circleVectorLayer);

  // 3. Vector 레이어 Feature 추가
  var circleVectorSource = circleVectorLayer.getSource();

  /** 4. 원형 Feature 객체 생성 및 추가 */
  var circleFeatures = [];
  options.features.forEach(function (feature$1) {
    var circleFeature = feature.getCircleFeature(coordinates_util.getFromLonLat(feature$1.coordinates), feature$1.properties.circleRadius);
    Object.keys(feature$1.properties).forEach(function (key) {
      circleFeature.set(key, feature$1.properties[key]);
    });
    feature.setFeatureStyle(circleFeature, new style.Style({
      fill: new style.Fill({
        color: options.fillColor || DEFAULT_FILL_COLOR
      }),
      stroke: new style.Stroke({
        width: options.strokeWidth || DEFAULT_STROKE_WIDTH,
        color: options.strokeColor || DEFAULT_STROKE_COLOR
      })
    }));
    circleFeatures.push(circleFeature);
  });
  circleVectorSource === null || circleVectorSource === void 0 ? void 0 : circleVectorSource.addFeatures(circleFeatures);
};

exports.circleLayer = circleLayer;
exports.highlightCirclePoint = highlightCirclePoint;
exports.removeCircleLayer = removeCircleLayer;
exports.removeHighlightCirclePoint = removeHighlightCirclePoint;
