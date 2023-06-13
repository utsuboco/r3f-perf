"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const React = require("react");
const Graph = require("./Graph.js");
const reactIcons = require("@radix-ui/react-icons");
const HtmlMinimal = require("./HtmlMinimal.js");
const PerfHeadless = require("./PerfHeadless.js");
const styles = require("../styles.js");
const Program = require("./Program.js");
const store = require("../store.js");
const colorsGraph = (colorBlind) => {
  const colors = {
    overClock: `#ff6eff`,
    fps: colorBlind ? "100, 143, 255" : "238,38,110",
    cpu: colorBlind ? "254, 254, 98" : "66,226,46",
    gpu: colorBlind ? "254,254,254" : "253,151,31",
    custom: colorBlind ? "86,180,233" : "40,255,255"
  };
  return colors;
};
const DynamicUIPerf = ({ showGraph, colorBlind }) => {
  const overclockingFps = store.usePerf((s) => s.overclockingFps);
  const fpsLimit = store.usePerf((s) => s.fpsLimit);
  return /* @__PURE__ */ jsxRuntime.jsxs(
    styles.PerfB,
    {
      style: showGraph ? {
        color: overclockingFps ? colorsGraph(colorBlind).overClock.toString() : `rgb(${colorsGraph(colorBlind).fps})`
      } : {},
      children: [
        "FPS ",
        overclockingFps ? `${fpsLimit}🚀` : ""
      ]
    }
  );
};
const DynamicUI = ({ showGraph, colorBlind, customData, minimal }) => {
  const gl = store.usePerf((state) => state.gl);
  return gl ? /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfIContainer, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.LightningBoltIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(
        styles.PerfB,
        {
          style: showGraph ? {
            color: `rgb(${colorsGraph(colorBlind).gpu.toString()})`
          } : {},
          children: "GPU"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfSmallI, { children: "ms" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.RulerHorizontalIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(
        styles.PerfB,
        {
          style: showGraph ? {
            color: `rgb(${colorsGraph(colorBlind).cpu.toString()})`
          } : {},
          children: "CPU"
        }
      ),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfSmallI, { children: "ms" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.LapTimerIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(DynamicUIPerf, { showGraph, colorBlind })
    ] }),
    !minimal && gl && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.TextAlignJustifyIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: gl.info.render.calls === 1 ? "call" : "calls" })
    ] }),
    !minimal && gl && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.VercelLogoIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Triangles" })
    ] }),
    customData && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.BarChartIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { style: showGraph ? { color: `rgb(${colorsGraph(colorBlind).custom})` } : {}, children: customData.name }),
      customData.info && /* @__PURE__ */ jsxRuntime.jsx(styles.PerfSmallI, { children: customData.info })
    ] })
  ] }) : null;
};
const PerfUI = ({
  showGraph,
  colorBlind,
  deepAnalyze,
  customData,
  matrixUpdate,
  openByDefault,
  minimal
}) => {
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(DynamicUI, { showGraph, colorBlind, customData, minimal }),
    !minimal && /* @__PURE__ */ jsxRuntime.jsx(
      PerfThree,
      {
        matrixUpdate,
        openByDefault,
        deepAnalyze,
        showGraph
      }
    )
  ] });
};
const InfoUI = ({ matrixUpdate }) => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.MarginIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Geometries" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ImageIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Textures" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ActivityLogIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "shaders" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.MinusIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Lines" })
    ] }),
    /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.DotIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Points" })
    ] }),
    matrixUpdate && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { children: [
      /* @__PURE__ */ jsxRuntime.jsx(reactIcons.DropdownMenuIcon, {}),
      /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { children: "Matrices" })
    ] })
  ] });
};
const ToggleEl = ({ tab, title, set }) => {
  const tabStore = store.usePerf((s) => s.tab);
  return /* @__PURE__ */ jsxRuntime.jsx(
    styles.Toggle,
    {
      className: `${tabStore === tab ? " __perf_toggle_tab_active" : ""}`,
      onClick: () => {
        set(true);
        store.setPerf({ tab });
      },
      children: /* @__PURE__ */ jsxRuntime.jsx("span", { children: title })
    }
  );
};
const PerfThree = ({ openByDefault, showGraph, deepAnalyze, matrixUpdate }) => {
  const [show, set] = React.useState(openByDefault);
  return /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
    /* @__PURE__ */ jsxRuntime.jsx(TabContainers, { show, showGraph, matrixUpdate }),
    openByDefault && !deepAnalyze ? null : /* @__PURE__ */ jsxRuntime.jsxs(styles.ToggleContainer, { className: "__perf_toggle", children: [
      deepAnalyze && /* @__PURE__ */ jsxRuntime.jsx(ToggleEl, { tab: "programs", title: "Programs", set }),
      deepAnalyze && /* @__PURE__ */ jsxRuntime.jsx(ToggleEl, { tab: "infos", title: "Infos", set }),
      /* @__PURE__ */ jsxRuntime.jsx(
        styles.Toggle,
        {
          onClick: () => {
            set(!show);
          },
          children: show ? /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(reactIcons.TriangleDownIcon, {}),
            " Minimize"
          ] }) : /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(reactIcons.TriangleUpIcon, {}),
            " More"
          ] })
        }
      )
    ] })
  ] });
};
const TabContainers = ({ show, showGraph, matrixUpdate }) => {
  const tab = store.usePerf((state) => state.tab);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(InfoUI, { matrixUpdate }),
    show && /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsx(styles.ContainerScroll, { style: { marginTop: showGraph ? "38px" : 0 }, children: tab === "programs" && /* @__PURE__ */ jsxRuntime.jsx(Program.ProgramsUI, {}) }) })
  ] });
};
const Perf = ({
  showGraph = true,
  colorBlind = false,
  openByDefault = true,
  className,
  overClock = false,
  style,
  position = "top-right",
  chart,
  logsPerSecond,
  deepAnalyze = false,
  antialias = true,
  customData,
  matrixUpdate,
  minimal
}) => {
  const perfContainerRef = React.useRef(null);
  return /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      PerfHeadless.PerfHeadless,
      {
        logsPerSecond,
        chart,
        overClock,
        deepAnalyze,
        matrixUpdate
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(HtmlMinimal.HtmlMinimal, { name: "r3f-perf", children: /* @__PURE__ */ jsxRuntime.jsxs(
      styles.PerfS,
      {
        className: (className ? " ".concat(className) : " ") + ` ${position ? position : ""} ${minimal ? "minimal" : ""}`,
        style: { minHeight: minimal ? "37px" : showGraph ? "100px" : "60px", ...style },
        ref: perfContainerRef,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            Graph.ChartUI,
            {
              perfContainerRef,
              colorBlind,
              chart,
              showGraph,
              antialias,
              customData,
              minimal,
              matrixUpdate
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
            PerfUI,
            {
              colorBlind,
              showGraph,
              deepAnalyze,
              openByDefault,
              customData,
              matrixUpdate,
              minimal
            }
          )
        ]
      }
    ) })
  ] });
};
exports.Perf = Perf;
exports.colorsGraph = colorsGraph;
//# sourceMappingURL=Perf.js.map
