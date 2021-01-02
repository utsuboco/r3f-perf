import React, { VFC, HTMLAttributes } from 'react';
import Gui from './gui';
import { Headless, usePerfFunc } from './headless';

export interface PerfProps extends HTMLAttributes<HTMLDivElement> {
  headless?: boolean;
}

/**
 * Performance profiler component
 */
export let Perf: VFC<PerfProps> = () => null;
export let usePerf: any;
if (process.env.NODE_ENV === 'development') {
  Perf = ({ headless = false }, props) => {
    return headless ? <Headless /> : <Gui {...props} />;
  };
  usePerf = usePerfFunc;
}
