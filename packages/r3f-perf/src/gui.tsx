import React, { FC, HTMLAttributes, useEffect, useRef, useState } from 'react';
import { FaMemory } from '@react-icons/all-files/fa/FaMemory';
import { RiCpuLine } from '@react-icons/all-files/ri/RiCpuLine';
import { RiCpuFill } from '@react-icons/all-files/ri/RiCpuFill';
import { VscPulse } from '@react-icons/all-files/vsc/VscPulse';
import { AiOutlineCodeSandbox } from '@react-icons/all-files/ai/AiOutlineCodeSandbox';
import { FaRegImages } from '@react-icons/all-files/fa/FaRegImages';
import { FiLayers } from '@react-icons/all-files/fi/FiLayers';
import { BsTriangle } from '@react-icons/all-files/bs/BsTriangle';
import { VscActivateBreakpoints } from '@react-icons/all-files/vsc/VscActivateBreakpoints';
import { FaServer } from '@react-icons/all-files/fa/FaServer';
import { RiArrowDownSFill } from '@react-icons/all-files/ri/RiArrowDownSFill';
import { RiArrowRightSFill } from '@react-icons/all-files/ri/RiArrowRightSFill';
import { IoIosImages } from '@react-icons/all-files/io/IoIosImages';
import { IoIosImage } from '@react-icons/all-files/io/IoIosImage';
import { GiPauseButton } from '@react-icons/all-files/gi/GiPauseButton';
import { BsEyeSlashFill } from '@react-icons/all-files/bs/BsEyeSlashFill';
import { BsEyeFill } from '@react-icons/all-files/bs/BsEyeFill';
import { IoRocketSharp } from '@react-icons/all-files/io5/IoRocketSharp';
import { IoLayers } from '@react-icons/all-files/io5/IoLayers';
import { IoShapes } from '@react-icons/all-files/io5/IoShapes';
import { GoSettings } from '@react-icons/all-files/go/GoSettings';
import { Html } from './html';
import { usePerfStore, Headless, ProgramsPerf } from './headless';
import { PerfProps } from '.';
import { raf } from 'rafz';

import {
  Toggle,
  PerfS,
  PerfI,
  PerfB,
  Graphpc,
  Graph,
  ToggleContainer,
  ProgramGeo,
  ContainerScroll,
  ProgramHeader,
  ProgramTitle,
  ToggleVisible,
  ProgramConsole,
  ProgramsUL,
  ProgramsULHeader,
} from './styles';

interface colors {
  [index: string]: string;
}
export interface graphData {
  pointsX: number[];
  pointsY: number[];
  maxVal: number;
  element: string;
}

export const colorsGraph = (colorBlind: boolean | undefined) => {
  const colors: colors = {
    fps: colorBlind ? '100, 143, 255' : '238,38,110',
    cpu: colorBlind ? '254, 254, 98' : '66,226,46',
    gpu: colorBlind ? '254,254,254' : '253,151,31',
  };
  return colors;
};

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  colorBlind?: boolean;
  trackGPU?: boolean;
}
const ChartCurve = ({ cg, canvas, colorBlind, trackGPU }: any) => {
  // Create a viewport. Units are in pixels.
  const viewport = {
    x: 0,
    y: 0,
    width: cg.canvas.width,
    height: cg.canvas.height,
  };
  const coords = cg.coordinate.cartesian(
    cg.scale.linear([0, 1], [0, viewport.width - 4]),
    cg.scale.linear([0, 1], [10, viewport.height - 4])
  );

  const toPoints = (element: string, factor: number = 1) => {
    let maxVal = 0;
    let pointsX = [];
    let pointsY = [];
    const chart = usePerfStore.getState().chart.data[element];
    if (!chart || chart.length === 0) {
      return {
        pointsX: [0],
        pointsY: [0],
      };
    }
    let len = chart.length;
    for (let i = 0; i < len; i++) {
      let id = (usePerfStore.getState().chart.circularId + i + 1) % len;
      if (chart[id] !== undefined) {
        if (chart[id] > maxVal) {
          maxVal = chart[id] * factor;
        }

        pointsX.push(i / (len - 1));
        pointsY.push((Math.min(100, chart[id]) * factor) / 100);
      }
    }
    const graph: graphData = {
      pointsX,
      pointsY,
      maxVal,
      element,
    };
    return graph;
  };
  raf(() => {
    const graphs: any = [toPoints('fps'), toPoints('cpu')];
    if (trackGPU) {
      graphs.push(toPoints('gpu'));
    }
    const fps = graphs[0];
    const cpu = graphs[1];
    const xs = [];
    const ys = [];

    for (let x = 0; x <= 1; x += 0.001) {
      xs.push(x);
      ys.push(0.5 + 0.25 * Math.sin(x * 2 * Math.PI));
    }

    const arrData = [
      cg.lineStrip(fps.pointsX, fps.pointsY, {
        colors: colorBlind
          ? [100 / 255, 143 / 255, 255 / 255, 1]
          : [238 / 255, 38 / 255, 110 / 255, 1],
        widths: 1.5,
      }),
      cg.lineStrip(cpu.pointsX, cpu.pointsY, {
        colors: colorBlind
          ? [254 / 255, 254 / 255, 98 / 255, 1]
          : [66 / 255, 226 / 255, 46 / 255, 1],
        widths: 1.5,
      }),
    ];

    if (trackGPU) {
      const gpu = graphs[2];
      arrData.push(
        cg.lineStrip(gpu.pointsX, gpu.pointsY, {
          colors: colorBlind
            ? [254 / 255, 254 / 255, 255 / 255, 1]
            : [253 / 255, 151 / 255, 31 / 255, 1],
          widths: 1.5,
        })
      );
    }
    cg.clear([0.141, 0.141, 0.141, 1]);
    cg.render(coords, viewport, arrData);

    cg.copyTo(viewport, canvas.current);
    return true;
  });

  return null;
};
const ChartUI: FC<PerfUIProps> = ({ colorBlind, trackGPU }) => {
  const canvas = useRef<any>(undefined);
  const [cg, setcg]: any = useState(null);
  useEffect(() => {
    if (canvas.current) {
      import('candygraph').then((module) => {
        // Do something with the module.
        const CandyGraph = module.CandyGraph;
        const cg = new CandyGraph(canvas.current);
        cg.canvas.width = 310;
        cg.canvas.height = 100;
        setcg(cg);
      });

      // cg.copyTo(viewport, canvas.current);
    }
  }, [canvas.current]);

  const paused = usePerfStore((state) => state.paused);
  return (
    <Graph>
      <canvas
        ref={canvas}
        style={{
          width: `${cg ? cg.canvas.width : 0}px`,
          height: `${cg ? cg.canvas.height : 0}px`,
          marginBottom: `-42px`,
          position: 'relative',
        }}
      />
      {!paused && cg && (
        <ChartCurve
          colorBlind={colorBlind}
          trackGPU={trackGPU}
          cg={cg}
          canvas={canvas}
        />
      )}
      {paused && (
        <Graphpc>
          <GiPauseButton /> PAUSED
        </Graphpc>
      )}
    </Graph>
  );
};

const DynamicUI: FC<PerfProps> = ({ showGraph, trackGPU, colorBlind }) => {
  const log = usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);

  return log ? (
    <>
      <PerfI>
        <RiCpuLine />
        <PerfB
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).cpu})` } : {}
          }
        >
          CPU
        </PerfB>{' '}
        <span>{(Math.round(log.cpu * 100) || 0).toFixed(2)}%</span>
      </PerfI>
      <PerfI>
        <RiCpuFill />
        <PerfB
          style={
            showGraph && trackGPU
              ? { color: `rgb(${colorsGraph(colorBlind).gpu})` }
              : {}
          }
        >
          GPU
        </PerfB>{' '}
        <span>{(Math.round(log.gpu * 1000) / 1000 || 0).toFixed(2)}</span>
        <small>ms</small>
      </PerfI>
      <PerfI>
        <FaMemory />
        <PerfB>Memory</PerfB> {log.mem}
        <small>mb</small>
      </PerfI>
      <PerfI>
        <VscPulse />
        <PerfB
          style={
            showGraph ? { color: `rgb(${colorsGraph(colorBlind).fps})` } : {}
          }
        >
          FPS
        </PerfB>{' '}
        <span>{log.fps}</span>
      </PerfI>
      {gl && (
        <PerfI>
          <BsTriangle />
          <PerfB>Triangles</PerfB> <span>{gl.info.render.triangles}</span>
        </PerfI>
      )}
    </>
  ) : null;
};

const PerfUI: FC<PerfProps> = ({
  showGraph,
  trackGPU,
  colorBlind,
  openByDefault,
}) => {
  return (
    <div>
      <DynamicUI
        showGraph={showGraph}
        trackGPU={trackGPU}
        colorBlind={colorBlind}
      />
      <PerfThree openByDefault={openByDefault} />
    </div>
  );
};

const UniformsGL = ({ program, material, setTexNumber }: any) => {
  const gl = usePerfStore((state) => state.gl);
  const [uniforms, set] = useState<any | null>(null);

  useEffect(() => {
    if (gl) {
      const data: any = program?.getUniforms();
      let TexCount = 0;
      const format: any = [];
      data.seq.forEach((e: any) => {
        if (
          e.id !== 'isOrthographic' &&
          e.id !== 'uvTransform' &&
          e.id !== 'lightProbe' &&
          e.id !== 'projectionMatrix' &&
          e.id !== 'viewMatrix' &&
          e.id !== 'normalMatrix' &&
          e.id !== 'modelViewMatrix'
        ) {
          let values: any = [];
          let data: any = {
            name: e.id,
          };
          if (e.cache) {
            e.cache.forEach((v: any) => {
              values.push(v.toString().substring(0, 4));
            });
            data.value = values.join();
            if (material[e.id] && material[e.id].image) {
              if (material[e.id].image) {
                TexCount++;
                const repeatType = (wrap: number) => {
                  switch (wrap) {
                    case 1000:
                      return 'RepeatWrapping';
                    case 1001:
                      return 'ClampToEdgeWrapping';
                    case 1002:
                      return 'MirroredRepeatWrapping';
                    default:
                      return 'ClampToEdgeWrapping';
                  }
                };

                const encodingType = (encoding: number) => {
                  switch (encoding) {
                    case 3000:
                      return 'LinearEncoding';
                    case 3001:
                      return 'sRGBEncoding';
                    case 3002:
                      return 'RGBEEncoding';
                    case 3003:
                      return 'LogLuvEncoding';
                    case 3004:
                      return 'RGBM7Encoding';
                    case 3005:
                      return 'RGBM16Encoding';
                    case 3006:
                      return 'RGBDEncoding';
                    case 3007:
                      return 'GammaEncoding';
                    default:
                      return 'ClampToEdgeWrapping';
                  }
                };

                data.value = {
                  name: e.id,
                  url: material[e.id].image.currentSrc,
                  encoding: encodingType(material[e.id].encoding),
                  wrapT: repeatType(material[e.id].image.wrapT),
                  flipY: material[e.id].flipY.toString(),
                };
              }
            }
            format.push(data);
          }
        }
      });
      if (TexCount > 0) {
        setTexNumber(TexCount);
      }
      set(format);
    }
  }, []);

  return (
    <ProgramsUL>
      {uniforms &&
        uniforms.map((uniform: any) => {
          return (
            <span key={uniform.name}>
              {typeof uniform.value === 'string' ? (
                <li>
                  <span>
                    {uniform.name} :{' '}
                    <b>
                      {uniform.value.substring(0, 12)}
                      {uniform.value.length > 12 ? '...' : ''}
                    </b>
                  </span>
                </li>
              ) : (
                <>
                  <li>{uniform.value.name}:</li>
                  <div>
                    {Object.keys(uniform.value).map((key) => {
                      return key !== 'name' ? (
                        <div key={key}>
                          {key === 'url' ? (
                            <a href={uniform.value[key]} target="_blank">
                              <img src={uniform.value[key]} />
                            </a>
                          ) : (
                            <li>
                              {key}: <b>{uniform.value[key]}</b>
                            </li>
                          )}
                        </div>
                      ) : null;
                    })}
                    <ProgramConsole
                      onClick={() => {
                        console.info(material[uniform.value.name]);
                      }}
                    >
                      console.log({uniform.value.name});
                    </ProgramConsole>
                  </div>
                </>
              )}
            </span>
          );
        })}
    </ProgramsUL>
  );
};
type ProgramUIProps = {
  el: ProgramsPerf;
};
const ProgramUI: FC<ProgramUIProps> = ({ el }) => {
  const [showProgram, setShowProgram] = useState(el.visible);

  const [toggleProgram, set] = useState(el.expand);
  const [texNumber, setTexNumber] = useState(0);
  const { meshes, program, material }: any = el;
  return (
    <ProgramGeo>
      <ProgramHeader
        onPointerEnter={() => {
          Object.keys(meshes).forEach((key) => {
            const mesh = meshes[key];
            mesh.material.wireframe = true;
          });
        }}
        onPointerLeave={() => {
          Object.keys(meshes).forEach((key) => {
            const mesh = meshes[key];
            mesh.material.wireframe = false;
          });
        }}
        onClick={() => {
          el.expand = !toggleProgram;

          Object.keys(meshes).forEach((key) => {
            const mesh = meshes[key];
            mesh.material.wireframe = false;
          });

          set(!toggleProgram);
        }}
      >
        <Toggle style={{ marginRight: '6px' }}>
          {toggleProgram ? (
            <span>
              <RiArrowDownSFill />
            </span>
          ) : (
            <span>
              <RiArrowRightSFill />
            </span>
          )}
        </Toggle>
        {program && (
          <span>
            <ProgramTitle>{program.name}</ProgramTitle>

            <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
              <IoLayers style={{ top: '-1px' }} />
              {Object.keys(meshes).length}
              <small>{Object.keys(meshes).length > 1 ? 'users' : 'user'}</small>
            </PerfI>
            {texNumber > 0 && (
              <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
                {texNumber > 1 ? (
                  <IoIosImages style={{ top: '-1px' }} />
                ) : (
                  <IoIosImage style={{ top: '-1px' }} />
                )}
                {texNumber}
                <small>tex</small>
              </PerfI>
            )}

            {material.glslVersion === '300 es' && (
              <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
                <IoRocketSharp style={{ top: '-1px' }} />
                {/* <PerfB>glsl</PerfB> */}
                300
                <small>es</small>
                <PerfB style={{ bottom: '-9px' }}>glsl</PerfB>
              </PerfI>
            )}
          </span>
        )}
        <ToggleVisible
          onClick={(e: any) => {
            e.stopPropagation();
            Object.keys(meshes).forEach((key) => {
              const mesh = meshes[key];
              const invert = !showProgram;
              mesh.visible = invert;
              el.visible = invert;
              setShowProgram(invert);
            });
          }}
        >
          {showProgram ? <BsEyeFill /> : <BsEyeSlashFill />}
        </ToggleVisible>
      </ProgramHeader>
      <div
        style={{ maxHeight: toggleProgram ? '9999px' : 0, overflow: 'hidden' }}
      >
        <ProgramsULHeader>
          <GoSettings /> Uniforms:
        </ProgramsULHeader>
        <UniformsGL
          program={program}
          material={material}
          setTexNumber={setTexNumber}
        />
        <ProgramsULHeader>
          <IoShapes /> Geometries:
        </ProgramsULHeader>

        <ProgramsUL>
          {meshes &&
            Object.keys(meshes).map(
              (key) =>
                meshes[key] &&
                meshes[key].geometry && (
                  <li key={key}>{meshes[key].geometry.type}</li>
                )
            )}
        </ProgramsUL>
        <ProgramConsole
          onClick={() => {
            console.info(material);
          }}
        >
          console.log({material.type})
        </ProgramConsole>
      </div>
    </ProgramGeo>
  );
};
const ProgramsUI: FC<PerfProps> = () => {
  usePerfStore((state) => state.triggerProgramsUpdate);
  const programs = usePerfStore((state) => state.programs);
  return (
    <>
      {programs &&
        programs.map((el: ProgramsPerf) => {
          if (!el) {
            return null;
          }
          return el ? <ProgramUI key={el.material.id} el={el} /> : null;
        })}
    </>
  );
};

const InfoUI: FC<PerfProps> = () => {
  usePerfStore((state) => state.log);
  const gl = usePerfStore((state) => state.gl);
  if (!gl) return null;
  const { info } = gl;
  return (
    <div>
      <PerfI>
        <AiOutlineCodeSandbox />
        <PerfB>
          {info.memory.geometries === 1 ? 'Geometry' : 'Geometries'}
        </PerfB>{' '}
        <span>{info.memory.geometries}</span>
      </PerfI>
      <PerfI>
        <FaRegImages />
        <PerfB>
          {info.memory.textures === 1 ? 'Texture' : 'Textures'}
        </PerfB>{' '}
        <span>{info.memory.textures}</span>
      </PerfI>
      <PerfI>
        <FiLayers />
        <PerfB>{info.render.calls === 1 ? 'call' : 'calls'}</PerfB>{' '}
        <span>{info.render.calls}</span>
      </PerfI>
      <PerfI>
        <FaServer />
        {info.programs && (
          <>
            <PerfB>{info.programs.length === 1 ? 'shader' : 'shaders'}</PerfB>{' '}
            <span>{info.programs.length}</span>
          </>
        )}
      </PerfI>
      {/* <PerfI>
            <RiRhythmLine/>
            <PerfB>Lines</PerfB> <span>{info.render.lines}</span>
          </PerfI> */}
      <PerfI>
        <VscActivateBreakpoints />
        <PerfB>Points</PerfB> <span>{info.render.points}</span>
      </PerfI>
    </div>
  );
};

const ToggleEl = ({ tab, title, set }: any) => {
  const tabStore = usePerfStore((state) => state.tab);
  return (
    <Toggle
      className={`${tabStore === tab ? ' __perf_toggle_tab_active' : ''}`}
      onClick={() => {
        set(true);
        usePerfStore.setState({ tab: tab });
      }}
    >
      <span>{title}</span>
    </Toggle>
  );
};
const PerfThree: FC<PerfProps> = ({ openByDefault }) => {
  const [show, set] = React.useState(openByDefault);

  // const initialDpr = useThree((state) => state.viewport.initialDpr)

  return (
    <span>
      <TabContainers show={show} />
      <ToggleContainer className={'__perf_toggle'}>
        {/* <ToggleEl tab="data" title="Geometries" set={set} /> */}
        <ToggleEl tab="programs" title="Programs" set={set} />
        <ToggleEl tab="infos" title="Infos" set={set} />
        <Toggle
          onClick={() => {
            set(!show);
          }}
        >
          {show ? (
            <span>
              <RiArrowDownSFill /> Minimize
            </span>
          ) : (
            <span>
              <RiArrowRightSFill /> More
            </span>
          )}
        </Toggle>
      </ToggleContainer>
    </span>
  );
};

const TabContainers = ({ show }: any) => {
  const tab = usePerfStore((state) => state.tab);

  return (
    <>
      {show && (
        <ContainerScroll>
          <div>
            {tab === 'programs' && <ProgramsUI />}
            {tab === 'infos' && <InfoUI />}
          </div>
        </ContainerScroll>
      )}
    </>
  );
};
/**
 * Performance profiler component
 */
const Gui: FC<PerfProps> = ({
  showGraph,
  colorBlind,
  trackGPU,
  openByDefault,
  className,
  position,
  chart,
}) => {
  return (
    <>
      <Headless trackGPU={trackGPU} chart={chart} />
      {/* @ts-ignore */}
      <Html transform={false}>
        <PerfS
          className={
            (className ? ' '.concat(className) : ' ') +
            ` ${position ? position : ''}`
          }
        >
          <PerfUI
            colorBlind={colorBlind}
            showGraph={showGraph}
            trackGPU={trackGPU}
            openByDefault={openByDefault}
          />
          {showGraph && <ChartUI colorBlind={colorBlind} trackGPU={trackGPU} />}
        </PerfS>
      </Html>
    </>
  );
};

export default Gui;
