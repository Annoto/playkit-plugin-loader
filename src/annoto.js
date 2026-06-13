/**
 * Annoto - thin Kaltura Player v7 (Playkit) wrapper plugin.
 *
 * Purpose
 * -------
 * Annoto's official integration artifact is a single script:
 *   https://cdn.annoto.net/playkit-plugin/latest/plugin.js
 * In every documented v7 setup this script must be added to the *host page*.
 * That works for direct / dynamic / thumbnail embeds, but NOT for the Kaltura
 * IFrame (auto) embed, because the player runs inside a Kaltura-served iframe
 * whose markup the integrator cannot edit, and v7 has no KMC mechanism to load
 * an external script inside it (v2 had the `iframeHTML5Js` flashvar).
 *
 * This plugin closes that gap. Because it is a *registered Playkit plugin*, it
 * can be bundled into a Kaltura uiConf via Player Studio. The player then runs
 * this code from *inside* the iframe bundle, where it loads plugin.js and sets
 * the documented auto-boot globals. No host-page script required.
 *
 * Scope: anonymous-only (no SSO). Configuration is passed through the player's
 * `plugins` config (i.e. KMC Player Studio advanced settings), so no host-page
 * JavaScript is needed.
 *
 * Built against the public Annoto integration surface only (plugin.js + the
 * documented NN_PLAYKIT_* globals) — no Annoto internals — so it keeps working
 * as Annoto ships updates to plugin.js.
 */

const DEFAULT_SCRIPT_URL = 'https://cdn.annoto.net/playkit-plugin/latest/plugin.js';

/**
 * Resolve the Kaltura `BasePlugin` base class. When bundled for a uiConf this
 * comes from the `kaltura-player-js` package; when the file is dropped on a page
 * for quick testing it comes from the global `KalturaPlayer.core`.
 */
function resolveBasePlugin() {
  if (typeof KalturaPlayer !== 'undefined' && KalturaPlayer.core && KalturaPlayer.core.BasePlugin) {
    return KalturaPlayer.core.BasePlugin;
  }
  // eslint-disable-next-line global-require
  return require('kaltura-player-js').core.BasePlugin;
}

const BasePlugin = resolveBasePlugin();

class Annoto extends BasePlugin {
  /**
   * Default configuration. Override any of these via the player `plugins` config:
   *   plugins: { annoto: { clientId: 'eyJ...', region: 'eu' } }
   */
  static get defaultConfig() {
    return {
      // Annoto API key (JWT). Required. Named `clientId` to match Annoto docs.
      clientId: '',
      // Annoto service region for the API key: 'eu' | 'us' | 'staging'. Default 'eu'.
      region: 'eu',
      // Optional widget theme override: 'dark' | 'default'. Prefer setting in the
      // Annoto dashboard; this is here only for per-embed override.
      theme: '',
      // Override the plugin.js URL (e.g. staging) if ever needed.
      scriptUrl: DEFAULT_SCRIPT_URL
    };
  }

  /**
   * The player always wants this plugin to load; validity is decided by config.
   */
  static isValid() {
    return true;
  }

  constructor(name, player, config) {
    super(name, player, config);
    this._loadAnnoto();
  }

  _loadAnnoto() {
    const { clientId, region, theme, scriptUrl } = this.config;

    if (!clientId) {
      this.logger.warn('Annoto: missing `clientId` in plugin config — Annoto will not boot.');
      return;
    }

    // Set the documented Annoto auto-boot globals (anonymous-only path).
    // plugin.js picks these up and boots the widget bound to the player on page.
    const w = window;
    w.NN_PLAYKIT_AUTO_BOOT = true;
    w.NN_PLAYKIT_API_KEY = clientId;
    if (region) {
      w.NN_PLAYKIT_REGION = region;
    }
    if (theme) {
      w.NN_PLAYKIT_THEME = theme;
    }

    // Guard against double-injection when multiple players exist on the page.
    if (w.__annotoPlaykitScriptInjected) {
      this.logger.debug('Annoto: plugin.js already injected, skipping.');
      return;
    }
    w.__annotoPlaykitScriptInjected = true;

    const url = scriptUrl || DEFAULT_SCRIPT_URL;
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = () => this.logger.debug('Annoto: plugin.js loaded from ' + url);
    script.onerror = () => {
      w.__annotoPlaykitScriptInjected = false;
      this.logger.error('Annoto: failed to load plugin.js from ' + url);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Nothing player-specific to tear down; plugin.js manages the widget lifecycle.
  reset() {}

  destroy() {}
}

export { Annoto, DEFAULT_SCRIPT_URL };
