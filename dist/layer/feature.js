'use strict';

var _rollupPluginBabelHelpers = require('../_virtual/_rollupPluginBabelHelpers.js');
var ol = require('ol');
var geom = require('ol/geom');
var Style = require('ol/style/Style');

/**
 * @private
 * @name getPointFeature
 * @function
 * @description 포인트 feature 객체 반환
 * @param {number[]} coordinates 포인트 feature 생성 좌표
 * @return {Feature}
 */
var getPointFeature = function getPointFeature(coordinates) {
  return new ol.Feature({
    geometry: new geom.Point(coordinates)
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
  return new ol.Feature({
    geometry: new geom.LineString(coordinates)
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
  return new ol.Feature({
    geometry: new geom.Circle(coordinates, radius)
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
  var circleFeature = new ol.Feature({
    geometry: new geom.Circle(coordinates, radius)
  });
  var circleGradientStyle = new Style({
    renderer: function renderer(coordinates, state) {
      var convertCoordinates = coordinates;
      var _convertCoordinates = _rollupPluginBabelHelpers.slicedToArray(convertCoordinates, 2),
        _convertCoordinates$ = _rollupPluginBabelHelpers.slicedToArray(_convertCoordinates[0], 2),
        x = _convertCoordinates$[0],
        y = _convertCoordinates$[1],
        _convertCoordinates$2 = _rollupPluginBabelHelpers.slicedToArray(_convertCoordinates[1], 2),
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

exports.getCircleFeature = getCircleFeature;
exports.getCircleGradientFeature = getCircleGradientFeature;
exports.getFindFeature = getFindFeature;
exports.getFindFeatures = getFindFeatures;
exports.getLineFeature = getLineFeature;
exports.getPointFeature = getPointFeature;
exports.removeDuplicateFeatures = removeDuplicateFeatures;
exports.setFeatureStyle = setFeatureStyle;
