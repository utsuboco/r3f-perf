import React, { FC, useRef } from 'react';
import { FaMemory } from '@react-icons/all-files/fa/FaMemory';
import { RiCpuLine } from '@react-icons/all-files/ri/RiCpuLine';
import { RiCpuFill } from '@react-icons/all-files/ri/RiCpuFill';
import { RiRhythmLine } from '@react-icons/all-files/ri/RiRhythmLine';
import { VscPulse } from '@react-icons/all-files/vsc/VscPulse';
import { AiOutlineCodeSandbox } from '@react-icons/all-files/ai/AiOutlineCodeSandbox';
import { FaRegImages } from '@react-icons/all-files/fa/FaRegImages';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { BsTriangle } from '@react-icons/all-files/bs/BsTriangle';
import { VscActivateBreakpoints } from '@react-icons/all-files/vsc/VscActivateBreakpoints';
import { FaServer } from '@react-icons/all-files/fa/FaServer';
import { RiArrowDownSFill } from '@react-icons/all-files/ri/RiArrowDownSFill';
import { RiArrowRightSFill } from '@react-icons/all-files/ri/RiArrowRightSFill';
import { ProgramsUI } from './ui/program';
import { ChartUI } from './ui/graph';

import { Html } from './html';
import { usePerfStore, Headless } from './headless';
import { PerfProps } from '.';

import {
  Toggle,
  PerfS,
  PerfIContainer,
  PerfI,
  PerfB,
  ToggleContainer,
  ContainerScroll,
} from './styles';

interface colors {
  [index: string]: string;
}

export const colorsGraph = (colorBlind: boolean | undefined) => {
  const colors: colors = {
    fps: colorBlind ? '100, 143, 255' : '238,38,110',
    cpu: colorBlind ? '254, 254, 98' : '66,226,46',
    gpu: colorBlind ? '254,254,254' : '253,151,31',
  };
  return colors;
};

const DynamicUI: FC<PerfProps> = ({
  showGraph,
  trackCPU,
  trackGPU,
  colorBlind,
}) => {
  const log = usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);

  return log ? (
    <PerfIContainer>
      {trackCPU && (
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
      )}

      <PerfI>
        <RiCpuFill />
        <PerfB
          style={
            showGraph && trackGPU
              ? {
                  color: `rgb(${colorsGraph(colorBlind).gpu.toString()})`,
                }
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
          <FiLayers />
          <PerfB>{gl.info.render.calls === 1 ? 'call' : 'calls'}</PerfB>{' '}
          <span>{gl.info.render.calls}</span>
        </PerfI>
      )}
      {gl && (
        <PerfI>
          <BsTriangle />
          <PerfB>Triangles</PerfB> <span>{gl.info.render.triangles}</span>
        </PerfI>
      )}
    </PerfIContainer>
  ) : null;
};

const PerfUI: FC<PerfProps> = ({
  showGraph,
  trackCPU,
  trackGPU,
  colorBlind,
  openByDefault,
}) => {
  return (
    <>
      <DynamicUI
        showGraph={showGraph}
        trackGPU={trackGPU}
        trackCPU={trackCPU}
        colorBlind={colorBlind}
      />
      <PerfThree openByDefault={openByDefault} />
    </>
  );
};

const InfoUI: FC<PerfProps> = () => {
  usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);
  if (!gl) return null;
  const { info } = gl;
  return (
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
        <FaServer />
        {info.programs && (
          <>
            <PerfB>{info.programs.length === 1 ? 'shader' : 'shaders'}</PerfB>{' '}
            <span>{info.programs.length}</span>
          </>
        )}
      </PerfI>
      <PerfI>
        <RiRhythmLine />
        <PerfB>Lines</PerfB> <span>{info.render.lines}</span>
      </PerfI>
      <PerfI>
        <VscActivateBreakpoints />
        <PerfB>Points</PerfB> <span>{info.render.points}</span>
      </PerfI>
    </div>
  );
};

const ToggleEl = ({ tab, title, set }: any) => {
  const tabStore = usePerfStore((state) => state.tab);
  return (
    <Toggle
      className={`${tabStore === tab ? ' __perf_toggle_tab_active' : ''}`}
      onClick={() => {
        set(true);
        usePerfStore.setState({ tab: tab });
      }}
    >
      <span>{title}</span>
    </Toggle>
  );
};
const PerfThree: FC<PerfProps> = ({ openByDefault }) => {
  const [show, set] = React.useState(openByDefault);

  // const initialDpr = useThree((state) => state.viewport.initialDpr)

  return (
    <span>
      <TabContainers show={show} />
      <ToggleContainer className={'__perf_toggle'}>
        {/* <ToggleEl tab="inspector" title="Inspector" set={set} /> */}
        <ToggleEl tab="programs" title="Programs" set={set} />
        <ToggleEl tab="infos" title="Infos" set={set} />
        <Toggle
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
      </ToggleContainer>
    </span>
  );
};

const TabContainers = ({ show }: any) => {
  const tab = usePerfStore((state) => state.tab);

  return (
    <>
      {show && (
        <ContainerScroll>
          <div>
            {tab === 'programs' && <ProgramsUI />}
            {tab === 'infos' && <InfoUI />}
          </div>
        </ContainerScroll>
      )}
    </>
  );
};
/**
 * Performance profiler component
 */
const Gui: FC<PerfProps> = ({
  showGraph,
  colorBlind,
  trackGPU,
  trackCPU,
  openByDefault,
  className,
  position,
  chart,
}) => {
  const perfContainerRef = useRef(null);

  return (
    <>
      <Headless trackGPU={trackGPU} trackCPU={trackCPU} chart={chart} />
      {/* @ts-ignore */}
      <Html transform={false}>
        <PerfS
          className={
            (className ? ' '.concat(className) : ' ') +
            ` ${position ? position : ''}`
          }
          ref={perfContainerRef}
        >
          <PerfUI
            colorBlind={colorBlind}
            showGraph={showGraph}
            trackGPU={trackGPU}
            trackCPU={trackCPU}
            openByDefault={openByDefault}
          />
          {showGraph && (
            <ChartUI
              perfContainerRef={perfContainerRef}
              colorBlind={colorBlind}
              trackCPU={trackCPU}
              trackGPU={trackGPU}
            />
          )}
        </PerfS>
      </Html>
    </>
  );
};

export default Gui;
