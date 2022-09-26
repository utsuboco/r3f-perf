import { FC, HTMLAttributes, useEffect, useMemo } from 'react';
import {
  addEffect,
  addAfterEffect,
  useThree,
  addTail,
} from '@react-three/fiber';
import GLPerf from './perf';
import create from 'zustand';
import { PerfProps } from '.';
import * as THREE from 'three';
import countGeoDrawCalls from './helpers/countGeoDrawCalls';


// cameras from r3f-perf scene

// @ts-ignore
const updateMatrixWorldTemp = THREE.Object3D.prototype.updateMatrixWorld;
const updateWorldMatrixTemp = THREE.Object3D.prototype.updateWorldMatrix;
const updateMatrixTemp = THREE.Object3D.prototype.updateMatrix;

export let matriceWorldCount = {
  value: 0
}
export let matriceCount = {
  value: 0
}
type drawCount = {
  type: string;
  drawCount: number;
};
export type drawCounts = {
  total: number;
  type: string;
  data: drawCount[];
};

export type ProgramsPerf = {
  meshes?: {
    [index: string]: THREE.Mesh[];
  };
  material: THREE.Material;
  program?: WebGLProgram;
  visible: boolean;
  drawCounts: drawCounts;
  expand: boolean;
};

export type ProgramsPerfs = Map<string, ProgramsPerf>;

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


const addMuiPerfID = (material: THREE.Material, currentObjectWithMaterials: any) => {
  if (!material.defines) {
    material.defines = {};
  }

  if (material.defines && !material.defines.muiPerf) {
    material.defines = Object.assign(material.defines || {}, {
      muiPerf: material.uuid,
    });
  }

  const uuid = material.uuid;

  if (!currentObjectWithMaterials[uuid]) {
    currentObjectWithMaterials[uuid] = {
      meshes: {},
      material: material,
    };
    material.needsUpdate = true;
  }
  material.needsUpdate = false;
  return uuid;
};

export type State = {
  log: any;
  paused: boolean;
  triggerProgramsUpdate: number;
  customData: number;
  chart: {
    data: {
      [index: string]: number[];
    };
    circularId: number;
  };
  gl: THREE.WebGLRenderer | undefined;
  scene: THREE.Scene | undefined;
  programs: ProgramsPerfs;
  objectWithMaterials: THREE.Mesh[] | null;
  tab: 'infos' | 'programs' | 'data';
};


type Logger = {
  i: number;
  maxMemory: number;
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

export const usePerfStore = create<State>((set) => ({
  log: null,
  paused: false,
  triggerProgramsUpdate: 0,
  customData: 0,
  chart: {
    data: {
      fps: [],
      gpu: [],
      mem: [],
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

export const setCustomData = (customData: number) => {
  usePerfStore.setState({customData})
}
export const getCustomData = () => {
  return usePerfStore.getState().customData
}

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
export const Headless: FC<PerfProps> = ({ trackCPU, chart, deepAnalyze, matrixUpdate }) => {
  const { gl, scene } = useThree();

  usePerfStore.setState({ gl, scene });

  
  const PerfLib = useMemo(() => {
    
      const PerfLib = new GLPerf({
      trackGPU: true,
      chartLen: chart ? chart.length : 120,
      chartHz: chart ? chart.hz : 60,
      gl: gl.getContext(),
      chartLogger: (chart: Chart) => {
        usePerfStore.setState({ chart });
      },
      paramLogger: (logger: Logger) => {
        usePerfStore.setState({
          log: {
            maxMemory: logger.maxMemory,
            gpu: logger.gpu,
            mem: logger.mem,
            fps: logger.fps,
            totalTime: logger.duration,
            frameCount: logger.frameCount
          },
        });
      },
      })

      const callbacks = new Map()
      const callbacksAfter = new Map()
      Object.defineProperty(THREE.Scene.prototype, 'onBeforeRender', {
        get() {
          return (...args: any) => {
            if (PerfLib) {
              PerfLib.begin('profiler');
            }
            callbacks.get(this)?.(...args)
          }
        },
        set(callback) {
          callbacks.set(this, callback)
        },
        configurable: true
      })
      

      Object.defineProperty(THREE.Scene.prototype, 'onAfterRender', {
        get() {
          return (...args: any) => {
            if (PerfLib) {
              PerfLib.end('profiler');
            }
            callbacksAfter.get(this)?.(...args)
          }
        },
        set(callback) {
          callbacksAfter.set(this, callback)
        },
        configurable: true
      })
    
      return PerfLib
    }, [])

  useEffect(() => {
    if (matrixUpdate) {
      THREE.Object3D.prototype.updateMatrixWorld = function () {
        if( this.matrixWorldNeedsUpdate || arguments[0]/*force*/ ){
          matriceWorldCount.value++
        }
        // @ts-ignore
        updateMatrixWorldTemp.apply(this, arguments)

      }
      THREE.Object3D.prototype.updateWorldMatrix = function () {
        matriceWorldCount.value++
        // @ts-ignore
        updateWorldMatrixTemp.apply(this, arguments)
      }
      THREE.Object3D.prototype.updateMatrix = function () {
        matriceCount.value++
        // @ts-ignore
        updateMatrixTemp.apply(this, arguments)
      }
    }

      
    gl.info.autoReset = false;
    let effectSub: any = null
    let afterEffectSub: any = null
    if (!gl.info) return

    
    effectSub = addEffect(function preRafR3FPerf() {
      if (usePerfStore.getState().paused) {
        usePerfStore.setState({ paused: false });
      }

      matriceCount.value -= 1
      matriceWorldCount.value = 0
      matriceCount.value = 0

      if (gl.info) {
        gl.info.reset();
      }
    });

    afterEffectSub = addAfterEffect(function postRafR3FPerf() {
      if (PerfLib && !PerfLib.paused) {
        PerfLib.nextFrame(window.performance.now());
      }
      if (deepAnalyze) {
      const currentObjectWithMaterials: any = {};
      const programs: ProgramsPerfs = new Map();

        scene.traverse(function deepAnalyzeR3FPerf(object) {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
            if (object.material) {
              let uuid = object.material.uuid;
              // troika generate and attach 2 materials
              const isTroika =
                Array.isArray(object.material) && object.material.length > 1;
              if (isTroika) {
                uuid = addMuiPerfID(
                  object.material[1],
                  currentObjectWithMaterials
                );
              } else {
                uuid = addMuiPerfID(
                  object.material,
                  currentObjectWithMaterials
                );
              }

              currentObjectWithMaterials[uuid].meshes[object.uuid] = object;
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
              drawCounts: {
                total: 0,
                type: 'triangle',
                data: [],
              },
              expand: false,
              visible: true,
            });
          }
        });
        if (programs.size !== usePerfStore.getState().programs.size) {
          countGeoDrawCalls(programs);
          usePerfStore.setState({
            programs: programs,
            triggerProgramsUpdate: usePerfStore.getState()
              .triggerProgramsUpdate++,
          });
        }
      }


    });

    return () => {
      if (PerfLib) {
        window.cancelAnimationFrame(PerfLib.rafId);
        window.cancelAnimationFrame(PerfLib.checkQueryId);
      }

      if (matrixUpdate) {

        THREE.Object3D.prototype.updateMatrixWorld = updateMatrixTemp
  
      }
  
      effectSub();
      afterEffectSub();
    };
  }, [PerfLib, gl, trackCPU, chart, matrixUpdate]);

  useEffect(() => {
    const unsub = addTail(function postRafTailR3FPerf() {
      if (PerfLib) {
        PerfLib.paused = true;
        matriceCount.value = 0
        matriceWorldCount.value = 0
        usePerfStore.setState({
          paused: true,
          log: {
            maxMemory: 0,
            gpu: 0,
            mem: 0,
            fps: 0,
            totalTime: 0,
            frameCount: 0
          },
        });
      }
      return false;
    });

    return () => {
      unsub();
    };
  }, []);

  return null;
};
