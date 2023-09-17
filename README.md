# @innodep/tms-react-gis

> @innodep/tms-react-gis는 react 전용 컴포넌트 라이브러리로 yarn berry 패키지 매니저와 rollup 번들러 적용,
> openlayers를 활용한 지도 처리 및 지도 사용자 interaction 처리를 손쉽게 사용하기 위한 지도 컴포넌트 테스트용 starter 입니다.

<br />

# 🚩 목차

-   [Install](#install)
-   [Usage](#usage)
    -   [Basic Map](#basic-map)
-   [React Support](#-react-support)

<br />

# Install

Innodep 의 사내 NPM 서버에 배포된 라이브러리 설치를 위해서는 아래와 같이 registry 등록을 최초 한번 수행해야 합니다.

```typescript
// 최초 1번 수행(registry 등록)
npm config set {사내 npm 서버 registry 등록}

npm install @innodep/tms-react-gis
```

<br />

# Module Test

해당 라이브러리의 패키지 매니저는 yarn berry(v2)로 개발을 위해 아래와 같이 yarn을 설치 하며, 개발준비를 위한 설치를 진행 한다.

```typescript
// global yarn 설치
npm install -g yarn
// yarn 설치 확인 (버전)
yarn --version

// 패키지 설치
yarn install

// vscode 진입 후 설치 해야 하며, 알림창 발생 시 허용 처리를 한다. Yarn berry의 Pnp 기능 사용을 때, TypeScript가 정상적으로 작동하도록 추가적인 구성
yarn dlx @yarnpkg/sdks vscode

// typescript plugin 설치
yarn plugin import typescript

// 빌드 실행, build:watch 실행 시, gis 모듈의 변경 실시간 빌드 되어 적용 된다.
yarn build:watch

/**
 * yarn 패키지 초기화 & 재설치 방법
 * yarn clean cache 실행 시, 폴더 내 .yarn 에 캐시되어 있는 패키지들이 삭제 되며,
 * yarn install 을 통해 초기화 된다.
 */
yarn clean cache
yarn install
```

개발 테스트를 위해, 라이브러리 테스트용 React 프로젝트를 생성 후, local 위치에서 설치하여 테스트를 진행 한다.

```typescript
/**
 * package.json > dependencies
 * 예제의 경우 @innodep/tms-react-gis 모듈 프로젝트를 react 프로젝트 내부 root 위치 packages/
 * 디렉토리 위치에 넣어두고 로컬 패키지로 설치하여 테스트
 */
 "@innodep/tms-react-gis": "file:packages/tms-react-gis",
```

<br />

# Usage

## Basic Map

예제 작성 예시
(기본 지도 생성)
<br/>

### TmsMapOptions(지도 생성 옵션)

| Name                | Type     | Default    | Description                                                            |
| ------------------- | -------- | ---------- | ---------------------------------------------------------------------- |
| type                | string   | `required` | 지도 종류, kakao, google, vworld                                       |
| lng                 | string   | `required` | 지도 생성시 보여줄 위치의 경도, EPSG:4326 형태로 입력 (127.xxxx); 지정 |
| lat                 | string   | `required` | 지도 생성시 보여줄 위치의 위도 EPSG:4326 형태로 입력 (36.xxxx);        |
| ref                 | Ref      | `required` | 지도 객체의 참조 ref                                                   |
| zoom                | string   | 17         | 지도의 초기 zoom 레벨                                                  |
| minZoom             | number   | 1          | 지도의 최소 zoom 레벨                                                  |
| maxZoom             | number   | 22         | 지도의 최대 zoom 레벨                                                  |
| events              | object   | `optional` | 지도의 이벤트 처리를 위한 옵션                                         |
| events.postRendered | function | -          | Base 지도가 생성 된 이후 발생하는 이벤트                               |

<br/>

```tsx
import React, { useRef } from "react";

import { TmsMap } from "@innodep/tms-react-gis";
import {
    TmsMapOptions,
    TmsMapRefObject,
} from "@innodep/tms-react-gis/dist/interfaces/map.interface";

const BasicMap = () => {
    const tmsMapRef = useRef<TmsMapRefObject>(null);

    const postRendered = () => {
        // create map after
        console.log(
            "지도 생성 완료(맵 생성 옵션 중 events > postRendered 콜백 참조)"
        );
    };

    const mapOptions: TmsMapOptions = {
        type: "kakao",
        lng: 126.88572333216116,
        lat: 37.47954004208002,
        zoom: 18,
        ref: tmsMapRef,
        events: {
            postRendered: postRendered,
        },
    };

    return (
        <>
            <TmsMap options={mapOptions} />
        </>
    );
};

export default BasicMap;
```

<br/>

# React Support

```typescript
"react": "^16 || ^17 || ^18"
```
