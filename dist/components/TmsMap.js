'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var React = require('react');
var TmsMapContainer = require('./TmsMapContainer.js');

var TmsMap = function TmsMap(props) {
  return /*#__PURE__*/React.createElement(TmsMapContainer.default, {
    options: props.options,
    ref: props.options.ref
  });
};

exports.default = TmsMap;
