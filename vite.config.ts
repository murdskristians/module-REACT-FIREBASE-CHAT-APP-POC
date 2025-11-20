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
      external: [
        'react',
        'react-dom',
        'react-router-dom',
        'firebase',
        'firebase/compat/app',
        'firebase/compat/auth',
        'firebase/compat/firestore',
        'firebase/compat/storage',
        'firebase/compat/functions',
        'piche.ui'
      ],
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
