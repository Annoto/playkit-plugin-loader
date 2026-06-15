const path = require('path');

/**
 * Builds a UMD bundle that self-registers the plugin with the Kaltura player.
 * The output (dist/playkit-plugin-loader.js) is what you host and reference from a
 * Kaltura uiConf so the plugin is part of the player bundle (and therefore runs
 * inside the IFrame embed).
 *
 * `kaltura-player-js` is treated as an external/global so the plugin shares the
 * single player instance loaded by the page/uiConf rather than bundling its own.
 */
module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'playkit-plugin-loader.js',
    library: 'playkitPluginLoader',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  externals: {
    'kaltura-player-js': {
      commonjs: 'kaltura-player-js',
      commonjs2: 'kaltura-player-js',
      amd: 'kaltura-player-js',
      root: 'KalturaPlayer'
    }
  }
};
