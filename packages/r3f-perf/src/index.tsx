import { VFC } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';
export { setCustomData, getCustomData } from './headless'

export type chart = {
  length: number;
  hz: number;
};

export type customData = {
  name: number;
  info: number;
  value: number;
};

export interface PerfProps {
  headless?: boolean;
  showGraph?: boolean;
  overClock?: boolean;
  colorBlind?: boolean;
  antialias?: boolean;
  trackCPU?: boolean;
  openByDefault?: boolean;
  className?: string;
  style?: object;
  position?: string;
  chart?: chart;
  deepAnalyze?: boolean;
  customData?: customData;
  matrixUpdate?: boolean;
  minimal?: boolean;
}

/**
 * Performance profiler component
 */

export const Perf: VFC<PerfProps> = ({
  headless = false,
  colorBlind = false,
  overClock = false,
  showGraph = true,
  trackCPU = false,
  deepAnalyze = false,
  antialias = true,
  openByDefault = true,
  customData,
  matrixUpdate = false,
  position = 'top-right',
  chart = {
    length: 30,
    hz: 15,
  },
  className,
  style,
  minimal = false
}) => {
  return headless ? (
    <Headless chart={chart} deepAnalyze={deepAnalyze} matrixUpdate={matrixUpdate} overClock={overClock} />
  ) : (
    <Gui
      colorBlind={colorBlind}
      showGraph={showGraph}
      trackCPU={trackCPU}
      openByDefault={openByDefault}
      className={className}
      style={style}
      overClock={overClock}
      position={position}
      antialias={antialias}
      chart={chart}
      deepAnalyze={deepAnalyze}
      minimal={minimal}
      customData={customData}
      matrixUpdate={matrixUpdate}
    />
  );
};

export const usePerf = usePerfFunc;
