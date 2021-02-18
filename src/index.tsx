import React, { VFC, HTMLAttributes } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export interface PerfProps extends HTMLAttributes<HTMLDivElement> {
  headless?: boolean;
  showGraph?: boolean;
  colorBlind?: boolean;
  trackGPU?: boolean;
  openByDefault?: boolean;
  className?: any;
  position?: string;
}

/**
 * Performance profiler component
 */
export let Perf: VFC<PerfProps> = () => null;
export let usePerf: any;
if (process.env.NODE_ENV === 'production' || process.env.R3F_PERF_SHOW_IN_PROD !== 'SHOW') {
} else {
  Perf = ({
    headless = false,
    colorBlind = false,
    showGraph = true,
    trackGPU = true,
    openByDefault = false,
    position = 'top-right',
    className,
  }) => {
    return headless ? (
      <Headless />
    ) : (
      <Gui
        colorBlind={colorBlind}
        showGraph={showGraph}
        trackGPU={trackGPU}
        openByDefault={openByDefault}
        className={className}
        position={position}
      />
    );
  };
  usePerf = usePerfFunc;
}
