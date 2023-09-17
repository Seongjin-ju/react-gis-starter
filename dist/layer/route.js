'use strict';

var condition = require('ol/events/condition');
var interaction$1 = require('ol/interaction');
var VectorSource = require('ol/source/Vector');
var style = require('ol/style');
var coordinates_util = require('../utils/coordinates.util.js');
var feature = require('./feature.js');
var interaction = require('./interaction.js');
var vectorLayer = require('./vectorLayer.js');

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
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
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
  var routePointLayer = vectorLayer.getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
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
      highlightRoutePointLayer = vectorLayer.getFindVectorLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
      if (!highlightRoutePointLayer) {
        highlightRoutePointLayer = vectorLayer.getVectorLayer(new VectorSource({}), 5);
        highlightRoutePointLayer.set(LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
        mapObject.addLayer(highlightRoutePointLayer);
      }

      /** 7. 하이라이트용 레이어 벡터 소스 추출 */
      var highlightRoutePointVectorSource = highlightRoutePointLayer.getSource();

      /** 8. 이미 만들어진 동일 위치 하이라이트 표시가 있는지 체크(deselect 처리) */
      if (highlightRoutePointVectorSource) {
        var routeHighlightPointFeatures = feature.getFindFeatures(highlightRoutePointVectorSource, ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        if (routeHighlightPointFeatures && routeHighlightPointFeatures.length > 0) {
          /** 8-1. 하이라이트용 feature 삭제 */
          routeHighlightPointFeatures.forEach(function (duplicateFeature) {
            highlightRoutePointVectorSource === null || highlightRoutePointVectorSource === void 0 ? void 0 : highlightRoutePointVectorSource.removeFeature(duplicateFeature);
          });
        }

        /** 8-2. 하이라이트용 feature 생성 및 추가 */
        var highlightRoutePointCoordinates = findPointFeature.getGeometry().getCoordinates();

        /** 8-3. 기존 생성된 하이라이트용 feature 삭제 */
        feature.removeDuplicateFeatures(highlightRoutePointVectorSource, FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);

        // 원형 강조 표시
        var circleGradientFeature = feature.getCircleGradientFeature(highlightRoutePointCoordinates, radius || POINT_SELECTION_RADIUS);
        circleGradientFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
        circleGradientFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        highlightRoutePointVectorSource === null || highlightRoutePointVectorSource === void 0 ? void 0 : highlightRoutePointVectorSource.addFeature(circleGradientFeature);

        // cluster 아이콘 추가
        var clusterPointFeature = feature.getPointFeature(highlightRoutePointCoordinates);
        clusterPointFeature.set(FEATURE_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_FEATURE);
        clusterPointFeature.set(ROUTE_HIGHLIGHT_POINT_FEATURE_PROP_KEY, index);
        var style$1 = new style.Style({
          image: new style.Icon({
            anchor: [0.5, 1],
            anchorXUnits: "fraction",
            anchorYUnits: "fraction",
            crossOrigin: "anonymous",
            src: routeLayerOptions.clusterIcon,
            rotateWithView: true
          }),
          text: new style.Text({
            text: String(findRouterPointLabel ? findRouterPointLabel : findPointFeature.getProperties().routePointLabel),
            font: "".concat(routeLayerOptions.labelSize || 13, "px Noto Sans KR, Malgun Gothic, sans-serif"),
            fill: new style.Fill({
              color: routeLayerOptions.labelColor || "#ffffff"
            }),
            stroke: new style.Stroke({
              color: routeLayerOptions.labelColor || "#ffffff"
            }),
            textAlign: "center",
            justify: "center",
            textBaseline: "middle",
            offsetY: routeLayerOptions.labelOffsetY || 0
          }),
          zIndex: 2
        });
        feature.setFeatureStyle(clusterPointFeature, style$1);
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
  var pointVectorLayer = vectorLayer.getVectorLayer(new VectorSource({}), 3);
  pointVectorLayer.set(LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
  pointVectorLayer.set("layerOptions", options);
  mapObject.addLayer(pointVectorLayer);
  var pointVectorSource = pointVectorLayer.getSource();

  /** 2. 포인트 스타일 함수 객체 생성 */
  var pointStyleFunction = function pointStyleFunction(feature) {
    var featureProps = feature.getProperties();
    var style$1 = new style.Style({
      image: new style.Icon({
        anchor: [0.5, 1],
        anchorXUnits: "fraction",
        anchorYUnits: "fraction",
        crossOrigin: "anonymous",
        src: options.routeIcon,
        rotateWithView: true
      }),
      text: new style.Text({
        text: String(featureProps.routePointLabel),
        font: "".concat(options.labelSize || 13, "px Noto Sans KR, Malgun Gothic, sans-serif"),
        fill: new style.Fill({
          color: options.labelColor || "#ffffff"
        }),
        stroke: new style.Stroke({
          color: options.labelColor || "#ffffff"
        }),
        textAlign: "center",
        justify: "center",
        textBaseline: "middle",
        offsetY: options.labelOffsetY || 0
      }),
      zIndex: 2
    });
    return style$1;
  };

  /** 3. 포인트 Feature 객체 생성 및 추가 */
  var pointFeatures = [];
  options.features.forEach(function (feature$1) {
    var pointFeature = feature.getPointFeature(coordinates_util.getFromLonLat(feature$1.coordinates));
    Object.keys(feature$1.properties).forEach(function (key) {
      pointFeature.set(key, feature$1.properties[key]);
    });
    if (feature$1.clusterFeatures) {
      pointFeature.set(CLUSTER_FEATURES, feature$1.clusterFeatures);
    }
    feature.setFeatureStyle(pointFeature, pointStyleFunction);
    pointFeatures.push(pointFeature);
  });
  pointVectorSource === null || pointVectorSource === void 0 ? void 0 : pointVectorSource.addFeatures(pointFeatures);

  /** 4. 포인트 선택 interaction 추가 */
  var pointSelectInteraction = new interaction$1.Select({
    condition: condition.click,
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
        feature.removeDuplicateFeatures(pointVectorSource, FEATURE_TYPE_KEY, ROUTE_POINT_FEATURE);
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
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
  vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
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
    vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);
    vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_POINT_LAYER);
    vectorLayer.removeDuplicateLayer(mapObject, LAYER_TYPE_KEY, ROUTE_HIGHLIGHT_POINT_LAYER);
    interaction.removeDuplicateInteraction(mapObject, LAYER_TYPE_KEY, ROUTE_LAYER);

    // 2. 경로 표시용 Vector 레이어 생성 및 타입 추가 & 지도 내 레이어 추가
    var lineVectorLayer = vectorLayer.getVectorLayer(new VectorSource({}), 2);
    lineVectorLayer.set(LAYER_TYPE_KEY, ROUTE_LAYER);
    mapObject.addLayer(lineVectorLayer);

    // 3. 라인 Feature 생성용 좌표 변환 (좌표 4326 -> 5179 좌표 변환 및 이중 배열 생성)
    var lineCoordinates = options.features.map(function (feature) {
      return coordinates_util.getFromLonLat(feature.coordinates);
    });
    // 4. 라인 Feature 생성
    var lineFeature = feature.getLineFeature(lineCoordinates);
    // 5. 라인 스타일 추가
    var lineFeatureStyle = new style.Style({
      stroke: new style.Stroke({
        color: options.lineColor || "#ff0000",
        width: options.lineWidth || 3
      })
    });
    feature.setFeatureStyle(lineFeature, lineFeatureStyle);

    // 6. Vector 레이어 Feature 추가
    var lineVectorSource = lineVectorLayer.getSource();
    lineVectorSource === null || lineVectorSource === void 0 ? void 0 : lineVectorSource.addFeature(lineFeature);

    // 7. 경로 포인트 레이어 생성
    routePointLayer(mapObject, options);
  } catch (e) {
    console.log("routeLayer Error : " + e);
  }
};

exports.highlightRoutePoint = highlightRoutePoint;
exports.removeHighlightRoutePoint = removeHighlightRoutePoint;
exports.removeRouteLayer = removeRouteLayer;
exports.routeLayer = routeLayer;
