"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const React = require("react");
const styles = require("../styles.js");
require("../index.js");
const reactIcons = require("@radix-ui/react-icons");
const estimateBytesUsed = require("../helpers/estimateBytesUsed.js");
const store = require("../store.js");
const addTextureUniforms = (id, texture) => {
  const repeatType = (wrap) => {
    switch (wrap) {
      case 1e3:
        return "RepeatWrapping";
      case 1001:
        return "ClampToEdgeWrapping";
      case 1002:
        return "MirroredRepeatWrapping";
      default:
        return "ClampToEdgeWrapping";
    }
  };
  const encodingType = (encoding) => {
    switch (encoding) {
      case 3e3:
        return "LinearEncoding";
      case 3001:
        return "sRGBEncoding";
      case 3002:
        return "RGBEEncoding";
      case 3003:
        return "LogLuvEncoding";
      case 3004:
        return "RGBM7Encoding";
      case 3005:
        return "RGBM16Encoding";
      case 3006:
        return "RGBDEncoding";
      case 3007:
        return "GammaEncoding";
      default:
        return "ClampToEdgeWrapping";
    }
  };
  return {
    name: id,
    url: texture.image.currentSrc,
    encoding: encodingType(texture.encoding),
    wrapT: repeatType(texture.wrapT),
    flipY: texture.flipY.toString()
  };
};
const UniformsGL = ({ program, material, setTexNumber }) => {
  const gl = store.usePerf((state) => state.gl);
  const [uniforms, set] = React.useState(null);
  React.useEffect(() => {
    if (gl) {
      const data = program == null ? void 0 : program.getUniforms();
      let TexCount = 0;
      const format = /* @__PURE__ */ new Map();
      data.seq.forEach((e) => {
        if (!e.id.includes("uTroika") && e.id !== "isOrthographic" && e.id !== "uvTransform" && e.id !== "lightProbe" && e.id !== "projectionMatrix" && e.id !== "viewMatrix" && e.id !== "normalMatrix" && e.id !== "modelMatrix" && e.id !== "modelViewMatrix") {
          let values = [];
          let data2 = {
            name: e.id
          };
          if (e.cache) {
            e.cache.forEach((v) => {
              if (typeof v !== "undefined") {
                values.push(v.toString().substring(0, 4));
              }
            });
            data2.value = values.join();
            if (material[e.id] && material[e.id].image) {
              if (material[e.id].image) {
                TexCount++;
                data2.value = addTextureUniforms(e.id, material[e.id]);
              }
            }
            if (!data2.value) {
              data2.value = "empty";
            }
            format.set(e.id, data2);
          }
        }
      });
      if (material.uniforms) {
        Object.keys(material.uniforms).forEach((key) => {
          const uniform = material.uniforms[key];
          if (uniform.value) {
            const { value } = uniform;
            let data2 = {
              name: key
            };
            if (key.includes("uTroika")) {
              return;
            }
            if (value.isTexture) {
              TexCount++;
              data2.value = addTextureUniforms(key, value);
            } else {
              let sb = JSON.stringify(value);
              try {
                sb = JSON.stringify(value);
              } catch (_err) {
                sb = value.toString();
              }
              data2.value = sb;
            }
            format.set(key, data2);
          }
        });
      }
      if (TexCount > 0) {
        setTexNumber(TexCount);
      }
      set(format);
    }
  }, []);
  return /* @__PURE__ */ jsxRuntime.jsx(styles.ProgramsUL, { children: uniforms && Array.from(uniforms.values()).map((uniform) => {
    return /* @__PURE__ */ jsxRuntime.jsx("span", { children: typeof uniform.value === "string" ? /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
      uniform.name,
      " :",
      " ",
      /* @__PURE__ */ jsxRuntime.jsxs("b", { children: [
        uniform.value.substring(0, 30),
        uniform.value.length > 30 ? "..." : ""
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
      /* @__PURE__ */ jsxRuntime.jsx("li", { children: /* @__PURE__ */ jsxRuntime.jsxs("b", { children: [
        uniform.value.name,
        ":"
      ] }) }),
      /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
        Object.keys(uniform.value).map((key) => {
          return key !== "name" ? /* @__PURE__ */ jsxRuntime.jsx("div", { children: key === "url" ? /* @__PURE__ */ jsxRuntime.jsx("a", { href: uniform.value[key], target: "_blank", children: /* @__PURE__ */ jsxRuntime.jsx("img", { src: uniform.value[key] }) }) : /* @__PURE__ */ jsxRuntime.jsxs("li", { children: [
            key,
            ": ",
            /* @__PURE__ */ jsxRuntime.jsx("b", { children: uniform.value[key] })
          ] }) }, key) : null;
        }),
        /* @__PURE__ */ jsxRuntime.jsxs(
          styles.ProgramConsole,
          {
            onClick: () => {
              var _a;
              console.info(
                material[uniform.value.name] || ((_a = material == null ? void 0 : material.uniforms[uniform.value.name]) == null ? void 0 : _a.value)
              );
            },
            children: [
              "console.info(",
              uniform.value.name,
              ");"
            ]
          }
        )
      ] })
    ] }) }, uniform.name);
  }) });
};
const DynamicDrawCallInfo = ({ el }) => {
  store.usePerf((state) => state.log);
  const gl = store.usePerf((state) => state.gl);
  const getVal = (el2) => {
    if (!gl)
      return 0;
    const res = Math.round(
      el2.drawCounts.total / (gl.info.render.triangles + gl.info.render.lines + gl.info.render.points) * 100 * 10
    ) / 10;
    return isFinite(res) && res || 0;
  };
  return /* @__PURE__ */ jsxRuntime.jsx(jsxRuntime.Fragment, { children: el.drawCounts.total > 0 && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
    el.drawCounts.type === "Triangle" ? /* @__PURE__ */ jsxRuntime.jsx(reactIcons.VercelLogoIcon, { style: { top: "-1px" } }) : /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ActivityLogIcon, { style: { top: "-1px" } }),
    el.drawCounts.total,
    /* @__PURE__ */ jsxRuntime.jsxs("small", { children: [
      el.drawCounts.type,
      "s"
    ] }),
    gl && /* @__PURE__ */ jsxRuntime.jsxs(
      styles.PerfB,
      {
        style: { bottom: "-10px", width: "40px", fontWeight: "bold" },
        children: [
          el.visible && !el.material.wireframe ? getVal(el) : 0,
          "%"
        ]
      }
    )
  ] }) });
};
const ProgramUI = ({ el }) => {
  const [showProgram, setShowProgram] = React.useState(el.visible);
  const [toggleProgram, set] = React.useState(el.expand);
  const [texNumber, setTexNumber] = React.useState(0);
  const { meshes, program, material } = el;
  return /* @__PURE__ */ jsxRuntime.jsxs(styles.ProgramGeo, { children: [
    /* @__PURE__ */ jsxRuntime.jsxs(
      styles.ProgramHeader,
      {
        onClick: () => {
          el.expand = !toggleProgram;
          Object.keys(meshes).forEach((key) => {
            const mesh = meshes[key];
            mesh.material.wireframe = false;
          });
          set(!toggleProgram);
        },
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(styles.Toggle, { style: { marginRight: "6px" }, children: toggleProgram ? /* @__PURE__ */ jsxRuntime.jsx("span", { children: /* @__PURE__ */ jsxRuntime.jsx(reactIcons.TriangleDownIcon, {}) }) : /* @__PURE__ */ jsxRuntime.jsx("span", { children: /* @__PURE__ */ jsxRuntime.jsx(reactIcons.TriangleUpIcon, {}) }) }),
          program && /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
            /* @__PURE__ */ jsxRuntime.jsx(styles.ProgramTitle, { children: program.name }),
            /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              /* @__PURE__ */ jsxRuntime.jsx(reactIcons.LayersIcon, { style: { top: "-1px" } }),
              Object.keys(meshes).length,
              /* @__PURE__ */ jsxRuntime.jsx("small", { children: Object.keys(meshes).length > 1 ? "users" : "user" })
            ] }),
            texNumber > 0 && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              texNumber > 1 ? /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ImageIcon, { style: { top: "-1px" } }) : /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ImageIcon, { style: { top: "-1px" } }),
              texNumber,
              /* @__PURE__ */ jsxRuntime.jsx("small", { children: "tex" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsx(DynamicDrawCallInfo, { el }),
            material.glslVersion === "300 es" && /* @__PURE__ */ jsxRuntime.jsxs(styles.PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              /* @__PURE__ */ jsxRuntime.jsx(reactIcons.RocketIcon, { style: { top: "-1px" } }),
              "300",
              /* @__PURE__ */ jsxRuntime.jsx("small", { children: "es" }),
              /* @__PURE__ */ jsxRuntime.jsx(styles.PerfB, { style: { bottom: "-10px", width: "40px" }, children: "glsl" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            styles.ToggleVisible,
            {
              onPointerEnter: () => {
                Object.keys(meshes).forEach((key) => {
                  const mesh = meshes[key];
                  mesh.material.wireframe = true;
                });
              },
              onPointerLeave: () => {
                Object.keys(meshes).forEach((key) => {
                  const mesh = meshes[key];
                  mesh.material.wireframe = false;
                });
              },
              onClick: (e) => {
                e.stopPropagation();
                Object.keys(meshes).forEach((key) => {
                  const mesh = meshes[key];
                  const invert = !showProgram;
                  mesh.visible = invert;
                  el.visible = invert;
                  setShowProgram(invert);
                });
              },
              children: showProgram ? /* @__PURE__ */ jsxRuntime.jsx(reactIcons.EyeOpenIcon, {}) : /* @__PURE__ */ jsxRuntime.jsx(reactIcons.EyeNoneIcon, {})
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        style: { maxHeight: toggleProgram ? "9999px" : 0, overflow: "hidden" },
        children: [
          /* @__PURE__ */ jsxRuntime.jsxs(styles.ProgramsULHeader, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(reactIcons.ButtonIcon, {}),
            " Uniforms:"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(
            UniformsGL,
            {
              program,
              material,
              setTexNumber
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsxs(styles.ProgramsULHeader, { children: [
            /* @__PURE__ */ jsxRuntime.jsx(reactIcons.CubeIcon, {}),
            " Geometries:"
          ] }),
          /* @__PURE__ */ jsxRuntime.jsx(styles.ProgramsUL, { children: meshes && Object.keys(meshes).map(
            (key) => meshes[key] && meshes[key].geometry && /* @__PURE__ */ jsxRuntime.jsxs(styles.ProgramsGeoLi, { children: [
              /* @__PURE__ */ jsxRuntime.jsxs("span", { children: [
                meshes[key].geometry.type,
                ": "
              ] }),
              meshes[key].userData && meshes[key].userData.drawCount && /* @__PURE__ */ jsxRuntime.jsxs("b", { children: [
                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  meshes[key].userData.drawCount.count,
                  /* @__PURE__ */ jsxRuntime.jsxs("small", { children: [
                    " ",
                    meshes[key].userData.drawCount.type,
                    "s"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntime.jsx("br", {}),
                /* @__PURE__ */ jsxRuntime.jsxs("div", { children: [
                  Math.round(
                    estimateBytesUsed.estimateBytesUsed(meshes[key].geometry) / 1024 * 1e3
                  ) / 1e3,
                  "Kb",
                  /* @__PURE__ */ jsxRuntime.jsx("small", { children: " memory used" })
                ] })
              ] })
            ] }, key)
          ) }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            styles.ProgramConsole,
            {
              onClick: () => {
                console.info(material);
              },
              children: [
                "console.info(",
                material.type,
                ")"
              ]
            }
          )
        ]
      }
    )
  ] });
};
const ProgramsUI = () => {
  store.usePerf((state) => state.triggerProgramsUpdate);
  const programs = store.usePerf((state) => state.programs);
  return /* @__PURE__ */ jsxRuntime.jsx(styles.ProgramsContainer, { children: programs && Array.from(programs.values()).map((el) => {
    if (!el) {
      return null;
    }
    return el ? /* @__PURE__ */ jsxRuntime.jsx(ProgramUI, { el }, el.material.uuid) : null;
  }) });
};
exports.ProgramsUI = ProgramsUI;
//# sourceMappingURL=Program.js.map
