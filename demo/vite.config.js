import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 4000
  },
  plugins: [react(), reactRefresh()],
});
