const path = require('path')

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
    devtool: 'source-map',
  }
}
