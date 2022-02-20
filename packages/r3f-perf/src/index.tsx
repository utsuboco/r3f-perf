import React, { VFC } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export type chart = {
  length: number;
  hz: number;
};

export interface PerfProps {
  headless?: boolean;
  showGraph?: boolean;
  colorBlind?: boolean;
  trackCPU?: boolean;
  openByDefault?: boolean;
  className?: any;
  position?: string;
  chart?: chart;
  deepAnalyze?: boolean;
}

/**
 * Performance profiler component
 */

export const Perf: VFC<PerfProps> = ({
  headless = false,
  colorBlind = false,
  showGraph = true,
  trackCPU = false,
  deepAnalyze = false,
  openByDefault = true,
  position = 'top-right',
  chart = {
    length: 30,
    hz: 15,
  },
  className,
}) => {
  return headless ? (
    <Headless chart={chart} deepAnalyze={deepAnalyze} />
  ) : (
    <Gui
      colorBlind={colorBlind}
      showGraph={showGraph}
      trackCPU={trackCPU}
      openByDefault={openByDefault}
      className={className}
      position={position}
      chart={chart}
      deepAnalyze={deepAnalyze}
    />
  );
};

export const usePerf = usePerfFunc;
