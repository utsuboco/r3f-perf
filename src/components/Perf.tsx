import React, { FC, useRef } from 'react'
import { ChartUI } from './Graph'
import {
  ActivityLogIcon,
  BarChartIcon,
  DotIcon,
  DropdownMenuIcon,
  ImageIcon,
  LapTimerIcon,
  LightningBoltIcon,
  MarginIcon,
  MinusIcon,
  RulerHorizontalIcon,
  TextAlignJustifyIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  VercelLogoIcon,
} from '@radix-ui/react-icons'

import { HtmlMinimal } from './HtmlMinimal'
import { PerfHeadless } from './PerfHeadless'

import { Toggle, PerfS, PerfIContainer, PerfI, PerfB, ToggleContainer, ContainerScroll, PerfSmallI } from '../styles'
import { ProgramsUI } from './Program'
import { setPerf, usePerf } from '../store'
import { PerfPropsGui } from '../typings'

interface colors {
  [index: string]: string
}

export const colorsGraph = (colorBlind: boolean | undefined) => {
  const colors: colors = {
    overClock: `#ff6eff`,
    fps: colorBlind ? '100, 143, 255' : '238,38,110',
    cpu: colorBlind ? '254, 254, 98' : '66,226,46',
    gpu: colorBlind ? '254,254,254' : '253,151,31',
    custom: colorBlind ? '86,180,233' : '40,255,255',
  }
  return colors
}

const DynamicUIPerf: FC<PerfPropsGui> = ({ showGraph, colorBlind }) => {
  const overclockingFps = usePerf((s) => s.overclockingFps)
  const fpsLimit = usePerf((s) => s.fpsLimit)

  return (
    <PerfB
      style={
        showGraph
          ? {
              color: overclockingFps
                ? colorsGraph(colorBlind).overClock.toString()
                : `rgb(${colorsGraph(colorBlind).fps})`,
            }
          : {}
      }>
      FPS {overclockingFps ? `${fpsLimit}🚀` : ''}
    </PerfB>
  )
}

const DynamicUI: FC<PerfPropsGui> = ({ showGraph, colorBlind, customData, minimal }) => {
  const gl = usePerf((state) => state.gl)

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
          }>
          GPU
        </PerfB>
        <PerfSmallI>ms</PerfSmallI>
      </PerfI>
      <PerfI>
        <RulerHorizontalIcon />
        <PerfB
          style={
            showGraph
              ? {
                  color: `rgb(${colorsGraph(colorBlind).cpu.toString()})`,
                }
              : {}
          }>
          CPU
        </PerfB>
        <PerfSmallI>ms</PerfSmallI>
      </PerfI>
      {/* <PerfI>
        <RulerHorizontalIcon />
        <PerfB  style={
            showGraph
              ? {
                  color: `rgb(${colorsGraph(colorBlind).cpu.toString()})`,
                }
              : {}
          }>Memory</PerfB>
        <PerfSmallI>mb</PerfSmallI>
      </PerfI> */}
      <PerfI>
        <LapTimerIcon />
        <DynamicUIPerf showGraph={showGraph} colorBlind={colorBlind} />
      </PerfI>
      {!minimal && gl && (
        <PerfI>
          <TextAlignJustifyIcon />
          {/* @ts-ignore */}
          <PerfB>{gl.info.render.calls === 1 ? 'call' : 'calls'}</PerfB>
        </PerfI>
      )}
      {!minimal && gl && (
        <PerfI>
          <VercelLogoIcon />
          <PerfB>Triangles</PerfB>
        </PerfI>
      )}
      {customData && (
        <PerfI>
          <BarChartIcon />
          <PerfB style={showGraph ? { color: `rgb(${colorsGraph(colorBlind).custom})` } : {}}>{customData.name}</PerfB>
          {customData.info && <PerfSmallI>{customData.info}</PerfSmallI>}
        </PerfI>
      )}
    </PerfIContainer>
  ) : null
}

const PerfUI: FC<PerfPropsGui> = ({
  showGraph,
  colorBlind,
  deepAnalyze,
  customData,
  matrixUpdate,
  openByDefault,
  minimal,
}) => {
  return (
    <>
      <DynamicUI showGraph={showGraph} colorBlind={colorBlind} customData={customData} minimal={minimal} />
      {!minimal && (
        <PerfThree
          matrixUpdate={matrixUpdate}
          openByDefault={openByDefault}
          deepAnalyze={deepAnalyze}
          showGraph={showGraph}
        />
      )}
    </>
  )
}

const InfoUI: FC<PerfPropsGui> = ({ matrixUpdate }) => {
  return (
    <div>
      <PerfI>
        <MarginIcon />
        <PerfB>Geometries</PerfB>
      </PerfI>
      <PerfI>
        <ImageIcon />
        <PerfB>Textures</PerfB>
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
      {matrixUpdate && (
        <PerfI>
          <DropdownMenuIcon />
          <PerfB>Matrices</PerfB>
        </PerfI>
      )}
    </div>
  )
}

const ToggleEl = ({ tab, title, set }: any) => {
  const tabStore = usePerf((s: { tab: any }) => s.tab)
  return (
    <Toggle
      className={`${tabStore === tab ? ' __perf_toggle_tab_active' : ''}`}
      onClick={() => {
        set(true)
        setPerf({ tab: tab })
      }}>
      <span>{title}</span>
    </Toggle>
  )
}
const PerfThree: FC<PerfPropsGui> = ({ openByDefault, showGraph, deepAnalyze, matrixUpdate }) => {
  const [show, set] = React.useState(openByDefault)

  return (
    <span>
      <TabContainers show={show} showGraph={showGraph} matrixUpdate={matrixUpdate} />
      {openByDefault && !deepAnalyze ? null : (
        <ToggleContainer className={'__perf_toggle'}>
          {/* <ToggleEl tab="inspector" title="Inspector" set={set} /> */}
          {deepAnalyze && <ToggleEl tab="programs" title="Programs" set={set} />}
          {deepAnalyze && <ToggleEl tab="infos" title="Infos" set={set} />}
          <Toggle
            onClick={() => {
              set(!show)
            }}>
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
      )}
    </span>
  )
}

const TabContainers = ({ show, showGraph, matrixUpdate }: any) => {
  const tab = usePerf((state) => state.tab)

  return (
    <>
      <InfoUI matrixUpdate={matrixUpdate} />
      {show && (
        <div>
          <ContainerScroll style={{ marginTop: showGraph ? '38px' : 0 }}>
            {tab === 'programs' && <ProgramsUI />}
          </ContainerScroll>
        </div>
      )}
    </>
  )
}
/**
 * Performance profiler component
 */
export const Perf: FC<PerfPropsGui> = ({
  showGraph = true,
  colorBlind = false,
  openByDefault = true,
  className,
  overClock = false,
  style,
  position = 'top-right',
  chart,
  logsPerSecond,
  deepAnalyze = false,
  antialias = true,
  customData,
  matrixUpdate,
  minimal,
}) => {
  const perfContainerRef = useRef(null)

  return (
    <>
      <PerfHeadless
        logsPerSecond={logsPerSecond}
        chart={chart}
        overClock={overClock}
        deepAnalyze={deepAnalyze}
        matrixUpdate={matrixUpdate}
      />
      <HtmlMinimal name='r3f-perf'>
        <PerfS
          className={
            (className ? ' '.concat(className) : ' ') + ` ${position ? position : ''} ${minimal ? 'minimal' : ''}`
          }
          style={{ minHeight: minimal ? '37px' : showGraph ? '100px' : '60px', ...style }}
          ref={perfContainerRef}>
          <ChartUI
            perfContainerRef={perfContainerRef}
            colorBlind={colorBlind}
            chart={chart}
            showGraph={showGraph}
            antialias={antialias}
            customData={customData}
            minimal={minimal}
            matrixUpdate={matrixUpdate}
          />
          <PerfUI
            colorBlind={colorBlind}
            showGraph={showGraph}
            deepAnalyze={deepAnalyze}
            openByDefault={openByDefault}
            customData={customData}
            matrixUpdate={matrixUpdate}
            minimal={minimal}
          />
        </PerfS>
      </HtmlMinimal>
    </>
  )
}
