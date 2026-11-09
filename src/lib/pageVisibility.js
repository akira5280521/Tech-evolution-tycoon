// One hidden flag for the browser tab and the Android activity.
// The idle tick and the audio mute both read this, so backgrounding the app
// uses the same 24 hour offline budget as a hidden tab.

let nativeHidden = false;

export function setNativeHidden(hidden) {
  nativeHidden = !!hidden;
  if (typeof document !== "undefined") {
    document.dispatchEvent(new Event("visibilitychange"));
  }
}

export function isPageHidden() {
  if (nativeHidden) return true;
  return typeof document !== "undefined" && document.hidden;
}
