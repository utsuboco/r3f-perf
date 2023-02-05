import { MathUtils } from 'three'
import { getPerf, setPerf } from './store'

declare global {
  interface Window {
    GLPerf: any
  }
  interface Performance {
    memory: any
  }
}

export const overLimitFps = {
  value: 0,
  fpsLimit: 60,
  isOverLimit: 0,
}

interface LogsAccums {
  mem: number[]
  gpu: number[]
  cpu: number[]
  fps: number[]
  fpsFixed: number[]
}

const average = (arr: number[]) => arr?.reduce((a: number, b: number) => a + b, 0) / arr.length

export class GLPerf {
  names: string[] = ['']
  finished: any[] = []
  gl: any
  extension: any
  query: any
  paused: boolean = false
  overClock: boolean = false
  queryHasResult: boolean = false
  queryCreated: boolean = false
  isWebGL2: boolean = true
  memAccums: number[] = []
  gpuAccums: number[] = []
  activeAccums: boolean[] = []
  logsAccums: LogsAccums = {
    mem: [],
    gpu: [],
    cpu: [],
    fps: [],
    fpsFixed: [],
  }
  fpsChart: number[] = []
  gpuChart: number[] = []
  cpuChart: number[] = []
  memChart: number[] = []
  paramLogger: any = () => {}
  glFinish: any = () => {}
  chartLogger: any = () => {}
  chartLen: number = 60
  logsPerSecond: number = 10
  maxMemory: number = 1500
  chartHz: number = 10
  startCpuProfiling: boolean = false
  lastCalculateFixed: number = 0
  chartFrame: number = 0
  gpuTimeProcess: number = 0
  chartTime: number = 0
  activeQueries: number = 0
  circularId: number = 0
  detected: number = 0
  frameId: number = 0
  rafId: number = 0
  idleCbId: number = 0
  checkQueryId: number = 0
  uuid: string | undefined = undefined
  currentCpu: number = 0
  currentMem: number = 0
  paramFrame: number = 0
  paramTime: number = 0
  now: any = () => {}
  t0: number = 0

  constructor(settings: object = {}) {
    window.GLPerf = window.GLPerf || {}

    Object.assign(this, settings)

    this.fpsChart = new Array(this.chartLen).fill(0)
    this.gpuChart = new Array(this.chartLen).fill(0)
    this.cpuChart = new Array(this.chartLen).fill(0)
    this.memChart = new Array(this.chartLen).fill(0)
    this.now = () => (window.performance && window.performance.now ? window.performance.now() : Date.now())
    this.initGpu()
    this.is120hz()
  }
  initGpu() {
    this.uuid = MathUtils.generateUUID()
    if (this.gl) {
      this.isWebGL2 = true
      if (!this.extension) {
        this.extension = this.gl.getExtension('EXT_disjoint_timer_query_webgl2')
      }
      if (this.extension === null) {
        this.isWebGL2 = false
      }
    }
  }
  /**
   * 120hz device detection
   */
  is120hz() {
    let n = 0
    const loop = (t: number) => {
      if (++n < 20) {
        this.rafId = window.requestAnimationFrame(loop)
      } else {
        this.detected = Math.ceil((1e3 * n) / (t - this.t0) / 70)
        window.cancelAnimationFrame(this.rafId)
      }
      if (!this.t0) this.t0 = t
    }
    this.rafId = window.requestAnimationFrame(loop)
  }

  /**
   * Explicit UI add
   * @param { string | undefined } name
   */
  addUI(name: string) {
    if (this.names.indexOf(name) === -1) {
      this.names.push(name)
      this.gpuAccums.push(0)
      this.activeAccums.push(false)
    }
  }

  nextFps(d: any) {
    const goal = 1000 / 60
    const elapsed = goal - d.timeRemaining()
    const fps = (goal * overLimitFps.fpsLimit) / 10 / elapsed
    if (fps < 0) return

    overLimitFps.value = fps
    if (overLimitFps.isOverLimit < 25) {
      overLimitFps.isOverLimit++
    } else {
      setPerf({ overclockingFps: true })
    }
  }
  /**
   * Increase frameID
   * @param { any | undefined } now
   */
  nextFrame(now: any) {
    this.frameId++
    const t = now || this.now()
    let duration = t - this.paramTime
    let gpu = 0
    // params
    if (this.frameId <= 1) {
      this.paramFrame = this.frameId
      this.paramTime = t
    } else {
      if (t >= this.paramTime) {
        this.maxMemory = window.performance.memory ? window.performance.memory.jsHeapSizeLimit / 1048576 : 0
        const frameCount = this.frameId - this.paramFrame
        const fpsFixed = (frameCount * 1000) / duration
        const fps = getPerf().overclockingFps ? overLimitFps.value : fpsFixed

        gpu = this.isWebGL2 ? this.gpuAccums[0] : this.gpuAccums[0] / duration

        if (this.isWebGL2) {
          this.gpuAccums[0] = 0
        } else {
          Promise.all(this.finished).then(() => {
            this.gpuAccums[0] = 0
            this.finished = []
          })
        }

        this.currentMem = Math.round(
          window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize / 1048576 : 0
        )

        if (window.performance && this.startCpuProfiling) {
          window.performance.mark('cpu-finished')
          const cpuMeasure = performance.measure('cpu-duration', 'cpu-started', 'cpu-finished')
          this.currentCpu = cpuMeasure.duration

          this.logsAccums.cpu.push(this.currentCpu)
          // make sure the measure has started and ended
          this.startCpuProfiling = false
        }

        this.logsAccums.mem.push(this.currentMem)
        this.logsAccums.fpsFixed.push(fpsFixed)
        this.logsAccums.fps.push(fps)
        this.logsAccums.gpu.push(gpu)

        if (this.overClock && typeof window.requestIdleCallback !== 'undefined') {
          if (overLimitFps.isOverLimit > 0 && fps > fpsFixed) {
            overLimitFps.isOverLimit--
          } else if (getPerf().overclockingFps) {
            setPerf({ overclockingFps: false })
          }
        }
        // TODO 200 to settings
        if (t >= this.paramTime + 1000 / this.logsPerSecond) {
          this.paramLogger({
            cpu: average(this.logsAccums.cpu),
            gpu: average(this.logsAccums.gpu),
            mem: average(this.logsAccums.mem),
            fps: average(this.logsAccums.fps),
            duration: Math.round(duration),
            maxMemory: this.maxMemory,
            frameCount,
          })

          this.logsAccums.mem = []
          this.logsAccums.fps = []
          this.logsAccums.gpu = []
          this.logsAccums.cpu = []

          this.paramFrame = this.frameId
          this.paramTime = t
        }

        if (this.overClock) {
          // calculate the max framerate every two seconds
          if (t - this.lastCalculateFixed >= 2 * 1000) {
            this.lastCalculateFixed = now
            overLimitFps.fpsLimit = Math.round(average(this.logsAccums.fpsFixed) / 10) * 100
            setPerf({ fpsLimit: overLimitFps.fpsLimit / 10 })
            this.logsAccums.fpsFixed = []

            this.paramFrame = this.frameId
            this.paramTime = t
          }
        }
      }
    }

    // chart
    if (!this.detected || !this.chartFrame) {
      this.chartFrame = this.frameId
      this.chartTime = t
      this.circularId = 0
    } else {
      const timespan = t - this.chartTime
      let hz = (this.chartHz * timespan) / 1e3
      while (--hz > 0 && this.detected) {
        const frameCount = this.frameId - this.chartFrame
        const fpsFixed = (frameCount / timespan) * 1e3
        const fps = getPerf().overclockingFps ? overLimitFps.value : fpsFixed
        this.fpsChart[this.circularId % this.chartLen] = fps
        // this.fpsChart[this.circularId % this.chartLen] = ((overLimitFps.isOverLimit > 0 ? overLimitFps.value : fps) / overLimitFps.fpsLimit) * 60;
        const memS = 1000 / this.currentMem
        const cpuS = this.currentCpu
        const gpuS = (this.isWebGL2 ? this.gpuAccums[1] * 2 : Math.round((this.gpuAccums[1] / duration) * 100)) + 4
        if (gpuS > 0) {
          this.gpuChart[this.circularId % this.chartLen] = gpuS
        }
        if (cpuS > 0) {
          this.cpuChart[this.circularId % this.chartLen] = cpuS
        }
        if (memS > 0) {
          this.memChart[this.circularId % this.chartLen] = memS
        }
        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger({
            i,
            data: {
              fps: this.fpsChart,
              gpu: this.gpuChart,
              cpu: this.cpuChart,
              mem: this.memChart,
            },
            circularId: this.circularId,
          })
        }
        this.circularId++
        this.chartFrame = this.frameId
        this.chartTime = t
      }
    }
  }

  startGpu() {
    const gl = this.gl
    const ext = this.extension

    if (!gl || !ext) return
    if (this.isWebGL2) {
      let available = false
      let disjoint: any, ns: any

      if (this.query) {
        this.queryHasResult = false
        let query = this.query
        // console.log(gl.getParameter(ext.TIMESTAMP_EXT))
        available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE)
        disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT)

        if (available && !disjoint) {
          ns = gl.getQueryParameter(this.query, gl.QUERY_RESULT)
          const ms = ns * 1e-6

          if (available || disjoint) {
            // Clean up the query object.
            gl.deleteQuery(this.query)
            // Don't re-enter this polling loop.
            query = null
          }

          if (available && ms > 0) {
            // update the display if it is valid
            if (!disjoint) {
              this.activeAccums.forEach((_active: any, i: any) => {
                this.gpuAccums[i] = ms
              })
            }
          }
        }
      }

      if (available || !this.query) {
        this.queryCreated = true
        this.query = gl.createQuery()

        gl.beginQuery(ext.TIME_ELAPSED_EXT, this.query)
      }
    }
  }

  endGpu() {
    // finish the query measurement
    const ext = this.extension
    const gl = this.gl

    if (this.isWebGL2 && this.queryCreated && gl.getQuery(ext.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) {
      gl.endQuery(ext.TIME_ELAPSED_EXT)
    }
  }

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name: string) {
    this.startGpu()
    this.updateAccums(name)
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name: string) {
    this.endGpu()
    this.updateAccums(name)
  }

  updateAccums(name: string) {
    let nameId = this.names.indexOf(name)
    if (nameId === -1) {
      nameId = this.names.length
      this.addUI(name)
    }

    const t = this.now()

    this.activeAccums[nameId] = !this.activeAccums[nameId]
    this.t0 = t
  }
}
