const path = require('path')

function resolve (dir) {
  return path.join(__dirname, dir)
}

const externals = process.env.NODE_ENV === 'development' ? {} : {
  'element-ui': 'element-ui',
  'vue': 'vue'
}

const svgFilePath = path.resolve('./src/assets/icon')

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

    /**
     * vue-svgicon
     */
    config.module
    .rule('vue-svgicon')
    .include.add(svgFilePath)
    .end()
    .test(/\.svg$/)
    .use('svgicon')
    .loader('@yzfe/svgicon-loader')
    .options({
      svgFilePath
    })
    config.module.rule('svg').exclude.add(svgFilePath).end()
    config.resolve.alias.set('@icon', svgFilePath) // recommended configuration alias
    config.module
    .rule('vue')
    .use('vue-loader')
    .loader('vue-loader')
    .tap(opts => {
      opts.transformAssetUrls = opts.transformAssetUrls || {} // vue-svgicon recommended configuration transformAssetUrls
      opts.transformAssetUrls['icon'] = ['data'] // vue-svgicon recommended configuration transformAssetUrls
      return opts
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
      //libraryExport: 'default'
    },
    externals,
    devtool: 'source-map',
  }
}
