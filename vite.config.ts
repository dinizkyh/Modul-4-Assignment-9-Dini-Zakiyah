import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/index.ts',
      exportName: 'app',
      tsCompiler: 'esbuild',
    }),
  ],
  optimizeDeps: {
    exclude: ['bcrypt'],
  },
  build: {
    outDir: 'dist',
    target: 'node18',
    ssr: true,
    rollupOptions: {
      input: './src/index.ts',
      output: {
        format: 'cjs',
      },
      external: [
        'express',
        'bcrypt',
        'jsonwebtoken',
        'mysql2',
        'uuid',
        'joi',
        'cors',
        'helmet',
        'express-rate-limit',
        'swagger-jsdoc',
        'swagger-ui-express',
        'dotenv'
      ],
    },
  },
});
