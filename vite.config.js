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
        index: path.resolve(__dirname, 'src/core/index.ts'),
        react: path.resolve(__dirname, 'src/react/index.ts'),
      },
      name: 'EquosBrowserSDK',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'livekit-client',
        '@livekit/components-react',
        '@livekit/components-styles',
        'lucide-react',
      ],
      output: {
        dir: 'dist',
        entryFileNames: '[name].[format].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        exports: 'named',
        preserveModules: false,
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
});
