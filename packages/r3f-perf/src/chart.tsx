import React, { FC, HTMLAttributes } from 'react';
import { GraphpSvg } from './styles';
import { colorsGraph } from './gui';

const smoothing = 0.15;
const h = 63;
const w = 320;

const options = {
  yMin: 0,
  yMax: 65,
  xMin: 0,
  xMax: 200,
};

const map = (value: any, inMin: any, inMax: any, outMin: any, outMax: any) => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const pointsPositionsCalc = (points: any, w: any, h: any, options: any) =>
  points.map((e: any) => {
    const x = map(e[0], options.xMin, options.xMax, 0, w);
    const y = map(e[1], options.yMin, options.yMax, h, 0);
    return [x, y];
  });

const line = (pointA: any, pointB: any) => {
  const lengthX = pointB[0] - pointA[0];
  const lengthY = pointB[1] - pointA[1];
  return {
    length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
    angle: Math.atan2(lengthY, lengthX),
  };
};

const controlPoint = (line: any, smooth: any) => (
  current: any,
  previous: any,
  next: any,
  reverse: any
) => {
  const p = previous || current;
  const n = next || current;
  const l = line(p, n);

  const angle = l.angle + (reverse ? Math.PI : 0);
  const length = l.length * smooth;
  const x = current[0] + Math.cos(angle) * length;
  const y = current[1] + Math.sin(angle) * length;
  return [x, y];
};

const bezierCommand = (controlPoint: any) => (
  point: number[],
  i: number,
  a: any
) => {
  const cps = controlPoint(a[i - 1], a[i - 2], point);
  const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
  const close = i === a.length - 1 ? ' z' : '';
  return `C ${cps[0]},${cps[1]} ${cpe[0]},${cpe[1]} ${point[0]},${point[1]}${close}`;
};

interface SvgPathProps extends HTMLAttributes<HTMLDivElement> {
  points: string[][];
  element: string;
  colorBlind: boolean | undefined;
}

const SvgPath: FC<SvgPathProps> = ({ element, points, colorBlind }) => {
  if (!points || points.length === 0) {
    return null;
  }
  const colors = colorsGraph(colorBlind);
  const pointsPositions = pointsPositionsCalc(points, w, h, options);
  const bezierCommandCalc = bezierCommand(controlPoint(line, smoothing));

  const d = pointsPositions.reduce(
    (acc: any, e: any, i: any, a: any) =>
      i === 0
        ? `M ${a[a.length - 1][0]},${h} L ${e[0]},${h} L ${e[0]},${e[1]}`
        : `${acc} ${bezierCommandCalc(e, i, a)}`,
    ''
  );

  return (
    <path
      d={d}
      fill={`url(#graph${element})`}
      stroke={`rgb(${colors[element]})`}
    />
  );
};

interface ChartProps extends HTMLAttributes<HTMLDivElement> {
  points: any;
  colorBlind: boolean | undefined;
}

export const PriceChart: FC<ChartProps> = ({ points, colorBlind }) => {
  const element = points.element;

  if (!points.points || points.points.length === 0) {
    return null;
  }

  return (
    <GraphpSvg
      height="65"
      width="320"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 65"
    >
      <pattern
        id={`graph${element}`}
        x="0"
        y="0"
        width="8"
        height="60"
        patternUnits="userSpaceOnUse"
      >
        <rect
          x="4"
          y="0"
          width="4"
          height="60"
          fill={`url(#${element}gradFade)`}
        />
        <rect x="0" y="0" width="4" height="60" fill={`url(#${element}grad)`} />
      </pattern>
      <SvgPath
        points={points.points}
        element={points.element}
        colorBlind={colorBlind}
      />
    </GraphpSvg>
  );
};

export default PriceChart;
