const path = require('path')

module.exports = {
  pages: {
    index: {
      entry: 'demo/main.ts',
      template: 'public/index.html',
      filename: 'index.html'
    }
  },
  css: { extract: false },
  publicPath: './',
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
