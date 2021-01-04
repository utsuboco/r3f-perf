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
  cpuAccums: number[] = [];
  gpuAccums: number[] = [];
  activeAccums: boolean[] = [];
  chart: number[] = [];
  gpuChart: number[] = [];
  cpuChart: number[] = [];
  paramLogger: any = () => {};
  glFinish: any = () => {};
  addProfiler: any = () => {};
  chartLogger: any = () => {};
  chartLen: number = 30;
  chartHz: number = 5;
  trackGPU: boolean = true;
  chartFrame: number = 0;
  chartTime: number = 0;
  circularId: number = 0;
  detected: number = 0;
  frameId: number = 0;
  paramFrame: number = 0;
  paramTime: number = 0;
  now: any = () => {};
  t0: number = 0;

  constructor(settings: object = {}) {
    window.GLPerf = window.GLPerf || {};

    Object.assign(this, settings);
    this.chart = new Array(this.chartLen).fill(0);
    this.gpuChart = new Array(this.chartLen).fill(0);
    this.cpuChart = new Array(this.chartLen).fill(0);
    this.now = () =>
      window.performance && window.performance.now
        ? window.performance.now()
        : Date.now();

    this.is120hz();
    this.isGL();
  }
  /**
   * 120hz device detection
   */
  is120hz() {
    let rafId: number;
    let n = 0;
    const loop = (t: number) => {
      if (++n < 20) {
        rafId = window.requestAnimationFrame(loop);
      } else {
        this.detected = Math.ceil((1e3 * n) / (t - this.t0) / 70);
        window.cancelAnimationFrame(rafId);
      }
      if (!this.t0) this.t0 = t;
    };
    window.requestAnimationFrame(loop);
  }

  isGL() {
    const gl = this.gl;
    if (gl) {
      const glFinish = async (t: any, activeAccums: any) =>
        Promise.resolve(
          setTimeout(() => {
            gl.getError();
            const dt = this.now() - t;

            activeAccums.forEach((active: any, i: any) => {
              if (active) {
                this.gpuAccums[i] += dt;
                // console.log(this.gpuAccums)
              }
            });
          }, 0)
        );

      const addProfiler = (fn: any, self: any, target: any) =>
        function () {
          const t = self.now();
          fn.apply(target, arguments);
          self.finished.push(glFinish(t, self.activeAccums.slice(0)));
        };

      [
        'drawArrays',
        'drawElements',
        'drawArraysInstanced',
        'drawBuffers',
        'drawElementsInstanced',
        'drawRangeElements',
      ].forEach((fn) => {
        if (gl[fn]) {
          gl[fn] = addProfiler(gl[fn], this, gl);
        }
      });
      gl.getExtension = ((fn, self) =>
        function () {
          let ext = fn.apply(gl, arguments);
          if (ext) {
            ['drawElementsInstancedANGLE', 'drawBuffersWEBGL'].forEach((fn) => {
              if (ext[fn]) ext[fn] = addProfiler(ext[fn], self, ext);
            });
          }
          return ext;
        })(gl.getExtension, this);
    }
  }
  /**
   * Explicit UI add
   * @param { string | undefined } name
   */
  addUI(name: string) {
    if (this.names.indexOf(name) === -1) {
      this.names.push(name);
      this.cpuAccums.push(0);
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
    let cpu = 0;
    let gpu = 0;
    // params
    if (this.frameId <= 1) {
      this.paramFrame = this.frameId;
      this.paramTime = t;
    } else {
      if (duration >= 1e3) {
        const frameCount = this.frameId - this.paramFrame;
        const fps = (frameCount / duration) * 1e3;
        for (let i = 0; i < this.names.length; i++) {
          cpu = Math.round((this.cpuAccums[i] / duration) * 100);
          gpu = Math.round((this.gpuAccums[i] / duration) * 100);
          const mem = Math.round(
            window.performance && window.performance.memory
              ? window.performance.memory.usedJSHeapSize / (1 << 20)
              : 0
          );
          this.paramLogger({
            i,
            cpu,
            gpu,
            mem,
            fps: Math.round(fps * 10) / 10,
            duration: Math.round(duration),
            frameCount,
          });
          this.cpuAccums[i] = 0;
          Promise.all(this.finished).then(() => {
            this.gpuAccums[i] = 0;
            this.finished = [];
          });
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
        const cpuS = Math.round((this.cpuAccums[1] / duration) * 100);
        const gpuS = Math.round((this.gpuAccums[1] / duration) * 100);
        if (gpuS > 0) {
          this.gpuChart[this.circularId % this.chartLen] = gpuS;
        }
        if (cpuS > 0) {
          this.cpuChart[this.circularId % this.chartLen] = cpuS;
        }

        for (let i = 0; i < this.names.length; i++) {
          this.chartLogger({
            i,
            data: {
              fps: this.chart,
              gpu: this.gpuChart,
              cpu: this.cpuChart,
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

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name: string) {
    this.updateAccums(name);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name: string) {
    this.updateAccums(name);
  }

  updateAccums(name: string) {
    let nameId = this.names.indexOf(name);
    if (nameId === -1) {
      nameId = this.names.length;
      this.addUI(name);
    }

    const t = this.now();
    const dt = t - this.t0;

    for (let i = 0; i < nameId + 1; i++) {
      if (this.activeAccums[i]) {
        this.cpuAccums[i] += dt;
      }
    }
    this.activeAccums[nameId] = !this.activeAccums[nameId];
    this.t0 = t;
  }
}
