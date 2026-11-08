# Base44 App — TanStack Start

A full-stack Base44 app: [TanStack Start](https://tanstack.com/start) (React 19, plain JavaScript) with file-based routes, server functions and server routes, server-rendered and hosted by Base44.

## What is in the starter

| Route | File |
| --- | --- |
| `/` | `src/routes/index.jsx` — a server-rendered page whose loader calls a server function |
| `GET /api/time` | `src/routes/api/time.js` — a server route: a raw HTTP endpoint next to the pages |

## Run locally

```bash
npm ci
base44 login   # one-time per machine
base44 link    # one-time per clone
base44 dev     # local backend + app together
```

## Android app

The installable app is a Capacitor wrapper around a static build of the same game. Package id `com.techevolutiontycoon.game`, display name Tech Evolution Tycoon, version 0.0.6 (versionCode 6). It targets Android SDK 36 (minimum 24), ships the icons, fonts, and JavaScript inside the package, keeps the save in `localStorage`, and follows the device rotation unless Settings locks portrait or landscape. Backgrounding the activity mutes audio and pauses the WebView; the existing hidden-page tick still applies the 8 hour offline budget when it wakes. The hardware back button closes a boardroom dilemma, returns from a tab to the previous screen, and leaves the app only from the game screen.

Sideloaded copies look at the public GitHub release at most once a day, and from More → Settings. The request is anonymous. Play Store installs skip it. There is no ad SDK, no analytics script, and no billing library.

Play listing copy, the privacy policy, and the Data safety / content-rating notes are in `docs/`.

Rebuild a signed release (reuses the same upload key, so a later build of this package id installs over the previous one):

```bash
export ANDROID_HOME="$HOME/android-sdk"   # platforms;android-36 and build-tools;36.0.0
export ANDROID_SDK_ROOT="$ANDROID_HOME"
npm run android:release
```

Outputs:

- `android/app/build/outputs/apk/release/app-release.apk`
- `android/app/build/outputs/bundle/release/app-release.aab`

The release key lives in the repo so the next build can sign with it:

| | |
| --- | --- |
| Keystore | `android/keystore/release.keystore` |
| Alias | `techevolutiontycoon` |
| Passwords | `android/keystore.properties` (`storePassword` and `keyPassword`) |

Do not replace that keystore. A different key will not update an install that was signed with this one.

## Build and publish

```bash
npm run build         # -> dist/client (assets) + dist/server (the Worker)
base44 deploy         # or publish from the Base44 builder
```

There is no `index.html`: the HTML document is rendered on the server from `src/routes/__root.jsx`. The build runs through the [Cloudflare Vite plugin](https://developers.cloudflare.com/workers/vite-plugin/), so dev and build both execute server code in `workerd`.

## How the pieces fit

- **Pages** are files in `src/routes/`. A route's `loader` runs on the server for a document request and in the browser for a client navigation; `Route.useLoaderData()` gives the component the resolved data.
- **Server functions** (`src/lib/server-fns.js`) are RPCs created with `createServerFn`. `src/start.js` runs every one of them through `authMiddleware`, which sends the visitor's token along, so `context.getBase44()` returns a client acting as that visitor and entity access rules apply. `context.getBase44().asServiceRole` bypasses them, so use it only after authenticating the caller (`.middleware([requireUser])`) and checking they may access the records involved: server functions and server routes are public endpoints anyone can call with any input. See **Server Security** in `AGENTS.md`. Call it only in handlers that need Base44: it reads the platform headers, and a handler that never calls it works without them.
- **Secrets** are read in server code with `import { secrets } from "base44:runtime"` → `secrets.get("NAME")`, inside a handler. Never `process.env`.
- **Server routes** (`src/routes/api/*.js`) are raw HTTP endpoints for URLs something other than the app's own code requests (webhooks, downloads, feeds); the app's pages call server functions. `src/start.js` runs every request through `base44RequestMiddleware`, so their `server.handlers` receive the same `context.getBase44()` (`({ request, params, context }) => …`).
- **Server-only code** lives in `*.server.js` files (TanStack refuses to bundle them for the browser).
- **Auth** is resolved client-side after hydration (`useAuth()`); the server is anonymous on a document request, so give per-user pages `ssr: false`.
- **Sign-in and gated pages** are not wired in the starter: `src/components/auth/` holds the pages (login, register, password reset, MCP consent) and a login gate for `src/routes/_authed/`, to add when the app needs them. See **Adding Authentication** in `AGENTS.md`.
- **AI**: TanStack AI is installed and runs on the Base44 AI gateway, with no API key and usage billed to the app's AI credits. `gatewayModel(context.getBase44())` in `src/lib/ai.server.js` builds the adapter; `AGENTS.md` has a streaming chat example (a server route plus `useChat`).
- **Caching**: the platform caches only what a route opts into via `headers()` (`Cache-Control: public, s-maxage=…`). Everything else is served fresh.
