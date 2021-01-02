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

## Development and production build
R3F-Perf is automatically removed from the production build based on the `process.env.NODE_ENV`.