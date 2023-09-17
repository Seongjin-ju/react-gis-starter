import React from "react";

import { TmsMapProps } from "../interfaces/map.interface";

import TmsMapContainer from "./TmsMapContainer";

const TmsMap = (props: TmsMapProps) => {
    return <TmsMapContainer options={props.options} ref={props.options.ref} />;
};

export default TmsMap;
