import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo, useRef } from "react";
import { matriceCount, matriceWorldCount } from "./PerfHeadless.mjs";
import { Graph, Graphpc } from "../styles.mjs";
import { PauseIcon } from "@radix-ui/react-icons";
import { useFrame, Canvas } from "@react-three/fiber";
import "../index.mjs";
import { colorsGraph } from "./Perf.mjs";
import * as THREE from "three";
import { TextsHighHZ } from "./TextsHighHZ.mjs";
import { getPerf, usePerf } from "../store.mjs";
const ChartCurve = ({ colorBlind, minimal, chart = { length: 120, hz: 60 } }) => {
  const curves = useMemo(() => {
    return {
      fps: new Float32Array(chart.length * 3),
      cpu: new Float32Array(chart.length * 3),
      // mem: new Float32Array(chart.length * 3),
      gpu: new Float32Array(chart.length * 3)
    };
  }, [chart]);
  const fpsRef = useRef(null);
  const fpsMatRef = useRef(null);
  const gpuRef = useRef(null);
  const cpuRef = useRef(null);
  const dummyVec3 = useMemo(() => new THREE.Vector3(0, 0, 0), []);
  const updatePoints = (element, factor = 1, ref, viewport) => {
    let maxVal = 0;
    const { width: w, height: h } = viewport;
    const chart2 = getPerf().chart.data[element];
    if (!chart2 || chart2.length === 0) {
      return;
    }
    const padding = minimal ? 2 : 6;
    const paddingTop = minimal ? 12 : 50;
    let len = chart2.length;
    for (let i = 0; i < len; i++) {
      let id = (getPerf().chart.circularId + i + 1) % len;
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
  useFrame(function updateChartCurve({ viewport }) {
    updatePoints("fps", 1, fpsRef.current, viewport);
    if (fpsMatRef.current) {
      fpsMatRef.current.color.set(getPerf().overclockingFps ? colorsGraph(colorBlind).overClock.toString() : `rgb(${colorsGraph(colorBlind).fps.toString()})`);
    }
    updatePoints("gpu", 5, gpuRef.current, viewport);
    updatePoints("cpu", 5, cpuRef.current, viewport);
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsx("bufferGeometry", { ref: fpsRef, children: /* @__PURE__ */ jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.fps,
          itemSize: 3,
          usage: THREE.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsx("lineBasicMaterial", { ref: fpsMatRef, color: `rgb(${colorsGraph(colorBlind).fps.toString()})`, transparent: true, opacity: 0.5 })
    ] }),
    /* @__PURE__ */ jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsx("bufferGeometry", { ref: gpuRef, children: /* @__PURE__ */ jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.gpu,
          itemSize: 3,
          usage: THREE.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsx("lineBasicMaterial", { color: `rgb(${colorsGraph(colorBlind).gpu.toString()})`, transparent: true, opacity: 0.5 })
    ] }),
    /* @__PURE__ */ jsxs("line", { onUpdate: (self) => {
      self.updateMatrix();
      matriceCount.value -= 1;
      self.matrixWorld.copy(self.matrix);
    }, children: [
      /* @__PURE__ */ jsx("bufferGeometry", { ref: cpuRef, children: /* @__PURE__ */ jsx(
        "bufferAttribute",
        {
          attach: "attributes-position",
          count: chart.length,
          array: curves.cpu,
          itemSize: 3,
          usage: THREE.DynamicDrawUsage,
          needsUpdate: true
        }
      ) }),
      /* @__PURE__ */ jsx("lineBasicMaterial", { color: `rgb(${colorsGraph(colorBlind).cpu.toString()})`, transparent: true, opacity: 0.5 })
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
  const canvas = useRef(void 0);
  const paused = usePerf((state) => state.paused);
  return /* @__PURE__ */ jsxs(
    Graph,
    {
      style: {
        display: "flex",
        position: "absolute",
        height: `${minimal ? 37 : showGraph ? 100 : 60}px`,
        minWidth: `${minimal ? "100px" : customData ? "370px" : "310px"}`
      },
      children: [
        /* @__PURE__ */ jsx(
          Canvas,
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
            children: !paused ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Renderer, {}),
              /* @__PURE__ */ jsx(TextsHighHZ, { customData, minimal, matrixUpdate }),
              showGraph && /* @__PURE__ */ jsx(
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
        paused && /* @__PURE__ */ jsxs(Graphpc, { children: [
          /* @__PURE__ */ jsx(PauseIcon, {}),
          " PAUSED"
        ] })
      ]
    }
  );
};
const Renderer = () => {
  useFrame(function updateR3FPerf({ gl, scene, camera }) {
    camera.updateMatrix();
    matriceCount.value -= 1;
    camera.matrixWorld.copy(camera.matrix);
    camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
    gl.render(scene, camera);
    matriceWorldCount.value = 0;
    matriceCount.value = 0;
  }, Infinity);
  return null;
};
export {
  ChartUI
};
//# sourceMappingURL=Graph.mjs.map
