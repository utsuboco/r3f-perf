import React, { VFC, HTMLAttributes } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export interface PerfProps extends HTMLAttributes<HTMLDivElement> {
  headless?: boolean;
  graph?: boolean;
}

/**
 * Performance profiler component
 */
export let Perf: VFC<PerfProps> = () => null;
export let usePerf: any;
if (process.env.NODE_ENV === 'development') {
  Perf = ({ headless = false, graph = true }) => {
    return headless ? <Headless /> : <Gui graph={graph} />;
  };
  usePerf = usePerfFunc;
}
