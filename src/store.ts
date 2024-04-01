import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'
import * as THREE from 'three'

type drawCount = {
  type: string
  drawCount: number
}
export type drawCounts = {
  total: number
  type: string
  data: drawCount[]
}

export type ProgramsPerf = {
  meshes?: {
    [index: string]: THREE.Mesh[]
  }
  material: THREE.Material
  program?: WebGLProgram
  visible: boolean
  drawCounts: drawCounts
  expand: boolean
}

type Logger = {
  i: number
  maxMemory: number
  gpu: number
  mem: number
  cpu: number
  fps: number
  duration: number
  frameCount: number
}

type GLLogger = {
  calls: number
  triangles: number
  points: number
  lines: number
  counts: number
}

export type State = {
  getReport: () => any
  log: any
  paused: boolean
  overclockingFps: boolean
  fpsLimit: number
  startTime: number
  triggerProgramsUpdate: number
  customData: number
  accumulated: {
    totalFrames: number
    log: Logger
    gl: GLLogger
    max: {
      log: Logger
      gl: GLLogger
    }
  }
  chart: {
    data: {
      [index: string]: number[]
    }
    circularId: number
  }
  infos: {
    version: string
    renderer: string
    vendor: string
  }
  gl: THREE.WebGLRenderer | undefined
  scene: THREE.Scene | undefined
  programs: ProgramsPerfs
  objectWithMaterials: THREE.Mesh[] | null
  tab: 'infos' | 'programs' | 'data'
}

export type ProgramsPerfs = Map<string, ProgramsPerf>

const setCustomData = (customData: number) => {
  setPerf({ customData })
}
const getCustomData = () => {
  return getPerf().customData
}

export const usePerfImpl = createWithEqualityFn<State>((set, get): any => {
  function getReport() {
    const { accumulated, startTime, infos } = get()
    const maxMemory = get().log?.maxMemory
    const { totalFrames, log, gl, max } = accumulated

    const glAverage = {
      calls: gl.calls / totalFrames,
      triangles: gl.triangles / totalFrames,
      points: gl.points / totalFrames,
      lines: gl.lines / totalFrames,
    }

    const logAverage = {
      gpu: log.gpu / totalFrames,
      cpu: log.cpu / totalFrames,
      mem: log.mem / totalFrames,
      fps: log.fps / totalFrames,
    }

    const sessionTime = (window.performance.now() - startTime) / 1000

    return {
      sessionTime,
      infos,
      log: logAverage,
      gl: glAverage,
      max,
      maxMemory,
      totalFrames,
    }
  }

  return {
    log: null,
    paused: false,
    triggerProgramsUpdate: 0,
    startTime: 0,
    customData: 0,
    fpsLimit: 60,
    overclockingFps: false,
    accumulated: {
      totalFrames: 0,
      gl: {
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
        counts: 0,
      },
      log: {
        gpu: 0,
        cpu: 0,
        mem: 0,
        fps: 0,
      },
      max: {
        gl: {
          calls: 0,
          triangles: 0,
          points: 0,
          lines: 0,
          counts: 0,
        },
        log: {
          gpu: 0,
          cpu: 0,
          mem: 0,
          fps: 0,
        },
      },
    },
    chart: {
      data: {
        fps: [],
        cpu: [],
        gpu: [],
        mem: [],
      },
      circularId: 0,
    },
    gl: undefined,
    objectWithMaterials: null,
    scene: undefined,
    programs: new Map(),
    sceneLength: undefined,
    tab: 'infos',
    getReport,
  }
})

const usePerf = (sel: (state: State) => unknown) => usePerfImpl(sel, shallow)
Object.assign(usePerf, usePerfImpl)
const { getState: getPerf, setState: setPerf } = usePerfImpl

export { usePerf, getPerf, setPerf, setCustomData, getCustomData }
