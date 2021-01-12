![npm](https://img.shields.io/npm/v/r3f-perf) [![dependencies Status](https://status.david-dm.org/gh/RenaudROHLINGER/r3f-perf.svg)](https://david-dm.org/RenaudROHLINGER/r3f-perf) [![devDependencies Status](https://status.david-dm.org/gh/RenaudROHLINGER/r3f-perf.svg?type=dev)](https://david-dm.org/RenaudROHLINGER/r3f-perf?type=dev) ![npm](https://img.shields.io/npm/dw/r3f-perf)

# R3F-Perf

Easily monitor the performances of your React-Three-Fiber application.
r3f-perf.js is 6.23 KB and automatically removed in production. See [Dev and production build](#dev-and-production-build)

## Installation

```bash
yarn add --dev r3f-perf
```

## Options

```jsx
headless?: false, // Without UI. See Headless section
showGraph?: true // show the graphs
colorBlind?: false // Color blind colors for accessibility
trackGPU?: true // show a graph of the GPU (Experimental, might not be relevant)
openByDefault?: false // show more informations by default
className?: false // override CSS class
```

## Usage

Simply add the the profiler component in your app

```jsx
import { Canvas } from 'react-three-fiber';
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf />
</Canvas>;
```

Usage without interface : headless mode

```jsx
import { Canvas } from 'react-three-fiber';
import { Perf, usePerf } from 'r3f-perf';

const PerfHook = () => {
  const { gl, log } = usePerf();
  console.log(gl, log);
  return null;
};

export default function App() {
  return (
    <Canvas>
      <Perf headless />
      <PerfHook />
    </Canvas>
  );
}
```

## SSR

The tool work with any server side rendering framework. You can try with Next and React-Three-Fiber using this starter :
https://github.com/RenaudRohlinger/r3f-next-starter

## Dev and production build

R3F-Perf is automatically removed from the production build based on the `process.env.NODE_ENV`.

To render R3F-Perf even in production :

```jsx
import { Perf } from 'r3f-perf/dist/r3f-perf.cjs.development.js';
```

## Todo

- ~~Fix NaN number on init~~
- ~~Improved readme~~
- ~~Log the numbers of programs(shader) used in real-time~~
- ~~Tool in full size by default parameter~~
- Position parameter
- Values and graphs refresh frequency parameter
- Fix graph SVG position if too low (not visible)

### Maintainers :

- [`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
