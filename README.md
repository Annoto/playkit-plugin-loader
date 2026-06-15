# playkit-plugin-loader

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
  'annoto-loader': {
    clientId: 'eyJhbGciOiJIUzI1NiJ9...', // Annoto API key (JWT) — required
    region: 'eu'                         // 'eu' | 'us' | 'staging' (optional)
    // theme: 'dark'                     // optional per-embed override
  }
}
```

The plugin is named **`annoto-loader`** (not `annoto`) on purpose, to avoid a
registration clash with the `annoto` plugin that `plugin.js` may register at
runtime. If Annoto/Kaltura adopt this wrapper directly, the name can become
`annoto`.

## Test it locally (localhost:8080)

1. Serve this folder on port 8080 (the demo uses `:8080` by convention):

   ```bash
   cd playkit-plugin-loader
   npx http-server -p 8080 -c-1 .
   # or: python3 -m http.server 8080
   ```

2. Open <http://localhost:8080/demo/>.

3. Paste your **Annoto API key** into the *clientId* field. The Kaltura
   partner/uiConf/entry fields default to Annoto's Kaltura test player — replace
   them with your own to test against your account.

4. Click **Load player + Annoto**. The page sets up the Kaltura v7 player with
   `plugins: { 'annoto-loader': { clientId } }` and **no Annoto script on the page** —
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
   npm run build      # -> dist/playkit-plugin-loader.js
   ```

2. Host `dist/playkit-plugin-loader.js` on a public HTTPS URL (any CDN).

3. Add it to a v7 player in **Player Studio** (steps below).

4. Generate the **IFrame (auto) embed** for that player and drop it on any
   external site. Annoto loads inside the iframe with no extra script.

## Player Studio (KMC) uiConf setup

These steps add the plugin to a TV Platform Studio (v7) player and configure it.
Open the **KMC → Studio** tab (`https://kmc.kaltura.com/index.php/kmcng/studio/v3`)
and use the **TV Platform Studio** (a.k.a. Player V7). If you don't see that tab,
ask your Kaltura account manager to enable it.

### A. Configure the plugin (uiConf advanced settings)

This is the part you can do yourself today.

1. In Studio, **Add New Player** (or pick an existing v7 player) and give it a
   name.
2. Open the player's **config / advanced settings** (the raw uiConf JSON editor —
   in the left sidebar, the option that lets you edit the player config file).
3. Add an `annoto-loader` entry to the `plugins` object:

   ```json
   {
     "plugins": {
       "annoto-loader": {
         "clientId": "eyJhbGciOiJIUzI1NiJ9...",
         "region": "eu"
       }
     }
   }
   ```

   `clientId` is your Annoto API key; `region` is `eu` / `us` / `staging`.
4. **Save** the player. Note its **Player ID** (this is the **uiConfId**) from the
   ID column in the player list.

### B. Get the plugin code loaded with the player

Configuration alone (step A) only tells the player *how* to configure
`annoto-loader` — the player also has to actually *load* the plugin code. There
are two ways, depending on your Kaltura setup:

- **Kaltura SaaS (cloud KMC):** the v7 bundler only includes plugins Kaltura has
  registered/whitelisted, so a self-hosted custom bundle is **not** pulled into
  the iframe build automatically. To enable the true IFrame embed on SaaS, ask
  Kaltura (via your account manager / Kaltura PS) to **whitelist and include this
  plugin** in the player bundler, pointing at your hosted
  `dist/playkit-plugin-loader.js`. This is the same "whitelist Annoto" ask raised in
  the original thread — this repo is the artifact that request points to.
- **Self-hosted / on-prem Kaltura:** add the plugin to your player **bundler
  config** so `dist/playkit-plugin-loader.js` is built into the uiConf bundle. Once
  it's in the bundle, the IFrame embed works with no host-page script.

> Until B is done on SaaS, you can still ship Annoto on every embed type **except
> the bare IFrame** using Annoto's standard host-page script setup, or use the
> **dynamic embed** with the plugin registered on the page (what the local demo
> does). The IFrame-without-host-script case is specifically what step B unlocks.

### C. Generate the embed and verify

1. In **KMC → Content**, pick an entry → **Share & Embed**.
2. Select your v7 player at the top.
3. Choose **Auto Embed** (the iframe embed) in advanced settings and copy the
   code.
4. Paste it on any external page and confirm the Annoto widget loads inside the
   iframe and is functional (anonymous comments, etc.).

> The cleanest long-term outcome is for Annoto (or Kaltura PS) to publish this
> wrapper and for Kaltura to whitelist it as a built-in Player Studio plugin, so
> customers can toggle Annoto on without any manual uiConf work. This package is
> the proof-of-concept / testing artifact for that.

## Open-sourcing

MIT-licensed, intended to live under the Annoto's org.

## Files

```
src/annoto.js        Plugin class (loads plugin.js, sets auto-boot globals)
src/index.js         Registers the plugin as `annoto-loader`
webpack.config.js    Builds dist/playkit-plugin-loader.js (UMD) for uiConf bundling
demo/index.html      Zero-build localhost:8080 test page
```

## Known limitations / notes

- Anonymous or OAuth or Sign in via Email- No SSO. Per-user identity inside an IFrame embed is a
  separate design problem (passing a user JWT into the iframe) and is out of
  scope here.
- The wrapper relies on Annoto's documented auto-boot globals. If the demo shows
  the player but not the Annoto widget, capture the browser console — it'll show
  whether `plugin.js` loaded and whether it found the player — and share it so we
  can adjust the boot timing.
