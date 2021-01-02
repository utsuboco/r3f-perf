import 'react-app-polyfill/ie11';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Canvas } from 'react-three-fiber'
import { Perf } from '../dist';
import './index.css'
import {Instances, Stars} from './instances';

const App = () => {
  return (
    <>
      <Canvas camera={{ position: [0, 0, -75], fov: 45, near: 0.1, far: 100 }}>
        <Perf />
        <Instances row={30} />
        <Stars />
      </Canvas>
    </>
  )
  // return 
}

ReactDOM.render(<App />, document.getElementById('root'));
