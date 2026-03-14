// Use standard asset URL pattern — consuming bundlers (Turbopack, webpack 5, Vite)
// recognize `new URL('./file', import.meta.url)` and handle the asset automatically.
// This avoids the original `import font from './roboto.woff'` which Turbopack
// incorrectly tries to parse as UTF-8 JavaScript.
// See: https://github.com/utsuboco/r3f-perf/issues/59
const fontUrl = new URL('./roboto.woff', import.meta.url).href
export default fontUrl
