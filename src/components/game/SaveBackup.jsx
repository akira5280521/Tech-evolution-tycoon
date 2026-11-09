import { useState } from "react";
import { toast } from "sonner";
import { money } from "@/lib/gameConfig";
import { decodeSave } from "@/lib/saveCode";
import { Panel } from "./chrome";

const smallButton =
  "min-h-11 border-2 px-3 font-pixel text-[0.55rem] shadow-[2px_2px_0_0_#000] disabled:cursor-not-allowed disabled:opacity-60";

async function copyText(text, field) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall back to selecting the text */
  }
  try {
    field?.focus();
    field?.select();
    return document.execCommand?.("copy") === true;
  } catch {
    return false;
  }
}

function savedLabel(at) {
  if (!at) return "an unknown date";
  try {
    return new Date(at).toLocaleString();
  } catch {
    return "an unknown date";
  }
}

// Export the save as a code, or replace the save with one. Used before a
// reinstall or to move to another phone.
export default function SaveBackup({ state, onExport, onImport }) {
  const [code, setCode] = useState("");
  const [exporting, setExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(null);

  const makeCode = async () => {
    setExporting(true);
    setCopied(false);
    try {
      setCode(await onExport());
    } catch {
      toast("Couldn't make a save code", { description: "Try again in a moment." });
    } finally {
      setExporting(false);
    }
  };

  const copy = async (event) => {
    const field = event.currentTarget.parentElement?.parentElement?.querySelector("textarea[data-save-code]");
    const ok = await copyText(code, field);
    setCopied(ok);
    if (!ok) toast("Select the code and copy it", { description: "This device blocked automatic copying." });
  };

  const check = async () => {
    setChecking(true);
    setError("");
    setPending(null);
    const result = await decodeSave(paste);
    setChecking(false);
    if (!result.ok) setError(result.error);
    else setPending(result);
  };

  const confirmImport = () => {
    if (!pending) return;
    if (onImport(pending.data)) {
      toast("Save restored", { description: "Your empire is back." });
      setPending(null);
      setPaste("");
      setCode("");
    } else {
      setError("That save couldn't be loaded.");
    }
  };

  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">SAVE BACKUP</h2>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
        Your progress lives only on this device. Make a save code and keep it somewhere safe, like a notes app or an email to yourself.
        Paste it back in after reinstalling or on a new phone.
      </p>

      <div className="mt-3 space-y-2" data-save-export>
        <button
          type="button"
          onClick={makeCode}
          disabled={exporting}
          className={`${smallButton} w-full border-[var(--game-accent)] bg-[var(--game-accent)] text-black`}
        >
          {exporting ? "MAKING CODE…" : code ? "MAKE A FRESH CODE" : "EXPORT SAVE"}
        </button>
        {code && (
          <>
            <textarea
              data-save-code
              readOnly
              value={code}
              rows={4}
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Your save code"
              className="w-full resize-none break-all border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-2 font-mono text-xs leading-4 text-[var(--game-fg)]"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={copy} className={`${smallButton} border-[var(--game-accent)] text-[var(--game-accent)]`}>
                COPY CODE
              </button>
              <span className="font-term text-base text-[var(--game-muted)]">
                {copied ? "Copied. Paste it somewhere safe now." : `${code.length.toLocaleString()} characters`}
              </span>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 space-y-2 border-t-2 border-[var(--game-border)] pt-3" data-save-import>
        <h3 className="font-pixel text-[0.55rem]">RESTORE FROM A CODE</h3>
        <textarea
          value={paste}
          onChange={(event) => {
            setPaste(event.target.value);
            setError("");
            setPending(null);
          }}
          rows={3}
          placeholder="Paste your save code here"
          aria-label="Save code to restore"
          className="w-full resize-none break-all border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-2 font-mono text-xs leading-4 text-[var(--game-fg)]"
        />
        {!pending && (
          <button
            type="button"
            onClick={check}
            disabled={checking || !paste.trim()}
            className={`${smallButton} w-full border-[var(--game-border-strong)] text-[var(--game-fg)]`}
          >
            {checking ? "CHECKING…" : "CHECK CODE"}
          </button>
        )}
        {error && <p className="font-term text-lg leading-6 text-[var(--game-danger)]">{error}</p>}
        {pending && (
          <div className="space-y-2 border-2 border-[var(--game-danger)] p-2" data-save-confirm>
            <p className="font-term text-lg leading-6">
              This code holds an empire with {money(pending.summary.career)} career earnings, {pending.summary.investors.toLocaleString()} investors
              {pending.summary.forks ? `, ${pending.summary.forks} timeline fork${pending.summary.forks === 1 ? "" : "s"}` : ""} and {pending.summary.eras} era{pending.summary.eras === 1 ? "" : "s"}, saved {savedLabel(pending.summary.savedAt)}.
            </p>
            <p className="font-term text-lg leading-6 text-[var(--game-danger)]">
              Restoring replaces your current empire ({money(state.careerEarnings || 0)} career earnings). This can't be undone, so export your current save first if you want to keep it.
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={confirmImport} className={`${smallButton} flex-1 border-[var(--game-danger)] bg-[var(--game-danger)] text-black`}>
                REPLACE MY SAVE
              </button>
              <button type="button" onClick={() => setPending(null)} className={`${smallButton} flex-1 border-[var(--game-border-strong)] text-[var(--game-muted)]`}>
                CANCEL
              </button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
