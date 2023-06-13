declare global {
    interface Window {
        GLPerf: any;
    }
    interface Performance {
        memory: any;
    }
}
export declare const overLimitFps: {
    value: number;
    fpsLimit: number;
    isOverLimit: number;
};
interface LogsAccums {
    mem: number[];
    gpu: number[];
    cpu: number[];
    fps: number[];
    fpsFixed: number[];
}
export declare class GLPerf {
    names: string[];
    finished: any[];
    gl: any;
    extension: any;
    query: any;
    paused: boolean;
    overClock: boolean;
    queryHasResult: boolean;
    queryCreated: boolean;
    isWebGL2: boolean;
    memAccums: number[];
    gpuAccums: number[];
    activeAccums: boolean[];
    logsAccums: LogsAccums;
    fpsChart: number[];
    gpuChart: number[];
    cpuChart: number[];
    memChart: number[];
    paramLogger: any;
    glFinish: any;
    chartLogger: any;
    chartLen: number;
    logsPerSecond: number;
    maxMemory: number;
    chartHz: number;
    startCpuProfiling: boolean;
    lastCalculateFixed: number;
    chartFrame: number;
    gpuTimeProcess: number;
    chartTime: number;
    activeQueries: number;
    circularId: number;
    detected: number;
    frameId: number;
    rafId: number;
    idleCbId: number;
    checkQueryId: number;
    uuid: string | undefined;
    currentCpu: number;
    currentMem: number;
    paramFrame: number;
    paramTime: number;
    now: any;
    t0: number;
    constructor(settings?: object);
    initGpu(): void;
    /**
     * 120hz device detection
     */
    is120hz(): void;
    /**
     * Explicit UI add
     * @param { string | undefined } name
     */
    addUI(name: string): void;
    nextFps(d: any): void;
    /**
     * Increase frameID
     * @param { any | undefined } now
     */
    nextFrame(now: any): void;
    startGpu(): void;
    endGpu(): void;
    /**
     * Begin named measurement
     * @param { string | undefined } name
     */
    begin(name: string): void;
    /**
     * End named measure
     * @param { string | undefined } name
     */
    end(name: string): void;
    updateAccums(name: string): void;
}
export {};
