import { FC, useEffect, useState } from 'react';

import {
  ProgramGeo,
  ProgramHeader,
  ProgramTitle,
  ToggleVisible,
  ProgramConsole,
  ProgramsUL,
  ProgramsULHeader,
  Toggle,
  PerfI,
  PerfB,
  ProgramsGeoLi,
  ProgramsContainer,
} from '../styles';
import { usePerf } from '..';
import { ActivityLogIcon, ButtonIcon, CubeIcon, EyeNoneIcon, EyeOpenIcon, ImageIcon, LayersIcon, RocketIcon, TriangleDownIcon, TriangleUpIcon, VercelLogoIcon } from '@radix-ui/react-icons';
import { ProgramsPerf } from '../store';
import { PerfProps } from '../typings';
import { estimateBytesUsed } from '../helpers/estimateBytesUsed';

const addTextureUniforms = (id: string, texture: any) => {
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
  return {
    name: id,
    url: texture.image.currentSrc,
    encoding: encodingType(texture.encoding),
    wrapT: repeatType(texture.wrapT),
    flipY: texture.flipY.toString(),
  };
};

const UniformsGL = ({ program, material, setTexNumber }: any) => {
  const gl = usePerf((state) => state.gl);
  const [uniforms, set] = useState<any | null>(null);

  useEffect(() => {
    if (gl) {
      const data: any = program?.getUniforms();
      let TexCount = 0;
      const format: any = new Map();

      data.seq.forEach((e: any) => {
        if (
          !e.id.includes('uTroika') &&
          e.id !== 'isOrthographic' &&
          e.id !== 'uvTransform' &&
          e.id !== 'lightProbe' &&
          e.id !== 'projectionMatrix' &&
          e.id !== 'viewMatrix' &&
          e.id !== 'normalMatrix' &&
          e.id !== 'modelMatrix' &&
          e.id !== 'modelViewMatrix'
        ) {
          let values: any = [];
          let data: any = {
            name: e.id,
          };
          if (e.cache) {
            e.cache.forEach((v: any) => {
              if (typeof v !== 'undefined') {
                values.push(v.toString().substring(0, 4));
              }
            });
            data.value = values.join();
            if (material[e.id] && material[e.id].image) {
              if (material[e.id].image) {
                TexCount++;
                data.value = addTextureUniforms(e.id, material[e.id]);
              }
            }
            if (!data.value) {
              data.value = 'empty';
            }
            format.set(e.id, data);
          }
        }
      });

      if (material.uniforms) {
        Object.keys(material.uniforms).forEach((key: any) => {
          const uniform = material.uniforms[key];
          if (uniform.value) {
            const { value } = uniform;
            let data: any = {
              name: key,
            };
            if (key.includes('uTroika')) {
              return;
            }
            if (value.isTexture) {
              TexCount++;
              data.value = addTextureUniforms(key, value);
            } else {
              let sb = JSON.stringify(value);
              try {
                sb = JSON.stringify(value);
              } catch (_err) {
                sb = value.toString();
              }
              data.value = sb;
            }
            format.set(key, data);
          }
        });
      }

      if (TexCount > 0) {
        setTexNumber(TexCount);
      }
      set(format);
    }
  }, []);

  return (
    <ProgramsUL>
      {uniforms &&
        Array.from(uniforms.values()).map((uniform: any) => {
          return (
            <span key={uniform.name}>
              {typeof uniform.value === 'string' ? (
                <li>
                  <span>
                    {uniform.name} :{' '}
                    <b>
                      {uniform.value.substring(0, 30)}
                      {uniform.value.length > 30 ? '...' : ''}
                    </b>
                  </span>
                </li>
              ) : (
                <>
                  <li>
                    <b>{uniform.value.name}:</b>
                  </li>
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
                        console.info(
                          material[uniform.value.name] ||
                            material?.uniforms[uniform.value.name]?.value
                        );
                      }}
                    >
                      console.info({uniform.value.name});
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

const DynamicDrawCallInfo = ({ el }: any) => {
  usePerf((state) => state.log);
  const gl: any = usePerf((state) => state.gl);

  const getVal = (el: any) => {
    if (!gl) return 0;

    const res =
      Math.round(
        (el.drawCounts.total /
          (gl.info.render.triangles +
            gl.info.render.lines +
            gl.info.render.points)) *
          100 *
          10
      ) / 10;
    return (isFinite(res) && res) || 0;
  };
  return (
    <>
      {el.drawCounts.total > 0 && (
        <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
          {el.drawCounts.type === 'Triangle' ? (
            <VercelLogoIcon style={{ top: '-1px' }} />
          ) : (
            <ActivityLogIcon style={{ top: '-1px' }} />
          )}
          {el.drawCounts.total}
          <small>{el.drawCounts.type}s</small>
          {gl && (
            <PerfB
              style={{ bottom: '-10px', width: '40px', fontWeight: 'bold' }}
            >
              {el.visible && !el.material.wireframe ? getVal(el) : 0}%
            </PerfB>
          )}
        </PerfI>
      )}
    </>
  );
};
const ProgramUI: FC<ProgramUIProps> = ({ el }) => {
  const [showProgram, setShowProgram] = useState(el.visible);

  const [toggleProgram, set] = useState(el.expand);
  const [texNumber, setTexNumber] = useState(0);
  const { meshes, program, material }: any = el;

  return (
    <ProgramGeo>
      <ProgramHeader
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
              <TriangleDownIcon />
            </span>
          ) : (
            <span>
              <TriangleUpIcon />
            </span>
          )}
        </Toggle>
        {program && (
          <span>
            <ProgramTitle>{program.name}</ProgramTitle>

            <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
              <LayersIcon style={{ top: '-1px' }} />
              {Object.keys(meshes).length}
              <small>{Object.keys(meshes).length > 1 ? 'users' : 'user'}</small>
            </PerfI>
            {texNumber > 0 && (
              <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
                {texNumber > 1 ? (
                  <ImageIcon style={{ top: '-1px' }} />
                ) : (
                  <ImageIcon style={{ top: '-1px' }} />
                )}
                {texNumber}
                <small>tex</small>
              </PerfI>
            )}
            <DynamicDrawCallInfo el={el} />
            {material.glslVersion === '300 es' && (
              <PerfI style={{ height: 'auto', width: 'auto', margin: '0 4px' }}>
                <RocketIcon style={{ top: '-1px' }} />
                300
                <small>es</small>
                <PerfB style={{ bottom: '-10px', width: '40px' }}>glsl</PerfB>
              </PerfI>
            )}
          </span>
        )}
        <ToggleVisible
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
          {showProgram ? <EyeOpenIcon /> : <EyeNoneIcon />}
        </ToggleVisible>
      </ProgramHeader>
      <div
        style={{ maxHeight: toggleProgram ? '9999px' : 0, overflow: 'hidden' }}
      >
        <ProgramsULHeader>
          <ButtonIcon /> Uniforms:
        </ProgramsULHeader>
        <UniformsGL
          program={program}
          material={material}
          setTexNumber={setTexNumber}
        />
        <ProgramsULHeader>
          <CubeIcon /> Geometries:
        </ProgramsULHeader>

        <ProgramsUL>
          {meshes &&
            Object.keys(meshes).map(
              (key) =>
                meshes[key] &&
                meshes[key].geometry && (
                  <ProgramsGeoLi key={key}>
                    <span>{meshes[key].geometry.type}: </span>
                    {meshes[key].userData && meshes[key].userData.drawCount && (
                      <b>
                        <div>
                          {meshes[key].userData.drawCount.count}
                          <small> {meshes[key].userData.drawCount.type}s</small>
                        </div>
                        <br />
                        <div>
                          {Math.round(
                            (estimateBytesUsed(meshes[key].geometry) / 1024) *
                              1000
                          ) / 1000}
                          Kb
                          <small> memory used</small>
                        </div>
                      </b>
                    )}
                  </ProgramsGeoLi>
                )
            )}
        </ProgramsUL>
        <ProgramConsole
          onClick={() => {
            console.info(material);
          }}
        >
          console.info({material.type})
        </ProgramConsole>
      </div>
    </ProgramGeo>
  );
};

export const ProgramsUI: FC<PerfProps> = () => {
  usePerf((state) => state.triggerProgramsUpdate);
  const programs:any = usePerf((state) => state.programs);
  return (
    <ProgramsContainer>
      {programs &&
        Array.from(programs.values()).map((el: any) => {
          if (!el) {
            return null;
          }
          return el ? <ProgramUI key={el.material.uuid} el={el} /> : null;
        })}
    </ProgramsContainer>
  );
};
