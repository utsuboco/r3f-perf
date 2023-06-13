"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const store = require("./store.js");
const Perf = require("./components/Perf.js");
const PerfHeadless = require("./components/PerfHeadless.js");
exports.getCustomData = store.getCustomData;
exports.getPerf = store.getPerf;
exports.setCustomData = store.setCustomData;
exports.setPerf = store.setPerf;
exports.usePerf = store.usePerf;
exports.Perf = Perf.Perf;
exports.PerfHeadless = PerfHeadless.PerfHeadless;
//# sourceMappingURL=index.js.map
