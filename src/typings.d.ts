declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

export type chart = {
  length: number
  hz: number
}

export type customData = {
  name: number
  info: number
  value: number
  round: number
}
export interface PerfProps {
  logsPerSecond?: number
  overClock?: boolean
  matrixUpdate?: boolean
  customData?: customData
  chart?: chart
  deepAnalyze?: boolean
}

export interface PerfPropsGui extends PerfProps {
  showGraph?: boolean
  colorBlind?: boolean
  antialias?: boolean
  openByDefault?: boolean
  position?: string
  minimal?: boolean
  className?: string
  style?: object
}

interface PerfUIProps extends HTMLAttributes<HTMLDivElement> {
  perfContainerRef?: any
  colorBlind?: boolean
  showGraph?: boolean
  antialias?: boolean
  chart?: chart
  customData?: customData
  minimal?: boolean
  matrixUpdate?: boolean
}
