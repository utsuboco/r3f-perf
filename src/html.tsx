import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Group } from 'three';
import { Assign } from 'utility-types';
import { ReactThreeFiber, useThree } from 'react-three-fiber';

export interface HtmlProps
  extends Omit<
    Assign<
      React.HTMLAttributes<HTMLDivElement>,
      ReactThreeFiber.Object3DNode<Group, typeof Group>
    >,
    'ref'
  > {
  portal?: React.MutableRefObject<HTMLElement>;
}

export const Html = React.forwardRef(
  (
    { children, style, className, portal, ...props }: HtmlProps,
    ref: React.Ref<HTMLDivElement>
  ) => {
    const { gl } = useThree();
    const [el] = React.useState(() => document.createElement('div'));
    const group = React.useRef<Group>(null);
    const target = portal?.current ?? gl.domElement.parentNode;

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

    React.useEffect(
      () =>
        void ReactDOM.render(
          <div ref={ref} className={className} children={children} />,
          el
        )
    );

    return <group {...props} ref={group} />;
  }
);
