import babel from '@rollup/plugin-babel'
import babelrc from './.babelrc.json'

export default {
  input: 'index.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd',
    name: 'bundle',
    globals: {
      axios: "axios",
      proj4: "proj4",
      "bignumber.js": "bignumber.js",
      three: "three",
    }
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      ...babelrc,
    }),
  ],
  external: ["axios", "proj4", "bignumber.js", "three"],
}