import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetUno } from 'unocss'
import Icons from 'unplugin-icons/vite'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import { name } from './package.json'

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
    sourcemap: true,
    rollupOptions: {
      external: ['element-ui', 'vue'],
      output: {
        globals: {
          'element-ui': 'ElementUI',
          'vue': 'Vue',
        },
      },
    },
  },
})
