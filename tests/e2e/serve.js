// Serves the built Android web bundle (dist/client) the way the WebView
// does: real files when they exist, index.html for every app route.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = process.env.SERVE_ROOT ? path.resolve(process.env.SERVE_ROOT) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../dist/client");
const port = Number(process.env.PORT || 4173);
const types = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp", ".ico": "image/x-icon",
  ".woff": "font/woff", ".woff2": "font/woff2", ".ttf": "font/ttf", ".mp3": "audio/mpeg", ".ogg": "audio/ogg", ".webmanifest": "application/manifest+json",
};

http
  .createServer((req, res) => {
    const url = decodeURIComponent((req.url || "/").split("?")[0]);
    let file = path.join(root, url);
    if (!file.startsWith(root)) {
      res.writeHead(403);
      res.end();
      return;
    }
    // The hosted build's server routes (/api/sw and friends) don't exist in
    // the Android bundle; answer them the way a missing file is answered.
    if (url.startsWith("/api/")) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      // An app route (/tech, /facilities...) or a missing asset.
      if (path.extname(url)) {
        res.writeHead(404);
        res.end();
        return;
      }
      file = path.join(root, "index.html");
    }
    res.writeHead(200, { "content-type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, "127.0.0.1", () => console.log(`serving ${root} on http://127.0.0.1:${port}`));
