import { jsx } from "react/jsx-runtime";
import { useThree } from "@react-three/fiber";
import { forwardRef, useRef, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
const HtmlMinimal = forwardRef(({ portal, className, children, name, ...props }, ref) => {
  const gl = useThree((state) => state.gl);
  const group = useRef(null);
  const rootRef = useRef(null);
  const target = (portal == null ? void 0 : portal.current) != null ? portal.current : gl.domElement.parentNode;
  useLayoutEffect(() => {
    if (!group.current || !target)
      return;
    const el = document.createElement("div");
    const root = rootRef.current = createRoot(el);
    target.appendChild(el);
    return () => {
      root.unmount();
      rootRef.current = null;
      target.removeChild(el);
    };
  }, [target]);
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root)
      return;
    root.render(
      /* @__PURE__ */ jsx("div", { ref, className, children })
    );
  });
  return /* @__PURE__ */ jsx("group", { name, ...props, ref: group });
});
export {
  HtmlMinimal
};
//# sourceMappingURL=HtmlMinimal.mjs.map
