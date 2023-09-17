'use strict';

var VectorLayer = require('ol/layer/Vector');

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

exports.getFindVectorLayer = getFindVectorLayer;
exports.getVectorLayer = getVectorLayer;
exports.removeDuplicateLayer = removeDuplicateLayer;
