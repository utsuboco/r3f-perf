# R3F-Perf

Easily monitor the performances of your React-Three-Fiber application.

```jsx
r3f-perf.cjs.production.min.js
Size:       34 B  with all dependencies, minified and gzipped

r3f-perf.esm.js
Size:       6.23 KB with all dependencies, minified and gzipped
```

## Installation
```bash
yarn add --dev r3f-perf
```
## Options
```jsx
headless?: false, // Without UI. See Headless section
graph?: true // show the graphs
colorBlind?: false // Color blind colors for accessibility
trackGPU?: true // show a graph of the GPU (Experimental, might not be relevant)
openByDefault?: false // show more informations by default
```

## Usage
Simply add the the profiler component in your app
```jsx
import { Canvas } from 'react-three-fiber'
import { Perf } from 'r3f-perf'

<Canvas>
  <Perf />
</Canvas>
```

Usage without interface : headless mode
```jsx
import { Canvas } from 'react-three-fiber'
import { Perf, usePerf } from 'r3f-perf'

const PerfHook = () => {
  const { gl, log } = usePerf()
  console.log(gl, log)
  return null
}

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

## Development and production build
R3F-Perf is automatically removed from the production build based on the `process.env.NODE_ENV`.

## Todo
- Log the numbers of programs(shader) used  in real-time
- Position parameter
- Tool full size by default parameter
- Values and graphs refresh frequency parameter
- Fix graph SVG position if too low (not visible)