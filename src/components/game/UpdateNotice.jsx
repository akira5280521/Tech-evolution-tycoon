import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { PLAY_INSTALLER, fetchLatestRelease, parseRelease, readUpdateCache, shouldAutoCheck, stillNewer, writeUpdateCache } from "@/lib/appUpdate";

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
  const [showNotes, setShowNotes] = useState(false);
  const [previewNotes, setPreviewNotes] = useState(false);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    setPreviewNotes(new URLSearchParams(window.location.search).has("notes"));
  }, []);

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
        if (!cancel) setUpdate(stillNewer(cache?.update, installed));
        return;
      }
      try {
        const release = await fetchLatestRelease();
        const next = parseRelease(release, installed);
        writeUpdateCache({ checkedAt: now, update: next });
        if (!cancel) setUpdate(next);
      } catch {
        // Leave checkedAt alone so a failed lookup retries on the next launch
        // instead of going quiet for a day.
        if (!cancel) setUpdate(stillNewer(cache?.update, installed));
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
      if (installed == null) {
        setNote("Couldn't read the installed version.");
        return;
      }
      const release = await fetchLatestRelease();
      const next = parseRelease(release, installed);
      writeUpdateCache({ checkedAt: Date.now(), update: next });
      setUpdate(next);
      if (!next) setNote("You're on the latest version.");
    } catch {
      setNote("Couldn't reach GitHub. Check your connection and try again.");
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
      const status = result?.status;
      if (status === "needs-permission") {
        setInstallNote("Allow installs from this app, then come back.");
      } else if (status === "downloading") {
        setInstallNote("Downloading in the background. The installer opens when it finishes.");
      } else if (status === "rejected") {
        setInstallNote("The download didn't pass the safety check, so it wasn't installed. Get the update from the GitHub releases page.");
      } else if (status === "installing") {
        setInstallNote("Opening the installer…");
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
          <div className="flex shrink-0 gap-2">
            {hasNotes(value.update) && (
              <button
                type="button"
                data-action="whats-new"
                onClick={() => setShowNotes(true)}
                className="min-h-11 shrink-0 border-2 border-[var(--game-border-strong)] px-2 font-pixel text-[0.5rem] text-[var(--game-fg)]"
              >
                WHAT'S NEW
              </button>
            )}
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
        </div>
      )}
      {value.update && showNotes && (
        <ReleaseNotes
          update={value.update}
          installing={installing}
          onUpdate={() => {
            setShowNotes(false);
            startInstall(value.update.apkUrl);
          }}
          onClose={() => setShowNotes(false)}
        />
      )}
      {previewNotes && !value.update && (
        <ReleaseNotes update={previewUpdate} installing={false} onUpdate={() => setPreviewNotes(false)} onClose={() => setPreviewNotes(false)} />
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

function hasNotes(update) {
  return !!(update?.notes && (update.notes.added?.length || update.notes.soon?.length));
}

const previewUpdate = {
  label: "v0.0.9",
  notes: {
    added: [
      "NEXT buy reaches the next milestone or gate",
      "Eight boardroom dilemmas, each with a fixed reward",
      "Six new mega-projects, from ARPANET Node to Parallel Timeline",
    ],
    soon: [
      "Investor upgrade shop",
      "A second world: the Space Age",
      "Cloud save backup",
    ],
  },
};

export function ReleaseNotes({ update, installing, onUpdate, onClose }) {
  const added = update.notes?.added || [];
  const soon = update.notes?.soon || [];
  return (
    <div role="dialog" aria-label={`What's new in ${update.label}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col border-4 border-[var(--game-accent)] bg-[var(--game-card)] shadow-[6px_6px_0_0_#000]">
        <div className="overflow-y-auto p-4">
          <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">UPDATE {update.label}</p>
          {added.length > 0 && (
            <>
              <h2 className="mt-3 font-pixel text-sm text-[var(--game-fg)]">WHAT'S NEW</h2>
              <ul className="mt-2 space-y-2" data-notes="added">
                {added.map((item) => (
                  <li key={item} className="flex gap-2 font-term text-lg leading-6 text-[var(--game-fg)]">
                    <span aria-hidden="true" className="text-[var(--game-accent)]">▸</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {soon.length > 0 && (
            <>
              <h2 className="mt-4 font-pixel text-sm text-[var(--game-violet)]">COMING SOON</h2>
              <ul className="mt-2 space-y-2" data-notes="soon">
                {soon.map((item) => (
                  <li key={item} className="flex gap-2 font-term text-lg leading-6 text-[var(--game-muted)]">
                    <span aria-hidden="true" className="shrink-0 border border-[var(--game-violet-border)] px-1 font-pixel text-[0.45rem] leading-5 text-[var(--game-violet)]">SOON</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="flex gap-2 border-t-2 border-[var(--game-border-strong)] p-3">
          <button
            type="button"
            onClick={onUpdate}
            disabled={installing}
            className="min-h-11 flex-1 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-2 font-pixel text-[0.55rem] text-black disabled:opacity-60"
          >
            {installing ? "DOWNLOADING…" : "UPDATE NOW"}
          </button>
          <button
            type="button"
            data-notes-close
            onClick={onClose}
            className="min-h-11 flex-1 border-2 border-[var(--game-border-strong)] px-2 font-pixel text-[0.55rem] text-[var(--game-muted)]"
          >
            LATER
          </button>
        </div>
      </div>
    </div>
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
