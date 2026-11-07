// Sideload update check against the public GitHub Releases API.
// The request sends no save data and no account. Play installs skip it.

export const RELEASES_URL = "https://api.github.com/repos/akira5280521/Tech-evolution-tycoon/releases/latest";
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
export const CACHE_KEY = "pc-tycoon-update-check-v1";
export const PLAY_INSTALLER = "com.android.vending";

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
  return { versionCode, label, apkUrl: apk.browser_download_url };
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

export function shouldAutoCheck(now, cache) {
  if (!cache || typeof cache.checkedAt !== "number") return true;
  return now - cache.checkedAt >= CHECK_INTERVAL_MS;
}

export async function fetchLatestRelease() {
  const response = await fetch(RELEASES_URL, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "TechEvolutionTycoon",
    },
  });
  if (!response.ok) throw new Error("release lookup failed");
  return response.json();
}
