import React, { useState, useRef, useEffect, useCallback } from 'react'
import * as ReactDOM from 'react-dom';
import { Perf } from 'r3f-perf';
import './index.css'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Orbit } from './sandboxes/perf-minimal/src/orbit';
import { AdaptiveDpr, AdaptiveEvents } from './sandboxes/perf-minimal/src/adaptative';
import { useControls } from 'leva';
import Boxes from './sandboxes/perf-minimal/src/boxes';

export default function App() {
  const { showCanvas } = useControls('Test', {
    showCanvas: true
  });

  return (
    <>
    {/* frameloop={'demand'}  */}
      {showCanvas && (
      <Canvas concurrent shadows dpr={[1, 2]} frameloop={'demand'} performance={{min: 0.2}}  orthographic pixelRatio={[1, 2]} camera={{ position: [0, 0, 10], near: 1, far: 15, zoom: 50 }}>
        <ambientLight />
        <Boxes position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />
        <group>

        </group>
        <Orbit />
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />
        <Perf className={'override'} trackGPU={true} openByDefault={true} showGraph={true} position={'bottom-left'} />
      </Canvas>
      )}
      {!showCanvas && <div>Canvas OFF</div>}
    </>
  )
}
ReactDOM.render(<App />, document.getElementById('root'));
