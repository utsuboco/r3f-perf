import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three"

const tempObject = new THREE.Object3D()

export const Instances = ({row}) => {
  const [hovered, setHover] = useState(null)
  const ref = useRef()
  useFrame(state => {
    const time = state.clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(time / 2)
    let i = 0
    for (let x = 0; x < row; x++)
      for (let y = 0; y < row; y++)
        for (let z = 0; z < row; z++) {
          const id = i++
          tempObject.scale.set(...([0.65, 0.65, 0.65]))
          tempObject.position.set(15 - x, 15 - y, 15 - z)
          tempObject.rotation.y = Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time)
          tempObject.rotation.z = tempObject.rotation.y * 2
          tempObject.updateMatrix()
          const scale = id === hovered ? 2 : 1
          tempObject.scale.set(scale, scale, scale)

          ref.current.setMatrixAt(id, tempObject.matrix)
        }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[null, null, row * row * row]} onPointerMove={e => setHover(e.instanceId)} onPointerOut={e => setHover(undefined)}>
      <boxBufferGeometry attach="geometry" args={[0.7, 0.7, 0.7]} />
      <meshNormalMaterial attach="material" />
    </instancedMesh>
  )
}


export const Stars = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let count = 0; count < 1000; count++) {
    const x = 200 * Math.random() - 100;
    const y = 200 * Math.random() - 100;
    const z = -25 - (25 * Math.random() - 25);

    vertices.push(x, y, z);
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );

  return (
    <points args={[geometry]}>
      <pointsMaterial
        size={2}
        attach="material" 
        sizeAttenuation={true}
        // alphaTest={0.5}
        // transparent={false}
      />
    </points>
  );
};
