import React, { useMemo, Suspense } from 'react';
import { Perf } from 'r3f-perf';
import './index.css';
import { Canvas, extend } from '@react-three/fiber';
import { Orbit } from './sandboxes/perf-minimal/src/orbit';
import * as THREE from 'three';
import { useControls } from 'leva';
import Boxes from './sandboxes/perf-minimal/src/boxes';
import {
  Box,
  Cylinder,
  shaderMaterial,
  Sphere,
  useTexture,
} from '@react-three/drei';

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 offset; // { "value": [0.1, 0.0], "max": [10., 10.0], "min": [-5., -5.0]}

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.xy += + offset;
    gl_Position = projectionMatrix *  modelViewMatrix *  vec4(pos, 1.0);
  }
`;
const fragmentShader = /* glsl */ `
  uniform float amount; // { "value": 0.5, "min": 0, "max": 10 }
  varying vec2 vUv;
  out vec4 glFrag;
  void main() {
    glFrag = vec4(vUv * amount, 0., 1.);
  }
`;

const MyMaterial = shaderMaterial(
  {
    amount: 0.5,
    offset: [0, -0.2],
    glslVersion: THREE.GLSL3,
  },
  vertexShader,
  fragmentShader
);

extend({ MyMaterial });

const Bob = () => {
  const bob = useTexture('../caveman.png');
  return (
    <Box position-x={-3}>
      <meshBasicMaterial map={bob} />
    </Box>
  );
};
export function App() {
  const { showCanvas } = useControls('Test', {
    showCanvas: true,
  });
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'blue' }));
  return (
    <>
      {/* frameloop={'demand'}  */}
      {showCanvas && (
        <Canvas
          concurrent
          shadows
          dpr={[1, 2]}
          performance={{ min: 0.2 }}
          orthographic
          pixelRatio={[1, 2]}
          camera={{ position: [0, 0, 10], near: 1, far: 15, zoom: 50 }}
        >
          <ambientLight />
          <Suspense fallback={null}>
            <Bob />
          </Suspense>
          <Sphere position-x={2} position-y={2} material={mat} />
          <Cylinder position-x={2} position-y={0} material={mat} />
          <Cylinder position-x={4} position-y={2}>
            <meshPhysicalMaterial />
          </Cylinder>
          <Sphere position-y={-2}>
            <myMaterial />
          </Sphere>

          <Boxes position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
          <Orbit />
          {/* <AdaptiveDpr pixelated />
          <AdaptiveEvents /> */}
          <Perf
            className={'override'}
            trackGPU={true}
            openByDefault={true}
            chart={{
              hz: 35,
              length: 120,
            }}
            colorBlind={true}
            position={'bottom-right'}
          />
        </Canvas>
      )}
      {!showCanvas && <div>Canvas OFF</div>}
    </>
  );
}
// ReactDOM.render(<App />, document.getElementById('root'));
