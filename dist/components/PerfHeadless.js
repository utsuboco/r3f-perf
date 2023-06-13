"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const React = require("react");
const fiber = require("@react-three/fiber");
const internal = require("../internal.js");
const THREE = require("three");
const countGeoDrawCalls = require("../helpers/countGeoDrawCalls.js");
const store = require("../store.js");
const events = require("@utsubo/events");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const THREE__namespace = /* @__PURE__ */ _interopNamespaceDefault(THREE);
const updateMatrixWorldTemp = THREE__namespace.Object3D.prototype.updateMatrixWorld;
const updateWorldMatrixTemp = THREE__namespace.Object3D.prototype.updateWorldMatrix;
const updateMatrixTemp = THREE__namespace.Object3D.prototype.updateMatrix;
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
  const { gl, scene } = fiber.useThree();
  store.setPerf({ gl, scene });
  const PerfLib = React.useMemo(() => {
    const PerfLib2 = new internal.GLPerf({
      trackGPU: true,
      overClock,
      chartLen: chart ? chart.length : 120,
      chartHz: chart ? chart.hz : 60,
      logsPerSecond: logsPerSecond || 10,
      gl: gl.getContext(),
      chartLogger: (chart2) => {
        store.setPerf({ chart: chart2 });
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
        store.setPerf({
          log
        });
        const { accumulated } = store.getPerf();
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
        store.setPerf({ accumulated });
        events.emitEvent("log", [log, gl]);
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
    store.setPerf({
      startTime: window.performance.now(),
      infos: {
        version: glVersion,
        renderer: glRenderer,
        vendor: glVendor
      }
    });
    const callbacks = /* @__PURE__ */ new Map();
    const callbacksAfter = /* @__PURE__ */ new Map();
    Object.defineProperty(THREE__namespace.Scene.prototype, "onBeforeRender", {
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
    Object.defineProperty(THREE__namespace.Scene.prototype, "onAfterRender", {
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
  React.useEffect(() => {
    if (PerfLib) {
      PerfLib.overClock = overClock || false;
      if (overClock === false) {
        store.setPerf({ overclockingFps: false });
        internal.overLimitFps.value = 0;
        internal.overLimitFps.isOverLimit = 0;
      }
      PerfLib.chartHz = (chart == null ? void 0 : chart.hz) || 60;
      PerfLib.chartLen = (chart == null ? void 0 : chart.length) || 120;
    }
  }, [overClock, PerfLib, chart == null ? void 0 : chart.length, chart == null ? void 0 : chart.hz]);
  React.useEffect(() => {
    if (matrixUpdate) {
      THREE__namespace.Object3D.prototype.updateMatrixWorld = function() {
        if (this.matrixWorldNeedsUpdate || arguments[0]) {
          matriceWorldCount.value++;
        }
        updateMatrixWorldTemp.apply(this, arguments);
      };
      THREE__namespace.Object3D.prototype.updateWorldMatrix = function() {
        matriceWorldCount.value++;
        updateWorldMatrixTemp.apply(this, arguments);
      };
      THREE__namespace.Object3D.prototype.updateMatrix = function() {
        matriceCount.value++;
        updateMatrixTemp.apply(this, arguments);
      };
    }
    gl.info.autoReset = false;
    let effectSub = null;
    let afterEffectSub = null;
    if (!gl.info)
      return;
    effectSub = fiber.addEffect(function preRafR3FPerf() {
      if (store.getPerf().paused) {
        store.setPerf({ paused: false });
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
    afterEffectSub = fiber.addAfterEffect(function postRafR3FPerf() {
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
          if (object instanceof THREE__namespace.Mesh || object instanceof THREE__namespace.Points) {
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
        if (programs.size !== store.getPerf().programs.size) {
          countGeoDrawCalls.countGeoDrawCalls(programs);
          store.setPerf({
            programs,
            triggerProgramsUpdate: store.getPerf().triggerProgramsUpdate++
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
        THREE__namespace.Object3D.prototype.updateMatrixWorld = updateMatrixTemp;
      }
      effectSub();
      afterEffectSub();
    };
  }, [PerfLib, gl, chart, matrixUpdate]);
  React.useEffect(() => {
    const unsub = fiber.addTail(function postRafTailR3FPerf() {
      if (PerfLib) {
        PerfLib.paused = true;
        matriceCount.value = 0;
        matriceWorldCount.value = 0;
        store.setPerf({
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
exports.PerfHeadless = PerfHeadless;
exports.matriceCount = matriceCount;
exports.matriceWorldCount = matriceWorldCount;
//# sourceMappingURL=PerfHeadless.js.map
