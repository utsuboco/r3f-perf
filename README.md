# R3F-Perf

Easily monitor the performances of your React-Three-Fiber application.

## Installation
```bash
yarn add --dev r3f-perf
```

## Usage
Simply add the bench component in your app
```jsx
import { Canvas } from 'react-three-fiber'
import { Perf } from 'r3f-perf'

<Canvas>
  <Perf />
</Canvas>
```