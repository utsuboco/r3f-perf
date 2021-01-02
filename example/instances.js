import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "react-three-fiber";
import * as THREE from "three"

export const Instances = ({row}) => {
  const [hovered, setHover] = useState(null)
  const geometry = new THREE.BoxBufferGeometry()
  const ref = useRef()
  const group = new THREE.Object3D()
  // useMemo(() => geometry.computeVertexNormals(), [geometry])
  useFrame(state => {
    const time = state.clock.getElapsedTime()
    ref.current.rotation.y = Math.sin(time / 2)
    let i = 0
    for (let x = 0; x < row; x++)
      for (let y = 0; y < row; y++)
        for (let z = 0; z < row; z++) {
          const id = i++
          group.scale.set(...([0.65, 0.65, 0.65]))
          group.position.set(20 - x, 20 - y, 20 - z)
          group.rotation.y = Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time)
          group.rotation.z = group.rotation.y * 2
          group.updateMatrix()
          ref.current.setMatrixAt(id, group.matrix)
        }
    ref.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={ref} args={[geometry, null, row * row * row]}>
      <meshNormalMaterial />
    </instancedMesh>
  )
}


export const Stars = () => {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  for (let count = 0; count < 1000; count++) {
    const x = 200 * Math.random() - 100;
    const y = 200 * Math.random() - 100;
    const z = 200 * Math.random() - 100;

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
        sizeAttenuation={true}
        // alphaTest={0.5}
        // transparent={false}
      />
    </points>
  );
};
