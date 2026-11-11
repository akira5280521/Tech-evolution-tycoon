import { useEffect, useRef, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { money } from "@/lib/gameConfig";
import { isPageHidden } from "@/lib/pageVisibility";
import {
  UPLOAD_EVERY_MS,
  checkCloud,
  cloudLoaded,
  getCloudState,
  keepLocal,
  localSummary,
  refreshStatus,
  subscribeCloud,
  upload,
} from "@/lib/cloudSave";

export function useCloud() {
  return useSyncExternalStore(subscribeCloud, getCloudState, getCloudState);
}

export function cloudLabel(state) {
  return `Career ${money(state.careerEarnings || 0)} · ${state.investors || 0} investors`;
}

function savedLabel(at) {
  if (!at) return "an unknown time";
  try {
    return new Date(at).toLocaleString();
  } catch {
    return "an unknown time";
  }
}

// Runs on every screen: checks the cloud copy once per session, then keeps it
// up to date. Shows the "which save do you want?" choice when the cloud copy
// is ahead of this phone.
export default function CloudSync({ game }) {
  const cloud = useCloud();
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    let alive = true;
    const startCheck = async () => {
      const s = await refreshStatus();
      if (!alive || !s.configured || !s.signedIn || !s.auto) return;
      await checkCloud(localSummary());
    };
    const push = async () => {
      const s = getCloudState();
      if (!s.configured || !s.signedIn || !s.auto || s.phase !== "ready") return;
      try {
        const code = await gameRef.current.exportSave();
        await upload(code, { label: cloudLabel(gameRef.current.state) });
      } catch {
        /* try again on the next tick */
      }
    };
    startCheck();
    const onVisibility = () => {
      if (isPageHidden()) push();
      else startCheck();
    };
    document.addEventListener("visibilitychange", onVisibility);
    const iv = setInterval(push, UPLOAD_EVERY_MS);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(iv);
    };
  }, []);

  if (cloud.phase !== "ask" || !cloud.cloud || game.state.offlineReport) return null;
  const c = cloud.cloud.summary;
  const local = localSummary();

  const loadIt = () => {
    if (game.importSave(cloud.cloud.data)) {
      cloudLoaded();
      toast("Cloud save loaded", { description: "Your empire from Play Games is back." });
    } else {
      keepLocal();
      toast("That cloud save couldn't be loaded", { description: "This phone's save was kept." });
    }
  };
  const keepIt = async () => {
    keepLocal();
    const code = await game.exportSave();
    const ok = await upload(code, { force: true, label: cloudLabel(game.state) });
    toast("Kept this phone's save", {
      description: ok ? "It's now your cloud save too." : "It will go to the cloud on the next save.",
    });
  };

  return (
    <div role="dialog" aria-label="Choose a save" className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/70 p-4">
      <div data-cloud-choice className="game-modal w-full max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <h2 className="font-pixel text-sm text-[var(--game-accent)]">CLOUD SAVE FOUND</h2>
        <p className="mt-3 font-term text-lg leading-6">
          Your Google Play Games save has more progress than this phone. Which one do you want to play?
        </p>
        <div className="mt-3 space-y-2 font-term text-lg leading-6">
          <p className="border-2 border-[var(--game-success-border)] p-2">
            <span className="font-pixel text-[0.55rem] text-[var(--game-success)]">CLOUD</span>
            <br />
            {money(c.career)} career · {c.investors.toLocaleString()} investors · {c.eras} era{c.eras === 1 ? "" : "s"}
            <br />
            <span className="text-[var(--game-muted)]">saved {savedLabel(cloud.cloud.modified || c.savedAt)}</span>
          </p>
          <p className="border-2 border-[var(--game-border-strong)] p-2">
            <span className="font-pixel text-[0.55rem] text-[var(--game-muted)]">THIS PHONE</span>
            <br />
            {money(local.career || 0)} career · {(local.investors || 0).toLocaleString()} investors · {local.eras || 0} era{local.eras === 1 ? "" : "s"}
          </p>
        </div>
        <p className="mt-3 font-term text-base leading-5 text-[var(--game-muted)]">The one you don't pick is replaced. To keep both, export this phone's save from Save Backup first.</p>
        <div className="mt-3 flex flex-col gap-2">
          <button type="button" data-cloud-load onClick={loadIt} className="min-h-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.6rem] text-black shadow-[3px_3px_0_0_#000]">
            LOAD CLOUD SAVE
          </button>
          <button type="button" data-cloud-keep onClick={keepIt} className="min-h-11 border-2 border-[var(--game-border-strong)] px-3 font-pixel text-[0.6rem] text-[var(--game-fg)]">
            KEEP THIS PHONE&apos;S
          </button>
        </div>
      </div>
    </div>
  );
}
