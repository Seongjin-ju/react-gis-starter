import { Feature } from "ol";
import { Coordinate } from "ol/coordinate";
import { Circle, LineString, Point } from "ol/geom";
import { State } from "ol/render";
import VectorSource from "ol/source/Vector";
import Style, { StyleLike } from "ol/style/Style";

/**
 * @private
 * @name getPointFeature
 * @function
 * @description 포인트 feature 객체 반환
 * @param {number[]} coordinates 포인트 feature 생성 좌표
 * @return {Feature}
 */
export const getPointFeature = (coordinates: number[]): Feature => {
    return new Feature({
        geometry: new Point(coordinates),
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
export const getLineFeature = (coordinates: number[][]): Feature => {
    return new Feature({
        geometry: new LineString(coordinates),
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
export const getCircleFeature = (coordinates: number[], radius: number): Feature => {
    return new Feature({
        geometry: new Circle(coordinates, radius),
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
export const getCircleGradientFeature = (coordinates: number[], radius: number) => {
    const circleFeature = new Feature({
        geometry: new Circle(coordinates, radius),
    });
    const circleGradientStyle: Style = new Style({
        renderer(coordinates: Coordinate | Coordinate[] | Coordinate[][], state: State) {
            const convertCoordinates = coordinates as number[][];
            const [[x, y], [x1, y1]] = convertCoordinates;
            const ctx = state.context;
            const dx = x1 - x;
            const dy = y1 - y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            const innerRadius = 0;
            const outerRadius = radius * 1;

            const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, outerRadius);
            gradient.addColorStop(0, "rgba(255,0,0,0.8)");
            gradient.addColorStop(0.6, "rgba(255,0,0,0.3)");
            gradient.addColorStop(1, "rgba(255,0,0,0)");
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
        },
        zIndex: 1,
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
export const setFeatureStyle = (feature: Feature, style: Style | StyleLike): void => {
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
export const getFindFeature = (
    vectorSource: VectorSource,
    featurePropKey: string,
    featurePropValue: string | number
): Feature | undefined => {
    const features = vectorSource.getFeatures();
    const isDuplicateFeature: Feature | undefined = features.find((feature: Feature) => {
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
export const getFindFeatures = (
    vectorSource: VectorSource,
    featurePropKey: string,
    featurePropValue: string | number
): Feature[] | undefined => {
    const features = vectorSource.getFeatures();
    const isDuplicateFeatures: Feature[] | undefined = features.filter((feature: Feature) => {
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
export const removeDuplicateFeatures = (vectorSource: VectorSource, key: string, value: string): void => {
    const features = vectorSource.getFeatures();
    const isDuplicateFeature: Feature[] = features.filter((feature: Feature) => {
        return feature.get(key) === value;
    });
    if (isDuplicateFeature && isDuplicateFeature.length > 0) {
        isDuplicateFeature.forEach((feature: Feature) => vectorSource.removeFeature(feature));
    }
};
