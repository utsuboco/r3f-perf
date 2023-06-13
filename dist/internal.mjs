import { MathUtils } from "three";
import { setPerf, getPerf } from "./store.mjs";
const overLimitFps = {
  value: 0,
  fpsLimit: 60,
  isOverLimit: 0
};
const average = (arr) => (arr == null ? void 0 : arr.reduce((a, b) => a + b, 0)) / arr.length;
class GLPerf {
  constructor(settings = {}) {
    this.names = [""];
    this.finished = [];
    this.paused = false;
    this.overClock = false;
    this.queryHasResult = false;
    this.queryCreated = false;
    this.isWebGL2 = true;
    this.memAccums = [];
    this.gpuAccums = [];
    this.activeAccums = [];
    this.logsAccums = {
      mem: [],
      gpu: [],
      cpu: [],
      fps: [],
      fpsFixed: []
    };
    this.fpsChart = [];
    this.gpuChart = [];
    this.cpuChart = [];
    this.memChart = [];
    this.paramLogger = () => {
    };
    this.glFinish = () => {
    };
    this.chartLogger = () => {
    };
    this.chartLen = 60;
    this.logsPerSecond = 10;
    this.maxMemory = 1500;
    this.chartHz = 10;
    this.startCpuProfiling = false;
    this.lastCalculateFixed = 0;
    this.chartFrame = 0;
    this.gpuTimeProcess = 0;
    this.chartTime = 0;
    this.activeQueries = 0;
    this.circularId = 0;
    this.detected = 0;
    this.frameId = 0;
    this.rafId = 0;
    this.idleCbId = 0;
    this.checkQueryId = 0;
    this.uuid = void 0;
    this.currentCpu = 0;
    this.currentMem = 0;
    this.paramFrame = 0;
    this.paramTime = 0;
    this.now = () => {
    };
    this.t0 = 0;
    window.GLPerf = window.GLPerf || {};
    Object.assign(this, settings);
    this.fpsChart = new Array(this.chartLen).fill(0);
    this.gpuChart = new Array(this.chartLen).fill(0);
    this.cpuChart = new Array(this.chartLen).fill(0);
    this.memChart = new Array(this.chartLen).fill(0);
    this.now = () => window.performance && window.performance.now ? window.performance.now() : Date.now();
    this.initGpu();
    this.is120hz();
  }
  initGpu() {
    this.uuid = MathUtils.generateUUID();
    if (this.gl) {
      this.isWebGL2 = true;
      if (!this.extension) {
        this.extension = this.gl.getExtension("EXT_disjoint_timer_query_webgl2");
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
    const loop = (t) => {
      if (++n < 20) {
        this.rafId = window.requestAnimationFrame(loop);
      } else {
        this.detected = Math.ceil(1e3 * n / (t - this.t0) / 70);
        window.cancelAnimationFrame(this.rafId);
      }
      if (!this.t0)
        this.t0 = t;
    };
    this.rafId = window.requestAnimationFrame(loop);
  }
  /**
   * Explicit UI add
   * @param { string | undefined } name
   */
  addUI(name) {
    if (this.names.indexOf(name) === -1) {
      this.names.push(name);
      this.gpuAccums.push(0);
      this.activeAccums.push(false);
    }
  }
  nextFps(d) {
    const goal = 1e3 / 60;
    const elapsed = goal - d.timeRemaining();
    const fps = goal * overLimitFps.fpsLimit / 10 / elapsed;
    if (fps < 0)
      return;
    overLimitFps.value = fps;
    if (overLimitFps.isOverLimit < 25) {
      overLimitFps.isOverLimit++;
    } else {
      setPerf({ overclockingFps: true });
    }
  }
  /**
   * Increase frameID
   * @param { any | undefined } now
   */
  nextFrame(now) {
    this.frameId++;
    const t = now || this.now();
    let duration = t - this.paramTime;
    let gpu = 0;
    if (this.frameId <= 1) {
      this.paramFrame = this.frameId;
      this.paramTime = t;
    } else {
      if (t >= this.paramTime) {
        this.maxMemory = window.performance.memory ? window.performance.memory.jsHeapSizeLimit / 1048576 : 0;
        const frameCount = this.frameId - this.paramFrame;
        const fpsFixed = frameCount * 1e3 / duration;
        const fps = getPerf().overclockingFps ? overLimitFps.value : fpsFixed;
        gpu = this.isWebGL2 ? this.gpuAccums[0] : this.gpuAccums[0] / duration;
        if (this.isWebGL2) {
          this.gpuAccums[0] = 0;
        } else {
          Promise.all(this.finished).then(() => {
            this.gpuAccums[0] = 0;
            this.finished = [];
          });
        }
        this.currentMem = Math.round(
          window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize / 1048576 : 0
        );
        if (window.performance && this.startCpuProfiling) {
          window.performance.mark("cpu-finished");
          const cpuMeasure = performance.measure("cpu-duration", "cpu-started", "cpu-finished");
          this.currentCpu = (cpuMeasure == null ? void 0 : cpuMeasure.duration) || 0;
          this.logsAccums.cpu.push(this.currentCpu);
          this.startCpuProfiling = false;
        }
        this.logsAccums.mem.push(this.currentMem);
        this.logsAccums.fpsFixed.push(fpsFixed);
        this.logsAccums.fps.push(fps);
        this.logsAccums.gpu.push(gpu);
        if (this.overClock && typeof window.requestIdleCallback !== "undefined") {
          if (overLimitFps.isOverLimit > 0 && fps > fpsFixed) {
            overLimitFps.isOverLimit--;
          } else if (getPerf().overclockingFps) {
            setPerf({ overclockingFps: false });
          }
        }
        if (t >= this.paramTime + 1e3 / this.logsPerSecond) {
          this.paramLogger({
            cpu: average(this.logsAccums.cpu),
            gpu: average(this.logsAccums.gpu),
            mem: average(this.logsAccums.mem),
            fps: average(this.logsAccums.fps),
            duration: Math.round(duration),
            maxMemory: this.maxMemory,
            frameCount
          });
          this.logsAccums.mem = [];
          this.logsAccums.fps = [];
          this.logsAccums.gpu = [];
          this.logsAccums.cpu = [];
          this.paramFrame = this.frameId;
          this.paramTime = t;
        }
        if (this.overClock) {
          if (t - this.lastCalculateFixed >= 2 * 1e3) {
            this.lastCalculateFixed = now;
            overLimitFps.fpsLimit = Math.round(average(this.logsAccums.fpsFixed) / 10) * 100;
            setPerf({ fpsLimit: overLimitFps.fpsLimit / 10 });
            this.logsAccums.fpsFixed = [];
            this.paramFrame = this.frameId;
            this.paramTime = t;
          }
        }
      }
    }
    if (!this.detected || !this.chartFrame) {
      this.chartFrame = this.frameId;
      this.chartTime = t;
      this.circularId = 0;
    } else {
      const timespan = t - this.chartTime;
      let hz = this.chartHz * timespan / 1e3;
      while (--hz > 0 && this.detected) {
        const frameCount = this.frameId - this.chartFrame;
        const fpsFixed = frameCount / timespan * 1e3;
        const fps = getPerf().overclockingFps ? overLimitFps.value : fpsFixed;
        this.fpsChart[this.circularId % this.chartLen] = fps;
        const memS = 1e3 / this.currentMem;
        const cpuS = this.currentCpu;
        const gpuS = (this.isWebGL2 ? this.gpuAccums[1] * 2 : Math.round(this.gpuAccums[1] / duration * 100)) + 4;
        if (gpuS > 0) {
          this.gpuChart[this.circularId % this.chartLen] = gpuS;
        }
        if (cpuS > 0) {
          this.cpuChart[this.circularId % this.chartLen] = cpuS;
        }
        if (memS > 0) {
          this.memChart[this.circularId % this.chartLen] = memS;
        }
        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger({
            i,
            data: {
              fps: this.fpsChart,
              gpu: this.gpuChart,
              cpu: this.cpuChart,
              mem: this.memChart
            },
            circularId: this.circularId
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
    if (!gl || !ext)
      return;
    if (this.isWebGL2) {
      let available = false;
      let disjoint, ns;
      if (this.query) {
        this.queryHasResult = false;
        let query = this.query;
        available = gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
        disjoint = gl.getParameter(ext.GPU_DISJOINT_EXT);
        if (available && !disjoint) {
          ns = gl.getQueryParameter(this.query, gl.QUERY_RESULT);
          const ms = ns * 1e-6;
          if (available || disjoint) {
            gl.deleteQuery(this.query);
            query = null;
          }
          if (available && ms > 0) {
            if (!disjoint) {
              this.activeAccums.forEach((_active, i) => {
                this.gpuAccums[i] = ms;
              });
            }
          }
        }
      }
      if (available || !this.query) {
        this.queryCreated = true;
        this.query = gl.createQuery();
        gl.beginQuery(ext.TIME_ELAPSED_EXT, this.query);
      }
    }
  }
  endGpu() {
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
  begin(name) {
    this.startGpu();
    this.updateAccums(name);
  }
  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name) {
    this.endGpu();
    this.updateAccums(name);
  }
  updateAccums(name) {
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
export {
  GLPerf,
  overLimitFps
};
//# sourceMappingURL=internal.mjs.map
