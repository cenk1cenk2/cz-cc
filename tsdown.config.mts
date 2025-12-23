import { defineConfig } from 'tsdown'

export default defineConfig((options) => ({
  name: !options.watch && 'production',

  tsconfig: 'jsconfig.json',

  dts: false,

  format: ['cjs'],

  sourcemap: false,

  clean: true,
  minify: false,
  unbundle: false
}))
