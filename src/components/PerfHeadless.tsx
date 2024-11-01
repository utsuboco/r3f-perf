import { type FC, type HTMLAttributes, useEffect, useMemo } from 'react'
import { addEffect, addAfterEffect, useThree, addTail } from '@react-three/fiber'
import { overLimitFps, GLPerf } from '../internal'

import * as THREE from 'three'
import { countGeoDrawCalls } from '../helpers/countGeoDrawCalls'
import { getPerf, type ProgramsPerfs, setPerf } from '../store'
import type { PerfProps } from '../types'
import { emitEvent } from '@utsubo/events'

// cameras from r3f-perf scene

// @ts-ignore
const updateMatrixWorldTemp = THREE.Object3D.prototype.updateMatrixWorld
const updateWorldMatrixTemp = THREE.Object3D.prototype.updateWorldMatrix
const updateMatrixTemp = THREE.Object3D.prototype.updateMatrix

const maxGl = ['calls', 'triangles', 'points', 'lines']
const maxLog = ['gpu', 'cpu', 'mem', 'fps']

export let matriceWorldCount = {
  value: 0,
}
export let matriceCount = {
  value: 0,
}

const isUUID = (uuid: string) => {
  let s: any = '' + uuid

  s = s.match('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
  if (s === null) {
    return false
  }
  return true
}

const addMuiPerfID = (material: THREE.Material, currentObjectWithMaterials: any) => {
  if (!material.defines) {
    material.defines = {}
  }

  if (material.defines && !material.defines.muiPerf) {
    material.defines = Object.assign(material.defines || {}, {
      muiPerf: material.uuid,
    })
  }

  const uuid = material.uuid

  if (!currentObjectWithMaterials[uuid]) {
    currentObjectWithMaterials[uuid] = {
      meshes: {},
      material: material,
    }
    material.needsUpdate = true
  }
  material.needsUpdate = false
  return uuid
}

type Chart = {
  data: {
    [index: string]: number[]
  }
  id: number
  circularId: number
}

const getMUIIndex = (muid: string) => muid === 'muiPerf'

export interface Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * Performance profiler component
 */
export const PerfHeadless: FC<PerfProps> = ({ overClock, logsPerSecond, chart, deepAnalyze, matrixUpdate }) => {
  const { gl, scene } = useThree()
  setPerf({ gl, scene })

  const PerfLib = useMemo(() => {
    const PerfLib = new GLPerf({
      trackGPU: true,
      overClock: overClock,
      chartLen: chart ? chart.length : 120,
      chartHz: chart ? chart.hz : 60,
      logsPerSecond: logsPerSecond || 10,
      gl: gl.getContext(),
      chartLogger: (chart: Chart) => {
        setPerf({ chart })
      },
      paramLogger: (logger: any) => {
        const log = {
          maxMemory: logger.maxMemory,
          gpu: logger.gpu,
          cpu: logger.cpu,
          mem: logger.mem,
          fps: logger.fps,
          totalTime: logger.duration,
          frameCount: logger.frameCount,
        }
        setPerf({
          log,
        })
        const { accumulated }: any = getPerf()
        const glRender: any = gl.info.render

        accumulated.totalFrames++
        accumulated.gl.calls += glRender.calls
        accumulated.gl.triangles += glRender.triangles
        accumulated.gl.points += glRender.points
        accumulated.gl.lines += glRender.lines

        accumulated.log.gpu += logger.gpu
        accumulated.log.cpu += logger.cpu
        accumulated.log.mem += logger.mem
        accumulated.log.fps += logger.fps
        // calculate max
        for (let i = 0; i < maxGl.length; i++) {
          const key = maxGl[i]
          const value = glRender[key]
          if (value > accumulated.max.gl[key]) {
            accumulated.max.gl[key] = value
          }
        }

        for (let i = 0; i < maxLog.length; i++) {
          const key = maxLog[i]
          const value = logger[key]
          if (value > accumulated.max.log[key]) {
            accumulated.max.log[key] = value
          }
        }

        // TODO CONVERT TO OBJECT AND VALUE ALWAYS 0 THIS IS NOT CALL
        setPerf({ accumulated })

        emitEvent('log', [log, gl])
      },
    })

    // Infos

    const ctx = gl.getContext()
    let glRenderer = null
    let glVendor = null

    const rendererInfo: any = ctx.getExtension('WEBGL_debug_renderer_info')
    const glVersion = ctx.getParameter(ctx.VERSION)

    if (rendererInfo != null) {
      glRenderer = ctx.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL)
      glVendor = ctx.getParameter(rendererInfo.UNMASKED_VENDOR_WEBGL)
    }

    if (!glVendor) {
      glVendor = 'Unknown vendor'
    }

    if (!glRenderer) {
      glRenderer = ctx.getParameter(ctx.RENDERER)
    }

    setPerf({
      startTime: window.performance.now(),
      infos: {
        version: glVersion,
        renderer: glRenderer,
        vendor: glVendor,
      },
    })

    const callbacks = new Map()
    const callbacksAfter = new Map()
    Object.defineProperty(THREE.Scene.prototype, 'onBeforeRender', {
      get() {
        return (...args: any) => {
          if (PerfLib) {
            PerfLib.begin('profiler')
          }
          callbacks.get(this)?.(...args)
        }
      },
      set(callback) {
        callbacks.set(this, callback)
      },
      configurable: true,
    })

    Object.defineProperty(THREE.Scene.prototype, 'onAfterRender', {
      get() {
        return (...args: any) => {
          if (PerfLib) {
            PerfLib.end('profiler')
          }
          callbacksAfter.get(this)?.(...args)
        }
      },
      set(callback) {
        callbacksAfter.set(this, callback)
      },
      configurable: true,
    })

    return PerfLib
  }, [])

  useEffect(() => {
    if (PerfLib) {
      PerfLib.overClock = overClock || false
      if (overClock === false) {
        setPerf({ overclockingFps: false })
        overLimitFps.value = 0
        overLimitFps.isOverLimit = 0
      }
      PerfLib.chartHz = chart?.hz || 60
      PerfLib.chartLen = chart?.length || 120
    }
  }, [overClock, PerfLib, chart?.length, chart?.hz])

  useEffect(() => {
    if (matrixUpdate) {
      THREE.Object3D.prototype.updateMatrixWorld = function () {
        if (this.matrixWorldNeedsUpdate || arguments[0] /*force*/) {
          matriceWorldCount.value++
        }
        // @ts-ignore
        updateMatrixWorldTemp.apply(this, arguments)
      }
      THREE.Object3D.prototype.updateWorldMatrix = function () {
        matriceWorldCount.value++
        // @ts-ignore
        updateWorldMatrixTemp.apply(this, arguments)
      }
      THREE.Object3D.prototype.updateMatrix = function () {
        matriceCount.value++
        // @ts-ignore
        updateMatrixTemp.apply(this, arguments)
      }
    }

    gl.info.autoReset = false
    let effectSub: any = null
    let afterEffectSub: any = null
    if (!gl.info) return

    effectSub = addEffect(function preRafR3FPerf() {
      if (getPerf().paused) {
        setPerf({ paused: false })
      }

      if (window.performance) {
        window.performance.mark('cpu-started')
        PerfLib.startCpuProfiling = true
      }

      matriceCount.value -= 1
      matriceWorldCount.value = 0
      matriceCount.value = 0

      if (gl.info) {
        gl.info.reset()
      }
    })

    afterEffectSub = addAfterEffect(function postRafR3FPerf() {
      if (PerfLib && !PerfLib.paused) {
        PerfLib.nextFrame(window.performance.now())

        if (overClock && typeof window.requestIdleCallback !== 'undefined') {
          PerfLib.idleCbId = requestIdleCallback(PerfLib.nextFps)
        }
      }
      if (deepAnalyze) {
        const currentObjectWithMaterials: any = {}
        const programs: ProgramsPerfs = new Map()

        scene.traverse(function deepAnalyzeR3FPerf(object) {
          if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
            if (object.material) {
              let uuid = object.material.uuid
              // troika generate and attach 2 materials
              const isTroika = Array.isArray(object.material) && object.material.length > 1
              if (isTroika) {
                uuid = addMuiPerfID(object.material[1], currentObjectWithMaterials)
              } else {
                uuid = addMuiPerfID(object.material, currentObjectWithMaterials)
              }

              currentObjectWithMaterials[uuid].meshes[object.uuid] = object
            }
          }
        })

        gl?.info?.programs?.forEach((program: any) => {
          const cacheKeySplited = program.cacheKey.split(',')
          const muiPerfTracker = cacheKeySplited[cacheKeySplited.findIndex(getMUIIndex) + 1]
          if (isUUID(muiPerfTracker) && currentObjectWithMaterials[muiPerfTracker]) {
            const { material, meshes } = currentObjectWithMaterials[muiPerfTracker]
            programs.set(muiPerfTracker, {
              program,
              material,
              meshes,
              drawCounts: {
                total: 0,
                type: 'triangle',
                data: [],
              },
              expand: false,
              visible: true,
            })
          }
        })

        if (programs.size !== getPerf().programs.size) {
          countGeoDrawCalls(programs)
          setPerf({
            programs: programs,
            triggerProgramsUpdate: getPerf().triggerProgramsUpdate++,
          })
        }
      }
    })

    return () => {
      if (PerfLib) {
        if (typeof window.cancelIdleCallback !== 'undefined') {
          window.cancelIdleCallback(PerfLib.idleCbId)
        }
        window.cancelAnimationFrame(PerfLib.rafId)
        window.cancelAnimationFrame(PerfLib.checkQueryId)
      }

      if (matrixUpdate) {
        THREE.Object3D.prototype.updateMatrixWorld = updateMatrixTemp
      }

      effectSub()
      afterEffectSub()
    }
  }, [PerfLib, gl, chart, matrixUpdate])

  useEffect(() => {
    const unsub = addTail(function postRafTailR3FPerf() {
      if (PerfLib) {
        PerfLib.paused = true
        matriceCount.value = 0
        matriceWorldCount.value = 0
        setPerf({
          paused: true,
          log: {
            maxMemory: 0,
            gpu: 0,
            mem: 0,
            cpu: 0,
            fps: 0,
            totalTime: 0,
            frameCount: 0,
          },
        })
      }
      return false
    })

    return () => {
      unsub()
    }
  }, [])

  return null
}
