import { defineConfig } from 'tsdown'

export default defineConfig((options) => ({
  name: !options.watch && 'production',

  entryPoints: ['src/index.js'],
  tsconfig: 'jsconfig.json',

  dts: false,

  format: ['cjs'],

  sourcemap: false,

  clean: true,
  minify: true,
  bundle: true
}))
