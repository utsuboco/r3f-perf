import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Canvas, useFrame } from 'react-three-fiber'
import { Perf } from '../dist';
import './index.css'

function Box(props) {
  const mesh = React.useRef(null)

  const [hovered, setHover] = React.useState(false)
  const [active, setActive] = React.useState(false)

  useFrame(() => {
    if (mesh && mesh.current) {
      mesh.current.rotation.x = mesh.current.rotation.y += 0.01
    }
  })

  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? [1.5, 1.5, 1.5] : [1, 1, 1]}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}>
      <boxBufferGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
    </mesh>
  )
}

const App = () => {
  return (
    <>
      <Canvas>
        <Perf />
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <Box position={[-1.2, 0, 0]} />
        <Box position={[1.2, 0, 0]} />
      </Canvas>
    </>
  )
  // return 
}

ReactDOM.render(<App />, document.getElementById('root'));
