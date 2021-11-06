import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

const plugins = [resolve(), typescript(), commonjs()];

const doFormats = [
  "umd",
  //"amd",
  //"cjs",
  //"es",
  //"iife",
  //"system"
]

// TODO: edit external dependencies
const external = [  
]

// TODO: edit export name
const name = "smartstore"

// TODO: edit global export names
const globals = {
  "lodash": "lodash"
}

// TODO: exit exports
const exports = "named"

const base = {
    input: 'src/index.ts',    
    external,
    output: {
      name,                  
      sourcemap: true,
      exports,
      globals
    },
    plugins
  }

// format specific output
const formats = {
  // Asynchronous Module Definition, used with module loaders like RequireJS
  amd: {},
  // CommonJS, suitable for Node and other bundlers (alias: commonjs)
  cjs: {},
  // Keep the bundle as an ES module file, suitable for other bundlers and inclusion as a <script type=module> tag in modern browsers (alias: esm, module)
  es: {},
  // A self-executing function, suitable for inclusion as a <script> tag. (If you want to create a bundle for your application, you probably want to use this.). "iife" stands for "immediately-invoked Function Expression"
  iife: {},
  // Universal Module Definition, works as amd, cjs and iife all in one
  umd: {file: "dist/index.js"},
  // Native format of the SystemJS loader (alias: systemjs)
  system: {},
}

const entries = doFormats.map(format => {
  const file = `dist/index.${format}.js`  
  let output = base.output
  output.file = file
  output.format = format  
  output = {...output, ...formats[format]}
  
  console.log(output)

  const entry = {...base}
  entry.output = output

  return entry
})

export default entries