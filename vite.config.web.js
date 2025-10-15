import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
      include: ['src'],
    }),
  ],
  build: {
    lib: {
      entry: {
        web: path.resolve(__dirname, 'src/web/index.ts'),
      },
      name: 'EquosBrowserWebSDK',
      formats: ['es'],
    },
    minify: 'terser',
    terserOptions: {
      format: { comments: false },
    },
    rollupOptions: {
      treeshake: true,
      external: ['@equos/browser-sdk'],
      output: {
        dir: 'dist',
        entryFileNames: '[name].[format].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        preserveModules: false,
      },
      plugins: [],
    },
    sourcemap: false,
    emptyOutDir: false,
    outDir: 'dist',
  },
});
