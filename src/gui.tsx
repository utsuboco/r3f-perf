import React, { FC, HTMLAttributes } from 'react';
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
import styles from './index.module.css';
import { Html } from './html';
import { usePerfStore, Headless } from './headless';

const PerfUI = () => {
  const log = usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);
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
  const { info } = usePerfStore((state) => state.gl);
  const [show, set] = React.useState(false);
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
  return (
    <>
      <Headless />
      <Html className={styles.perf}>
        <PerfUI />
      </Html>
    </>
  );
};

export default Gui;
