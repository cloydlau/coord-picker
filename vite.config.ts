import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import Unocss from 'unocss/vite'
import { presetUno, presetAttributify } from 'unocss'
import Icons from 'unplugin-icons/vite'
import { name } from './package.json'
const { resolve } = require('path')

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  plugins: [
    createVuePlugin(/*options*/),
    Unocss({
      presets: [
        presetAttributify({ /* options */ }),
        presetUno(),
        // ...other presets
      ]
    }),
    Icons(),
  ],
  build: {
    lib: {
      name,
      entry: 'src/index.ts'
    },
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['element-ui', 'vue'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          '@amap/amap-jsapi-loader': '@amap/amap-jsapi-loader',
          'element-ui': 'ElementUI',
          vue: 'Vue',
        }
      },
    }
  }
})
