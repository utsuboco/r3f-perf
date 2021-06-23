import React, { VFC } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

type chart = {
  length: number;
  hz: number;
};

export interface PerfProps {
  headless?: boolean;
  showGraph?: boolean;
  colorBlind?: boolean;
  trackGPU?: boolean;
  openByDefault?: boolean;
  className?: any;
  position?: string;
  chart?: chart;
}

/**
 * Performance profiler component
 */

export const Perf: VFC<PerfProps> = ({
  headless = false,
  colorBlind = false,
  showGraph = true,
  trackGPU = true,
  openByDefault = false,
  position = 'top-right',
  chart = {
    length: 30,
    hz: 10,
  },
  className,
}) => {
  return headless ? (
    <Headless chart={chart} />
  ) : (
    <Gui
      colorBlind={colorBlind}
      showGraph={showGraph}
      trackGPU={trackGPU}
      openByDefault={openByDefault}
      className={className}
      position={position}
      chart={chart}
    />
  );
};

export const usePerf = usePerfFunc;
