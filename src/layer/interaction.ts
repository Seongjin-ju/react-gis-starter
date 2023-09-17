import { Map } from "ol";
import { Interaction } from "ol/interaction";

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
export const removeDuplicateInteraction = (mapObject: Map, key: string, value: string): void => {
    const isRouteLayerInteractions: Interaction[] | undefined = mapObject
        .getInteractions()
        .getArray()
        .filter((interaction: Interaction) => {
            const interactionProps = interaction.getProperties();
            if (interactionProps[key] && interactionProps[key] === value) {
                return interaction;
            }
        });

    if (isRouteLayerInteractions && isRouteLayerInteractions.length > 0) {
        isRouteLayerInteractions.forEach((interaction: Interaction) => {
            mapObject.removeInteraction(interaction as Interaction);
        });
    }
};
