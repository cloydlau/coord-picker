import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import Icons from 'unplugin-icons/vite'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import { PascalCasedName, name } from './package.json'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  plugins: [
    vue(),
    UnoCSS({
      presets: [
        presetAttributify({ /* options */ }),
        presetUno(),
        // ...other presets
      ],
    }),
    cssInjectedByJsPlugin(),
    Icons(),
    AutoImport({
      // targets to transform
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
        /\.vue$/, /\.vue\?vue/, // .vue
        /\.md$/, // .md
      ],
      // global imports to register
      imports: [
        // presets
        'vue',
        '@vueuse/core',
        {
          vue: [
            ['default', 'Vue'],
          ],
        },
      ],
    }),
    dts(),
  ],
  build: {
    lib: {
      name,
      entry: 'src/index.ts',
    },
    cssCodeSplit: true,
    sourcemap: true,
    rollupOptions: {
      external: ['element-ui', 'vue'],
      output: {
        globals: {
          [name]: PascalCasedName,
          'element-ui': 'ElementUI',
          'vue': 'Vue',
        },
      },
    },
  },
})
