import React, { FC, HTMLAttributes, useLayoutEffect } from 'react';
import { addEffect, addAfterEffect, useThree } from 'react-three-fiber';
import { FaMemory } from '@react-icons/all-files/fa/FaMemory';
import { RiCpuLine } from '@react-icons/all-files/ri/RiCpuLine';
import { RiCpuFill } from '@react-icons/all-files/ri/RiCpuFill';
import { VscPulse } from '@react-icons/all-files/vsc/VscPulse';
import { BiTimer } from '@react-icons/all-files/bi/BiTimer';
import { AiOutlineCodeSandbox } from '@react-icons/all-files/ai/AiOutlineCodeSandbox';
import { FaRegImages } from '@react-icons/all-files/fa/FaRegImages';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { BsTriangle } from '@react-icons/all-files/bs/BsTriangle';
import { VscActivateBreakpoints } from '@react-icons/all-files/vsc/VscActivateBreakpoints';
import { RiRhythmLine } from '@react-icons/all-files/ri/RiRhythmLine';
import { FaTools } from '@react-icons/all-files/fa/FaTools';
import { BiLayerMinus } from '@react-icons/all-files/bi/BiLayerMinus';
import GLPerf from './perf';
import create from 'zustand';
import { Html } from './html';
import styles from './index.module.css';

type State = {
  log: any;
  chart: string;
  gl: {
    info: any;
  };
};

let PerfLib: GLPerf | null;

type Logger = {
  i: number;
  cpu: number;
  gpu: number;
  mem: number;
  fps: number;
  duration: number;
  frameCount: number;
};

type Chart = {
  chart: number[];
  circularId: number;
};

const usePerfStore = create<State>(_ => ({
  log: null,
  chart: '',
  gl: {
    info: null,
  },
}));

const PerfUI = () => {
  const log = usePerfStore(state => state.log);
  const gl = usePerfStore(state => state.gl);
  // console.log(log)
  return log ? (
    <div>
      <i>
        <RiCpuLine />
        <b>CPU</b> {Math.round(log.cpu * 0.27 * 100) / 100 || 0}%
      </i>
      <i>
        <RiCpuFill />
        <b>GPU</b> {Math.round(log.gpu * 0.27 * 100) / 100 || 0}%
      </i>
      <i>
        <FaMemory />
        <b>Memory</b> {log.mem}
        <small>mb</small>
      </i>
      <i>
        <VscPulse />
        <b>FPS</b> {log.fps}
      </i>
      <i>
        <BiTimer />
        <b>Time</b> {log.totalTime}
        <small>ms</small>
      </i>
      {gl && <PerfThree />}
    </div>
  ) : null;
};

const PerfThree = () => {
  const { info } = usePerfStore(state => state.gl);
  const [show, set] = React.useState(false);
  // console.log(log)
  return (
    <span>
      {info && show && (
        <div>
          <i>
            <AiOutlineCodeSandbox />
            <b>Geometries</b> {info.memory.geometries}
          </i>
          <i>
            <FaRegImages />
            <b>Textures</b> {info.memory.textures}
          </i>
          <i>
            <FiLayers />
            <b>Calls</b> {info.render.calls}
          </i>
          <i>
            <BsTriangle />
            <b>Triangles</b> {info.render.triangles}
          </i>
          <i>
            <RiRhythmLine />
            <b>Lines</b> {info.render.lines}
          </i>
          <i>
            <VscActivateBreakpoints />
            <b>Points</b> {info.render.points}
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
            <BiLayerMinus /> MINIMIZE
          </span>
        ) : (
          <span>
            <FaTools /> MORE
          </span>
        )}
      </div>
    </span>
  );
};

export interface Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * Performance profiler component
 */
const Gui: FC<Props> = () => {
  const { gl } = useThree();
  usePerfStore.setState({ gl });

  useLayoutEffect(() => {
    if (!PerfLib) {
      PerfLib = new GLPerf({
        trackGPU: true,
        gl: gl.getContext(),
        chartLogger: (chart: Chart) => {
          // console.log(chart)
          let points = '';
          const len = chart.chart.length;
          for (let i = 0; i < len; i++) {
            const id = (chart.circularId + i + 1) % len;
            if (chart.chart[id] !== undefined) {
              points =
                points +
                ' ' +
                ((55 * i) / (len - 1)).toFixed(1) +
                ',' +
                (45 - (chart.chart[id] * 22) / 60 / 1).toFixed(1);
            }
          }
          usePerfStore.setState({ chart: points });
        },
        paramLogger: (logger: Logger) => {
          usePerfStore.setState({
            log: {
              cpu: logger.cpu,
              gpu: logger.gpu,
              mem: logger.mem,
              fps: logger.fps,
              totalTime: logger.duration,
              frameCount: logger.frameCount,
            },
          });
        },
      });
    }
    if (PerfLib) {
      const unsub1 = addEffect(() => {
        if (PerfLib) {
          PerfLib.begin('profiler');
        }
        return false;
      });
      const unsub2 = addAfterEffect(() => {
        if (PerfLib) {
          PerfLib.end('profiler');
          PerfLib.nextFrame(window.performance.now());
        }
        return false;
      });
      return () => {
        unsub1();
        unsub2();
      };
    } else {
      return undefined;
    }
  });

  return (
    <Html className={styles.perf}>
      <PerfUI />
    </Html>
  );
};

export default Gui;
