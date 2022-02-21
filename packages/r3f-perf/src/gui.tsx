import React, { FC, useRef } from 'react';
import { ChartUI } from './ui/graph';
import { ActivityLogIcon, BarChartIcon, Crosshair1Icon, DotIcon, ImageIcon, LapTimerIcon, LightningBoltIcon, MarginIcon, MinusIcon, PaddingIcon, RulerHorizontalIcon, TextAlignJustifyIcon, TriangleDownIcon, TriangleUpIcon, VercelLogoIcon } from '@radix-ui/react-icons'

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
  PerfSmallI,
} from './styles';
import { ProgramsUI } from './ui/program';

interface colors {
  [index: string]: string;
}

export const colorsGraph = (colorBlind: boolean | undefined) => {
  const colors: colors = {
    fps: colorBlind ? '100, 143, 255' : '238,38,110',
    mem: colorBlind ? '254, 254, 98' : '66,226,46',
    gpu: colorBlind ? '254,254,254' : '253,151,31',
  };
  return colors;
};

const DynamicUI: FC<PerfProps> = ({
  showGraph,
  colorBlind,
}) => {
  const gl = usePerfStore((state) => state.gl);

  return gl ? (
    <PerfIContainer>
      <PerfI>
        <LightningBoltIcon />
        <PerfB
          style={
            showGraph
              ? {
                  color: `rgb(${colorsGraph(colorBlind).gpu.toString()})`,
                }
              : {}
          }
        >
          GPU
        </PerfB>
        <PerfSmallI>ms</PerfSmallI>
      </PerfI>
      <PerfI>
        <RulerHorizontalIcon />
        <PerfB  style={
            showGraph
              ? {
                  color: `rgb(${colorsGraph(colorBlind).mem.toString()})`,
                }
              : {}
          }>Memory</PerfB>
        <PerfSmallI>mb</PerfSmallI>
      </PerfI>
      <PerfI>
        <LapTimerIcon />
        <PerfB
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).fps})` } : {}
          }
        >
          FPS
        </PerfB>
      </PerfI>
      {gl && (
        <PerfI>
          <TextAlignJustifyIcon />
          <PerfB>{gl.info.render.calls === 1 ? 'call' : 'calls'}</PerfB>
        </PerfI>
      )}
      {gl && (
        <PerfI>
          <VercelLogoIcon />
          <PerfB>Triangles</PerfB>
        </PerfI>
      )}
    </PerfIContainer>
  ) : null;
};

const PerfUI: FC<PerfProps> = ({
  showGraph,
  colorBlind,
  deepAnalyze,
  openByDefault,
}) => {
  return (
    <>
      <DynamicUI
        showGraph={showGraph}
        colorBlind={colorBlind}
      />
      <PerfThree openByDefault={openByDefault} deepAnalyze={deepAnalyze} showGraph={showGraph} />
    </>
  );
};

const InfoUI: FC<PerfProps> = () => {
  return (
    <div>
      <PerfI>
        <MarginIcon />
        <PerfB>
          Geometries
        </PerfB>
      </PerfI>
      <PerfI>
        <ImageIcon />
        <PerfB>
          Textures
        </PerfB>
      </PerfI>
      <PerfI>
        <ActivityLogIcon />
        <PerfB>shaders</PerfB>
      </PerfI>
      <PerfI>
        <MinusIcon />
        <PerfB>Lines</PerfB>
      </PerfI>
      <PerfI>
        <DotIcon />
        <PerfB>Points</PerfB>
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
const PerfThree: FC<PerfProps> = ({ openByDefault, showGraph, deepAnalyze }) => {
  const [show, set] = React.useState(openByDefault);

  // const initialDpr = useThree((state) => state.viewport.initialDpr)

  return (
    <span>
      <TabContainers show={show} showGraph={showGraph} />
      {openByDefault && !deepAnalyze ? null :
        <ToggleContainer className={'__perf_toggle'}>
          {/* <ToggleEl tab="inspector" title="Inspector" set={set} /> */}
          {deepAnalyze && <ToggleEl tab="programs" title="Programs" set={set} />}
          {deepAnalyze && <ToggleEl tab="infos" title="Infos" set={set} />}
          <Toggle
            onClick={() => {
              set(!show);
            }}
          >
            {show ? (
              <span>
                <TriangleDownIcon /> Minimize
              </span>
            ) : (
              <span>
                <TriangleUpIcon /> More
              </span>
            )}
          </Toggle>
        </ToggleContainer>
      }
    </span>
  );
};

const TabContainers = ({ show, showGraph }: any) => {
  const tab = usePerfStore((state) => state.tab);

  return (
    <>
      <InfoUI />
      {show && (
        <div>
          <ContainerScroll style={{marginTop: showGraph? '38px' : 0}}>
            {tab === 'programs' && <ProgramsUI />}
          </ContainerScroll>
          </div>
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
  openByDefault,
  className,
  position,
  chart,
  deepAnalyze,
  antialias,
}) => {
  const perfContainerRef = useRef(null);

  return (
    <>
      <Headless chart={chart} deepAnalyze={deepAnalyze} />
      {/* @ts-ignore */}
      <Html transform={false}>
        <PerfS
          className={
            (className ? ' '.concat(className) : ' ') +
            ` ${position ? position : ''}`
          }
          style={{minHeight: showGraph ? '100px' : '60px'}}
          ref={perfContainerRef}
        >
            <ChartUI
              perfContainerRef={perfContainerRef}
              colorBlind={colorBlind}
              chart={chart}
              showGraph={showGraph}
              antialias={antialias}
            />
          <PerfUI
            colorBlind={colorBlind}
            showGraph={showGraph}
            deepAnalyze={deepAnalyze}
            openByDefault={openByDefault}
          />
        </PerfS>
      </Html>
    </>
  );
};

export default Gui;
