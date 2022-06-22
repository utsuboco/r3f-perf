import { MathUtils } from "three";

declare global {
  interface Window {
    GLPerf: any;
  }
  interface Performance {
    memory: any;
  }
}

export default class GLPerf {
  names: string[] = [''];
  finished: any[] = [];
  gl: any;
  extension: any;
  query: any;
  paused: boolean = false;
  queryHasResult: boolean = false;
  queryCreated: boolean = false;
  isWebGL2: boolean = true;
  memAccums: number[] = [];
  gpuAccums: number[] = [];
  activeAccums: boolean[] = [];
  chart: number[] = [];
  gpuChart: number[] = [];
  memChart: number[] = [];
  paramLogger: any = () => {};
  glFinish: any = () => {};
  chartLogger: any = () => {};
  chartLen: number = 60;
  maxMemory: number = 1500;
  chartHz: number = 10;
  chartFrame: number = 0;
  gpuTimeProcess: number = 0;
  chartTime: number = 0;
  activeQueries: number = 0;
  circularId: number = 0;
  detected: number = 0;
  frameId: number = 0;
  rafId: number = 0;
  checkQueryId: number = 0;
  uuid: string|undefined = undefined;
  currentMem: number = 0;
  paramFrame: number = 0;
  paramTime: number = 0;
  now: any = () => {};
  t0: number = 0;

  constructor(settings: object = {}) {
    window.GLPerf = window.GLPerf || {};

    Object.assign(this, settings);

    this.chart = new Array(this.chartLen).fill(0);
    this.gpuChart = new Array(this.chartLen).fill(0);
    this.memChart = new Array(this.chartLen).fill(0);
    this.now = () =>
      window.performance && window.performance.now
        ? window.performance.now()
        : Date.now();
    this.initGpu();
    this.is120hz();
  }
  initGpu() {
    this.uuid = MathUtils.generateUUID()
    if (this.gl) {
      this.isWebGL2 = true;
      if (!this.extension) {
        this.extension = this.gl.getExtension('EXT_disjoint_timer_query_webgl2');
      }
      if (this.extension === null) {
        this.isWebGL2 = false;
      }
    }
  }

  /**
   * 120hz device detection
   */
  is120hz() {
    let n = 0;
    const loop = (t: number) => {
      if (++n < 20) {
        this.rafId = window.requestAnimationFrame(loop);
      } else {
        this.detected = Math.ceil((1e3 * n) / (t - this.t0) / 70);
        window.cancelAnimationFrame(this.rafId);
      }
      if (!this.t0) this.t0 = t;
    };
    this.rafId = window.requestAnimationFrame(loop);
  }

  /**
   * Explicit UI add
   * @param { string | undefined } name
   */
  addUI(name: string) {
    if (this.names.indexOf(name) === -1) {
      this.names.push(name);
      this.gpuAccums.push(0);
      this.activeAccums.push(false);
    }
  }

  /**
   * Increase frameID
   * @param { any | undefined } now
   */
  nextFrame(now: any) {
    this.frameId++;
    const t = now || this.now();
    const duration = t - this.paramTime;
    let gpu = 0;
    // params
    if (this.frameId <= 1) {
      this.paramFrame = this.frameId;
      this.paramTime = t;
    } else {
      if ( t >= this.paramTime + 200 ) {
      // if (duration >= 60) {
        this.maxMemory =  window.performance.memory ? window.performance.memory.jsHeapSizeLimit / 1048576 : 0
        const frameCount = this.frameId - this.paramFrame;
        const fps = (frameCount * 1000) / (duration);
        for (let i = 0; i < this.names.length; i++) {
          gpu = this.isWebGL2
            ? this.gpuAccums[i]
            : this.gpuAccums[i] / duration;

            this.currentMem = Math.round(
            window.performance && window.performance.memory
              ? window.performance.memory.usedJSHeapSize / 1048576
              : 0
          );
          this.paramLogger({
            gpu,
            i,
            mem: this.currentMem,
            maxMemory: this.maxMemory,
            fps: fps,
            duration: Math.round(duration),
            frameCount,
          });
          if (this.isWebGL2) {
            this.gpuAccums[i] = 0;
          } else {
            Promise.all(this.finished).then(() => {
              this.gpuAccums[i] = 0;
              this.finished = [];
            });
          }
        }
        this.paramFrame = this.frameId;
        this.paramTime = t;
      }
    }

    // chart
    if (!this.detected || !this.chartFrame) {
      this.chartFrame = this.frameId;
      this.chartTime = t;
      this.circularId = 0;
    } else {
      const timespan = t - this.chartTime;
      let hz = (this.chartHz * timespan) / 1e3;
      while (--hz > 0 && this.detected) {
        const frameCount = this.frameId - this.chartFrame;
        const fps = (frameCount / timespan) * 1e3;
        this.chart[this.circularId % this.chartLen] = fps;
        const memS = 1000 / this.currentMem;
        const gpuS =
          (this.isWebGL2
            ? this.gpuAccums[1] * 2
            : Math.round((this.gpuAccums[1] / duration) * 100)) + 4;
        if (gpuS > 0) {
          this.gpuChart[this.circularId % this.chartLen] = gpuS;
        }
        if (memS > 0) {
          this.memChart[this.circularId % this.chartLen] = memS;
        }
        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger({
            i,
            data: {
              fps: this.chart,
              gpu: this.gpuChart,
              mem: this.memChart,
            },
            circularId: this.circularId,
          });
        }
        this.circularId++;
        this.chartFrame = this.frameId;
        this.chartTime = t;
      }
    }
  }

  
  startGpu() {
    const gl = this.gl;
    const ext = this.extension;

    if (!gl || !ext) return
    if (this.isWebGL2) {
      let available = false;
      let disjoint: any, ns: any;

      if (this.query) {
        this.queryHasResult = false
        let query = this.query
        // console.log())
        // console.log(gl.getParameter(ext.TIMESTAMP_EXT))
        available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
        disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);

        if (available && !disjoint) {
          ns = gl.getQueryParameter(this.query, gl.QUERY_RESULT);
          const ms = ns * 1e-6;

          if (available && ms > 0) {
            // update the display if it is valid
            if (!disjoint) {
              this.activeAccums.forEach((_active: any, i: any) => {
                this.gpuAccums[i] = ms;
              });
            }
          }
        }
      }
     
      if (available || !this.query) {
        this.queryCreated = true
        this.query = gl.createQuery();
        
        gl.beginQuery(ext.TIME_ELAPSED_EXT, this.query);
      }

   
    }
  }

  endGpu() {
    // finish the query measurement
    const ext = this.extension;
    const gl = this.gl;

    if (this.isWebGL2 && this.queryCreated && gl.getQuery(ext.TIME_ELAPSED_EXT, gl.CURRENT_QUERY)) {
      gl.endQuery(ext.TIME_ELAPSED_EXT);
    }
  }

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name: string) {
    this.startGpu();
    this.updateAccums(name);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name: string) {
    this.endGpu();
    this.updateAccums(name);
  }

  updateAccums(name: string) {
    let nameId = this.names.indexOf(name);
    if (nameId === -1) {
      nameId = this.names.length;
      this.addUI(name);
    }

    const t = this.now();

    this.activeAccums[nameId] = !this.activeAccums[nameId];
    this.t0 = t;
  }
}
