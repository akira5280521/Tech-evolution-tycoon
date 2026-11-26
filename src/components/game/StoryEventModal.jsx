import { describeEffects } from "@/lib/empire";
import { storyEventSpec } from "@/lib/storyEvents";

export default function StoryEventModal({ event, onChoose }) {
  const spec = event ? storyEventSpec(event.id) : null;
  if (!spec) return null;
  return (
    <div role="dialog" aria-label={spec.title} data-story={spec.id} className="fixed inset-0 z-40 flex items-center justify-center overscroll-contain bg-black/75 p-4">
      <div className="game-modal flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden border-4 border-[var(--game-violet-border)] bg-[var(--game-card)] p-4 shadow-[6px_6px_0_0_#000]">
        <div className="hint-sheet-body">
          <p className="font-pixel text-[0.55rem] text-[var(--game-violet)]">HISTORY EVENT</p>
          {spec.year ? <p data-story-year className="mt-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">{spec.year}</p> : null}
          <h2 data-story-title className="mt-2 font-pixel text-sm leading-5 text-[var(--game-fg)]">{spec.title}</h2>
          <p data-story-text className="mt-3 font-term text-lg leading-6">{spec.text}</p>
        </div>
        <div className="hint-sheet-actions mt-4">
          {spec.choices.map((choice, n) => (
            <button
              key={choice.key}
              type="button"
              data-story-choice={choice.key}
              onClick={() => onChoose(choice.key)}
              className={`${n === 0 ? "" : "mt-2"} min-h-11 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 text-left`}
            >
              <span className="block font-pixel text-[0.6rem] text-[var(--game-violet)]">{choice.label}</span>
              <span className="font-term text-lg">{describeEffects(choice.effects)}</span>
            </button>
          ))}
          <button type="button" data-story-defer onClick={() => onChoose("defer")} className="mt-2 min-h-11 w-full border-2 border-[var(--game-violet-border)] px-3 py-2 font-pixel text-[0.6rem] text-[var(--game-violet)]">
            DECIDE IN 5 MINUTES
          </button>
        </div>
      </div>
    </div>
  );
}
