import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';

// https://vitejs.dev/config/
module.exports = {
  plugins: [reactRefresh()],
  build: {
    minify: false,
  },
};
