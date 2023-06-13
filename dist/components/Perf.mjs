import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React, { useRef } from "react";
import { ChartUI } from "./Graph.mjs";
import { LightningBoltIcon, RulerHorizontalIcon, LapTimerIcon, TextAlignJustifyIcon, VercelLogoIcon, BarChartIcon, MarginIcon, ImageIcon, ActivityLogIcon, MinusIcon, DotIcon, DropdownMenuIcon, TriangleDownIcon, TriangleUpIcon } from "@radix-ui/react-icons";
import { HtmlMinimal } from "./HtmlMinimal.mjs";
import { PerfHeadless } from "./PerfHeadless.mjs";
import { PerfB, PerfIContainer, PerfI, PerfSmallI, Toggle, ToggleContainer, ContainerScroll, PerfS } from "../styles.mjs";
import { ProgramsUI } from "./Program.mjs";
import { usePerf, setPerf } from "../store.mjs";
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
  const overclockingFps = usePerf((s) => s.overclockingFps);
  const fpsLimit = usePerf((s) => s.fpsLimit);
  return /* @__PURE__ */ jsxs(
    PerfB,
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
  const gl = usePerf((state) => state.gl);
  return gl ? /* @__PURE__ */ jsxs(PerfIContainer, { children: [
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(LightningBoltIcon, {}),
      /* @__PURE__ */ jsx(
        PerfB,
        {
          style: showGraph ? {
            color: `rgb(${colorsGraph(colorBlind).gpu.toString()})`
          } : {},
          children: "GPU"
        }
      ),
      /* @__PURE__ */ jsx(PerfSmallI, { children: "ms" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(RulerHorizontalIcon, {}),
      /* @__PURE__ */ jsx(
        PerfB,
        {
          style: showGraph ? {
            color: `rgb(${colorsGraph(colorBlind).cpu.toString()})`
          } : {},
          children: "CPU"
        }
      ),
      /* @__PURE__ */ jsx(PerfSmallI, { children: "ms" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(LapTimerIcon, {}),
      /* @__PURE__ */ jsx(DynamicUIPerf, { showGraph, colorBlind })
    ] }),
    !minimal && gl && /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(TextAlignJustifyIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: gl.info.render.calls === 1 ? "call" : "calls" })
    ] }),
    !minimal && gl && /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(VercelLogoIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Triangles" })
    ] }),
    customData && /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(BarChartIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { style: showGraph ? { color: `rgb(${colorsGraph(colorBlind).custom})` } : {}, children: customData.name }),
      customData.info && /* @__PURE__ */ jsx(PerfSmallI, { children: customData.info })
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
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(DynamicUI, { showGraph, colorBlind, customData, minimal }),
    !minimal && /* @__PURE__ */ jsx(
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
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(MarginIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Geometries" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(ImageIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Textures" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(ActivityLogIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "shaders" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(MinusIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Lines" })
    ] }),
    /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(DotIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Points" })
    ] }),
    matrixUpdate && /* @__PURE__ */ jsxs(PerfI, { children: [
      /* @__PURE__ */ jsx(DropdownMenuIcon, {}),
      /* @__PURE__ */ jsx(PerfB, { children: "Matrices" })
    ] })
  ] });
};
const ToggleEl = ({ tab, title, set }) => {
  const tabStore = usePerf((s) => s.tab);
  return /* @__PURE__ */ jsx(
    Toggle,
    {
      className: `${tabStore === tab ? " __perf_toggle_tab_active" : ""}`,
      onClick: () => {
        set(true);
        setPerf({ tab });
      },
      children: /* @__PURE__ */ jsx("span", { children: title })
    }
  );
};
const PerfThree = ({ openByDefault, showGraph, deepAnalyze, matrixUpdate }) => {
  const [show, set] = React.useState(openByDefault);
  return /* @__PURE__ */ jsxs("span", { children: [
    /* @__PURE__ */ jsx(TabContainers, { show, showGraph, matrixUpdate }),
    openByDefault && !deepAnalyze ? null : /* @__PURE__ */ jsxs(ToggleContainer, { className: "__perf_toggle", children: [
      deepAnalyze && /* @__PURE__ */ jsx(ToggleEl, { tab: "programs", title: "Programs", set }),
      deepAnalyze && /* @__PURE__ */ jsx(ToggleEl, { tab: "infos", title: "Infos", set }),
      /* @__PURE__ */ jsx(
        Toggle,
        {
          onClick: () => {
            set(!show);
          },
          children: show ? /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(TriangleDownIcon, {}),
            " Minimize"
          ] }) : /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(TriangleUpIcon, {}),
            " More"
          ] })
        }
      )
    ] })
  ] });
};
const TabContainers = ({ show, showGraph, matrixUpdate }) => {
  const tab = usePerf((state) => state.tab);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(InfoUI, { matrixUpdate }),
    show && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(ContainerScroll, { style: { marginTop: showGraph ? "38px" : 0 }, children: tab === "programs" && /* @__PURE__ */ jsx(ProgramsUI, {}) }) })
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
  const perfContainerRef = useRef(null);
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      PerfHeadless,
      {
        logsPerSecond,
        chart,
        overClock,
        deepAnalyze,
        matrixUpdate
      }
    ),
    /* @__PURE__ */ jsx(HtmlMinimal, { name: "r3f-perf", children: /* @__PURE__ */ jsxs(
      PerfS,
      {
        className: (className ? " ".concat(className) : " ") + ` ${position ? position : ""} ${minimal ? "minimal" : ""}`,
        style: { minHeight: minimal ? "37px" : showGraph ? "100px" : "60px", ...style },
        ref: perfContainerRef,
        children: [
          /* @__PURE__ */ jsx(
            ChartUI,
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
          /* @__PURE__ */ jsx(
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
export {
  Perf,
  colorsGraph
};
//# sourceMappingURL=Perf.mjs.map
