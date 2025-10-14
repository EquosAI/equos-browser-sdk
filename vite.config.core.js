import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
      include: ['src'],
    }),
  ],

  build: {
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/core/index.ts'),
      },
      name: 'EquosBrowserCoreSDK',
      formats: ['es'],
    },
    minify: 'terser',
    terserOptions: {
      format: { comments: false },
      compress: { drop_console: true, drop_debugger: true },
    },
    rollupOptions: {
      treeshake: true,
      external: [],
      output: {
        dir: 'dist',
        entryFileNames: '[name].[format].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        preserveModules: false,
      },
    },
    sourcemap: false,
    emptyOutDir: false,
    outDir: 'dist',
  },
});
