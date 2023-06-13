import { FC, HTMLAttributes } from 'react';
import { PerfProps } from '../typings';
export declare let matriceWorldCount: {
    value: number;
};
export declare let matriceCount: {
    value: number;
};
export interface Props extends HTMLAttributes<HTMLDivElement> {
}
/**
 * Performance profiler component
 */
export declare const PerfHeadless: FC<PerfProps>;
