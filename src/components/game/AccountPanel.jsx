import { useEffect, useState } from "react";
import { toast } from "sonner";
import { money } from "@/lib/gameConfig";
import {
  checkCloud,
  cloudLoaded,
  fetchCloudForLoad,
  localSummary,
  refreshStatus,
  setAutoUpload,
  signIn,
  upload,
} from "@/lib/cloudSave";
import { cloudLabel, useCloud } from "./CloudSync";
import { Panel } from "./chrome";

const button =
  "min-h-11 border-2 px-3 font-pixel text-[0.55rem] shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-60";

function when(at) {
  if (!at) return "never";
  try {
    return new Date(at).toLocaleString();
  } catch {
    return "recently";
  }
}

// Google Play Games account and cloud save, in More > Settings.
export default function AccountPanel({ state, onExport, onImport }) {
  const cloud = useCloud();
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    refreshStatus();
  }, []);

  const saveNow = async () => {
    // The session check runs first, so this can't overwrite a better cloud save unseen.
    const phase = cloud.phase === "ready" ? "ready" : await checkCloud(localSummary());
    if (phase !== "ready") return;
    const code = await onExport();
    const ok = await upload(code, { force: true, label: cloudLabel(state) });
    if (ok) toast("Saved to Play Games", { description: "Your cloud save is up to date." });
  };

  const loadOffer = async () => setOffer(await fetchCloudForLoad());

  const confirmLoad = () => {
    if (offer && onImport(offer.data)) {
      cloudLoaded();
      toast("Cloud save loaded", { description: "Your empire from Play Games is back." });
    }
    setOffer(null);
  };

  if (cloud.configured === null) {
    return (
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">ACCOUNT</h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Checking…</p>
      </Panel>
    );
  }

  if (!cloud.configured) {
    return (
      <Panel>
        <h2 className="font-pixel text-[0.6rem]">ACCOUNT</h2>
        <p data-account-off className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          Google Play Games sign-in and cloud save come with the Google Play version of the game. Until then, use Save Backup to move your progress.
        </p>
      </Panel>
    );
  }

  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">ACCOUNT</h2>
      {!cloud.signedIn ? (
        <div className="mt-2 space-y-2" data-account-signin>
          <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
            Sign in with Google Play Games to keep a cloud save of your empire and pick it up on another phone.
          </p>
          <button type="button" onClick={signIn} disabled={cloud.busy} className={`${button} w-full border-[var(--game-accent)] bg-[var(--game-accent)] text-black`}>
            {cloud.busy ? "SIGNING IN…" : "SIGN IN WITH PLAY GAMES"}
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-2" data-account-cloud>
          <p className="font-term text-lg leading-6">
            Signed in{cloud.name ? ` as ${cloud.name}` : ""} with Google Play Games.
          </p>
          <p className="font-term text-base leading-5 text-[var(--game-muted)]">Last cloud save: {when(cloud.lastUpload)}</p>
          <button
            type="button"
            data-cloud-auto
            onClick={() => setAutoUpload(!cloud.auto)}
            className={`${button} w-full ${cloud.auto ? "border-[var(--game-success-border)] text-[var(--game-success)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
          >
            AUTO CLOUD SAVE: {cloud.auto ? "ON" : "OFF"}
          </button>
          <div className="flex flex-wrap gap-2">
            <button type="button" data-cloud-save onClick={saveNow} disabled={cloud.busy || cloud.phase === "checking"} className={`${button} flex-1 border-[var(--game-accent)] text-[var(--game-accent)]`}>
              SAVE TO CLOUD NOW
            </button>
            <button type="button" data-cloud-fetch onClick={loadOffer} disabled={cloud.busy} className={`${button} flex-1 border-[var(--game-border-strong)] text-[var(--game-fg)]`}>
              LOAD FROM CLOUD
            </button>
          </div>
          {offer && (
            <div className="space-y-2 border-2 border-[var(--game-danger)] p-2" data-cloud-confirm>
              <p className="font-term text-lg leading-6">
                The cloud save has {money(offer.summary.career)} career earnings, {offer.summary.investors.toLocaleString()} investors and {offer.summary.eras} eras, saved {when(offer.modified || offer.summary.savedAt)}.
              </p>
              <p className="font-term text-lg leading-6 text-[var(--game-danger)]">
                Loading it replaces this phone&apos;s empire ({money(state.careerEarnings || 0)} career earnings).
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={confirmLoad} className={`${button} flex-1 border-[var(--game-danger)] bg-[var(--game-danger)] text-black`}>
                  REPLACE MY SAVE
                </button>
                <button type="button" onClick={() => setOffer(null)} className={`${button} flex-1 border-[var(--game-border-strong)] text-[var(--game-muted)]`}>
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {cloud.error && <p className="mt-2 font-term text-lg leading-6 text-[var(--game-danger)]">{cloud.error}</p>}
    </Panel>
  );
}
