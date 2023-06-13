import { FC } from 'react';
import { PerfPropsGui } from '../typings';
interface colors {
    [index: string]: string;
}
export declare const colorsGraph: (colorBlind: boolean | undefined) => colors;
/**
 * Performance profiler component
 */
export declare const Perf: FC<PerfPropsGui>;
export {};
