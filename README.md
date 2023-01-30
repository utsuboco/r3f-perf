![npm](https://img.shields.io/npm/v/r3f-perf) ![npm](https://img.shields.io/npm/dw/r3f-perf)

# R3F-Perf
**[Changelog](https://github.com/utsuboco/r3f-perf/blob/main/packages/r3f-perf/CHANGELOG.md)**

Easily monitor the performances of your @react-three/fiber application.

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
overClock?: false, // Disable the limitation of the monitor refresh rate for the fps
deepAnalyze?: false, // More detailed informations about gl programs
showGraph?: true // show the graphs
minimal?: false // condensed version with the most important informations (gpu/memory/fps/custom data)
customData?: {
  value: 0, // initial value,
  name: '', // name to show
  round: 2, // precision of the float
  info: '', // additional information about the data (fps/ms for instance)
}
matrixUpdate?: false // count the number of time matrixWorldUpdate is called per frame
chart?: {
  hz: 60, // graphs refresh frequency parameter
  length: 120, // number of values shown on the monitor
}
colorBlind?: false // Color blind colors for accessibility
className?: '' // override CSS class
style?: {} // override style
position?: 'top-right'|'top-left'|'bottom-right'|'bottom-left' // quickly set the position, default is top-right
```

## Usage

```jsx
import { Canvas } from '@react-three/fiber';
import { Perf } from 'r3f-perf';

<Canvas>
  <Perf />
</Canvas>;
```

#### Usage without interface : PerfHeadless

[Codesandbox Example](https://codesandbox.io/s/perlin-cubes-r3f-perf-headless-mh1jl7?file=/src/App.js)

```jsx
import { Canvas } from '@react-three/fiber';
import { PerfHeadless, usePerf } from 'r3f-perf';

const PerfHook = () => {
  // getPerf() is also available for non-reactive way or to access values outside react
  const [gl, log, getReport] = usePerf(s=> s[s.gl, s.log, s.getReport]);
  console.log(gl, log, getReport());
  return null;
};

export default function App() {
  return (
    <Canvas>
      <PerfHeadless />
      <PerfHook />
    </Canvas>
  );
}
```


## Custom Data

```jsx
import { setCustomData, getCustomData } from 'r3f-perf';

const UpdateCustomData = () => {
  // recommended to throttle to 1sec for readability
  useFrame(() => {
    setCustomData(55 + Math.random() * 5) // will update the panel with the current information
  })
  return null
}
```


## SSR

The tool work with any server side rendering framework. You can try with Next and @react-three/fiber using this starter :
https://github.com/pmndrs/react-three-next


### Maintainers :

- [`twitter 🐈‍⬛ @onirenaud`](https://twitter.com/onirenaud)
