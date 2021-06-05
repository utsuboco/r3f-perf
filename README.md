![npm](https://img.shields.io/npm/v/r3f-perf) [![dependencies Status](https://status.david-dm.org/gh/RenaudROHLINGER/r3f-perf.svg)](https://david-dm.org/RenaudROHLINGER/r3f-perf) [![devDependencies Status](https://status.david-dm.org/gh/RenaudROHLINGER/r3f-perf.svg?type=dev)](https://david-dm.org/RenaudROHLINGER/r3f-perf?type=dev) ![npm](https://img.shields.io/npm/dw/r3f-perf)

# R3F-Perf

Easily monitor the performances of your @react-three/fiber application.
r3f-perf.js is 6.23 KB.
<table>
  <tr>
    <td>Add the Perf component anywhere in your Canvas.</td>
    <td>
<a href="https://wtp9t.csb.app/">
  <img src="https://user-images.githubusercontent.com/15867665/120879065-bd666680-c5fb-11eb-9c8f-632b7ce09456.png" /></td>
</a>
  </tr>
</table>




## Installation

```bash
yarn add --dev r3f-perf
```

## Options

```jsx
headless?: false, // Without UI. See Headless section
showGraph?: true // show the graphs
chart?: {
  hz: 10, // graphs refresh frequency parameter
  length: 30, // number of values shown on the monitor
}
colorBlind?: false // Color blind colors for accessibility
trackGPU?: true // show a graph of the GPU (Experimental, might not be relevant)
openByDefault?: false // show more informations by default
className?: false // override CSS class
position?: 'top-right'|'top-left'|'bottom-right'|'bottom-left' // override position, default is top-right
```

## Usage

Simply add the the profiler component in your app

```jsx
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf />
</Canvas>;
```

Usage without interface : headless mode

```jsx
import { Canvas } from '@react-three/fiber';
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

The tool work with any server side rendering framework. You can try with Next and @react-three/fiber using this starter :
https://github.com/pmndrs/react-three-next


### Maintainers :

- [`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
