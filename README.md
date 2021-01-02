# R3F-Perf

Easily monitor the performances of your React-Three-Fiber application.

## Installation
```bash
yarn add --dev r3f-perf
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

<Canvas>
  <Perf headless />
  <PerfHook />
</Canvas>
```

## SSR
The tool work with any server side rendering framework. You can try with Next and React-Three-Fiber using this starter :
https://github.com/RenaudRohlinger/r3f-next-starter

## Development and production build
R3F-Perf is automatically removed from the production build based on the `process.env.NODE_ENV`.
