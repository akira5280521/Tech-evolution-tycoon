import notesMd from "../../docs/releases/v0.0.24.md?raw";
import { WEB_VERSION_CODE, WEB_VERSION_NAME } from "@/lib/appVersion";

// The release file is the list players see. This only reads it.
export function releaseNotes() {
  const lines = String(notesMd).split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === "## What's new");
  const items = [];
  for (let i = start + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) break;
    if (line.startsWith("- ")) items.push(line.slice(2).trim());
  }
  return {
    version: WEB_VERSION_NAME,
    versionCode: WEB_VERSION_CODE,
    items,
  };
}

const SEEN_KEY = "pc-tycoon-seen-notes";

export function notesUnseen() {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SEEN_KEY) !== WEB_VERSION_CODE;
  } catch {
    return false;
  }
}

export function markNotesSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, WEB_VERSION_CODE);
  } catch {
    /* this visit still closes the popup */
  }
}
