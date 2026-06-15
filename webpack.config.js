const webpack = require('webpack');
const path = require('path');
const packageData = require('./package.json');

module.exports = (env, { mode }) => {
  return {
    target: 'web',
    entry: './src/index.ts',
    devtool: 'source-map',
    module: {
      rules: [
        {
          test: /\.(tsx?|js)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                [
                  '@babel/preset-env',
                  {
                    bugfixes: true
                  }
                ],
                '@babel/preset-typescript'
              ],
              plugins: [
                ['@babel/plugin-transform-runtime'],
                ['@babel/plugin-proposal-decorators', { legacy: true }]
              ]
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    output: {
      filename: 'playkit-plugin-loader.js',
      path: path.resolve(__dirname, 'dist'),
      library: {
        umdNamedDefine: true,
        // Attaches to KalturaPlayer.plugins.annotoLoader (UMD global). The
        // registered plugin name used in player config is 'annoto-loader'.
        name: ['KalturaPlayer', 'plugins', 'annotoLoader'],
        type: 'umd'
      },
      clean: true
    },
    externals: {
      // The player is provided by the page/uiConf as the global KalturaPlayer,
      // so it is never bundled here.
      '@playkit-js/kaltura-player-js': 'root KalturaPlayer',
      '@playkit-js/playkit-js': 'root KalturaPlayer.core'
    },
    devServer: {
      static: {
        directory: path.join(__dirname, 'demo')
      },
      client: {
        progress: true
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        __VERSION__: JSON.stringify(packageData.version),
        __NAME__: JSON.stringify(packageData.name)
      })
    ]
  };
};
