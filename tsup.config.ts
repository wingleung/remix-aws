import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'tsup',
  entry: ['src/index.ts'],
  target: 'node18',
  format: [
    'cjs',
    'esm'
  ],
  dts: true,
  sourcemap: true,
  clean: true
})