import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { ProgramsUL, ProgramConsole, PerfI, PerfB, ProgramGeo, ProgramHeader, Toggle, ProgramTitle, ToggleVisible, ProgramsULHeader, ProgramsGeoLi, ProgramsContainer } from "../styles.mjs";
import "../index.mjs";
import { VercelLogoIcon, ActivityLogIcon, TriangleDownIcon, TriangleUpIcon, LayersIcon, ImageIcon, RocketIcon, EyeOpenIcon, EyeNoneIcon, ButtonIcon, CubeIcon } from "@radix-ui/react-icons";
import { estimateBytesUsed } from "../helpers/estimateBytesUsed.mjs";
import { usePerf } from "../store.mjs";
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
  const gl = usePerf((state) => state.gl);
  const [uniforms, set] = useState(null);
  useEffect(() => {
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
  return /* @__PURE__ */ jsx(ProgramsUL, { children: uniforms && Array.from(uniforms.values()).map((uniform) => {
    return /* @__PURE__ */ jsx("span", { children: typeof uniform.value === "string" ? /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("span", { children: [
      uniform.name,
      " :",
      " ",
      /* @__PURE__ */ jsxs("b", { children: [
        uniform.value.substring(0, 30),
        uniform.value.length > 30 ? "..." : ""
      ] })
    ] }) }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs("b", { children: [
        uniform.value.name,
        ":"
      ] }) }),
      /* @__PURE__ */ jsxs("div", { children: [
        Object.keys(uniform.value).map((key) => {
          return key !== "name" ? /* @__PURE__ */ jsx("div", { children: key === "url" ? /* @__PURE__ */ jsx("a", { href: uniform.value[key], target: "_blank", children: /* @__PURE__ */ jsx("img", { src: uniform.value[key] }) }) : /* @__PURE__ */ jsxs("li", { children: [
            key,
            ": ",
            /* @__PURE__ */ jsx("b", { children: uniform.value[key] })
          ] }) }, key) : null;
        }),
        /* @__PURE__ */ jsxs(
          ProgramConsole,
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
  usePerf((state) => state.log);
  const gl = usePerf((state) => state.gl);
  const getVal = (el2) => {
    if (!gl)
      return 0;
    const res = Math.round(
      el2.drawCounts.total / (gl.info.render.triangles + gl.info.render.lines + gl.info.render.points) * 100 * 10
    ) / 10;
    return isFinite(res) && res || 0;
  };
  return /* @__PURE__ */ jsx(Fragment, { children: el.drawCounts.total > 0 && /* @__PURE__ */ jsxs(PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
    el.drawCounts.type === "Triangle" ? /* @__PURE__ */ jsx(VercelLogoIcon, { style: { top: "-1px" } }) : /* @__PURE__ */ jsx(ActivityLogIcon, { style: { top: "-1px" } }),
    el.drawCounts.total,
    /* @__PURE__ */ jsxs("small", { children: [
      el.drawCounts.type,
      "s"
    ] }),
    gl && /* @__PURE__ */ jsxs(
      PerfB,
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
  const [showProgram, setShowProgram] = useState(el.visible);
  const [toggleProgram, set] = useState(el.expand);
  const [texNumber, setTexNumber] = useState(0);
  const { meshes, program, material } = el;
  return /* @__PURE__ */ jsxs(ProgramGeo, { children: [
    /* @__PURE__ */ jsxs(
      ProgramHeader,
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
          /* @__PURE__ */ jsx(Toggle, { style: { marginRight: "6px" }, children: toggleProgram ? /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(TriangleDownIcon, {}) }) : /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(TriangleUpIcon, {}) }) }),
          program && /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx(ProgramTitle, { children: program.name }),
            /* @__PURE__ */ jsxs(PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              /* @__PURE__ */ jsx(LayersIcon, { style: { top: "-1px" } }),
              Object.keys(meshes).length,
              /* @__PURE__ */ jsx("small", { children: Object.keys(meshes).length > 1 ? "users" : "user" })
            ] }),
            texNumber > 0 && /* @__PURE__ */ jsxs(PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              texNumber > 1 ? /* @__PURE__ */ jsx(ImageIcon, { style: { top: "-1px" } }) : /* @__PURE__ */ jsx(ImageIcon, { style: { top: "-1px" } }),
              texNumber,
              /* @__PURE__ */ jsx("small", { children: "tex" })
            ] }),
            /* @__PURE__ */ jsx(DynamicDrawCallInfo, { el }),
            material.glslVersion === "300 es" && /* @__PURE__ */ jsxs(PerfI, { style: { height: "auto", width: "auto", margin: "0 4px" }, children: [
              /* @__PURE__ */ jsx(RocketIcon, { style: { top: "-1px" } }),
              "300",
              /* @__PURE__ */ jsx("small", { children: "es" }),
              /* @__PURE__ */ jsx(PerfB, { style: { bottom: "-10px", width: "40px" }, children: "glsl" })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            ToggleVisible,
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
              children: showProgram ? /* @__PURE__ */ jsx(EyeOpenIcon, {}) : /* @__PURE__ */ jsx(EyeNoneIcon, {})
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsxs(
      "div",
      {
        style: { maxHeight: toggleProgram ? "9999px" : 0, overflow: "hidden" },
        children: [
          /* @__PURE__ */ jsxs(ProgramsULHeader, { children: [
            /* @__PURE__ */ jsx(ButtonIcon, {}),
            " Uniforms:"
          ] }),
          /* @__PURE__ */ jsx(
            UniformsGL,
            {
              program,
              material,
              setTexNumber
            }
          ),
          /* @__PURE__ */ jsxs(ProgramsULHeader, { children: [
            /* @__PURE__ */ jsx(CubeIcon, {}),
            " Geometries:"
          ] }),
          /* @__PURE__ */ jsx(ProgramsUL, { children: meshes && Object.keys(meshes).map(
            (key) => meshes[key] && meshes[key].geometry && /* @__PURE__ */ jsxs(ProgramsGeoLi, { children: [
              /* @__PURE__ */ jsxs("span", { children: [
                meshes[key].geometry.type,
                ": "
              ] }),
              meshes[key].userData && meshes[key].userData.drawCount && /* @__PURE__ */ jsxs("b", { children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  meshes[key].userData.drawCount.count,
                  /* @__PURE__ */ jsxs("small", { children: [
                    " ",
                    meshes[key].userData.drawCount.type,
                    "s"
                  ] })
                ] }),
                /* @__PURE__ */ jsx("br", {}),
                /* @__PURE__ */ jsxs("div", { children: [
                  Math.round(
                    estimateBytesUsed(meshes[key].geometry) / 1024 * 1e3
                  ) / 1e3,
                  "Kb",
                  /* @__PURE__ */ jsx("small", { children: " memory used" })
                ] })
              ] })
            ] }, key)
          ) }),
          /* @__PURE__ */ jsxs(
            ProgramConsole,
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
  usePerf((state) => state.triggerProgramsUpdate);
  const programs = usePerf((state) => state.programs);
  return /* @__PURE__ */ jsx(ProgramsContainer, { children: programs && Array.from(programs.values()).map((el) => {
    if (!el) {
      return null;
    }
    return el ? /* @__PURE__ */ jsx(ProgramUI, { el }, el.material.uuid) : null;
  }) });
};
export {
  ProgramsUI
};
//# sourceMappingURL=Program.mjs.map
