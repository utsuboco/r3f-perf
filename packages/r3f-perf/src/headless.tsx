import { FC, HTMLAttributes, useEffect, useRef } from 'react';
import {
  addEffect,
  addAfterEffect,
  useThree,
  addTail,
} from '@react-three/fiber';
import GLPerf from './perf';
import create from 'zustand';
import { PerfProps } from '.';
import {
  Material,
  Mesh,
  Points,
  Scene,
  WebGLProgram,
  WebGLRenderer,
} from 'three';

export type ProgramsPerf = {
  meshes?: {
    [index: string]: Mesh[];
  };
  material: Material;
  program?: WebGLProgram;
  visible: boolean;
  expand: boolean;
};

type ProgramsPerfs = Map<string, ProgramsPerf>;

const isUUID = (uuid: string) => {
  let s: any = '' + uuid;

  s = s.match(
    '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  );
  if (s === null) {
    return false;
  }
  return true;
};

export type State = {
  log: any;
  paused: boolean;
  triggerProgramsUpdate: number;
  chart: {
    data: {
      [index: string]: number[];
    };
    circularId: number;
  };
  gl: WebGLRenderer | undefined;
  scene: Scene | undefined;
  programs: ProgramsPerfs;
  objectWithMaterials: Mesh[] | null;
  tab: 'infos' | 'programs' | 'data';
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

const getMUIIndex = (muid: string) => muid === 'muiPerf';

export const usePerfStore = create<State>(() => ({
  log: null,
  paused: false,
  triggerProgramsUpdate: 0,
  chart: {
    data: {
      fps: [],
      gpu: [],
      cpu: [],
    },
    circularId: 0,
  },
  gl: undefined,
  objectWithMaterials: null,
  scene: undefined,
  programs: new Map(),
  sceneLength: undefined,
  tab: 'infos',
}));

export const usePerfFunc = () => {
  return {
    log: usePerfStore((state) => state.log),
    gl: usePerfStore((state) => state.gl)?.info,
    programs: usePerfStore((state) => state.programs),
  };
};

export interface Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * Performance profiler component
 */
export const Headless: FC<PerfProps> = ({ trackGPU, chart }) => {
  const { gl, scene } = useThree();
  const mounted = useRef(false);

  usePerfStore.setState({ gl, scene });

  useEffect(() => {
    gl.info.autoReset = false;
    if (!PerfLib && gl.info) {
      PerfLib = new GLPerf({
        trackGPU: trackGPU,
        chartLen: chart ? chart.length : 120,
        chartHz: chart ? chart.hz : 60,
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
      PerfLib.gl = gl.getContext();
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
        const currentObjectWithMaterials: any = {};
        const programs: ProgramsPerfs = new Map();

        scene.traverse(function (object) {
          if (object instanceof Mesh || object instanceof Points) {
            if (object.material) {
              if (!object.material.defines) {
                object.material.defines = {};
              }

              if (!object.material.defines.muiPerf) {
                object.material.defines = Object.assign(
                  object.material.defines || {},
                  {
                    muiPerf: object.material.uuid,
                  }
                );
              }

              if (!currentObjectWithMaterials[object.material.uuid]) {
                currentObjectWithMaterials[object.material.uuid] = {
                  meshes: {},
                  material: object.material,
                };
                object.material.needsUpdate = true;
              }
              currentObjectWithMaterials[object.material.uuid].meshes[
                object.uuid
              ] = object;
              object.material.needsUpdate = false;
            }
          }
        });

        gl?.info?.programs?.forEach((program: any) => {
          const cacheKeySplited = program.cacheKey.split(',');
          const muiPerfTracker =
            cacheKeySplited[cacheKeySplited.findIndex(getMUIIndex) + 1];
          if (
            isUUID(muiPerfTracker) &&
            currentObjectWithMaterials[muiPerfTracker]
          ) {
            const { material, meshes } = currentObjectWithMaterials[
              muiPerfTracker
            ];
            programs.set(muiPerfTracker, {
              program,
              material,
              meshes,
              expand: false,
              visible: true,
            });
          }
        });

        if (programs.size !== usePerfStore.getState().programs.size) {
          usePerfStore.setState({
            programs: programs,
            triggerProgramsUpdate: usePerfStore.getState()
              .triggerProgramsUpdate++,
          });
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
