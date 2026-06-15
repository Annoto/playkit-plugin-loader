import { registerPlugin } from '@playkit-js/kaltura-player-js';
import { pluginName, AnnotoLoader } from './annoto-loader';

registerPlugin(pluginName, AnnotoLoader);

export * from './types';
export { AnnotoLoader, pluginName };
