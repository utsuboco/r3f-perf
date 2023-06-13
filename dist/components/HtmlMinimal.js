"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const jsxRuntime = require("react/jsx-runtime");
const fiber = require("@react-three/fiber");
const React = require("react");
const client = require("react-dom/client");
const HtmlMinimal = React.forwardRef(({ portal, className, children, name, ...props }, ref) => {
  const gl = fiber.useThree((state) => state.gl);
  const group = React.useRef(null);
  const rootRef = React.useRef(null);
  const target = (portal == null ? void 0 : portal.current) != null ? portal.current : gl.domElement.parentNode;
  React.useLayoutEffect(() => {
    if (!group.current || !target)
      return;
    const el = document.createElement("div");
    const root = rootRef.current = client.createRoot(el);
    target.appendChild(el);
    return () => {
      root.unmount();
      rootRef.current = null;
      target.removeChild(el);
    };
  }, [target]);
  React.useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root)
      return;
    root.render(
      /* @__PURE__ */ jsxRuntime.jsx("div", { ref, className, children })
    );
  });
  return /* @__PURE__ */ jsxRuntime.jsx("group", { name, ...props, ref: group });
});
exports.HtmlMinimal = HtmlMinimal;
//# sourceMappingURL=HtmlMinimal.js.map
