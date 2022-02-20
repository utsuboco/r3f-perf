import React, { FC, HTMLAttributes, memo, Suspense, useCallback, useMemo, useRef, useState } from 'react';
import { usePerfStore } from '../headless';
import { Graph, Graphpc } from '../styles';
import { PauseIcon } from '@radix-ui/react-icons';
import { Canvas, useFrame, useThree, Viewport } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { BufferGeometry, SplineCurve, Vector2, Vector3 } from 'three';
import { chart } from '..';
import { colorsGraph } from '../gui';

export interface graphData {
  curve: SplineCurve;
  maxVal: number;
  element: string;
}

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  perfContainerRef?: any;
  colorBlind?: boolean;
  showGraph?: boolean;
  chart?: chart;
}
interface TextHighHZProps {
  metric: string;
  isPerf?: boolean;
  isMemory?: boolean;
  isShadersInfo?: boolean;
  fontSize: number;
  round: number;
  color?: string;
  offsetX: number;
  offsetY?: number;
}

const TextHighHZ: FC<TextHighHZProps> = memo(({isPerf,color, isMemory, isShadersInfo, metric, fontSize,offsetY=0, offsetX, round }) => {
  const { width: w, height: h } = useThree(s=>s.viewport)
  const fpsRef = useRef<any>(null)
  useFrame(() => {
    const gl:any = usePerfStore.getState().gl
    const log = usePerfStore.getState().log
    
    if (!log || !fpsRef.current) return

    let info = log[metric]
    if (isShadersInfo) {
      info = gl.info.programs?.length
    } else if (!isPerf && gl.info.render) {
      const infos: any = isMemory? gl.info.memory : gl.info.render
      info = infos[metric]
    }

    fpsRef.current.text = (Math.round(info * Math.pow(10, round)) / Math.pow(10, round)).toFixed(round)
  })
  return (
    <Text ref={fpsRef} fontSize={fontSize} position={[-w / 2 + (offsetX) + fontSize,h/2 - offsetY - fontSize,0 ]} color={color}>
      0
    </Text>
  )
})



const TextsHighHZ: FC<PerfUIProps> = ({ colorBlind }) => {
  const [supportMemory] = useState(window.performance.memory)

  const fontSize: number = 14
  return (
    <Suspense fallback={null}>
      <TextHighHZ color={`rgb(${colorsGraph(colorBlind).fps.toString()})`} isPerf metric='fps' fontSize={fontSize} offsetX={140} round={0} />
      <TextHighHZ color={supportMemory ? `rgb(${colorsGraph(colorBlind).mem.toString()})` : ''} isPerf metric='mem' fontSize={fontSize} offsetX={80} round={0} />
      <TextHighHZ color={supportMemory ? `rgb(${colorsGraph(colorBlind).mem.toString()})` : ''} isPerf metric='maxMemory' fontSize={9} offsetX={112} offsetY={9} round={0} />
      <TextHighHZ color={`rgb(${colorsGraph(colorBlind).gpu.toString()})`} isPerf metric='gpu'  fontSize={fontSize} offsetX={10} round={3}/>
      <TextHighHZ metric='calls'  fontSize={fontSize} offsetX={200} round={0}/>
      <TextHighHZ metric='triangles'  fontSize={fontSize} offsetX={260} round={0}/>
      <TextHighHZ isMemory metric='geometries' fontSize={fontSize} offsetY={30} offsetX={0} round={0}/>
      <TextHighHZ isMemory metric='textures'  fontSize={fontSize} offsetY={30} offsetX={80} round={0}/>
      <TextHighHZ isShadersInfo metric='programs'  fontSize={fontSize} offsetY={30} offsetX={140} round={0}/>
      <TextHighHZ metric='lines'  fontSize={fontSize} offsetY={30} offsetX={200} round={0}/>
      <TextHighHZ metric='points'  fontSize={fontSize} offsetY={30} offsetX={260} round={0}/>
    </Suspense>
  );
};


const ChartCurve:FC<PerfUIProps> = ({colorBlind, chart= {length: 30, hz: 15}}) => {
  
  // Create a viewport. Units are in pixels.
  // console.log(candyGraph)
  // const coords = candyGraph.createCartesianCoordinateSystem(
  //   candyGraph.createLinearScale([0, 1], [0, viewport.width - 4]),
  //   candyGraph.createLinearScale([0, 1], [10, viewport.height - 4])
  // );
  // console.log(coords)
  const curves: any = useMemo(() => {
    return {
      fps: new Float32Array(chart.length * 3),
      mem: new Float32Array(chart.length * 3),
      gpu: new Float32Array(chart.length * 3)
    }
  }, [chart])

  const fpsRef= useRef<any>(null)
  const gpuRef= useRef<any>(null)
  const memRef= useRef<any>(null)

  const dummyVec3 = useMemo(() => new Vector3(0,0,0), [])
  const updatePoints = useCallback((element: string, factor: number = 1, ref: any, viewport: Viewport) => {
    let maxVal = 0;
    const {width: w, height: h} = viewport
    const chart = usePerfStore.getState().chart.data[element];
    if (!chart || chart.length === 0) {
      return
    }
    const padding = 6
    const paddingTop = 50
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (usePerfStore.getState().chart.circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }
        dummyVec3.set(padding + i / (len - 1) * (w - padding * 2) - w / 2,(Math.min(100, chart[id]) * factor) / 100 * (h - padding * 2 - paddingTop) - h / 2,0)
        dummyVec3.toArray(ref.attributes.position.array, i * 3)
      }
    }
    
    ref.attributes.position.needsUpdate = true;
  }, []);

  const [supportMemory] = useState(window.performance.memory)
  useFrame(({viewport}) => {
    updatePoints('fps', 1, fpsRef.current, viewport)
    updatePoints('gpu', 5, gpuRef.current, viewport)
    if (supportMemory) {
      updatePoints('mem', 1, memRef.current, viewport)
    }
  })
  return (
    <>
      <line>
        <bufferGeometry ref={fpsRef}>
          <bufferAttribute
              attachObject={['attributes', 'position']}
              count={chart.length}
              array={curves.fps}
              itemSize={3}
              needsUpdate={true}
            />
        </bufferGeometry>
        <lineBasicMaterial color={`rgb(${colorsGraph(colorBlind).fps.toString()})`} transparent opacity={0.5} />
      </line>
      <line>
        <bufferGeometry ref={gpuRef}>
          <bufferAttribute
              attachObject={['attributes', 'position']}
              count={chart.length}
              array={curves.gpu}
              itemSize={3}
              needsUpdate={true}
            />
        </bufferGeometry>
        <lineBasicMaterial color={`rgb(${colorsGraph(colorBlind).gpu.toString()})`} transparent opacity={0.5} />
      </line>
      {supportMemory && <line>
        <bufferGeometry ref={memRef}>
          <bufferAttribute
            attachObject={['attributes', 'position']}
            count={chart.length}
            array={curves.mem}
            itemSize={3}
            needsUpdate={true}
          />
        </bufferGeometry>
        <lineBasicMaterial color={`rgb(${colorsGraph(colorBlind).mem.toString()})`} transparent opacity={0.5} />
      </line>}
    </>
  );
};

export const ChartUI: FC<PerfUIProps> = ({
  colorBlind,
  chart,
  showGraph= true,
}) => {
  const canvas = useRef<any>(undefined);

  const paused = usePerfStore((state) => state.paused);
  return (
    <Graph
      style={{
        display: 'flex',
        height: showGraph ? '100px' : '60px'
      }}
    >
      <Canvas
        ref={canvas}
        orthographic
        dpr={1}
        gl={{
          antialias: false,
          alpha: true,
          stencil: false,
          depth: false,
        }}
        flat={true}
        style={{
          marginBottom: `-42px`,
          position: 'relative',
          pointerEvents: 'none',
          background: 'transparent !important',
          height: showGraph ? '100px' : '60px'
        }}
      >
        {!paused ? (
          <>
            <TextsHighHZ />
            {showGraph && <ChartCurve
              colorBlind={colorBlind}
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
