import React, { useMemo, useEffect, useRef, useState } from 'react'
import './index.css'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Orbit } from './sandboxes/perf-minimal/src/orbit'
import * as THREE from 'three'
import { useControls } from 'leva'

import { Box, useTexture, Instances, Instance } from '@react-three/drei'
import { PerfHeadless, Perf, usePerf, setCustomData } from 'r3f-perf'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  uniform vec2 offset; // { "value": [0.1, 0.0], "max": [10., 10.0], "min": [-5., -5.0]}

  void main() {
    vUv = uv;
    vec3 pos = position;
    pos.xy += + offset;
    gl_Position = projectionMatrix *  modelViewMatrix *  vec4(pos, 1.0);
  }
`
const fragmentShader = /* glsl */ `
  uniform float amount; 
  uniform sampler2D albedo;
  varying vec2 vUv;
  out vec4 glFrag;
  void main() {
    glFrag = vec4(vUv * amount, 0., 1.);
  }
`

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
})

const Bob = () => {
  const bob = useTexture('../caveman.png')
  return (
    <>
      <Box position-x={-3}>
        <shaderMaterial args={[MyMaterial]} uniforms-albedo-value={bob} />
      </Box>
      <Box position-x={-1}>
        <meshPhysicalMaterial map={bob} />
      </Box>
    </>
  )
}

const UpdateCustomData = () => {
  // recommended to throttle to 1sec for readability
  const { width } = useThree((s) => s.size)
  const { noUI } = useControls({ noUI: true })

  const [getReport] = usePerf((s) => [s.getReport])

  useFrame(() => {
    setCustomData(30 + Math.random() * 5)
  })

  return noUI ? (
    <PerfHeadless overClock minimal={width < 712} matrixUpdate />
  ) : (
    <Perf
      className={'override'}
      showGraph
      overClock={true}
      deepAnalyze
      chart={{
        hz: 35,
        length: 60,
      }}
      position='bottom-left'
      minimal={width < 712}
      style={{}}
      customData={{
        value: 30,
        name: 'physic',
        info: 'fps',
      }}
      matrixUpdate
      // colorBlind={true}
    />
  )
}

const color = new THREE.Color()
const randomVector = (r) => [r / 2 - Math.random() * r, r / 2 - Math.random() * r, r / 2 - Math.random() * r]
const randomEuler = () => [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
const randomData = Array.from({ length: 2000 }, (r = 10) => ({
  random: Math.random(),
  position: randomVector(r),
  rotation: randomEuler(),
}))

function Shoes() {
  const scene = useThree((s) => s.scene)
  const { range, autoUpdate } = useControls({ autoUpdate: false, range: { value: 800, min: 0, max: 2000, step: 10 } })

  useEffect(() => {
    scene.matrixWorldAutoUpdate = autoUpdate
    scene.updateMatrixWorld()
    //   // basically what it does
    //   if (autoUpdate) {
    //     scene.traverse((obj) => (obj.matrixAutoUpdate = true))
    //   } else {
    //     scene.traverse((obj) => (obj.matrixAutoUpdate = false))
    //   }
  }, [scene, autoUpdate])

  return (
    <Instances range={range}>
      <boxGeometry args={[0.3, 0.3, 0.3, 10, 10]} />
      <meshPhongMaterial />
      {randomData.map((props, i) => (
        <Shoe key={i} {...props} />
      ))}
    </Instances>
  )
}

function Shoe({ random, ...props }) {
  const ref = useRef()
  const [hovered, setHover] = useState(false)
  useFrame((state) => {
    const t = state.clock.getElapsedTime() + random * 10000
    ref.current.rotation.set(Math.cos(t / 4) / 2, Math.sin(t / 4) / 2, Math.cos(t / 1.5) / 2)
    ref.current.position.y = Math.sin(t / 1.5) / 2
    ref.current.scale.x =
      ref.current.scale.y =
      ref.current.scale.z =
        THREE.MathUtils.lerp(ref.current.scale.z, hovered ? 1.4 : 1, 0.1)
    ref.current.color.lerp(color.set(hovered ? 'red' : 'white'), hovered ? 1 : 0.1)
  })
  return (
    <group {...props}>
      <Instance ref={ref} />
    </group>
  )
}

export function App() {
  const { otherboxes, mountCanvas, aa, boxes } = useControls({
    enable: true,
    mountCanvas: true,
    minimal: true,
    boxes: true,
    otherboxes: false,
    aa: false,
  })
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: 'blue' }))

  // const { average } = usePerf();

  // average = {
  //   fps: 0,
  //   loop: 0,
  //   cpu: 0,
  //   gpu:  0,
  // }

  return mountCanvas ? (
    <>
      {/* frameloop={'demand'}  */}
      <Canvas
        concurrent={'true'}
        gl={{
          antialias: aa,
        }}
        dpr={1}
        onCreated={({ scene }) => (scene.matrixWorldAutoUpdate = false)}
        performance={{ min: 0.2 }}
        orthographic
        camera={{ position: [0, 0, 10], near: 1, far: 15, zoom: 50 }}>
        <pointLight />
        {/* <Suspense fallback={null}>
          <Bob />
          <Fireflies count={30} />
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
        </Suspense> */}

        {/* <Sphere position-x={2} position-y={2} material={mat} /> */}
        {/* <Cylinder position-x={2} position-y={0} material={mat} />
        {/* <Cylinder position-x={4} position-y={2}>
            <meshPhysicalMaterial />
          </Cylinder> */}
        {/* <Sphere position-y={-2}>
            <meshBasicMaterial />
          </Sphere> */}

        {/* {otherboxes && <Boxes position={[0, 0, 0]} rotation={[0, 0, Math.PI]} />} */}
        {boxes && <Shoes />}
        {otherboxes && (
          <>
            <Shoes />
            <Shoes />
            <Shoes />
            <Shoes />
            <Shoes />
          </>
        )}
        <Orbit />
        {/* {enable && <UpdateCustomData />} */}
        <UpdateCustomData />
      </Canvas>
      {/* <PerfHook /> */}
    </>
  ) : null
}
