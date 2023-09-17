'use strict';

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

exports.removeDuplicateInteraction = removeDuplicateInteraction;
