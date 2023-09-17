'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var ol = require('ol');
var control = require('ol/control');
var interaction = require('ol/interaction');
var PinchZoom = require('ol/interaction/PinchZoom');
var base = require('../layer/base.js');
var ref_properties = require('../ref.properties.js');
var coordinates_util = require('../utils/coordinates.util.js');

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
var TmsMapContainer = /*#__PURE__*/React.forwardRef(function (props, ref) {
  var options = props.options;
  var divRef = React.useRef(null);
  var mapRef = React.useRef(null);
  React.useEffect(function () {
    if (divRef.current && !mapRef.current) {
      var tileLayers = null;
      if (options.type === KAKAO_BG) {
        tileLayers = base.getKaKaoTileLayer();
      }
      if (options.type === GOOGLE_BG) {
        tileLayers = base.getGoogleTileLayer();
      }
      if (options.type === VWORLD_BG) {
        tileLayers = base.getVWorldTileLayer();
      }
      if (tileLayers) {
        var _options$zoom, _options$minZoom, _options$maxZoom;
        var transformCoordinates = coordinates_util.getFromLonLat([options.lng, options.lat]);
        var view = new ol.View({
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
        mapRef.current = new ol.Map({
          controls: control.defaults({
            zoom: false,
            rotate: false
          }),
          interactions: interaction.defaults({
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
  React.useImperativeHandle(ref, function () {
    return mapRef.current ? ref_properties.refProperties(mapRef.current) : {};
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

exports.GOOGLE_BG = GOOGLE_BG;
exports.KAKAO_BG = KAKAO_BG;
exports.VWORLD_BG = VWORLD_BG;
exports.default = TmsMapContainer;
