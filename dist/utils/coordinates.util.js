'use strict';

var proj = require('ol/proj');

var DEFAULT_PROJECTION = "EPSG:5179";
var DEFAULT_DISPLAY_PROJECTION = "EPSG:4326";
var getTransForm = function getTransForm(coordinates) {
  return proj.transform(coordinates, DEFAULT_PROJECTION, DEFAULT_DISPLAY_PROJECTION);
};
var getFromLonLat = function getFromLonLat(coordinates) {
  return proj.fromLonLat(coordinates, DEFAULT_PROJECTION);
};
var getExtentFromLonLat = function getExtentFromLonLat(coordinates) {
  return proj.transformExtent(coordinates, DEFAULT_DISPLAY_PROJECTION, DEFAULT_PROJECTION);
};

exports.getExtentFromLonLat = getExtentFromLonLat;
exports.getFromLonLat = getFromLonLat;
exports.getTransForm = getTransForm;
