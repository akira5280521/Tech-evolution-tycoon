// Sideload update check against the public GitHub Releases API.
// The request sends no save data and no account. Play installs skip it.

export const RELEASES_URL = "https://api.github.com/repos/akira5280521/Tech-evolution-tycoon/releases/latest";
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const CACHE_KEY = "pc-tycoon-update-check-v1";
export const PLAY_INSTALLER = "com.android.vending";

const SOON_HEADING = /coming soon|planned|on the way|next up|roadmap/i;
const MAX_NOTES = 15;

// Turn the release body into two bullet lists. Any bullet line (-, *, •) is an
// item. A heading or a line ending in ":" switches sections; headings that say
// "Coming soon" (or Planned / Next up / Roadmap) start the coming-soon list.
export function parseNotes(body) {
  const added = [];
  const soon = [];
  if (typeof body !== "string") return { added, soon };
  let target = added;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || /^versionCode:/i.test(line)) continue;
    const bullet = line.match(/^(?:[-*•+]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      const text = bullet[1].replace(/\*\*|__|`/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").trim().slice(0, 160);
      if (text && target.length < MAX_NOTES) target.push(text);
      continue;
    }
    if (/^#{1,6}\s/.test(line) || line.endsWith(":")) {
      target = SOON_HEADING.test(line) ? soon : added;
    }
  }
  return { added, soon };
}

export function parseRelease(release, installedCode) {
  const installed = Number(installedCode);
  if (!Number.isFinite(installed)) return null;
  const text = typeof release?.body === "string" ? release.body : "";
  const match = text.match(/^versionCode:\s*(\d+)\s*$/m);
  if (!match) return null;
  const versionCode = Number(match[1]);
  if (!Number.isFinite(versionCode) || versionCode <= installed) return null;
  const assets = Array.isArray(release.assets) ? release.assets : [];
  const apk = assets.find((asset) => {
    const name = typeof asset?.name === "string" ? asset.name.toLowerCase() : "";
    return name.endsWith(".apk") && typeof asset.browser_download_url === "string" && asset.browser_download_url.startsWith("https://");
  });
  if (!apk) return null;
  const tag = typeof release.tag_name === "string" && release.tag_name ? release.tag_name : String(versionCode);
  const label = tag.startsWith("v") ? tag : `v${tag}`;
  return { versionCode, label, apkUrl: apk.browser_download_url, notes: parseNotes(text) };
}

export function readUpdateCache() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    if (!raw || typeof raw.checkedAt !== "number") return null;
    return {
      checkedAt: raw.checkedAt,
      update: raw.update && typeof raw.update.apkUrl === "string" ? raw.update : null,
    };
  } catch {
    return null;
  }
}

export function writeUpdateCache(entry) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    /* a full disk should not interrupt the game */
  }
}

// A cached offer is only real while it is still newer than what's installed.
// Without this the banner kept offering the version you just updated to.
export function stillNewer(update, installedCode) {
  const installed = Number(installedCode);
  return !!update && Number.isFinite(installed) && Number(update.versionCode) > installed ? update : null;
}

export function shouldAutoCheck(now, cache) {
  if (!cache || typeof cache.checkedAt !== "number") return true;
  return now - cache.checkedAt >= CHECK_INTERVAL_MS;
}

export async function fetchLatestRelease() {
  const response = await fetch(RELEASES_URL, {
    // Browsers own User-Agent; setting it here is ignored at best and can
    // force a CORS preflight GitHub rejects at worst.
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!response.ok) throw new Error("release lookup failed");
  return response.json();
}
