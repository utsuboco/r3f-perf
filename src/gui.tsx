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
import { RiRhythmLine } from '@react-icons/all-files/ri/RiRhythmLine';
import { RiArrowDownSFill } from '@react-icons/all-files/ri/RiArrowDownSFill';
import { RiArrowRightSFill } from '@react-icons/all-files/ri/RiArrowRightSFill';
import styles from './index.module.css';
import { Html } from './html';
import { usePerfStore, Headless } from './headless';
import PriceChart from './chart';
import { PerfProps } from '.';

const ChartUI = () => {
  const { circularId, data } = usePerfStore((state) => state.chart);
  const toPoints = (chart: number[], factor: number = 1) => {
    let maxVal = 0;
    let points = [];
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
        points.push([
          ((200 * i) / (len - 1)).toFixed(1),
          (Math.min(100, chart[id]) * factor).toFixed(1),
        ]);
      }
    }
    return [points, maxVal];
  };

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
          <linearGradient id={`Patterngrad`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(238,38,110,.7)" />
            <stop offset="20%" stopColor="rgba(238,38,110,.7)" />
            <stop offset="60%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`PatterngradFade`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(238,38,110,.2)" />
            <stop offset="20%" stopColor="rgba(238,38,110,.2)" />
            <stop offset="60%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id={`PatternCpugrad`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(253,151,31,.7)" />
            <stop offset="60%" stopColor="rgba(253,151,31,.7)" />
            <stop offset="90%" stopColor="transparent" />
          </linearGradient>
          <linearGradient
            id={`PatternCpugradFade`}
            gradientTransform="rotate(90)"
          >
            <stop offset="0%" stopColor="rgba(253,151,31,.2)" />
            <stop offset="60%" stopColor="rgba(253,151,31,.2)" />
            <stop offset="90%" stopColor="transparent" />
          </linearGradient>

          <linearGradient id={`PatternGpugrad`} gradientTransform="rotate(90)">
            <stop offset="0%" stopColor="rgba(66,226,46,.7)" />
            <stop offset="70%" stopColor="rgba(66,226,46,.7)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient
            id={`PatternGpugradFade`}
            gradientTransform="rotate(90)"
          >
            <stop offset="0%" stopColor="rgba(66,226,46,.2)" />
            <stop offset="70%" stopColor="rgba(66,226,46,.2)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
      <PriceChart points={toPoints(data.fps)} pattern={'Pattern'} />
      <PriceChart points={toPoints(data.cpu, 0.6)} pattern={'PatternCpu'} />
      <PriceChart points={toPoints(data.gpu, 0.6)} pattern={'PatternGpu'} />
    </div>
  );
};

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  graph?: boolean;
}

const PerfUI: FC<PerfUIProps> = ({ graph }) => {
  const log = usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);
  return log ? (
    <div>
      <i>
        <RiCpuLine className={styles.sbg} />
        <b style={graph ? { color: 'rgba(253,151,31,1)' } : {}}>CPU</b>{' '}
        {Math.round(log.cpu * 100) / 100 || 0}%
      </i>
      <i>
        <RiCpuFill className={styles.sbg} />
        <b style={graph ? { color: 'rgba(166,226,46,1)' } : {}}>GPU</b>{' '}
        {Math.min(Math.round(log.gpu * 100) / 100, 100) || 0}%
      </i>
      <i>
        <FaMemory className={styles.sbg} />
        <b>Memory</b> {log.mem}
        <small>mb</small>
      </i>
      <i>
        <VscPulse className={styles.sbg} />
        <b style={graph ? { color: 'rgba(238,38,110,1)' } : {}}>FPS</b>{' '}
        {log.fps}
      </i>
      {gl && (
        <i>
          <BsTriangle className={styles.sbg} />
          <b>Triangles</b> {gl.info.render.triangles}
        </i>
      )}
      {/* <i>
        <BiTimer className={styles.sbg} />
        <b>Time</b> {log.totalTime}
        <small>ms</small>
      </i> */}
      {gl && <PerfThree />}
    </div>
  ) : null;
};

const PerfThree = () => {
  const { info } = usePerfStore((state) => state.gl);
  const [show, set] = React.useState(false);
  return (
    <span>
      {info && show && (
        <div>
          <i>
            <AiOutlineCodeSandbox className={styles.sbg} />
            <b>Geometries</b> {info.memory.geometries}
          </i>
          <i>
            <FaRegImages className={styles.sbg} />
            <b>Textures</b> {info.memory.textures}
          </i>
          <i>
            <FiLayers className={styles.sbg} />
            <b>Calls</b> {info.render.calls}
          </i>
          <i>
            <RiRhythmLine className={styles.sbg} />
            <b>Lines</b> {info.render.lines}
          </i>
          <i>
            <VscActivateBreakpoints className={styles.sbg} />
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
const Gui: FC<PerfProps> = ({ graph = true }) => {
  return (
    <>
      <Headless />
      <Html className={styles.perf}>
        <PerfUI graph={graph} />
        {graph && <ChartUI />}
      </Html>
    </>
  );
};

export default Gui;
