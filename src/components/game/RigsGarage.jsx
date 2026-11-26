import { useEffect } from "react";
import { HUB_ROUTE } from "@/lib/hub";
import {
  RIGS_CAP,
  RIGS_ICON,
  benchCounts,
  benchHasParts,
  readRigs,
  rigStats,
  rigsOpen,
} from "@/lib/rigs";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton } from "./chrome";

function RigThumb({ thumbs, name }) {
  return (
    <div
      data-rigs-thumb
      className="flex h-14 w-[6.3rem] shrink-0 items-center justify-center gap-0.5 overflow-hidden border-2 border-[var(--game-border-strong)] bg-[#0d0e20] px-0.5"
      aria-hidden="true"
    >
      {thumbs.slice(0, 3).map((part, i) => (
        <img
          key={`${part.id}-${i}`}
          src={part.icon}
          alt=""
          width={i === 0 ? 40 : 28}
          height={i === 0 ? 40 : 28}
          className={`pixel-art object-contain ${i === 0 ? "h-10 w-10" : "h-7 w-7"}`}
        />
      ))}
      {!thumbs.length ? (
        <span className="font-pixel text-[0.4rem] text-[var(--game-dim)]">{name}</span>
      ) : null}
    </div>
  );
}

function PartLine({ slots }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {slots.filter((slot) => slot.name !== "—").map((part) => (
        <span key={part.slot} className="flex min-w-0 items-center gap-1">
          {part.icon ? (
            <img src={part.icon} alt="" width={16} height={16} className="pixel-art h-4 w-4 shrink-0 border border-[var(--game-border-strong)] bg-[var(--game-bg)] object-contain" />
          ) : null}
          <span className="font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)]">{part.slot}</span>
          <span className="font-term text-base leading-4 text-[var(--game-fg)]">{part.name}</span>
        </span>
      ))}
    </div>
  );
}

export default function RigsGarage() {
  const { state, saveBenchRig, deleteBenchRig, noteTutorialPage } = useGameState();
  useEffect(() => { noteTutorialPage?.("rigs"); }, [noteTutorialPage]);
  const open = rigsOpen(state);
  const builds = readRigs(state?.rigs);
  const onBench = benchCounts(state);
  const canSave = open && benchHasParts(onBench) && builds.length < RIGS_CAP;
  const saveHint = !open
    ? "Needs Home Computers this run."
    : !benchHasParts(onBench)
      ? "Build a PC on the Bench first."
      : builds.length >= RIGS_CAP
        ? `SAVED BUILDS is full (${RIGS_CAP}). Delete one to save another.`
        : "Stores a copy of the current build in SAVED BUILDS.";

  const onSave = () => {
    saveBenchRig?.();
  };

  const onDelete = (id, name) => {
    if (!window.confirm(`Delete ${name}?\n\nThis only removes the saved copy. The PC on the bench is not changed.`)) return;
    deleteBenchRig?.(id);
  };

  return (
    <ScreenShell title="RIGS" subtitle="Custom PCs from the PC Build Bench." backTo={HUB_ROUTE} titleIcon={RIGS_ICON}>
      {!open ? (
        <div
          aria-disabled="true"
          data-rigs-locked
          data-locked=""
          className="border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-3 text-[var(--game-dim)] opacity-60 shadow-[3px_3px_0_0_#000]"
        >
          <p className="font-pixel text-[0.6rem] leading-5">??? RIGS</p>
          <p className="break-words font-pixel text-[0.5rem] leading-4">Needs Home Computers this run</p>
          <p className="mt-1 font-pixel text-[0.5rem] leading-4">COMING SOON</p>
        </div>
      ) : (
        <div data-rigs-garage className="space-y-2">
          {!builds.length ? (
            <div data-rigs-empty className="border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-3 shadow-[3px_3px_0_0_#000]">
              <p className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">NO SAVED PCS YET</p>
              <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">Build one at the PC Build Bench, then tap SAVE THE PC ON THE BENCH.</p>
            </div>
          ) : null}
          {builds.map((build) => {
            const stats = rigStats(build.parts);
            return (
              <div
                key={build.id}
                data-rigs-build={build.id}
                className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-2 shadow-[3px_3px_0_0_#000]"
              >
                <div className="flex gap-3">
                  <RigThumb thumbs={stats.thumbs} name={build.name} />
                  <div className="min-w-0 flex-1">
                    <p className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{build.name}</p>
                    <p className="font-term text-base leading-5 text-[var(--game-success)]">{stats.outputLabel} · {stats.valueLabel}</p>
                    {stats.limit ? <p className="font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">{stats.limit}</p> : null}
                  </div>
                  <button
                    type="button"
                    data-rigs-delete={build.id}
                    onClick={() => onDelete(build.id, build.name)}
                    className="inline-flex min-h-12 shrink-0 self-center items-center border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-2 font-pixel text-[0.5rem] text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]"
                  >
                    DELETE
                  </button>
                </div>
                <PartLine slots={stats.slots} />
              </div>
            );
          })}
          <div data-rigs-save className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-2 shadow-[3px_3px_0_0_#000]">
            <GoldButton disabled={!canSave} onClick={onSave} dataAttr="save-rig">
              SAVE THE PC ON THE BENCH
            </GoldButton>
            <p className="mt-2 break-words font-term text-base leading-5 text-[var(--game-muted)]">{saveHint}</p>
          </div>
        </div>
      )}
    </ScreenShell>
  );
}
