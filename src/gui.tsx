import React, { FC, HTMLAttributes } from 'react';
import { FaMemory } from '@react-icons/all-files/fa/FaMemory';
import { RiCpuLine } from '@react-icons/all-files/ri/RiCpuLine';
import { RiCpuFill } from '@react-icons/all-files/ri/RiCpuFill';
import { VscPulse } from '@react-icons/all-files/vsc/VscPulse';
// import { BiTimer } from '@react-icons/all-files/bi/BiTimer';
import { AiOutlineCodeSandbox } from '@react-icons/all-files/ai/AiOutlineCodeSandbox';
import { FaRegImages } from '@react-icons/all-files/fa/FaRegImages';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { BsTriangle } from '@react-icons/all-files/bs/BsTriangle';
import { VscActivateBreakpoints } from '@react-icons/all-files/vsc/VscActivateBreakpoints';
// import { RiRhythmLine } from '@react-icons/all-files/ri/RiRhythmLine';
import { FaServer } from '@react-icons/all-files/fa/FaServer';
import { RiArrowDownSFill } from '@react-icons/all-files/ri/RiArrowDownSFill';
import { RiArrowRightSFill } from '@react-icons/all-files/ri/RiArrowRightSFill';
import { GiPauseButton } from '@react-icons/all-files/gi/GiPauseButton';
import styles from './index.module.css';
import { Html } from './html';
import { usePerfStore, Headless } from './headless';
import PriceChart from './chart';
import { PerfProps } from '.';

interface colors {
  [index: string]: string;
}
export interface graphData {
  points: string[][];
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

const ChartUI: FC<PerfUIProps> = ({ colorBlind, trackGPU }) => {
  const { circularId, data } = usePerfStore((state) => state.chart);
  const toPoints = (element: string, factor: number = 1) => {
    let maxVal = 0;
    let points = [];
    const chart = data[element];

    if (!chart || chart.length === 0) {
      return [0];
    }
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }
        const val: string[] = [
          ((200 * i) / (len - 1)).toFixed(1),
          (Math.min(100, chart[id]) * factor).toFixed(1),
        ];
        points.push(val);
      }
    }
    const graph: graphData = {
      points,
      maxVal,
      element,
    };
    return graph;
  };

  const paused = usePerfStore((state) => state.paused);
  return (
    <div className={styles.graphc}>
      <svg
        height="0"
        width="0"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 320 65"
        style={{ height: 0 }}
      >
        <defs>
          <linearGradient id={`fpsgrad`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).fps},.7)`}
            />
            <stop
              offset="20%"
              stopColor={`rgb(${colorsGraph(colorBlind).fps},.7)`}
            />
            <stop offset="60%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`fpsgradFade`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).fps},.2)`}
            />
            <stop
              offset="20%"
              stopColor={`rgb(${colorsGraph(colorBlind).fps},.2)`}
            />
            <stop offset="60%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id={`cpugrad`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).cpu},.7)`}
            />
            <stop
              offset="60%"
              stopColor={`rgb(${colorsGraph(colorBlind).cpu},.7)`}
            />
            <stop offset="90%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`cpugradFade`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).cpu},.2)`}
            />
            <stop
              offset="60%"
              stopColor={`rgb(${colorsGraph(colorBlind).cpu},.2)`}
            />
            <stop offset="90%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id={`gpugrad`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).gpu},${
                colorBlind ? '1' : '.7'
              })`}
            />
            <stop
              offset="70%"
              stopColor={`rgb(${colorsGraph(colorBlind).gpu},${
                colorBlind ? '1' : '.7'
              })`}
            />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`gpugradFade`} gradientTransform="rotate(90)">
            <stop
              offset="0%"
              stopColor={`rgb(${colorsGraph(colorBlind).gpu},.2)`}
            />
            <stop
              offset="70%"
              stopColor={`rgb(${colorsGraph(colorBlind).gpu},.2)`}
            />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      <PriceChart points={toPoints('fps')} colorBlind={colorBlind} />
      <PriceChart points={toPoints('cpu', 0.6)} colorBlind={colorBlind} />
      {trackGPU && (
        <PriceChart points={toPoints('gpu', 0.6)} colorBlind={colorBlind} />
      )}
      {paused && (
        <div className={styles.graphp}>
          <GiPauseButton /> PAUSED
        </div>
      )}
    </div>
  );
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
      <i>
        <RiCpuLine className={styles.sbg} />
        <b
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).cpu})` } : {}
          }
        >
          CPU
        </b>{' '}
        <span>{(Math.round(log.cpu * 100) / 100 || 0).toFixed(2)}%</span>
      </i>
      <i>
        <RiCpuFill className={styles.sbg} />
        <b
          style={
            showGraph && trackGPU
              ? { color: `rgb(${colorsGraph(colorBlind).gpu})` }
              : {}
          }
        >
          GPU
        </b>{' '}
        <span>{(Math.round(log.gpu * 1000) / 1000 || 0).toFixed(2)}</span>
        <small>ms</small>
      </i>
      <i>
        <FaMemory className={styles.sbg} />
        <b>Memory</b> {log.mem}
        <small>mb</small>
      </i>
      <i>
        <VscPulse className={styles.sbg} />
        <b
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).fps})` } : {}
          }
        >
          FPS
        </b>{' '}
        <span>{log.fps}</span>
      </i>
      {gl && (
        <i>
          <BsTriangle className={styles.sbg} />
          <b>Triangles</b> <span>{gl.info.render.triangles}</span>
        </i>
      )}
      {/* <i>
        <BiTimer className={styles.sbg} />
        <b>Time</b> {log.totalTime}
        <small>ms</small>
      </i> */}
      {gl && <PerfThree openByDefault={openByDefault} />}
    </div>
  ) : null;
};

const PerfThree: FC<PerfProps> = ({ openByDefault }) => {
  const { info } = usePerfStore((state) => state.gl);
  const [show, set] = React.useState(openByDefault);
  return (
    <span>
      {info && show && (
        <div>
          <i>
            <AiOutlineCodeSandbox className={styles.sbg} />
            <b>
              {info.memory.geometries === 1 ? 'Geometry' : 'Geometries'}
            </b>{' '}
            <span>{info.memory.geometries}</span>
          </i>
          <i>
            <FaRegImages className={styles.sbg} />
            <b>{info.memory.textures === 1 ? 'Texture' : 'Textures'}</b>{' '}
            <span>{info.memory.textures}</span>
          </i>
          <i>
            <FiLayers className={styles.sbg} />
            <b>{info.render.calls === 1 ? 'call' : 'calls'}</b>{' '}
            <span>{info.render.calls}</span>
          </i>
          <i>
            <FaServer className={styles.sbg} />
            <b>{info.programs.length === 1 ? 'shader' : 'shaders'}</b>{' '}
            <span>{info.programs.length}</span>
          </i>
          {/* <i>
            <RiRhythmLine className={styles.sbg} />
            <b>Lines</b> <span>{info.render.lines}</span>
          </i> */}
          <i>
            <VscActivateBreakpoints className={styles.sbg} />
            <b>Points</b> <span>{info.render.points}</span>
          </i>
        </div>
      )}
      <div
        className={styles.toggle}
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
      </div>
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
      <Html
        className={
          (className ? (styles.perf + ' ').concat(className) : styles.perf) +
          ` ${position ? styles[position] : ''}`
        }
      >
        <PerfUI
          colorBlind={colorBlind}
          showGraph={showGraph}
          trackGPU={trackGPU}
          openByDefault={openByDefault}
        />
        {showGraph && <ChartUI colorBlind={colorBlind} trackGPU={trackGPU} />}
      </Html>
    </>
  );
};

export default Gui;
