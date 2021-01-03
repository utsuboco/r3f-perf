import { FC, HTMLAttributes, useLayoutEffect } from 'react';
import { addEffect, addAfterEffect, useThree } from 'react-three-fiber';
import GLPerf from './perf';
import create from 'zustand';

export type State = {
  log: any;
  chart: string;
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
  chart: number[];
  circularId: number;
};

export const usePerfStore = create<State>((_) => ({
  log: null,
  chart: '',
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

  useLayoutEffect(() => {
    if (!PerfLib) {
      PerfLib = new GLPerf({
        trackGPU: true,
        gl: gl.getContext(),
        chartLogger: (chart: Chart) => {
          // console.log(chart)
          let points = '';
          const len = chart.chart.length;
          for (let i = 0; i < len; i++) {
            const id = (chart.circularId + i + 1) % len;
            if (chart.chart[id] !== undefined) {
              points =
                points +
                ' ' +
                ((55 * i) / (len - 1)).toFixed(1) +
                ',' +
                (45 - (chart.chart[id] * 22) / 60 / 1).toFixed(1);
            }
          }
          usePerfStore.setState({ chart: points });
        },
        paramLogger: (logger: Logger) => {
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
  });
  return null;
};
