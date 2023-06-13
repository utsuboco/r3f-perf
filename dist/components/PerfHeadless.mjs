import { useMemo, useEffect } from "react";
import { useThree, addEffect, addAfterEffect, addTail } from "@react-three/fiber";
import { GLPerf, overLimitFps } from "../internal.mjs";
import * as THREE from "three";
import { countGeoDrawCalls } from "../helpers/countGeoDrawCalls.mjs";
import { setPerf, getPerf } from "../store.mjs";
import { emitEvent } from "@utsubo/events";
const updateMatrixWorldTemp = THREE.Object3D.prototype.updateMatrixWorld;
const updateWorldMatrixTemp = THREE.Object3D.prototype.updateWorldMatrix;
const updateMatrixTemp = THREE.Object3D.prototype.updateMatrix;
const maxGl = ["calls", "triangles", "points", "lines"];
const maxLog = ["gpu", "cpu", "mem", "fps"];
let matriceWorldCount = {
  value: 0
};
let matriceCount = {
  value: 0
};
const isUUID = (uuid) => {
  let s = "" + uuid;
  s = s.match("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
  if (s === null) {
    return false;
  }
  return true;
};
const addMuiPerfID = (material, currentObjectWithMaterials) => {
  if (!material.defines) {
    material.defines = {};
  }
  if (material.defines && !material.defines.muiPerf) {
    material.defines = Object.assign(material.defines || {}, {
      muiPerf: material.uuid
    });
  }
  const uuid = material.uuid;
  if (!currentObjectWithMaterials[uuid]) {
    currentObjectWithMaterials[uuid] = {
      meshes: {},
      material
    };
    material.needsUpdate = true;
  }
  material.needsUpdate = false;
  return uuid;
};
const getMUIIndex = (muid) => muid === "muiPerf";
const PerfHeadless = ({ overClock, logsPerSecond, chart, deepAnalyze, matrixUpdate }) => {
  const { gl, scene } = useThree();
  setPerf({ gl, scene });
  const PerfLib = useMemo(() => {
    const PerfLib2 = new GLPerf({
      trackGPU: true,
      overClock,
      chartLen: chart ? chart.length : 120,
      chartHz: chart ? chart.hz : 60,
      logsPerSecond: logsPerSecond || 10,
      gl: gl.getContext(),
      chartLogger: (chart2) => {
        setPerf({ chart: chart2 });
      },
      paramLogger: (logger) => {
        const log = {
          maxMemory: logger.maxMemory,
          gpu: logger.gpu,
          cpu: logger.cpu,
          mem: logger.mem,
          fps: logger.fps,
          totalTime: logger.duration,
          frameCount: logger.frameCount
        };
        setPerf({
          log
        });
        const { accumulated } = getPerf();
        const glRender = gl.info.render;
        accumulated.totalFrames++;
        accumulated.gl.calls += glRender.calls;
        accumulated.gl.triangles += glRender.triangles;
        accumulated.gl.points += glRender.points;
        accumulated.gl.lines += glRender.lines;
        accumulated.log.gpu += logger.gpu;
        accumulated.log.cpu += logger.cpu;
        accumulated.log.mem += logger.mem;
        accumulated.log.fps += logger.fps;
        for (let i = 0; i < maxGl.length; i++) {
          const key = maxGl[i];
          const value = glRender[key];
          if (value > accumulated.max.gl[key]) {
            accumulated.max.gl[key] = value;
          }
        }
        for (let i = 0; i < maxLog.length; i++) {
          const key = maxLog[i];
          const value = logger[key];
          if (value > accumulated.max.log[key]) {
            accumulated.max.log[key] = value;
          }
        }
        setPerf({ accumulated });
        emitEvent("log", [log, gl]);
      }
    });
    const ctx = gl.getContext();
    let glRenderer = null;
    let glVendor = null;
    const rendererInfo = ctx.getExtension("WEBGL_debug_renderer_info");
    const glVersion = ctx.getParameter(ctx.VERSION);
    if (rendererInfo != null) {
      glRenderer = ctx.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL);
      glVendor = ctx.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL);
    }
    if (!glVendor) {
      glVendor = "Unknown vendor";
    }
    if (!glRenderer) {
      glRenderer = ctx.getParameter(ctx.RENDERER);
    }
    setPerf({
      startTime: window.performance.now(),
      infos: {
        version: glVersion,
        renderer: glRenderer,
        vendor: glVendor
      }
    });
    const callbacks = /* @__PURE__ */ new Map();
    const callbacksAfter = /* @__PURE__ */ new Map();
    Object.defineProperty(THREE.Scene.prototype, "onBeforeRender", {
      get() {
        return (...args) => {
          var _a;
          if (PerfLib2) {
            PerfLib2.begin("profiler");
          }
          (_a = callbacks.get(this)) == null ? void 0 : _a(...args);
        };
      },
      set(callback) {
        callbacks.set(this, callback);
      },
      configurable: true
    });
    Object.defineProperty(THREE.Scene.prototype, "onAfterRender", {
      get() {
        return (...args) => {
          var _a;
          if (PerfLib2) {
            PerfLib2.end("profiler");
          }
          (_a = callbacksAfter.get(this)) == null ? void 0 : _a(...args);
        };
      },
      set(callback) {
        callbacksAfter.set(this, callback);
      },
      configurable: true
    });
    return PerfLib2;
  }, []);
  useEffect(() => {
    if (PerfLib) {
      PerfLib.overClock = overClock || false;
      if (overClock === false) {
        setPerf({ overclockingFps: false });
        overLimitFps.value = 0;
        overLimitFps.isOverLimit = 0;
      }
      PerfLib.chartHz = (chart == null ? void 0 : chart.hz) || 60;
      PerfLib.chartLen = (chart == null ? void 0 : chart.length) || 120;
    }
  }, [overClock, PerfLib, chart == null ? void 0 : chart.length, chart == null ? void 0 : chart.hz]);
  useEffect(() => {
    if (matrixUpdate) {
      THREE.Object3D.prototype.updateMatrixWorld = function() {
        if (this.matrixWorldNeedsUpdate || arguments[0]) {
          matriceWorldCount.value++;
        }
        updateMatrixWorldTemp.apply(this, arguments);
      };
      THREE.Object3D.prototype.updateWorldMatrix = function() {
        matriceWorldCount.value++;
        updateWorldMatrixTemp.apply(this, arguments);
      };
      THREE.Object3D.prototype.updateMatrix = function() {
        matriceCount.value++;
        updateMatrixTemp.apply(this, arguments);
      };
    }
    gl.info.autoReset = false;
    let effectSub = null;
    let afterEffectSub = null;
    if (!gl.info)
      return;
    effectSub = addEffect(function preRafR3FPerf() {
      if (getPerf().paused) {
        setPerf({ paused: false });
      }
      if (window.performance) {
        window.performance.mark("cpu-started");
        PerfLib.startCpuProfiling = true;
      }
      matriceCount.value -= 1;
      matriceWorldCount.value = 0;
      matriceCount.value = 0;
      if (gl.info) {
        gl.info.reset();
      }
    });
    afterEffectSub = addAfterEffect(function postRafR3FPerf() {
      var _a, _b;
      if (PerfLib && !PerfLib.paused) {
        PerfLib.nextFrame(window.performance.now());
        if (overClock && typeof window.requestIdleCallback !== "undefined") {
          PerfLib.idleCbId = requestIdleCallback(PerfLib.nextFps);
        }
      }
      if (deepAnalyze) {
        const currentObjectWithMaterials = {};
        const programs = /* @__PURE__ */ new Map();
        scene.traverse(function deepAnalyzeR3FPerf(object) {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
            if (object.material) {
              let uuid = object.material.uuid;
              const isTroika = Array.isArray(object.material) && object.material.length > 1;
              if (isTroika) {
                uuid = addMuiPerfID(object.material[1], currentObjectWithMaterials);
              } else {
                uuid = addMuiPerfID(object.material, currentObjectWithMaterials);
              }
              currentObjectWithMaterials[uuid].meshes[object.uuid] = object;
            }
          }
        });
        (_b = (_a = gl == null ? void 0 : gl.info) == null ? void 0 : _a.programs) == null ? void 0 : _b.forEach((program) => {
          const cacheKeySplited = program.cacheKey.split(",");
          const muiPerfTracker = cacheKeySplited[cacheKeySplited.findIndex(getMUIIndex) + 1];
          if (isUUID(muiPerfTracker) && currentObjectWithMaterials[muiPerfTracker]) {
            const { material, meshes } = currentObjectWithMaterials[muiPerfTracker];
            programs.set(muiPerfTracker, {
              program,
              material,
              meshes,
              drawCounts: {
                total: 0,
                type: "triangle",
                data: []
              },
              expand: false,
              visible: true
            });
          }
        });
        if (programs.size !== getPerf().programs.size) {
          countGeoDrawCalls(programs);
          setPerf({
            programs,
            triggerProgramsUpdate: getPerf().triggerProgramsUpdate++
          });
        }
      }
    });
    return () => {
      if (PerfLib) {
        if (typeof window.cancelIdleCallback !== "undefined") {
          window.cancelIdleCallback(PerfLib.idleCbId);
        }
        window.cancelAnimationFrame(PerfLib.rafId);
        window.cancelAnimationFrame(PerfLib.checkQueryId);
      }
      if (matrixUpdate) {
        THREE.Object3D.prototype.updateMatrixWorld = updateMatrixTemp;
      }
      effectSub();
      afterEffectSub();
    };
  }, [PerfLib, gl, chart, matrixUpdate]);
  useEffect(() => {
    const unsub = addTail(function postRafTailR3FPerf() {
      if (PerfLib) {
        PerfLib.paused = true;
        matriceCount.value = 0;
        matriceWorldCount.value = 0;
        setPerf({
          paused: true,
          log: {
            maxMemory: 0,
            gpu: 0,
            mem: 0,
            cpu: 0,
            fps: 0,
            totalTime: 0,
            frameCount: 0
          }
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
export {
  PerfHeadless,
  matriceCount,
  matriceWorldCount
};
//# sourceMappingURL=PerfHeadless.mjs.map
