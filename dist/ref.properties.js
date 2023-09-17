'use strict';

var TmsMapContainer = require('./components/TmsMapContainer.js');
var base = require('./layer/base.js');
var circle = require('./layer/circle.js');
var route = require('./layer/route.js');
var coordinates_util = require('./utils/coordinates.util.js');
var map_util = require('./utils/map.util.js');

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
        return coordinates_util.getTransForm(center);
      } else {
        return undefined;
      }
    },
    setZoom: function setZoom(zoomLevel) {
      if (refCurrent) {
        refCurrent.getView().setZoom(zoomLevel);
      }
    },
    moveMap: function moveMap(options) {
      if (refCurrent) {
        map_util.moveMap(refCurrent, options);
      }
    },
    fitExtentCoordinates: function fitExtentCoordinates(options) {
      if (refCurrent) {
        map_util.fitExtentCoordinates(refCurrent, options);
      }
    },
    changeBaseMap: function changeBaseMap(mapType) {
      if (mapType === TmsMapContainer.KAKAO_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(base.getKaKaoTileLayer());
      }
      if (mapType === TmsMapContainer.GOOGLE_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(base.getGoogleTileLayer());
      }
      if (mapType === TmsMapContainer.VWORLD_BG) {
        refCurrent === null || refCurrent === void 0 ? void 0 : refCurrent.setLayers(base.getVWorldTileLayer());
      }
    },
    routeLayer: function routeLayer(options) {
      if (refCurrent) {
        route.routeLayer(refCurrent, options);
      }
    },
    removeRouteLayer: function removeRouteLayer() {
      if (refCurrent) {
        route.removeRouteLayer(refCurrent);
      }
    },
    highlightRoutePoint: function highlightRoutePoint(index, radius) {
      if (refCurrent) {
        route.highlightRoutePoint(refCurrent, index, radius);
      }
    },
    removeHighlightRoutePoint: function removeHighlightRoutePoint() {
      if (refCurrent) {
        route.removeHighlightRoutePoint(refCurrent);
      }
    },
    circleLayer: function circleLayer(options) {
      if (refCurrent) {
        circle.circleLayer(refCurrent, options);
      }
    },
    removeCircleLayer: function removeCircleLayer() {
      if (refCurrent) {
        circle.removeCircleLayer(refCurrent);
      }
    },
    highlightCirclePoint: function highlightCirclePoint(index, radius, options) {
      if (refCurrent) {
        circle.highlightCirclePoint(refCurrent, index, radius, options);
      }
    },
    removeHighlightCirclePoint: function removeHighlightCirclePoint() {
      if (refCurrent) {
        circle.removeHighlightCirclePoint(refCurrent);
      }
    }
  };
};

exports.refProperties = refProperties;
