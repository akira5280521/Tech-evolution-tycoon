import { HISTORY_CARDS, MUSEUM_SET_TOKENS, museumRows } from "@/lib/history";

// History cards, grouped by era. Locked cards say how to find them.
export default function MuseumSection({ state }) {
  const rows = museumRows(state);
  const found = (state.museum || []).length;
  return (
    <section data-museum className="space-y-3">
      <div>
        <h2 className="font-pixel text-[0.65rem] text-[var(--game-violet)]">· MUSEUM</h2>
        <p className="mt-1 font-pixel text-sm text-[var(--game-accent)]">{found} / {HISTORY_CARDS.length} HISTORY CARDS</p>
        <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
          Stories from computing history. Own 25 and 100 of an era to find its cards. Both cards of an era pay +{MUSEUM_SET_TOKENS} tokens. Company names here are parody. The dates and specs are real.
        </p>
      </div>
      {rows.map((row) => (
        <div key={row.era} className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-2">
          <h3 className="break-words font-pixel text-[0.55rem] leading-4">
            {row.revealed ? row.name : "???"} <span className="text-[var(--game-muted)]">· {row.revealed ? row.date : "c. ????"}</span>
          </h3>
          <div className="mt-2 space-y-2">
            {row.cards.map((card) => (
              <article
                key={card.id}
                className={`border-2 p-2 ${card.found ? "border-[var(--game-accent)]" : "border-[var(--game-border)] opacity-70"}`}
              >
                {card.found ? (
                  <>
                    <h4 className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">{card.title}</h4>
                    <p className="mt-1 break-words font-term text-lg leading-6">{card.text}</p>
                  </>
                ) : (
                  <p className="break-words font-term text-base leading-5 text-[var(--game-dim)]">
                    {row.revealed ? `LOCKED · Own ${card.need} ${row.name} at once.` : "LOCKED · Reach this era to find it."}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
