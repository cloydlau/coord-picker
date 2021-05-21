import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import WindiCSS from 'vite-plugin-windicss'
import Icons from 'vite-plugin-icons'
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
    WindiCSS(),
    Icons(),
  ],
  build: {
    lib: {
      name,
      entry: 'src/main.ts'
    },
    rollupOptions: {
      // 请确保外部化那些你的库中不需要的依赖
      external: ['vue', 'element-ui'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue'
        }
      },
    }
  }
})
