const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const externals = process.env.NODE_ENV === 'development' ? {} : {
  'element-ui': 'element-ui',
  'plain-kit': 'plain-kit',
  'vue': 'vue'
}

module.exports = {
  pages: {
    index: {
      entry: 'demo/main.ts',
    }
  },
  // 删除 HTML 相关的 webpack 插件
  chainWebpack: config => {
    config.plugins.delete('html')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')

    config.module
      .rule('svg')
      .exclude.add(resolve('src/assets/svg-sprite'))
      .end()
    config.module
      .rule('svg-sprite')
      .test(/\.svg$/)
      .include.add(resolve('src/assets/svg-sprite'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
  },
  css: {
    extract: {
      //filename: 'index.css',
    }
  },
  publicPath: './',
  assetsDir: 'static',
  outputDir: path.resolve(__dirname, './dist'),
  configureWebpack: {
    output: {
      filename: 'coord-picker.min.js',
      library: 'coord-picker',
      libraryTarget: 'umd',
      umdNamedDefine: true,
      libraryExport: 'default'
    },
    externals,
    devtool: 'source-map',
  }
}
