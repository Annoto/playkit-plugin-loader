import { BasePlugin } from '@playkit-js/kaltura-player-js';
import { AnnotoLoaderConfig } from './types';

export const pluginName = 'annoto-loader';

const DEFAULT_SCRIPT_URL = 'https://cdn.annoto.net/playkit-plugin/latest/plugin.js';

interface AnnotoWindow extends Window {
  NN_PLAYKIT_AUTO_BOOT?: boolean;
  NN_PLAYKIT_API_KEY?: string;
  NN_PLAYKIT_REGION?: string;
  NN_PLAYKIT_THEME?: string;
  __annotoPlaykitScriptInjected?: boolean;
}

/**
 * AnnotoLoader — thin Kaltura Player v7 (Playkit) plugin that loads Annoto's
 * hosted bundle (plugin.js) and sets the documented auto-boot globals.
 *
 * Why: Annoto's official artifact (plugin.js) normally has to be placed on the
 * host page, which is impossible for the Kaltura IFrame embed. As a registered
 * Playkit plugin, this loader can be bundled into a uiConf and runs from inside
 * the player bundle, so Annoto loads even in the IFrame embed with no host-page
 * script.
 *
 * Authentication (Anonymous, OAuth/social, or Email login) is handled by the
 * Annoto widget per your clientId (configured in the Annoto dashboard).
 * Configuration is passed through the player `plugins` config (KMC Player Studio
 * advanced settings).
 *
 * Uses only Annoto's public surface (plugin.js + the NN_PLAYKIT_* globals), so
 * it keeps working as Annoto ships updates to plugin.js.
 */
export class AnnotoLoader extends BasePlugin {
  public static defaultConfig: AnnotoLoaderConfig = {
    clientId: '',
    region: 'eu',
    theme: '',
    scriptUrl: DEFAULT_SCRIPT_URL
  };

  public static isValid(): boolean {
    return true;
  }

  public loadMedia(): void {
    this._loadAnnoto();
  }

  private _loadAnnoto(): void {
    const { clientId, region, theme, scriptUrl } = this.config as AnnotoLoaderConfig;

    if (!clientId) {
      this.logger.warn('Annoto: missing `clientId` in plugin config — Annoto will not boot.');
      return;
    }

    // Set the documented Annoto auto-boot globals.
    // plugin.js picks these up and boots the widget bound to the player on page.
    const w = window as AnnotoWindow;
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
    script.onload = (): void => this.logger.debug(`Annoto: plugin.js loaded from ${url}`);
    script.onerror = (): void => {
      w.__annotoPlaykitScriptInjected = false;
      this.logger.error(`Annoto: failed to load plugin.js from ${url}`);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Nothing player-specific to tear down; plugin.js manages the widget lifecycle.
  public reset(): void {
    // no-op
  }

  public destroy(): void {
    super.destroy();
  }
}
