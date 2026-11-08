const MODES = new Set(["auto", "portrait", "landscape"]);

export function normalizeOrientation(value) {
  return MODES.has(value) ? value : "auto";
}

// Auto follows the device. Portrait and landscape ask the OS to lock.
// A desktop browser may refuse the lock; the layout still follows the window.
export async function applyOrientation(mode) {
  const orientation = normalizeOrientation(mode);
  if (typeof document !== "undefined") {
    document.documentElement.dataset.orientationLock = orientation;
  }
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) {
    try {
      const { registerPlugin } = await import("@capacitor/core");
      const ScreenOrientation = registerPlugin("ScreenOrientation");
      await ScreenOrientation.lock({ orientation });
    } catch {
      /* the web layout still follows the device */
    }
    return;
  }
  const screenOrientation = typeof screen !== "undefined" ? screen.orientation : null;
  if (!screenOrientation) return;
  try {
    if (orientation === "auto") {
      if (typeof screenOrientation.unlock === "function") screenOrientation.unlock();
      return;
    }
    if (typeof screenOrientation.lock === "function") await screenOrientation.lock(orientation);
  } catch {
    /* desktop browsers refuse orientation lock */
  }
}
