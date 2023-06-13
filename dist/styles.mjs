import { styled } from "@stitches/react";
const PerfS = styled("div", {
  position: "fixed",
  top: 0,
  right: 0,
  zIndex: 9999,
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif`,
  backgroundColor: "rgba(36, 36, 36, .9)",
  color: "#fff",
  margin: 0,
  minHeight: "100px",
  padding: "4px 0",
  "-webkit-font-smoothing": "antialiased",
  "-moz-osx-font-smoothing": "grayscale",
  userSelect: "none",
  "&.top-left": {
    right: "initial",
    left: 0
  },
  "&.bottom-left": {
    right: "initial",
    top: "initial",
    bottom: 0,
    left: 0,
    ".__perf_toggle": {
      top: "-20px",
      bottom: "initial"
    }
  },
  "&.bottom-right": {
    top: "initial",
    bottom: 0,
    ".__perf_toggle": {
      top: "-20px",
      bottom: "initial"
    }
  },
  "&.minimal": {
    backgroundColor: "rgba(36, 36, 36, .75)"
  },
  "*": {
    margin: "0",
    padding: "0",
    border: "0",
    fontSize: "100%",
    lineHeight: "1",
    verticalAlign: "baseline"
  }
});
const PerfSmallI = styled("small", {
  position: "absolute",
  right: 0,
  fontSize: "10px"
});
const PerfI = styled("div", {
  display: "inline-flex",
  fontStyle: "normal",
  padding: 0,
  lineHeight: "13px",
  fontSize: "14px",
  width: "62px",
  position: "relative",
  pointerEvents: "auto",
  cursor: "default",
  fontWeight: 500,
  letterSpacing: "0px",
  textAlign: "left",
  height: "29px",
  whiteSpace: "nowrap",
  justifyContent: "space-evenly",
  fontVariantNumeric: "tabular-nums",
  small: {
    paddingLeft: "12px"
  },
  svg: {
    padding: 0,
    color: "rgba(145, 145, 145, 0.3)",
    fontSize: "40px",
    position: "absolute",
    zIndex: 1,
    maxHeight: "20px",
    left: " 50%",
    marginLeft: "-23px",
    top: "4px"
  }
});
const PerfB = styled("span", {
  verticalAlign: "bottom",
  position: "absolute",
  bottom: "5px",
  color: "rgba(101, 197, 188, 1)",
  textAlign: "right",
  letterSpacing: "1px",
  fontSize: "8px",
  fontWeight: "500",
  width: "60px"
});
const PerfIContainer = styled("div", {
  display: "flex"
  // justifyContent: 'space-between',
});
const ProgramHeader = styled("div", {
  backgroundColor: "#404040",
  padding: "6px",
  display: "block",
  fontSize: "12px",
  marginBottom: "6px",
  cursor: "pointer",
  "*": {
    cursor: "pointer !important"
  },
  "> span": {},
  small: {
    fontSize: "9px"
  },
  "> b": {
    marginRight: "4px",
    cursor: "pointer"
  }
});
const Graph = styled("div", {
  height: "66px",
  overflow: "hidden",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  top: "0px",
  justifyContent: "center",
  width: "100%",
  minWidth: "310px",
  margin: "0 auto",
  canvas: {
    background: "transparent !important",
    position: "absolute !important"
  }
});
const Graphpc = styled("div", {
  textAlign: "center",
  fontWeight: 700,
  fontSize: "12px",
  lineHeight: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  verticalAlign: "middle",
  color: "#f1f1f1",
  padding: "7px",
  width: "100%",
  backgroundColor: "rgba(36, 36, 37, 0.8)",
  zIndex: 1,
  position: "absolute",
  height: "100%"
});
const Toggle = styled("div", {
  pointerEvents: "auto",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "12px",
  backgroundColor: "rgb(41, 43, 45)",
  marginTop: "6px",
  width: "auto",
  margin: "0",
  color: "rgba(145, 145, 145, 1)",
  textAlign: "center",
  display: "inline-block",
  verticalAlign: "middle",
  padding: "4px 6px",
  "&.__perf_toggle_tab_active": {
    backgroundColor: "rgb(31 31 31)"
  },
  svg: {
    width: "12px",
    height: "12px",
    float: "left"
  }
});
const ToggleVisible = styled("div", {
  pointerEvents: "auto",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "12px",
  float: "right",
  backgroundColor: "rgb(41, 43, 45)",
  width: "auto",
  margin: "0",
  color: "rgba(145, 145, 145, 1)",
  textAlign: "center",
  display: "inline-block",
  verticalAlign: "middle",
  padding: "4px 6px",
  "&.__perf_toggle_tab_active": {
    backgroundColor: "rgb(31 31 31)"
  },
  svg: {
    width: "12px",
    height: "12px",
    float: "left"
  }
});
const ProgramGeo = styled("div", {
  padding: "4px 6px",
  fontSize: "12px",
  pointerEvents: "auto"
});
const ProgramTitle = styled("span", {
  fontWeight: "bold",
  letterSpacing: "0.08em",
  maxWidth: "145px",
  overflow: "hidden",
  textOverflow: "ellipsis",
  display: "inline-block",
  verticalAlign: "middle",
  fontSize: "11px",
  marginRight: "10px"
});
const ContainerScroll = styled("div", {
  maxHeight: "50vh",
  overflowY: "auto",
  marginTop: "38px"
});
const ProgramsContainer = styled("div", {
  marginTop: "0"
});
const ProgramsULHeader = styled("div", {
  display: "flex",
  position: "relative",
  fontWeight: "bold",
  color: "#fff",
  lineHeight: "14px",
  svg: {
    marginRight: "4px",
    display: "inline-block"
  }
});
const ProgramsUL = styled("ul", {
  display: "block",
  position: "relative",
  paddingLeft: "10px",
  margin: "6px 6px",
  img: {
    maxHeight: "60px",
    maxWidth: "100%",
    margin: "6px auto",
    display: "block"
  },
  "&:after": {
    content: "",
    position: "absolute",
    left: "0px",
    top: "0px",
    width: "1px",
    height: "100%",
    backgroundColor: "grey",
    transform: "translateX(-50%)",
    maxHeight: "50vh",
    overflowY: "auto"
  },
  li: {
    borderBottom: "1px solid #313131",
    display: "block",
    padding: "4px",
    margin: 0,
    lineHeight: 1,
    verticalAlign: "middle",
    height: "24px"
  },
  b: {
    fontWeight: "bold"
  },
  small: {
    textAlign: "revert",
    letterSpacing: "1px",
    fontSize: "10px",
    fontWeight: "500",
    marginLeft: "2px",
    color: "rgb(101, 197, 188)"
  }
});
const ProgramConsole = styled("button", {
  fontWeight: "bold",
  letterSpacing: "0.02em",
  backgroundColor: "rgb(41, 43, 45)",
  color: "rgb(211, 211, 211)",
  overflow: "hidden",
  textOverflow: "ellipsis",
  cursor: "pointer",
  display: "block",
  verticalAlign: "middle",
  fontSize: "11px",
  padding: "5px",
  margin: "4px auto"
});
const ToggleContainer = styled("div", {
  display: "flex",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "12px",
  backgroundColor: "rgb(41, 43, 45)",
  marginTop: "6px",
  width: "auto",
  margin: "0 auto",
  color: "rgba(145, 145, 145, 1)",
  textAlign: "center",
  position: "absolute",
  right: 0,
  bottom: " -20px",
  svg: {
    width: "12px",
    height: "12px",
    float: "left"
  }
});
const ProgramsGeoLi = styled("li", {
  display: "flex !important",
  height: "auto !important",
  span: {
    height: "40px",
    display: "block",
    position: "relative"
  },
  b: {
    paddingLeft: "12px"
  }
});
export {
  ContainerScroll,
  Graph,
  Graphpc,
  PerfB,
  PerfI,
  PerfIContainer,
  PerfS,
  PerfSmallI,
  ProgramConsole,
  ProgramGeo,
  ProgramHeader,
  ProgramTitle,
  ProgramsContainer,
  ProgramsGeoLi,
  ProgramsUL,
  ProgramsULHeader,
  Toggle,
  ToggleContainer,
  ToggleVisible
};
//# sourceMappingURL=styles.mjs.map
