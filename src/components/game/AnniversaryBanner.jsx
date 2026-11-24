import { ANNIVERSARY_MULT, ownedAnniversaries } from "@/lib/anniversaries";

// Anniversary week: a real launch day this week for an era the company owns.
// That row earns a little more until the week ends.
export default function AnniversaryBanner({ state }) {
  const list = ownedAnniversaries(state, Date.now());
  if (!list.length) return null;
  const day = (ms) => new Date(ms).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <section data-anniversary className="border-2 border-[var(--game-success)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <h2 className="font-pixel text-[0.6rem] text-[var(--game-success)]">ANNIVERSARY WEEK</h2>
      {list.map((a) => (
        <p key={a.era} data-anniversary-era={a.era} className="mt-1 break-words font-term text-lg leading-6 text-[var(--game-fg)]">
          {a.years} years ago, on {new Date(a.year, a.month - 1, a.day).toLocaleDateString("en-US", { month: "long", day: "numeric" })}, {a.year}, {a.text}. {a.name} earn ×{ANNIVERSARY_MULT} until {day(a.ends)}.
        </p>
      ))}
    </section>
  );
}
