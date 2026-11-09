import { setNativeHidden } from "@/lib/pageVisibility";

function handleBackButton(App, canGoBack) {
  const notes = document.querySelector("[data-notes-close]");
  if (notes) {
    notes.click();
    return;
  }
  const defer = document.querySelector("[data-dilemma='defer']");
  if (defer) {
    defer.click();
    return;
  }
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (path !== "/") {
    if (canGoBack) window.history.back();
    else window.location.assign("/");
    return;
  }
  App.exitApp();
}

// On the installed app, Capacitor reports background/foreground and the
// hardware back button. The web build has no native bridge, so this stays a
// no-op and the tab's own visibility events keep driving audio and the
// offline budget.
export function installNativeLifecycle() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap || typeof cap.isNativePlatform !== "function" || !cap.isNativePlatform()) return;
  import("@capacitor/app")
    .then(({ App }) => {
      App.addListener("appStateChange", ({ isActive }) => {
        setNativeHidden(!isActive);
      });
      App.addListener("backButton", ({ canGoBack }) => {
        handleBackButton(App, canGoBack);
      });
    })
    .catch(() => {
      /* the page still mutes on blur and visibilitychange */
    });
}
