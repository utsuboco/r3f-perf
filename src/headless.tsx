import { FC, HTMLAttributes, useEffect, useRef } from 'react';
import {
  addEffect,
  addAfterEffect,
  useThree,
  addTail,
} from 'react-three-fiber';
import GLPerf from './perf';
import create from 'zustand';
import { PerfProps } from '.';

export type State = {
  log: any;
  paused: boolean;
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
  paused: false,
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
export const Headless: FC<PerfProps> = ({ trackGPU, chart }) => {
  const { gl } = useThree();
  const mounted = useRef(false);

  usePerfStore.setState({ gl });

  useEffect(() => {
    gl.info.autoReset = false;
    if (!PerfLib && gl.info) {
      PerfLib = new GLPerf({
        trackGPU: trackGPU,
        chartLen: chart ? chart.length : 30,
        chartHz: chart ? chart.hz : 10,
        gl: gl.getContext(),
        chartLogger: (chart: Chart) => {
          usePerfStore.setState({ chart });
        },
        paramLogger: (logger: Logger) => {
          if (PerfLib && gl.info) {
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
    if (PerfLib && gl.info) {
      const unsub1 = addEffect(() => {
        if (usePerfStore.getState().paused) {
          usePerfStore.setState({ paused: false });
        }
        if (PerfLib && gl.info) {
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

      return () => {
        unsub1();
        unsub2();
      };
    } else {
      return undefined;
    }
  }, [gl, trackGPU, chart]);
  useEffect(() => {
    const unsub = addTail(() => {
      if (PerfLib && mounted.current) {
        PerfLib.paused = true;
        usePerfStore.setState({
          paused: true,
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
      mounted.current = true;

      return false;
    });

    return () => {
      unsub();
    };
  }, [mounted]);
  return null;
};
