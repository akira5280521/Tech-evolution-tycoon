import { useEffect, useState } from "react";
import { markNotesSeen, notesUnseen, releaseNotes } from "@/lib/releaseNotes";

export function WhatsNewDialog({ onClose }) {
  const notes = releaseNotes();
  return (
    <div role="dialog" aria-label={`What's new in ${notes.version}`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col border-4 border-[var(--game-accent)] bg-[var(--game-card)] shadow-[6px_6px_0_0_#000]">
        <div className="overflow-y-auto p-4">
          <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">v{notes.version}</p>
          <h2 className="mt-2 font-pixel text-sm text-[var(--game-fg)]">WHAT'S NEW</h2>
          <ul className="mt-3 space-y-2" data-notes="current">
            {notes.items.map((item) => (
              <li key={item} className="flex gap-2 font-term text-lg leading-6 text-[var(--game-fg)]">
                <span aria-hidden="true" className="text-[var(--game-accent)]">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t-2 border-[var(--game-border-strong)] p-3">
          <button
            type="button"
            data-notes-close
            onClick={onClose}
            className="min-h-12 w-full border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-2 font-pixel text-[0.55rem] text-black"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
}

// Once per versionCode, on the first launch after it changes.
export function WhatsNewGate() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (notesUnseen()) setOpen(true);
  }, []);
  if (!open) return null;
  const close = () => {
    markNotesSeen();
    setOpen(false);
  };
  return <WhatsNewDialog onClose={close} />;
}
