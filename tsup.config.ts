import { defineConfig } from 'tsup'

export default defineConfig((options) => ({
  name: !options.watch && 'production',

  entryPoints: [ 'src/index.js' ],
  tsconfig: 'jsconfig.json',

  dts: false,

  target: 'es2021',
  format: [ 'cjs' ],

  sourcemap: false,

  clean: true,
  minify: true,
  bundle: true
}))
