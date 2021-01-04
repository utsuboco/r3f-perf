import React from 'react';
import styles from './index.module.css';

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

const SvgPath = (props: any) => {
  if (!props.points || props.points.length === 0) {
    return null;
  }
  const pointsPositions = pointsPositionsCalc(props.points, w, h, options);
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
      className={styles[`${props.pattern}Stroke`]}
      fill={`url(#${props.pattern})`}
    />
  );
};

export const PriceChart = (props: any) => {
  if (!props.points[0] || props.points[0].length === 0) {
    return null;
  }
  return (
    <svg
      className={styles.graph}
      height="65"
      width="320"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 320 65"
    >
      <pattern
        id={props.pattern}
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
          fill={`url(#${props.pattern}gradFade)`}
        />
        <rect
          x="0"
          y="0"
          width="4"
          height="60"
          fill={`url(#${props.pattern}grad)`}
        />
      </pattern>
      <SvgPath points={props.points[0]} pattern={`${props.pattern}`} />
    </svg>
  );
};

export default PriceChart;
