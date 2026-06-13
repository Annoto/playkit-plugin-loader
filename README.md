# playkit-js-annoto

A **thin Kaltura Player v7 (Playkit) wrapper plugin** that loads the Annoto
plugin so Annoto can be enabled through a Kaltura **uiConf** — including the
**IFrame (auto) embed**, which is not supported by the standard host-page script
setup.

**Scope: anonymous-only** (no SSO / per-user login).

## Why this exists

Annoto ships a single integration script:

```
https://cdn.annoto.net/playkit-plugin/latest/plugin.js
```

In every documented v7 setup this script must be placed on the **host page**
after the Kaltura player script. That covers direct / dynamic / thumbnail
embeds, but **not the IFrame embed** — there the player runs inside a
Kaltura-served iframe whose markup you can't edit, and v7 has no KMC mechanism
to inject an external script into it (v2 had the `iframeHTML5Js` flashvar).

This package wraps `plugin.js` in a **registered Playkit plugin**. Because it's
a real plugin, it can be bundled into a uiConf via Player Studio and runs from
*inside* the player bundle — so it works in the IFrame embed with no host-page
script. When the plugin runs it loads `plugin.js` and sets Annoto's documented
auto-boot globals.

It uses only Annoto's public surface (`plugin.js` + the `NN_PLAYKIT_*` globals),
so Annoto can keep updating `plugin.js` without breaking this wrapper.

## Configuration

Configured entirely through the player `plugins` config (i.e. KMC Player Studio
advanced settings) — no host-page JavaScript:

```js
plugins: {
  annotoLoader: {
    clientId: 'eyJhbGciOiJIUzI1NiJ9...', // Annoto API key (JWT) — required
    region: 'eu'                         // 'eu' | 'us' | 'staging' (optional)
    // theme: 'dark'                     // optional per-embed override
  }
}
```

The plugin is named **`annotoLoader`** (not `annoto`) on purpose, to avoid a
registration clash with the `annoto` plugin that `plugin.js` may register at
runtime. If Annoto/Kaltura adopt this wrapper directly, the name can become
`annoto`.

## Test it locally (localhost:8080)

This is the part Muli couldn't do without a working API key.

1. Serve this folder on port 8080 (the demo uses `:8080` by convention):

   ```bash
   cd playkit-js-annoto
   npx http-server -p 8080 -c-1 .
   # or: python3 -m http.server 8080
   ```

2. Open <http://localhost:8080/demo/>.

3. Paste your **Annoto API key** into the *clientId* field. The Kaltura
   partner/uiConf/entry fields default to Annoto's Kaltura test player — replace
   them with your own to test against your account.

4. Click **Load player + Annoto**. The page sets up the Kaltura v7 player with
   `plugins: { annotoLoader: { clientId } }` and **no Annoto script on the page** —
   exactly how a uiConf-bundled plugin behaves. Confirm the Annoto widget loads
   and is functional (open comments, post anonymously, etc.).

The demo inlines the wrapper logic so no build step is needed for testing. It's
the same logic as `src/`.

## Build for a real uiConf (the actual IFrame-embed path)

To get Annoto into the IFrame embed for real, the plugin has to be part of the
uiConf bundle:

1. Build the UMD bundle:

   ```bash
   npm install
   npm run build      # -> dist/playkit-js-annoto.js
   ```

2. Host `dist/playkit-js-annoto.js`, and register it in a Kaltura uiConf /
   Player Studio so it's loaded with the player, with the `annotoLoader` plugin
   config above set in the uiConf.

3. Generate the **IFrame (auto) embed** for that uiConf and drop it on any
   external site. Annoto should now load inside the iframe with no extra script.

> The cleanest long-term outcome is for Annoto (or Kaltura PS) to publish this
> wrapper and for Kaltura to whitelist it as a built-in Player Studio plugin, so
> customers can toggle Annoto on without manual uiConf work. This package is the
> proof-of-concept / testing artifact for that.

## Open-sourcing

MIT-licensed, intended to live under the **Kaltura-PS** organization (as Muli
suggested) or Annoto's org.

## Files

```
src/annoto.js        Plugin class (loads plugin.js, sets auto-boot globals)
src/index.js         Registers the plugin as `annotoLoader`
webpack.config.js    Builds dist/playkit-js-annoto.js (UMD) for uiConf bundling
demo/index.html      Zero-build localhost:8080 test page
```

## Known limitations / notes

- **Anonymous-only.** No SSO. Per-user identity inside an IFrame embed is a
  separate design problem (passing a user JWT into the iframe) and is out of
  scope here.
- The wrapper relies on Annoto's documented auto-boot globals. If the demo shows
  the player but not the Annoto widget, capture the browser console — it'll show
  whether `plugin.js` loaded and whether it found the player — and share it so we
  can adjust the boot timing.
