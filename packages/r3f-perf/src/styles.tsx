import styled from 'styled-components'

export const PerfS = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
  'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
  sans-serif;
  background-color: rgba(36,36,36,1);
  color: #fff;

  pointer-events: none;
  margin: 0;
  padding: 4px 6px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  user-select: none;

  &.top-left {
    right: initial;
    left: 0;
  }
  &.bottom-left {
    right: initial;
    top: initial;
    bottom: 0;
    left: 0;
    .__perf_toggle {
      top: -17px;
      bottom: initial;
    }
  }
  &.bottom-right {
    top: initial;
    bottom: 0;
    .__perf_toggle {
      top: -17px;
      bottom: initial;
    }
  }

  
`
/* .perf.top-left {
  right: initial;
  left: 0;
}
.perf.bottom-left {
  right: initial;
  top: initial;
  bottom: 0;
  left: 0;
}
.perf.bottom-right {
  top: initial;
  bottom: 0;
} */

export const PerfI = styled.i`
  display: inline-flex;
  font-style: normal;
  padding: 0;
  line-height: 13px;
  font-size: 14px;
  width: 62px;
  position: relative;
  font-weight: 500;
  letter-spacing: 0px;
  text-align: left;
  height: 29px;
  white-space: nowrap;
  justify-content: space-evenly;
  font-variant-numeric: tabular-nums;
  svg {
    left: 0;
    padding: 0;
    color: rgba(145,145,145,.12);
    font-size: 22px;
    position: absolute;
    z-index: -1;
    max-height: 21px;
    left: 50%;
    margin-left: -27px;
    top: 4px;
  }
  `
  export const PerfSvg = styled.svg`
  left: 0;
  padding: 0;
  color: rgba(145,145,145,.12);
  font-size: 22px;
  position: absolute;
  z-index: -1;
  max-height: 21px;
  left: 50%;
  margin-left: -27px;
  top: 4px;
  `

  export const PerfB = styled.b`
  vertical-align: bottom;
  position: absolute;
  bottom: 5px;
  color: rgba(101,197,188, 1);
  text-align: revert;
  right: 0;
  letter-spacing: 0;
  letter-spacing: 1px;
  font-size: 8px;
  font-weight: 500;
  right: 0;
  `

  export const PerfSm = styled.small`
  font-size: 9px;
  margin-top: 2px;
  margin-left: -6px;
  display: inline-block;
  `
  export const Graph = styled.div`
    height: 61px;
    overflow: hidden;
    position: relative;
    display: flex;
    justify-content: center;
    width: 310px;
    margin: 0 auto;
    max-width: 312px;
  `

  export const Graphpc = styled.div`
  text-align: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  vertical-align: middle;
  color: #f1f1f1;
  padding: 7px;
  width: 100%;
  background-color: rgba(36, 36, 37, 0.8);
  z-index: 1;
  `
  export const GraphpSvg = styled.svg`
    bottom: -6px;
    max-width: 312px;
    position: absolute;
    z-index: 1;
  `
  export const GraphcSvg = styled.svg`
    bottom: -6px;
    max-width: 312px;
    position: absolute;
    z-index: 1;
  `


  export const Toggle = styled.div`
  pointer-events: auto;
  justify-content: center;
  display: block;
  cursor: pointer;
  font-size: 12px;
  background-color: rgb(41, 43, 45);
  margin-top: 6px;
  width: auto;
  margin: 0 auto;
  color: rgba(145,145,145,1);

  text-align: center;
  position: absolute;
  right: 0;
  bottom: -17px;
  padding: 4px 11px;
  `

// .perf.bottom-left .toggle{
//   top: -17px;
//   bottom: initial;
// }
// .perf.bottom-right .toggle{
//   top: -17px;
//   bottom: initial;
// }

export const ToggleSvg = styled.div`
  font-size: 19px;
  position: relative;
  z-index: 0;
  vertical-align: middle;
  padding: 0;
  left: initial;
  top: initial;
  color: rgba(145,145,145,1);
  margin: -6px -6px -6px -6px;
  display: inline-block;
  margin-top: -7px;
  `

// .toggle:hover {
//   background-color: rgb(32,32,32);
//   color: rgb(203,203,203);
// }
// .toggle:hover svg {
//   color: rgb(203,203,203);
// }

