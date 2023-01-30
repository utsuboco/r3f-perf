declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}


export type chart = {
  length: number;
  hz: number;
};

export type customData = {
  name: number;
  info: number;
  value: number;
  round: number;
};
export interface PerfProps {
  overClock?: boolean;
  matrixUpdate?: boolean;
  customData?: customData;
  chart?: chart;
  deepAnalyze?: boolean;
}

export interface PerfPropsGui extends PerfProps {
  showGraph?: boolean;
  colorBlind?: boolean;
  antialias?: boolean;
  openByDefault?: boolean;
  position?: string;
  minimal?: boolean;
  className?: string;
  style?: object;
}
