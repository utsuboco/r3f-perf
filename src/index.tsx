import React, { FC, HTMLAttributes } from 'react';
import Gui from './gui';

export interface Props extends HTMLAttributes<HTMLDivElement> {}

/**
 * Performance profiler component
 */
export let Perf: FC<Props> = () => null;
if (process.env.NODE_ENV === 'development') {
  Perf = () => <Gui />;
}
