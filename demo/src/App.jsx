import React, { useMemo, Suspense } from 'react';
import { Perf } from 'r3f-perf';
import './index.css';
import { Canvas, extend } from '@react-three/fiber';
import { Orbit } from './sandboxes/perf-minimal/src/orbit';
import * as THREE from 'three';
import Boxes from './sandboxes/perf-minimal/src/boxes';
import Fireflies from './fire';

import { Box, Cylinder, Text, Sphere, useTexture } from '@react-three/drei';

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
  uniform float amount; 
  uniform sampler2D albedo;
  varying vec2 vUv;
  out vec4 glFrag;
  void main() {
    glFrag = vec4(vUv * amount, 0., 1.);
  }
`;

const MyMaterial = new THREE.ShaderMaterial({
  uniforms: {
    amount: { value: 0.5 },
    offset: { value: [0, -0.2] },
    offset2: { value: new THREE.Vector4(2, 1, 2, 2) },
    albedo: { value: null },
  },
  fragmentShader,
  vertexShader,
  glslVersion: THREE.GLSL3,
});

const Bob = () => {
  const bob = useTexture('../caveman.png');
  return (
    <>
      <Box position-x={-3}>
        <shaderMaterial args={[MyMaterial]} uniforms-albedo-value={bob} />
      </Box>
      <Box position-x={-1}>
        <meshBasicMaterial map={bob} />
      </Box>
    </>
  );
};

export function App() {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'blue' }));
  return (
    <>
      {/* frameloop={'demand'}  */}
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
          <Fireflies count={30} />
        </Suspense>

        <Sphere position-x={2} position-y={2} material={mat} />
        <Cylinder position-x={2} position-y={0} material={mat} />
        {/* <Cylinder position-x={4} position-y={2}>
            <meshPhysicalMaterial />
          </Cylinder> */}
        {/* <Sphere position-y={-2}>
            <meshBasicMaterial />
          </Sphere> */}
        <Text
          color="black"
          anchorX="center"
          anchorY="middle"
          fontSize={0.4}
          maxWidth={200}
          lineHeight={1}
          letterSpacing={0.02}
          textAlign={'left'}
          font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
          outlineWidth={0.07}
          outlineColor="#ffffff"
          rotation={[0, -0.6, 0]}
          position={[-2, -2, 0]}
        >
          Some 3D Text
        </Text>
        <Boxes position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
        <Orbit />
        {/* <AdaptiveDpr pixelated />
          <AdaptiveEvents /> */}
        <Perf
          className={'override'}
          trackGPU={true}
          // trackCPU={true}
          openByDefault={true}
          chart={{
            hz: 35,
            length: 120,
          }}
          // colorBlind={true}
          position={'bottom-right'}
        />
      </Canvas>
    </>
  );
}
// ReactDOM.render(<App />, document.getElementById('root'));
