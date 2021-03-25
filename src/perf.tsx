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
  paused: boolean = false;
  isWebGL2: boolean = true;
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
  chartLen: number = 60;
  chartHz: number = 10;
  factorGPU: number = 1;
  trackGPU: boolean = true;
  chartFrame: number = 0;
  gpuTimeProcess: number = 0;
  chartTime: number = 0;
  activeQueries: number = 0;
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
    this.initGpu()
    this.is120hz();
  }
  initGpu() {
    if (this.gl) {
      this.isWebGL2 = true;
      this.extension = this.gl.getExtension( 'EXT_disjoint_timer_query_webgl2' );
      if ( this.extension === null ) {

        this.isWebGL2 = false;
        this.extension = this.gl.getExtension( 'EXT_disjoint_timer_query' );

        if ( this.extension === null ) {

          console.warn( 'GPUStatsPanel: disjoint_time_query extension not available.' );

        }

      }
    }

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
          gpu =  this.gpuAccums[i];
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
          this.gpuAccums[i] = 0;
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
        const cpuS = Math.round((this.cpuAccums[1] / duration) * 100) + 5;
        const gpuS = (this.gpuAccums[1] * 2) + 10;
        if (gpuS > 0) {
          this.gpuChart[this.circularId % this.chartLen] =
            gpuS;
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

  startGpu() {
    const gl = this.gl;
			const ext = this.extension;

			// create the query object
			let query: any;
			if ( this.isWebGL2 ) {

				query = gl.createQuery();
				gl.beginQuery( ext.TIME_ELAPSED_EXT, query );

			} else {

				query = ext.createQueryEXT();
				ext.beginQueryEXT( ext.TIME_ELAPSED_EXT, query );

			}

			this.activeQueries ++;

			const checkQuery = () => {

				// check if the query is available and valid
				let available, disjoint, ns;
				if ( this.isWebGL2 ) {

					available = gl.getQueryParameter( query, gl.QUERY_RESULT_AVAILABLE );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = gl.getQueryParameter( query, gl.QUERY_RESULT );

				} else {

					available = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_AVAILABLE_EXT );
					disjoint = gl.getParameter( ext.GPU_DISJOINT_EXT );
					ns = ext.getQueryObjectEXT( query, ext.QUERY_RESULT_EXT );

				}

				const ms = ns * 1e-6;
				if ( available ) {

					// update the display if it is valid
					if ( ! disjoint ) {
            this.activeAccums.forEach((_active: any, i: any) => {
              this.gpuAccums[i] = ms
            });
					}

					this.activeQueries --;


				} else {

					// otherwise try again the next frame
					window.requestAnimationFrame( checkQuery );

				}

			};

			window.requestAnimationFrame( checkQuery );
  }

  endGpu() {
    // finish the query measurement
    const ext = this.extension;
    const gl = this.gl;

    if ( ext === null ) {

      return;

    }

    if ( this.isWebGL2 ) {

      gl.endQuery( ext.TIME_ELAPSED_EXT );

    } else {

      ext.endQueryEXT( ext.TIME_ELAPSED_EXT );

    }

  };

  /**
   * Begin named measurement
   * @param { string | undefined } name
   */
  begin(name: string) {
    this.startGpu()
    this.updateAccums(name);
  }

  /**
   * End named measure
   * @param { string | undefined } name
   */
  end(name: string) {
    this.endGpu()
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
