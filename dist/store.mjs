import create from "zustand";
import shallow from "zustand/shallow";
const setCustomData = (customData) => {
  setPerf({ customData });
};
const getCustomData = () => {
  return getPerf().customData;
};
const usePerfImpl = create((set, get) => {
  function getReport() {
    var _a;
    const { accumulated, startTime, infos } = get();
    const maxMemory = (_a = get().log) == null ? void 0 : _a.maxMemory;
    const { totalFrames, log, gl, max } = accumulated;
    const glAverage = {
      calls: gl.calls / totalFrames,
      triangles: gl.triangles / totalFrames,
      points: gl.points / totalFrames,
      lines: gl.lines / totalFrames
    };
    const logAverage = {
      gpu: log.gpu / totalFrames,
      cpu: log.cpu / totalFrames,
      mem: log.mem / totalFrames,
      fps: log.fps / totalFrames
    };
    const sessionTime = (window.performance.now() - startTime) / 1e3;
    return {
      sessionTime,
      infos,
      log: logAverage,
      gl: glAverage,
      max,
      maxMemory,
      totalFrames
    };
  }
  return {
    log: null,
    paused: false,
    triggerProgramsUpdate: 0,
    startTime: 0,
    customData: 0,
    fpsLimit: 60,
    overclockingFps: false,
    accumulated: {
      totalFrames: 0,
      gl: {
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
        counts: 0
      },
      log: {
        gpu: 0,
        cpu: 0,
        mem: 0,
        fps: 0
      },
      max: {
        gl: {
          calls: 0,
          triangles: 0,
          points: 0,
          lines: 0,
          counts: 0
        },
        log: {
          gpu: 0,
          cpu: 0,
          mem: 0,
          fps: 0
        }
      }
    },
    chart: {
      data: {
        fps: [],
        cpu: [],
        gpu: [],
        mem: []
      },
      circularId: 0
    },
    gl: void 0,
    objectWithMaterials: null,
    scene: void 0,
    programs: /* @__PURE__ */ new Map(),
    sceneLength: void 0,
    tab: "infos",
    getReport
  };
});
const usePerf = (sel) => usePerfImpl(sel, shallow);
Object.assign(usePerf, usePerfImpl);
const { getState: getPerf, setState: setPerf } = usePerfImpl;
export {
  getCustomData,
  getPerf,
  setCustomData,
  setPerf,
  usePerf,
  usePerfImpl
};
//# sourceMappingURL=store.mjs.map
