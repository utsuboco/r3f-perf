import { FC, HTMLAttributes, useEffect } from 'react';
import { addEffect, addAfterEffect, useThree, addTail } from 'react-three-fiber';
import GLPerf from './perf';
import create from 'zustand';

export type State = {
  log: any;
  chart: {
    data: {
      [index: string]: number[];
    };
    circularId: number;
  };
  gl: {
    info: any;
  };
};

let PerfLib: GLPerf | null;

type Logger = {
  i: number;
  cpu: number;
  gpu: number;
  mem: number;
  fps: number;
  duration: number;
  frameCount: number;
};

type Chart = {
  data: {
    [index: string]: number[];
  };
  id: number;
  circularId: number;
};

export const usePerfStore = create<State>(() => ({
  log: null,
  chart: {
    data: {
      fps: [],
      gpu: [],
      cpu: [],
    },
    circularId: 0,
  },
  gl: {
    info: null,
  },
}));

export const usePerfFunc = () => {
  return {
    log: usePerfStore((state) => state.log),
    gl: usePerfStore((state) => state.gl)?.info,
  };
};

export interface Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * Performance profiler component
 */
export const Headless: FC<Props> = () => {
  const { gl } = useThree();
  usePerfStore.setState({ gl });

  useEffect(() => {
    gl.info.autoReset = false;
    if (!PerfLib) {
      PerfLib = new GLPerf({
        trackGPU: true,
        gl: gl.getContext(),
        chartLogger: (chart: Chart) => {
          usePerfStore.setState({ chart });
        },
        paramLogger: (logger: Logger) => {
          if (PerfLib) {
            PerfLib.factorGPU = 1 / gl.info.render.calls;
          }
          usePerfStore.setState({
            log: {
              cpu: logger.cpu,
              gpu: logger.gpu,
              mem: logger.mem,
              fps: logger.fps,
              totalTime: logger.duration,
              frameCount: logger.frameCount,
            },
          });
        },
      });
    }
    if (PerfLib) {
      const unsub1 = addEffect(() => {
        if (PerfLib) {
          gl.info.reset();
          PerfLib.begin('profiler');
        }
        return false;
      });
      const unsub2 = addAfterEffect(() => {
        if (PerfLib) {
          PerfLib.end('profiler');
          PerfLib.nextFrame(window.performance.now());
        }
        return false;
      });
      const unsub3 = addTail(() => {
        if (PerfLib) {
          PerfLib.paused = true
          usePerfStore.setState({
            log: {
              cpu: 0,
              gpu: 0,
              mem: 0,
              fps: 0,
              totalTime: 0,
              frameCount: 0,
            },
          });
        }
        return false
      })

      return () => {
        unsub1();
        unsub2();
        unsub3();
      };
    } else {
      return undefined;
    }
  });
  return null;
};
