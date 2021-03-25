import * as React from 'react';
import * as ReactDOM from 'react-dom';
// @ts-ignore
import _extends from '@babel/runtime/helpers/esm/extends';
import { useThree } from '@react-three/fiber';


function _objectWithoutPropertiesLoose(source: any, excluded: any) {
  if (source == null) return {};
  var target: any = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

const Html = /*#__PURE__*/React.forwardRef((_ref, ref) => {
  var _portal$current;

  let {
    // @ts-ignore
    portal,
    // @ts-ignore
    className,
    children,
  } = _ref,
      props = _objectWithoutPropertiesLoose(_ref, ["portal", "children", "className"]);


    const { gl } = useThree(({
      gl,
    }) => ({
      gl,
    }));

    const [el] = React.useState(() => document.createElement('div'));
    const group = React.useRef(null);
    const target = (_portal$current = portal == null ? void 0 : portal.current) != null ? _portal$current : gl.domElement.parentNode;

    React.useEffect(() => {
      if (group.current) {
        if (target) {
          target.appendChild(el);
        }
        return () => {
          if (target) target.removeChild(el);
          ReactDOM.unmountComponentAtNode(el);
        };
      }
      return undefined;
    }, [target, el]);

    React.useLayoutEffect(() => {
      ReactDOM.render( /*#__PURE__*/React.createElement("div", {
        ref: ref,
        className: className,
        children: children
      }), el);
    });

    return /*#__PURE__*/React.createElement("group", _extends({}, props, {
      ref: group
    }));
  }
);

export { Html };
