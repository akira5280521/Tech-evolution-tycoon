import { useEffect, useState } from "react";
import { WEB_VERSION_CODE, WEB_VERSION_NAME, formatAppVersion } from "@/lib/appVersion";

export default function AppVersionFooter() {
  const [label, setLabel] = useState(() => formatAppVersion(WEB_VERSION_NAME, WEB_VERSION_CODE));

  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const cap = window.Capacitor;
        if (!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform())) return;
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo();
        const next = formatAppVersion(info?.version, info?.build);
        if (!cancel) setLabel(next);
      } catch {
        /* keep the web fallback already on screen */
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  return (
    <footer data-app-version className="mt-auto border-t-2 border-[var(--game-border)] pt-4 text-center">
      <p className="font-term text-lg leading-6 text-[var(--game-dim)]">{label}</p>
    </footer>
  );
}
