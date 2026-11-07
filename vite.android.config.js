import path from "node:path";
import { fileURLToPath } from "node:url";
import base44 from "@base44/vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const root = path.dirname(fileURLToPath(import.meta.url));

// Static shell for the Capacitor app. The hosted Base44 build stays on
// vite.config.js (Cloudflare worker). This one emits a client bundle with no
// analytics, no builder hooks, and an index.html the WebView can open offline.
export default defineConfig({
  resolve: {
    alias: {
      "cloudflare:workers": path.join(root, "src/lib/cloudflare-workers-stub.js"),
    },
  },
  plugins: [
    base44({
      hmrNotifier: false,
      navigationNotifier: false,
      analyticsTracker: false,
      visualEditAgent: false,
    }),
    tanstackStart({
      srcDirectory: "src",
      spa: {
        enabled: true,
        prerender: {
          outputPath: "/index.html",
          crawlLinks: false,
        },
      },
    }),
    react(),
  ],
});
