const path = require('path');
const { name } = require('./package');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const productionGzipExtensions = ['js', 'css'];
//
const publicPath = process.env.VUE_APP_PUBLIC_PATH;
const assetPath = process.env.VUE_APP_ASSET_PATH;
const port = 8081;
module.exports = {
  publicPath: publicPath,
  devServer: {
    port: port,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  chainWebpack: (config) => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();
    config.resolve.alias.set('@', path.resolve('./src'));
    config.resolve.alias.set('vue-i18n', 'vue-i18n/dist/vue-i18n.cjs.js');

    svgRule
      .oneOf('component')
      .resourceQuery(/component/)
      .use('vue-loader-v16')
      .loader('vue-loader-v16')
      .end()
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]',
      });
    config.module
      .rule('fonts')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 4096, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'fonts/[name].[hash:8].[ext]',
            assetPath,
          },
        },
      })
      .end();
    config.module
      .rule('images')
      .use('url-loader')
      .loader('url-loader')
      .options({
        limit: 10240, // 小于4kb将会被打包成 base64
        fallback: {
          loader: 'file-loader',
          options: {
            name: 'img/[name].[hash:8].[ext]',
            assetPath,
          },
        },
      });
  },
  configureWebpack: {
    output: {
      // 把子应用打包成 umd 库格式
      library: `${name}-[name]`,
      libraryTarget: 'umd',
      jsonpFunction: `webpackJsonp_${name}`,
    },
    plugins: [
      require('unplugin-element-plus/webpack')({
        // options
      }),
      new CompressionWebpackPlugin({
        filename: '[path][base].gz',
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8,
      }),
    ],
  },
};
