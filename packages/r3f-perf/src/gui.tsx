import React, { FC, HTMLAttributes, useEffect, useRef } from 'react';
import { FaMemory } from '@react-icons/all-files/fa/FaMemory';
import { RiCpuLine } from '@react-icons/all-files/ri/RiCpuLine';
import { RiCpuFill } from '@react-icons/all-files/ri/RiCpuFill';
import { VscPulse } from '@react-icons/all-files/vsc/VscPulse';
import { AiOutlineCodeSandbox } from '@react-icons/all-files/ai/AiOutlineCodeSandbox';
import { FaRegImages } from '@react-icons/all-files/fa/FaRegImages';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { BsTriangle } from '@react-icons/all-files/bs/BsTriangle';
import { VscActivateBreakpoints } from '@react-icons/all-files/vsc/VscActivateBreakpoints';
import { FaServer } from '@react-icons/all-files/fa/FaServer';
import { RiArrowDownSFill } from '@react-icons/all-files/ri/RiArrowDownSFill';
import { RiArrowRightSFill } from '@react-icons/all-files/ri/RiArrowRightSFill';
import { GiPauseButton } from '@react-icons/all-files/gi/GiPauseButton';
import { Html } from './html';
import { usePerfStore, Headless } from './headless';
import { PerfProps } from '.';
import { Toggle, PerfS, PerfI, PerfB, Graphpc, Graph } from './styles';
import { CandyGraph } from 'candygraph';

interface colors {
  [index: string]: string;
}
export interface graphData {
  pointsX: number[];
  pointsY: number[];
  maxVal: number;
  element: string;
}

export const colorsGraph = (colorBlind: boolean | undefined) => {
  const colors: colors = {
    fps: colorBlind ? '100, 143, 255' : '238,38,110',
    cpu: colorBlind ? '254, 254, 98' : '66,226,46',
    gpu: colorBlind ? '254,254,254' : '253,151,31',
  };
  return colors;
};

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  colorBlind?: boolean;
  trackGPU?: boolean;
}
const ChartCurve = ({
  cg,
  viewport,
  coords,
  canvas,
  colorBlind,
  trackGPU,
}: any) => {
  const { circularId, data } = usePerfStore((state) => state.chart);
  const toPoints = (element: string, factor: number = 1) => {
    let maxVal = 0;
    let pointsX = [];
    let pointsY = [];
    const chart = data[element];
    if (!chart || chart.length === 0) {
      return {
        pointsX: [0],
        pointsY: [0],
      };
    }
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }

        pointsX.push(i / (len - 1));
        pointsY.push((Math.min(100, chart[id]) * factor) / 100);
      }
    }
    const graph: graphData = {
      pointsX,
      pointsY,
      maxVal,
      element,
    };
    return graph;
  };

  useEffect(() => {
    const graphs: any = [toPoints('fps'), toPoints('cpu')];
    if (trackGPU) {
      graphs.push(toPoints('gpu'));
    }
    // const renderChart = async () => {
    const fps = graphs[0];
    const cpu = graphs[1];
    const gpu = graphs[2];
    const xs = [];
    const ys = [];

    for (let x = 0; x <= 1; x += 0.001) {
      xs.push(x);
      ys.push(0.5 + 0.25 * Math.sin(x * 2 * Math.PI));
    }
    // fps
    cg.clear([0.141, 0.141, 0.141, 1]);
    cg.render(coords, viewport, [
      cg.lineStrip(fps.pointsX, fps.pointsY, {
        colors: colorBlind
          ? [100 / 255, 143 / 255, 255 / 255, 1]
          : [238 / 255, 38 / 255, 110 / 255, 1],
        widths: 1.5,
      }),
      cg.lineStrip(gpu.pointsX, gpu.pointsY, {
        colors: colorBlind
          ? [254 / 255, 254 / 255, 255 / 255, 1]
          : [253 / 255, 151 / 255, 31 / 255, 1],
        widths: 1.5,
      }),
      cg.lineStrip(cpu.pointsX, cpu.pointsY, {
        colors: colorBlind
          ? [254 / 255, 254 / 255, 98 / 255, 1]
          : [66 / 255, 226 / 255, 46 / 255, 1],
        widths: 1.5,
      }),
    ]);

    cg.copyTo(viewport, canvas.current);
  }, [circularId]);

  // console.log('render');

  // };
  return null;
};
const ChartUI: FC<PerfUIProps> = ({ colorBlind, trackGPU }) => {
  const canvas = useRef<any>(undefined);
  const cg = new CandyGraph();

  cg.canvas.width = 310;
  cg.canvas.height = 100;
  // Create a viewport. Units are in pixels.
  const viewport = {
    x: 0,
    y: 0,
    width: cg.canvas.width,
    height: cg.canvas.height,
  };
  const coords = cg.coordinate.cartesian(
    cg.scale.linear([0, 1], [0, viewport.width - 4]),
    cg.scale.linear([0, 1], [10, viewport.height - 4])
  );

  useEffect(() => {
    if (canvas.current) {
      cg.copyTo(viewport, canvas.current);
    }
  }, [canvas.current]);

  const paused = usePerfStore((state) => state.paused);
  return (
    <Graph>
      <canvas
        ref={canvas}
        style={{
          width: `${cg.canvas.width}px`,
          height: `${cg.canvas.height}px`,
          marginBottom: `-42px`,
          position: 'relative',
        }}
      >
        {!paused && (
          <ChartCurve
            colorBlind={colorBlind}
            trackGPU={trackGPU}
            cg={cg}
            canvas={canvas}
            viewport={viewport}
            coords={coords}
          />
        )}
      </canvas>
      {paused && (
        <Graphpc>
          <GiPauseButton /> PAUSED
        </Graphpc>
      )}
    </Graph>
  );
  //     {trackGPU && (
  //       <PriceChart points={toPoints('gpu', 0.6)} colorBlind={colorBlind} />
  //     )}
  //     {paused && (
  //       <Graphpc>
  //         <GiPauseButton /> PAUSED
  //       </Graphpc>
  //     )}
  //   </Graph>
  // );
};

const PerfUI: FC<PerfProps> = ({
  showGraph,
  trackGPU,
  colorBlind,
  openByDefault,
}) => {
  const log = usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);
  return log ? (
    <div>
      <PerfI>
        <RiCpuLine />
        <PerfB
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).cpu})` } : {}
          }
        >
          CPU
        </PerfB>{' '}
        <span>{(Math.round(log.cpu * 100) || 0).toFixed(2)}%</span>
      </PerfI>
      <PerfI>
        <RiCpuFill />
        <PerfB
          style={
            showGraph && trackGPU
              ? { color: `rgb(${colorsGraph(colorBlind).gpu})` }
              : {}
          }
        >
          GPU
        </PerfB>{' '}
        <span>{(Math.round(log.gpu * 1000) / 1000 || 0).toFixed(2)}</span>
        <small>ms</small>
      </PerfI>
      <PerfI>
        <FaMemory />
        <PerfB>Memory</PerfB> {log.mem}
        <small>mb</small>
      </PerfI>
      <PerfI>
        <VscPulse />
        <PerfB
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).fps})` } : {}
          }
        >
          FPS
        </PerfB>{' '}
        <span>{log.fps}</span>
      </PerfI>
      {gl && (
        <PerfI>
          <BsTriangle />
          <PerfB>Triangles</PerfB> <span>{gl.info.render.triangles}</span>
        </PerfI>
      )}
      {/* <PerfI>
        <BiTimer/>
        <PerfB>Time</PerfB> {log.totalTime}
        <small>ms</small>
      </PerfI> */}
      {gl && <PerfThree openByDefault={openByDefault} />}
    </div>
  ) : null;
};

const PerfThree: FC<PerfProps> = ({ openByDefault }) => {
  const { info } = usePerfStore((state) => state.gl);
  const [show, set] = React.useState(openByDefault);
  // const initialDpr = useThree((state) => state.viewport.initialDpr)

  return (
    <span>
      {info && show && (
        <div>
          <PerfI>
            <AiOutlineCodeSandbox />
            <PerfB>
              {info.memory.geometries === 1 ? 'Geometry' : 'Geometries'}
            </PerfB>{' '}
            <span>{info.memory.geometries}</span>
          </PerfI>
          <PerfI>
            <FaRegImages />
            <PerfB>
              {info.memory.textures === 1 ? 'Texture' : 'Textures'}
            </PerfB>{' '}
            <span>{info.memory.textures}</span>
          </PerfI>
          <PerfI>
            <FiLayers />
            <PerfB>{info.render.calls === 1 ? 'call' : 'calls'}</PerfB>{' '}
            <span>{info.render.calls}</span>
          </PerfI>
          <PerfI>
            <FaServer />
            <PerfB>
              {info.programs.length === 1 ? 'shader' : 'shaders'}
            </PerfB>{' '}
            <span>{info.programs.length}</span>
          </PerfI>
          {/* <PerfI>
            <RiRhythmLine/>
            <PerfB>Lines</PerfB> <span>{info.render.lines}</span>
          </PerfI> */}
          <PerfI>
            <VscActivateBreakpoints />
            <PerfB>Points</PerfB> <span>{info.render.points}</span>
          </PerfI>
        </div>
      )}
      <Toggle
        className={'__perf_toggle'}
        onClick={() => {
          set(!show);
        }}
      >
        {show ? (
          <span>
            <RiArrowDownSFill /> Minimize
          </span>
        ) : (
          <span>
            <RiArrowRightSFill /> More
          </span>
        )}
      </Toggle>
    </span>
  );
};

/**
 * Performance profiler component
 */
const Gui: FC<PerfProps> = ({
  showGraph,
  colorBlind,
  trackGPU,
  openByDefault,
  className,
  position,
  chart,
}) => {
  return (
    <>
      <Headless trackGPU={trackGPU} chart={chart} />
      {/* @ts-ignore */}
      <Html transform={false}>
        <PerfS
          className={
            (className ? ' '.concat(className) : ' ') +
            ` ${position ? position : ''}`
          }
        >
          <PerfUI
            colorBlind={colorBlind}
            showGraph={showGraph}
            trackGPU={trackGPU}
            openByDefault={openByDefault}
          />
          {showGraph && <ChartUI colorBlind={colorBlind} trackGPU={trackGPU} />}
        </PerfS>
      </Html>
    </>
  );
};

export default Gui;
