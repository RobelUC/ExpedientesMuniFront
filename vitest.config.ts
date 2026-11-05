import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@domain': path.resolve(__dirname, 'src/domain'), '@application': path.resolve(__dirname, 'src/application') } },
  test: { environment: 'node', include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'], clearMocks: true },
});
