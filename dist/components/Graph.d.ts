import { FC } from 'react';
import * as THREE from 'three';
import { PerfUIProps } from '../typings';
export interface graphData {
    curve: THREE.SplineCurve;
    maxVal: number;
    element: string;
}
export declare const ChartUI: FC<PerfUIProps>;
