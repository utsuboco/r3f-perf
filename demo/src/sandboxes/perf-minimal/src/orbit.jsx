import React, { useEffect, useRef } from 'react';
import { extend, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three-stdlib';

extend({ OrbitControls });

export function Orbit() {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const regress = useThree((state) => state.performance.regress);
  const ref = useRef();
  useEffect(() => {
    const onChange = () => (invalidate(), regress());
    ref.current?.connect(gl.domElement);
    ref.current?.addEventListener('change', onChange);
    return () => {
      ref.current?.dispose();
      ref.current?.removeEventListener('change', onChange);
    };
  }, []);
  // @ts-ignore
  return <orbitControls ref={ref} args={[camera]} />;
}
