import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as Perf } from '../stories/Perf.stories';
import { Canvas } from 'react-three-fiber'

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Canvas><Perf /></Canvas>, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
