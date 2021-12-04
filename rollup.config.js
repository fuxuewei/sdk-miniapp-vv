import typescript from 'rollup-plugin-typescript2'; // 处理typescript
import babel from 'rollup-plugin-babel'; // 处理es6
import { nodeResolve } from '@rollup/plugin-node-resolve'; // 你的包用到第三方npm包
import commonjs from '@rollup/plugin-commonjs'; // 你的包用到的第三方只有commonjs形式的包
import { uglify } from 'rollup-plugin-uglify';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import path from 'path';

export default {
  input: 'src/index.ts', // 源文件入口
  output: [
    {
      file: 'lib/index.esm.js', // package.json 中 "module": "dist/index.esm.js"
      format: 'esm', // es module 形式的包， 用来import 导入， 可以tree shaking
      sourcemap: true,
    },
    {
      file: 'lib/index.js', // package.json 中 "main": "dist/index.cjs.js",
      format: 'cjs', // commonjs 形式的包， require 导入
      sourcemap: true,
    },
    {
      format: 'umd',
      file: 'lib/index.umd.js', // umd 兼容形式的包， 可以直接应用于网页 script
      name: 'Tracer',
      sourcemap: true,
      plugins: [uglify()],
    },

    {
      format: 'umd',
      file: 'lib/index.min.js', // umd 兼容形式的包， 可以直接应用于网页 script
      name: 'Tracer',
      sourcemap: true,
      plugins: [uglify()],
    },
  ],
  plugins: [
    typescript({
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
    }), // 使用插件 @rollup/plugin-babel
    babel({
      exclude: 'node_modules/**',
    }),
    nodeResolve(),
    commonjs(),
    injectProcessEnv({
      SDK_VERSION: JSON.stringify(require('./package.json').version),
    }),
  ],
};
