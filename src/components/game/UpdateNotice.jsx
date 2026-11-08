import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PLAY_INSTALLER, fetchLatestRelease, parseRelease, readUpdateCache, shouldAutoCheck, writeUpdateCache } from "@/lib/appUpdate";

const UpdateCheckContext = createContext(null);

function isNativeApp() {
  const cap = typeof window !== "undefined" ? window.Capacitor : undefined;
  return !!(cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform());
}

async function readInstaller() {
  const { registerPlugin } = await import("@capacitor/core");
  const InstallSource = registerPlugin("InstallSource");
  const result = await InstallSource.getInstaller();
  return typeof result?.installer === "string" ? result.installer : null;
}

async function installedVersionCode() {
  const { App } = await import("@capacitor/app");
  const info = await App.getInfo();
  const code = Number.parseInt(String(info?.build ?? ""), 10);
  return Number.isFinite(code) ? code : null;
}

export async function installReleaseApk(url) {
  const { registerPlugin } = await import("@capacitor/core");
  const AppUpdate = registerPlugin("AppUpdate");
  return AppUpdate.installApk({ url });
}

export function UpdateCheckProvider({ children }) {
  const [playInstall, setPlayInstall] = useState(false);
  const [native, setNative] = useState(false);
  const [update, setUpdate] = useState(null);
  const [checking, setChecking] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [note, setNote] = useState("");
  const [installNote, setInstallNote] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (!isNativeApp()) return;
      setNative(true);
      let installer = null;
      try {
        installer = await readInstaller();
      } catch {
        installer = null;
      }
      if (installer === PLAY_INSTALLER) {
        if (!cancel) setPlayInstall(true);
        return;
      }
      const installed = await installedVersionCode();
      if (installed == null) return;
      const cache = readUpdateCache();
      const now = Date.now();
      if (!shouldAutoCheck(now, cache)) {
        if (!cancel) setUpdate(cache?.update || null);
        return;
      }
      try {
        const release = await fetchLatestRelease();
        const next = parseRelease(release, installed);
        writeUpdateCache({ checkedAt: now, update: next });
        if (!cancel) setUpdate(next);
      } catch {
        writeUpdateCache({ checkedAt: now, update: cache?.update || null });
        if (!cancel) setUpdate(cache?.update || null);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const checkNow = useCallback(async () => {
    if (!native || playInstall || checking) return;
    setChecking(true);
    setNote("");
    try {
      const installed = await installedVersionCode();
      if (installed == null) return;
      const release = await fetchLatestRelease();
      const next = parseRelease(release, installed);
      writeUpdateCache({ checkedAt: Date.now(), update: next });
      setUpdate(next);
      if (!next) setNote("You're on the latest version.");
    } catch {
      /* offline or GitHub unavailable — stay quiet */
    } finally {
      setChecking(false);
    }
  }, [checking, native, playInstall]);

  const startInstall = useCallback(async (url) => {
    if (!url || installing) return;
    setInstalling(true);
    setInstallNote("");
    try {
      const result = await installReleaseApk(url);
      if (result?.status === "needs-permission") {
        setInstallNote("Allow installs from this app, then come back.");
      }
    } catch {
      setInstallNote("Couldn't start the download.");
    } finally {
      setInstalling(false);
    }
  }, [installing]);

  const value = {
    showControl: native && !playInstall,
    update: playInstall ? null : update,
    checking,
    note,
    checkNow,
    installing,
    installNote,
    startInstall,
  };
  return (
    <UpdateCheckContext.Provider value={value}>
      {children}
      {value.update && (
        <div
          role="status"
          data-update-banner
          className="update-banner fixed inset-x-0 z-40 mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 border-2 border-[var(--game-accent)] bg-[var(--game-bg)] px-3 py-2 shadow-[4px_4px_0_0_#000]"
          style={{ bottom: "calc(4.6rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
        >
          <p className="font-pixel text-[0.55rem] leading-4 text-[var(--game-accent)]">Update available {value.update.label}</p>
          <button
            type="button"
            data-action="open-update"
            disabled={installing}
            onClick={() => startInstall(value.update.apkUrl)}
            className="min-h-11 shrink-0 border-2 border-[var(--game-accent)] px-2 font-pixel text-[0.5rem] text-[var(--game-accent)] disabled:opacity-60"
          >
            {installing ? "DOWNLOADING…" : "UPDATE"}
          </button>
        </div>
      )}
      {value.update && installNote ? (
        <p
          className="fixed inset-x-0 z-40 mx-auto max-w-4xl px-3 font-term text-base text-[var(--game-muted)]"
          style={{ bottom: "calc(8.2rem + var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px)))" }}
        >
          {installNote}
        </p>
      ) : null}
    </UpdateCheckContext.Provider>
  );
}

export function useUpdateCheck() {
  return useContext(UpdateCheckContext) || {
    showControl: false,
    update: null,
    checking: false,
    note: "",
    checkNow: async () => {},
    installing: false,
    installNote: "",
    startInstall: async () => {},
  };
}

export function CheckForUpdatesButton() {
  const { showControl, checking, note, checkNow } = useUpdateCheck();
  if (!showControl) return null;
  return (
    <div className="space-y-2">
      <button
        type="button"
        data-action="check-updates"
        onClick={checkNow}
        disabled={checking}
        className="min-h-11 border-2 border-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent)] disabled:opacity-60"
      >
        {checking ? "CHECKING…" : "CHECK FOR UPDATES"}
      </button>
      {note ? <p className="font-term text-lg text-[var(--game-muted)]">{note}</p> : null}
    </div>
  );
}
