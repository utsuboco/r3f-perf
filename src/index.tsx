import React, { VFC, HTMLAttributes } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export interface PerfProps extends HTMLAttributes<HTMLDivElement> {
  headless?: boolean;
  graph?: boolean;
  colorBlind?: boolean;
  trackGPU?: boolean;
  openByDefault?: boolean;
}

/**
 * Performance profiler component
 */
export let Perf: VFC<PerfProps> = () => null;
export let usePerf: any;
if (process.env.NODE_ENV === 'development') {
  Perf = ({
    headless = false,
    colorBlind = false,
    graph = true,
    trackGPU = true,
    openByDefault = false,
  }) => {
    return headless ? (
      <Headless />
    ) : (
      <Gui
        colorBlind={colorBlind}
        graph={graph}
        trackGPU={trackGPU}
        openByDefault={openByDefault}
      />
    );
  };
  usePerf = usePerfFunc;
}
