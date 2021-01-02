import React from 'react';
import * as ReactDOM from 'react-dom';
import { Default as Perf } from '../stories/Perf.stories';

describe('Thing', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Perf />, div);
    ReactDOM.unmountComponentAtNode(div);
  });
});
