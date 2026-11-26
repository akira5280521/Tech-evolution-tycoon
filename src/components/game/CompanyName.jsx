import { useEffect, useState } from "react";
import { COMPANY_MAX, DEFAULT_COMPANY, cleanCompanyName, companyName, companyPrompt, randomCompanyName } from "@/lib/company";
import { notesUnseen } from "@/lib/releaseNotes";

const button = "min-h-11 border-2 px-3 font-pixel text-[0.55rem] shadow-[3px_3px_0_0_#000]";

// The name box with a dice button for a made-up name.
function NameField({ value, onChange, onEnter }) {
  return (
    <div className="mt-3 flex gap-2">
      <input
        data-company-input
        type="text"
        value={value}
        maxLength={COMPANY_MAX}
        autoComplete="off"
        aria-label="Company name"
        placeholder={DEFAULT_COMPANY}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
        className="min-h-11 min-w-0 flex-1 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] px-2 font-term text-xl text-[var(--game-fg)]"
      />
      <button
        type="button"
        data-company-dice
        aria-label="Make up a name"
        onClick={() => onChange(randomCompanyName())}
        className={`${button} border-[var(--game-accent)] text-2xl leading-none text-[var(--game-accent)]`}
      >
        🎲
      </button>
    </div>
  );
}

// First launch, before the tutorial: name the company. Skipping keeps the
// default name; it can be changed in Settings.
export function CompanyNameScreen({ state, onName }) {
  const [value, setValue] = useState(() => randomCompanyName());
  // Wait for What's New to close (device storage is read in an effect).
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
  if (!notesDone || companyPrompt(state) !== "screen") return null;
  const start = () => onName(cleanCompanyName(value));
  return (
    <div role="dialog" aria-label="Name your company" data-company-screen className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="game-modal w-full max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <h2 className="font-pixel text-sm text-[var(--game-accent)]">NAME YOUR COMPANY</h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-fg)]">
          Every tech giant started somewhere small. Yours starts with a timber camp. What's it called?
        </p>
        <NameField value={value} onChange={setValue} onEnter={start} />
        <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Shown in the news and on your HQ. You can change it later in Settings.</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" data-company-skip onClick={() => onName(null)} className="min-h-11 px-2 font-pixel text-[0.5rem] text-[var(--game-muted)] underline">
            SKIP
          </button>
          <button type="button" data-company-start onClick={start} className={`${button} border-[var(--game-accent)] bg-[var(--game-accent)] text-[var(--game-accent-fg)]`}>
            START
          </button>
        </div>
      </div>
    </div>
  );
}

// An older save: a one-time card on the game screen.
export function CompanyNameCard({ state, onName }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  if (companyPrompt(state) !== "card") return null;
  return (
    <section data-company-card className="border-2 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">NEW: NAME YOUR COMPANY</h2>
      {editing ? (
        <>
          <NameField value={value} onChange={setValue} onEnter={() => onName(cleanCompanyName(value))} />
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" data-company-save onClick={() => onName(cleanCompanyName(value))} className={`${button} border-[var(--game-accent)] text-[var(--game-accent)]`}>
              SAVE
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">Give your company a name for the news and your HQ.</p>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" data-company-later onClick={() => onName(null)} className={`${button} border-[var(--game-border-strong)] text-[var(--game-fg)]`}>
              NOT NOW
            </button>
            <button
              type="button"
              data-company-name-it
              onClick={() => {
                setValue(randomCompanyName());
                setEditing(true);
              }}
              className={`${button} border-[var(--game-accent)] text-[var(--game-accent)]`}
            >
              NAME IT
            </button>
          </div>
        </>
      )}
    </section>
  );
}

// Settings: rename any time.
export function CompanyNameSetting({ state, onName }) {
  const [value, setValue] = useState(() => state?.companyName || "");
  const [saved, setSaved] = useState(false);
  const save = () => {
    onName(cleanCompanyName(value));
    setValue(cleanCompanyName(value) || "");
    setSaved(true);
  };
  return (
    <div data-company-setting>
      <h2 className="font-pixel text-[0.6rem]">COMPANY NAME</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
        Now: {companyName(state)}. Shown in the news and on HQ; it stays on this phone and isn't in the copied stats.
      </p>
      <NameField
        value={value}
        onChange={(v) => {
          setValue(v);
          setSaved(false);
        }}
        onEnter={save}
      />
      <button type="button" data-company-rename onClick={save} className={`${button} mt-2 w-full border-[var(--game-accent)] text-[var(--game-accent)]`}>
        {saved ? "SAVED" : "SAVE NAME"}
      </button>
    </div>
  );
}
