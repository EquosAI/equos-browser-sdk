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
        react: path.resolve(__dirname, 'src/react/index.ts'),
      },
      name: 'EquosBrowserReactSDK',
      formats: ['es'],
    },
    minify: 'terser',
    terserOptions: {
      format: { comments: false },
    },
    rollupOptions: {
      treeshake: true,
      external: [
        'react',
        'react-dom',
        'livekit-client',
        'lucide-react',
        '@livekit/components-react',
        '@livekit/components-styles',
        '@equos/browser-sdk',
      ],
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
