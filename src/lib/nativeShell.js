import { setNativeHidden } from "@/lib/pageVisibility";

// On the installed app, Capacitor reports background/foreground. The web build
// has no native bridge, so this stays a no-op and the tab's own visibility
// events keep driving audio and the offline budget.
export function installNativeLifecycle() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  if (!cap || typeof cap.isNativePlatform !== "function" || !cap.isNativePlatform()) return;
  import("@capacitor/app")
    .then(({ App }) => {
      App.addListener("appStateChange", ({ isActive }) => {
        setNativeHidden(!isActive);
      });
    })
    .catch(() => {
      /* the page still mutes on blur and visibilitychange */
    });
}
