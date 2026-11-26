import { useEffect, useState } from "react";
import { notesUnseen } from "@/lib/releaseNotes";

// Shown once to a save from before the hardware and era rework. Keeping the
// save always works; starting fresh is only a recommendation.
export function RestartOfferGate({ game }) {
  const [confirm, setConfirm] = useState(false);
  // Wait until What's New is closed (it reads device storage, so check it
  // in an effect, not while drawing).
  const [notesDone, setNotesDone] = useState(false);
  useEffect(() => {
    if (notesDone) return undefined;
    const check = () => {
      if (!notesUnseen()) setNotesDone(true);
    };
    check();
    const id = setInterval(check, 500);
    return () => clearInterval(id);
  }, [notesDone]);
  const state = game?.state;
  if (!notesDone || !state?.restartSuggested || state.restartSeen) return null;
  const keep = () => game.dismissRestart();
  const fresh = () => {
    game.dismissRestart();
    game.reset();
  };
  return (
    <div role="dialog" aria-label="A big update" data-restart-offer className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col border-4 border-[var(--game-accent)] bg-[var(--game-card)] shadow-[6px_6px_0_0_#000]">
        <div className="overflow-y-auto p-4">
          <h2 className="font-pixel text-sm text-[var(--game-fg)]">A BIG UPDATE</h2>
          <p className="mt-3 font-term text-lg leading-6 text-[var(--game-fg)]">
            This update rebuilt the hardware, research and eras: new eras from 1982 to 2010, every part opened by year and research, and a PC build bench. Your save still works and nothing was lost; parts that came too early were refunded.
          </p>
          <p className="mt-2 font-term text-lg leading-6 text-[var(--game-fg)]">
            For the game as it's meant to be played now, we recommend starting fresh. To send your numbers first, use More, then Stats, then Copy my stats.
          </p>
          {confirm && (
            <p data-restart-confirm className="mt-2 font-term text-lg leading-6 text-[var(--game-danger)]">
              Starting fresh erases this save for good: cash, eras, investors, research and badges. Tap again to confirm.
            </p>
          )}
        </div>
        <div className="space-y-2 border-t-2 border-[var(--game-border-strong)] p-3">
          <button type="button" data-restart-keep onClick={keep} className="min-h-12 w-full border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-2 font-pixel text-[0.55rem] text-black">
            KEEP PLAYING
          </button>
          <button
            type="button"
            data-restart-fresh
            onClick={confirm ? fresh : () => setConfirm(true)}
            className="min-h-12 w-full border-2 border-[var(--game-danger)] px-2 font-pixel text-[0.55rem] text-[var(--game-danger)]"
          >
            {confirm ? "YES, ERASE AND START FRESH" : "START FRESH"}
          </button>
        </div>
      </div>
    </div>
  );
}
