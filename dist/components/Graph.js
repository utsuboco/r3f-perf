"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const React = require("react");
const PerfHeadless = require("./PerfHeadless.js");
const styles = require("../styles.js");
const reactIcons = require("@radix-ui/react-icons");
const fiber = require("@react-three/fiber");
require("../index.js");
const Perf = require("./Perf.js");
const THREE = require("three");
const TextsHighHZ = require("./TextsHighHZ.js");
const store = require("../store.js");
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
const ChartCurve = ({ colorBlind, minimal, chart = { length: 120, hz: 60 } }) => {
  const curves = React.useMemo(() => {
    return {
      fps: new Float32Array(chart.length * 3),
      cpu: new Float32Array(chart.length * 3),
      // mem: new Float32Array(chart.length * 3),
      gpu: new Float32Array(chart.length * 3)
    };
  }, [chart]);
  const fpsRef = React.useRef(null);
  const fpsMatRef = React.useRef(null);
  const gpuRef = React.useRef(null);
  const cpuRef = React.useRef(null);
  const dummyVec3 = React.useMemo(() => new THREE__namespace.Vector3(0, 0, 0), []);
  const updatePoints = (element, factor = 1, ref, viewport) => {
    let maxVal = 0;
    const { width: w, height: h } = viewport;
    const chart2 = store.getPerf().chart.data[element];
    if (!chart2 || chart2.length === 0) {
      return;
    }
    const padding = minimal ? 2 : 6;
    const paddingTop = minimal ? 12 : 50;
    let len = chart2.length;
    for (let i = 0; i < len; i++) {
      let id = (store.getPerf().chart.circularId + i + 1) % len;
      if (chart2[id] !== void 0) {
        if (chart2[id] > maxVal) {
          maxVal = chart2[id] * factor;
        }
        dummyVec3.set(padding + i / (len - 1) * (w - padding * 2) - w / 2, Math.min(100, chart2[id]) * factor / 100 * (h - padding * 2 - paddingTop) - h / 2, 0);
        dummyVec3.toArray(ref.attributes.position.array, i * 3);
      }
    }
    ref.attributes.position.needsUpdate = true;
  };
  fiber.useFrame(function updateChartCurve({ viewport }) {
    updatePoints("fps", 1, fpsRef.current, viewport);
    if (fpsMatRef.current) {
      fpsMatRef.current.color.set(store.getPerf().overclockingFps ? Perf.colorsGraph(colorBlind).overClock.toString() : `rgb(${Perf.colorsGraph(colorBlind).fps.toString()})`);
    }
    updatePoints("gpu", 5, gpuRef.current, viewport);
    updatePoints("cpu", 5, cpuRef.current, viewport);
  });
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      PerfHeadless.matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsxRuntime.jsx("bufferGeometry", { ref: fpsRef, children: /* @__PURE__ */ jsxRuntime.jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.fps,
          itemSize: 3,
          usage: THREE__namespace.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("lineBasicMaterial", { ref: fpsMatRef, color: `rgb(${Perf.colorsGraph(colorBlind).fps.toString()})`, transparent: true, opacity: 0.5 })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      PerfHeadless.matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsxRuntime.jsx("bufferGeometry", { ref: gpuRef, children: /* @__PURE__ */ jsxRuntime.jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.gpu,
          itemSize: 3,
          usage: THREE__namespace.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("lineBasicMaterial", { color: `rgb(${Perf.colorsGraph(colorBlind).gpu.toString()})`, transparent: true, opacity: 0.5 })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      PerfHeadless.matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsxRuntime.jsx("bufferGeometry", { ref: cpuRef, children: /* @__PURE__ */ jsxRuntime.jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.cpu,
          itemSize: 3,
          usage: THREE__namespace.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsxRuntime.jsx("lineBasicMaterial", { color: `rgb(${Perf.colorsGraph(colorBlind).cpu.toString()})`, transparent: true, opacity: 0.5 })
    ] })
  ] });
};
const ChartUI = ({
  colorBlind,
  chart,
  customData,
  matrixUpdate,
  showGraph = true,
  antialias = true,
  minimal
}) => {
  const canvas = React.useRef(void 0);
  const paused = store.usePerf((state) => state.paused);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    styles.Graph,
    {
      style: {
        display: "flex",
        position: "absolute",
        height: `${minimal ? 37 : showGraph ? 100 : 60}px`,
        minWidth: `${minimal ? "100px" : customData ? "370px" : "310px"}`
      },
      children: [
        /* @__PURE__ */ jsxRuntime.jsx(
          fiber.Canvas,
          {
            ref: canvas,
            orthographic: true,
            dpr: antialias ? [1, 2] : 1,
            gl: {
              antialias: true,
              alpha: true,
              stencil: false,
              depth: false
            },
            onCreated: ({ scene }) => {
              scene.traverse((obj) => {
                obj.matrixWorldAutoUpdate = false;
                obj.matrixAutoUpdate = false;
              });
            },
            flat: true,
            style: {
              marginBottom: `-42px`,
              position: "relative",
              pointerEvents: "none",
              background: "transparent !important",
              height: `${minimal ? 37 : showGraph ? 100 : 60}px`
            },
            children: !paused ? /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              /* @__PURE__ */ jsxRuntime.jsx(Renderer, {}),
              /* @__PURE__ */ jsxRuntime.jsx(TextsHighHZ.TextsHighHZ, { customData, minimal, matrixUpdate }),
              showGraph && /* @__PURE__ */ jsxRuntime.jsx(
                ChartCurve,
                {
                  colorBlind,
                  minimal,
                  chart
                }
              )
            ] }) : null
          }
        ),
        paused && /* @__PURE__ */ jsxRuntime.jsxs(styles.Graphpc, { children: [
          /* @__PURE__ */ jsxRuntime.jsx(reactIcons.PauseIcon, {}),
          " PAUSED"
        ] })
      ]
    }
  );
};
const Renderer = () => {
  fiber.useFrame(function updateR3FPerf({ gl, scene, camera }) {
    camera.updateMatrix();
    PerfHeadless.matriceCount.value -= 1;
    camera.matrixWorld.copy(camera.matrix);
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    gl.render(scene, camera);
    PerfHeadless.matriceWorldCount.value = 0;
    PerfHeadless.matriceCount.value = 0;
  }, Infinity);
  return null;
};
exports.ChartUI = ChartUI;
//# sourceMappingURL=Graph.js.map
