import { Annoto } from './annoto';

/**
 * Plugin name used in the player `plugins` config and in the uiConf.
 *
 * NOTE: this is intentionally `annoto-loader` rather than `annoto` to avoid any
 * registration clash with the `annoto` plugin that Annoto's own plugin.js may
 * register at runtime. Configure it as:
 *
 *   plugins: { 'annoto-loader': { clientId: 'eyJ...', region: 'eu' } }
 *
 * If/when this wrapper is adopted/bundled by Annoto or Kaltura directly, the
 * name can be changed to `annoto`.
 */
const PLUGIN_NAME = 'annoto-loader';

function registerAnnoto() {
  const register =
    (typeof KalturaPlayer !== 'undefined' && KalturaPlayer.core && KalturaPlayer.core.registerPlugin) ||
    // eslint-disable-next-line global-require
    require('kaltura-player-js').registerPlugin;
  register(PLUGIN_NAME, Annoto);
}

registerAnnoto();

export { Annoto, PLUGIN_NAME };
