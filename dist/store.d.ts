import * as THREE from 'three';
type drawCount = {
    type: string;
    drawCount: number;
};
export type drawCounts = {
    total: number;
    type: string;
    data: drawCount[];
};
export type ProgramsPerf = {
    meshes?: {
        [index: string]: THREE.Mesh[];
    };
    material: THREE.Material;
    program?: WebGLProgram;
    visible: boolean;
    drawCounts: drawCounts;
    expand: boolean;
};
type Logger = {
    i: number;
    maxMemory: number;
    gpu: number;
    mem: number;
    cpu: number;
    fps: number;
    duration: number;
    frameCount: number;
};
type GLLogger = {
    calls: number;
    triangles: number;
    points: number;
    lines: number;
    counts: number;
};
export type State = {
    getReport: () => any;
    log: any;
    paused: boolean;
    overclockingFps: boolean;
    fpsLimit: number;
    startTime: number;
    triggerProgramsUpdate: number;
    customData: number;
    accumulated: {
        totalFrames: number;
        log: Logger;
        gl: GLLogger;
        max: {
            log: Logger;
            gl: GLLogger;
        };
    };
    chart: {
        data: {
            [index: string]: number[];
        };
        circularId: number;
    };
    infos: {
        version: string;
        renderer: string;
        vendor: string;
    };
    gl: THREE.WebGLRenderer | undefined;
    scene: THREE.Scene | undefined;
    programs: ProgramsPerfs;
    objectWithMaterials: THREE.Mesh[] | null;
    tab: 'infos' | 'programs' | 'data';
};
export type ProgramsPerfs = Map<string, ProgramsPerf>;
declare const setCustomData: (customData: number) => void;
declare const getCustomData: () => number;
export declare const usePerfImpl: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
declare const usePerf: (sel: (state: State) => unknown) => unknown;
declare const getPerf: () => State, setPerf: (partial: State | Partial<State> | ((state: State) => State | Partial<State>), replace?: boolean | undefined) => void;
export { usePerf, getPerf, setPerf, setCustomData, getCustomData };
