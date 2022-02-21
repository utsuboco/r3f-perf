![npm](https://img.shields.io/npm/v/r3f-perf) ![npm](https://img.shields.io/npm/dw/r3f-perf)

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
antialias?: true, // Take a bit more performances but render the text with antialiasing
headless?: false, // Without UI. See Headless section
deepAnalyze?: false, // More detailed informations about gl programs
showGraph?: true // show the graphs
chart?: {
  hz: 60, // graphs refresh frequency parameter
  length: 120, // number of values shown on the monitor
}
colorBlind?: false // Color blind colors for accessibility
className?: false // override CSS class
position?: 'top-right'|'top-left'|'bottom-right'|'bottom-left' // override position, default is top-right
```

## Usage

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

## Feature ideas todo :

- Convert all DOM text to shader to increase the refresh rate
- Buffer frame and Forward rendering differenciation in the "calls" section of the UI
- Postprocess shaders differenciation
- Deep analytics about the shaders (list the types of material/shader)
- Lights informations in the scene
- Show the number of items receiving and casting shadow in the scene
- Add an audit button to find what consume the most CPU/GPU in the app for every loop

### Maintainers :

- [`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
