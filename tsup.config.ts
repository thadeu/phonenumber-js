import { defineConfig } from 'tsup'

const shared = {
  sourcemap: true,
  splitting: false,
  treeshake: true,
  target: 'es2022' as const,
  platform: 'neutral' as const,
}

export default defineConfig([
  {
    ...shared,
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs', 'iife'],
    globalName: 'Phonenumber',
    dts: true,
    clean: true,
    outDir: 'dist',
  },
  {
    ...shared,
    entry: { br: 'src/br.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    clean: false,
    outDir: 'dist',
  },
])
