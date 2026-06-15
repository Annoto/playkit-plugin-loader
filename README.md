# playkit-plugin-loader

A thin **Kaltura Player v7 (Playkit)** plugin — `annoto-loader` — that loads
Annoto's hosted bundle and boots it through the player. Written in TypeScript,
structured after the [Kaltura-PS plugin template](https://github.com/Kaltura-PS/playkit-js-plugin-example).

**Scope: anonymous-only** (no SSO / per-user login).

## Why this exists

Annoto's official integration artifact is a single script
(`https://cdn.annoto.net/playkit-plugin/latest/plugin.js`) that normally has to
be placed on the **host page**. That works for direct / dynamic / thumbnail
embeds, but **not the Kaltura IFrame embed** — there the player runs inside a
Kaltura-served cross-origin iframe you can't inject into, and v7 has no KMC
mechanism to load an external script into it (v2 had the `iframeHTML5Js`
flashvar).

As a **registered Playkit plugin**, this loader can be bundled into a uiConf via
Player Studio and runs from *inside* the player bundle. On `loadMedia` it sets
Annoto's documented auto-boot globals (`NN_PLAYKIT_*`) and injects `plugin.js`,
so Annoto loads even in the IFrame embed with no host-page script. It uses only
Annoto's public surface, so it keeps working as `plugin.js` is updated.

## Configuration

Configured through the player `plugins` config (i.e. KMC Player Studio advanced
settings) — no host-page JavaScript:

```js
plugins: {
  'annoto-loader': {
    clientId: 'eyJhbGciOiJIUzI1NiJ9...', // Annoto API key (JWT) — required
    region: 'eu'                         // 'eu' | 'us' | 'staging' (optional)
    // theme: 'dark'                     // optional per-embed override
  }
}
```

The plugin registers as **`annoto-loader`** (not `annoto`) to avoid clashing
with the `annoto` plugin that `plugin.js` may register at runtime.

## Getting started with development

```sh
# Install dependencies
npm install

# Run the dev server for the demo page (recompiles on change)
npm run serve
```

Then set your Annoto API key in `demo/index.html` (`ANNOTO_API_KEY`) and the
Annoto widget will load on top of the player — with no Annoto script on the
page, mirroring the uiConf-bundled behaviour.

Other scripts:

```sh
npm run build        # production bundle (dist/) + type declarations
npm run build:prod   # production bundle only
npm run build:types  # .d.ts rollup via tsc + api-extractor
npm run type-check   # tsc --noEmit
npm run lint         # eslint
npm run lint:fix     # eslint --fix
npm run prettier     # format
npm run clean        # remove dist/ and lib/
```

## Kaltura Player Studio (uiConf) setup

1. **Configure** — in KMC → TV Platform Studio (v7), open the player's advanced
   settings (uiConf JSON) and add the `annoto-loader` block shown above. Save and
   note the Player ID (uiConfId).
2. **Load the plugin code** — the player must also *load* the plugin:
   - **Kaltura SaaS:** the v7 bundler only includes plugins Kaltura has
     whitelisted, so ask Kaltura (account manager / Kaltura PS) to include this
     plugin in the bundler, pointing at the hosted `dist/playkit-plugin-loader.js`.
   - **Self-hosted / on-prem:** add the plugin to your player bundler config so
     the bundle includes it.
3. **Embed & verify** — generate the Auto (IFrame) embed for that player and
   confirm Annoto loads inside the iframe.

### SharePoint note

Modern SharePoint pages don't run pasted `<script>` — the Embed web part is
iframe-only (allowlisted domains). So SharePoint needs either the Kaltura IFrame
embed (requires the bundling above) or a self-hosted iframe page that uses the
dynamic embed + this plugin. See the team thread for the decision tree.

## Distribution

This package is **`private`** and **not published to npm** (scoped `@annoto/`
to reserve the name). Like Annoto's `plugin.js`, it's distributed as the
**built bundle hosted on the Annoto CDN** — build it and host
`dist/playkit-plugin-loader.js`, then reference that URL from the Kaltura uiConf
/ bundler. `npm install` is for local development and building only.

## Project layout

```
src/index.ts                       Registers the plugin (annoto-loader)
src/annoto-loader.ts               Plugin class (loads plugin.js, sets globals)
src/types/                         Public config type (AnnotoLoaderConfig)
webpack.config.js                  Builds dist/playkit-plugin-loader.js (UMD)
tsconfig.json / tsconfig-lib.json  TypeScript + declaration build
api-extractor.json                 .d.ts rollup
demo/index.html                    Local demo page
```

## Known limitations / notes

- **Anonymous-only.** No SSO. Per-user identity inside an IFrame embed (passing
  a user JWT in) is a separate design problem and out of scope here.
- The loader relies on Annoto's documented auto-boot globals. If the demo shows
  the player but not the Annoto widget, check the browser console — it logs
  whether `plugin.js` loaded — and share it so the boot timing can be adjusted.

## License

MIT — see [LICENSE](LICENSE).
