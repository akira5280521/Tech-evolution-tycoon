import { eraChips } from "@/lib/eraChips";

export function EraChipStrip({ state, onPick }) {
  const chips = eraChips(state);
  if (!chips.length) return null;
  return (
    <div data-era-chips className="flex gap-1 overflow-x-auto px-1 pb-1" role="navigation" aria-label="Eras">
      {chips.map((chip) => (
        <button
          key={chip.locked ? "locked" : chip.id}
          type="button"
          data-era-chip={chip.locked ? "locked" : chip.id}
          disabled={chip.locked}
          onClick={() => !chip.locked && onPick?.(chip)}
          className={`shrink-0 border-2 px-2 min-h-11 font-pixel text-[0.55rem] ${
            chip.locked
              ? "border-fg/30 bg-panel text-ink-faint"
              : "border-line bg-panel text-ink hover:bg-panel-2"
          }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
