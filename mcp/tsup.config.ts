import { defineConfig } from 'tsup'

export default defineConfig({
    entry: { index: 'src/index.ts' },
    format: 'esm',
    outDir: 'dist',
    treeshake: 'safest',
    splitting: false,
    dts: true,
    clean: true,
})
