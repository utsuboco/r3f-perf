import { FC, useMemo, useRef } from 'react';
import { matriceCount, matriceWorldCount } from './PerfHeadless';
import { Graph, Graphpc } from '../styles';
import { PauseIcon } from '@radix-ui/react-icons';
import { Canvas, useFrame, Viewport } from '@react-three/fiber';
import { getPerf, usePerf } from '..';
import { colorsGraph } from './Perf';
import * as THREE from 'three';
import { PerfUIProps } from '../typings';
import { TextsHighHZ } from './TextsHighHZ';

export interface graphData {
  curve: THREE.SplineCurve;
  maxVal: number;
  element: string;
}


const ChartCurve:FC<PerfUIProps> = ({colorBlind, minimal, chart= {length: 120, hz: 60}}) => {

  const curves: any = useMemo(() => {
    return {
      fps: new Float32Array(chart.length * 3),
      cpu: new Float32Array(chart.length * 3),
      // mem: new Float32Array(chart.length * 3),
      gpu: new Float32Array(chart.length * 3)
    }
  }, [chart])

  const fpsRef= useRef<any>(null)
  const fpsMatRef= useRef<any>(null)
  const gpuRef= useRef<any>(null)
  const cpuRef= useRef<any>(null)

  const dummyVec3 = useMemo(() => new THREE.Vector3(0,0,0), [])
  const updatePoints = (element: string, factor: number = 1, ref: any, viewport: Viewport) => {
    let maxVal = 0;
    const {width: w, height: h} = viewport
    
    const chart = getPerf().chart.data[element];
    if (!chart || chart.length === 0) {
      return
    }
    const padding = minimal ? 2 : 6
    const paddingTop = minimal ? 12 : 50
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (getPerf().chart.circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }
        dummyVec3.set(padding + i / (len - 1) * (w - padding * 2) - w / 2, (Math.min(100, chart[id]) * factor) / 100 * (h - padding * 2 - paddingTop) - h / 2, 0)
        
        dummyVec3.toArray(ref.attributes.position.array, i * 3)
      }
    }
    
    ref.attributes.position.needsUpdate = true;
  };

  // const [supportMemory] = useState(window.performance.memory)
  useFrame(function updateChartCurve({viewport}) {
    
    updatePoints('fps', 1, fpsRef.current, viewport)
    if (fpsMatRef.current) {
      fpsMatRef.current.color.set(getPerf().overclockingFps ? colorsGraph(colorBlind).overClock.toString() : `rgb(${colorsGraph(colorBlind).fps.toString()})`)
    }
    updatePoints('gpu', 5, gpuRef.current, viewport)
    // if (supportMemory) {
      updatePoints('cpu', 5, cpuRef.current, viewport)
    // }
  })
  return (
    <>
      {/* @ts-ignore */}
      <line onUpdate={(self)=>{
          self.updateMatrix()
          matriceCount.value -= 1
          self.matrixWorld.copy(self.matrix)
        }}>
        <bufferGeometry ref={fpsRef}>
          <bufferAttribute
              attach={'attributes-position'}
              count={chart.length}
              array={curves.fps}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
              needsUpdate
            />
        </bufferGeometry>
        <lineBasicMaterial ref={fpsMatRef} color={`rgb(${colorsGraph(colorBlind).fps.toString()})`} transparent opacity={0.5} />
      </line>
      {/* @ts-ignore */}
      <line onUpdate={(self)=>{
          self.updateMatrix()
          matriceCount.value -= 1
          self.matrixWorld.copy(self.matrix)
        }}>
        <bufferGeometry ref={gpuRef}>
          <bufferAttribute
              attach={'attributes-position'}
              count={chart.length}
              array={curves.gpu}
              itemSize={3}
              usage={THREE.DynamicDrawUsage}
              needsUpdate
            />
        </bufferGeometry>
        <lineBasicMaterial color={`rgb(${colorsGraph(colorBlind).gpu.toString()})`} transparent opacity={0.5} />
      </line>
      {/* @ts-ignore */}
      <line onUpdate={(self)=>{
          self.updateMatrix()
          matriceCount.value -= 1
          self.matrixWorld.copy(self.matrix)
        }}>
        <bufferGeometry ref={cpuRef}>
          <bufferAttribute
            attach={'attributes-position'}
            count={chart.length}
            array={curves.cpu}
            itemSize={3}
            usage={THREE.DynamicDrawUsage}
            needsUpdate
          />
        </bufferGeometry>
        <lineBasicMaterial color={`rgb(${colorsGraph(colorBlind).cpu.toString()})`} transparent opacity={0.5} />
      </line>
    </>
  );
};

export const ChartUI: FC<PerfUIProps> = ({
  colorBlind,
  chart,
  customData,
  matrixUpdate,
  showGraph= true,
  antialias= true,
  minimal,
}) => {
  const canvas = useRef<any>(undefined);

  const paused = usePerf((state) => state.paused);
  return (
    <Graph
      style={{
        display: 'flex',
        position: 'absolute',
        height: `${minimal ? 37 : showGraph ? 100 : 60 }px`,
        minWidth: `${minimal ? '100px' : customData ? '370px' : '310px'}`
      }}
    >
      <Canvas
        ref={canvas}
        orthographic
        camera={{ rotation: [0, 0, 0] }}
        dpr={antialias ? [1,2] : 1}
        gl={{
          antialias: true,
          alpha: true,
          stencil: false,
          depth: false,
        }}
        onCreated={({scene}) => {
          scene.traverse((obj: THREE.Object3D)=>{
            //@ts-ignore
            obj.matrixWorldAutoUpdate=false
            obj.matrixAutoUpdate=false
          })
        }}
        flat={true}
        style={{
          marginBottom: `-42px`,
          position: 'relative',
          pointerEvents: 'none',
          background: 'transparent !important',
          height: `${minimal ? 37 : showGraph ? 100 : 60 }px`
        }}
      >
        {!paused ? (
          <>
            <Renderer />
            <TextsHighHZ customData={customData} minimal={minimal} matrixUpdate={matrixUpdate} />
            {showGraph && <ChartCurve
              colorBlind={colorBlind}
              minimal={minimal}
              chart={chart}
            />}
          </>
        ) : null}
      </Canvas>
      {paused && (
        <Graphpc>
          <PauseIcon /> PAUSED
        </Graphpc>
      )}
    </Graph>
  );
};

const Renderer = () =>{

  useFrame(function updateR3FPerf({ gl, scene, camera }) {
    camera.updateMatrix()
    matriceCount.value -= 1
    camera.matrixWorld.copy(camera.matrix)
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    gl.render(scene,camera)
    matriceWorldCount.value = 0
    matriceCount.value = 0
  }, Infinity)

  
  return null
}