import React, { useRef, useEffect, forwardRef, Ref, useImperativeHandle } from "react";

import { Collection, Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import { defaults as defaultInteractions } from "ol/interaction";
import PinchZoom from "ol/interaction/PinchZoom";
import BaseLayer from "ol/layer/Base";

import { TmsMapProps, TmsMapRefObject } from "../interfaces/map.interface";
import { getKaKaoTileLayer, getGoogleTileLayer, getVWorldTileLayer } from "../layer/base";
import { refProperties } from "../ref.properties";
import { getFromLonLat } from "../utils";

/**
 * 지도 생성 타입을 결정 하는 지도 종류 관련 상수 정의
 */
export const KAKAO_BG = "kakao";
export const GOOGLE_BG = "google";
export const VWORLD_BG = "vworld";

/**
 * 상수
 */
const DEFAULT_PROJECTION = "EPSG:5179";
const DEFAULT_ZOOM = 17;
const DEFAULT_MIN_ZOOM = 1;
const DEFAULT_MAX_ZOOM = 22;

const TmsMapContainer = forwardRef((props: TmsMapProps, ref: Ref<Partial<TmsMapRefObject>>) => {
    const { options } = props;

    const divRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        if (divRef.current && !mapRef.current) {
            let tileLayers: BaseLayer[] | Collection<BaseLayer> | null = null;

            if (options.type === KAKAO_BG) {
                tileLayers = getKaKaoTileLayer();
            }

            if (options.type === GOOGLE_BG) {
                tileLayers = getGoogleTileLayer();
            }

            if (options.type === VWORLD_BG) {
                tileLayers = getVWorldTileLayer();
            }

            if (tileLayers) {
                const transformCoordinates = getFromLonLat([options.lng, options.lat]);
                const view = new View({
                    center: transformCoordinates,
                    zoom: options.zoom ?? DEFAULT_ZOOM,
                    minZoom: options.minZoom ?? DEFAULT_MIN_ZOOM,
                    maxZoom: options.maxZoom ?? DEFAULT_MAX_ZOOM,
                    projection: DEFAULT_PROJECTION,
                    constrainResolution: true, // zoom 레벨 정수 처리 (소수점 X)
                    smoothResolutionConstraint: false,
                    smoothExtentConstraint: false,
                });

                mapRef.current = new Map({
                    controls: defaultControls({ zoom: false, rotate: false }),
                    interactions: defaultInteractions({
                        doubleClickZoom: false,
                    }).extend([new PinchZoom()]),
                    layers: tileLayers,
                    target: divRef.current,
                    view: view,
                });

                mapRef.current.once("postrender", (e) => {
                    options.events?.postRendered();
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
    useImperativeHandle(ref, () => (mapRef.current ? refProperties(mapRef.current) : {}));

    return <div ref={divRef} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}></div>;
});
TmsMapContainer.displayName = "TmsMapContainer";

export default TmsMapContainer;
