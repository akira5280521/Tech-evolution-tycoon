// Save backup codes: the whole save as one line of text a player can copy,
// keep anywhere, and paste back in (after a reinstall, or on a new phone).
//
// Format: TET1Z-<crc32>-<base64url of deflate (zlib) JSON>
//     or  TET1-<crc32>-<base64url of JSON>   (when the device can't compress)
// The checksum only catches a code that was cut off or mistyped. It is not a
// lock: this is a single-player save, and anything decoded still goes through
// migrateSave, which rejects or cleans every field before the game loads it.
import { migrateSave } from "./gameSave.js";

const PLAIN = "TET1";
const ZIPPED = "TET1Z";
// A real save is a few KB; this only stops a pasted novel from freezing the page.
export const MAX_CODE_LENGTH = 2_000_000;
// A compressed code can expand enormously ("zip bomb"); stop reading past this.
export const MAX_SAVE_BYTES = 4_000_000;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(text) {
  let crc = 0xffffffff;
  for (let i = 0; i < text.length; i++) crc = CRC_TABLE[(crc ^ text.charCodeAt(i)) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0).toString(16).padStart(8, "0");
}

function toBase64Url(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((text.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function runStream(bytes, stream, maxBytes = Infinity) {
  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new Error("save too large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

function canCompress() {
  return typeof CompressionStream === "function" && typeof DecompressionStream === "function";
}

/** Turns a packed save object into a backup code. */
export async function encodeSave(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data));
  let prefix = PLAIN;
  let payload = bytes;
  if (canCompress()) {
    try {
      // "deflate" works back to Chrome 80 WebViews; "deflate-raw" needs 103+.
      payload = await runStream(bytes, new CompressionStream("deflate"));
      prefix = ZIPPED;
    } catch {
      payload = bytes;
    }
  }
  const body = toBase64Url(payload);
  return `${prefix}-${crc32(body)}-${body}`;
}

/**
 * Reads a backup code. Returns { ok: true, data, summary } or { ok: false, error }.
 * `data` is the raw save object, ready for writeSaveData; the game's normal
 * loader checks it again on load.
 */
export async function decodeSave(code) {
  if (typeof code !== "string") return { ok: false, error: "Paste a save code first." };
  const clean = code.replace(/\s+/g, "");
  if (!clean) return { ok: false, error: "Paste a save code first." };
  if (clean.length > MAX_CODE_LENGTH) return { ok: false, error: "That code is far too long to be a save." };
  const match = clean.match(/^(TET1Z?)-([0-9a-f]{8})-([A-Za-z0-9_-]+)$/i);
  if (!match) return { ok: false, error: "That doesn't look like a Tech Evolution Tycoon save code." };
  const [, prefix, check, body] = match;
  if (crc32(body) !== check.toLowerCase()) {
    return { ok: false, error: "The code is incomplete or has a typo. Copy the whole code and try again." };
  }
  let data;
  try {
    let bytes = fromBase64Url(body);
    if (prefix.toUpperCase() === ZIPPED) {
      let inflate;
      try {
        inflate = canCompress() ? new DecompressionStream("deflate") : null;
      } catch {
        inflate = null;
      }
      if (!inflate) return { ok: false, error: "This device can't open compressed save codes. Update Android System WebView and try again." };
      bytes = await runStream(bytes, inflate, MAX_SAVE_BYTES);
    }
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, error: "The code couldn't be read. Copy the whole code and try again." };
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || !Array.isArray(data.biz)) {
    return { ok: false, error: "That code doesn't contain a save." };
  }
  const checked = migrateSave(data);
  if (!checked) return { ok: false, error: "That code doesn't contain a save." };
  return { ok: true, data, summary: summarize(checked) };
}

/** A few numbers to show before replacing a save. */
export function summarize(save) {
  const owned = Array.isArray(save?.biz) ? save.biz.filter((row) => (row?.owned || 0) > 0).length : 0;
  const savedAt = Number.isFinite(save?.lastSeen) ? save.lastSeen : null;
  const meta = save?.meta && typeof save.meta === "object" ? save.meta : {};
  const career = Number(meta.careerEarnings);
  const forks = Number(meta.singularities);
  return {
    career: Number.isFinite(career) && career >= 0 ? career : Number.isFinite(save?.lifetime) ? save.lifetime : 0,
    investors: Number.isFinite(save?.investors) ? save.investors : 0,
    forks: Number.isFinite(forks) && forks >= 0 ? Math.floor(forks) : 0,
    eras: owned,
    savedAt,
  };
}
