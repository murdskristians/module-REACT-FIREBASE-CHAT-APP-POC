import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/lib.ts'),
      name: 'ReactFirechatPoc',
      fileName: (format) => `index.${format}.js`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: (id) => {
        // Externalize React and related packages
        if (id === 'react' || id === 'react-dom' || id === 'react/jsx-runtime' || id.startsWith('react/')) {
          return true;
        }
        // Externalize react-router-dom
        if (id === 'react-router-dom' || id.startsWith('react-router-dom/')) {
          return true;
        }
        // Externalize Firebase
        if (id === 'firebase' || id.startsWith('firebase/')) {
          return true;
        }
        // Externalize piche.ui
        if (id === 'piche.ui' || id.startsWith('piche.ui/')) {
          return true;
        }
        return false;
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-router-dom': 'ReactRouterDOM',
          firebase: 'firebase',
          'piche.ui': 'PicheUI'
        }
      }
    },
    cssCodeSplit: false,
    outDir: 'dist'
  }
});
