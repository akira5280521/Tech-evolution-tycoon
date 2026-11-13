import { BUSINESSES, money } from "@/lib/gameConfig";

function durationLabel(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h >= 1) return `${h}h ${m}m`;
  if (m >= 1) return `${m} min`;
  return "under a minute";
}

// data: undefined = still loading, null = no save found, object = parsed save.
export default function AnalyticsPanel({ data }) {
  if (data === undefined) {
    return (
      <p className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-4 font-term text-lg text-[var(--game-muted)]">
        Reading your save…
      </p>
    );
  }
  if (data === null) {
    return (
      <p className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-4 font-term text-lg leading-6 text-[var(--game-muted)]">
        No save found yet. Start the game and your empire analytics will appear here.
      </p>
    );
  }

  const times = (Array.isArray(data.biz) ? data.biz : []).map((b) => Math.max(0, Number(b.activeMs) || 0));
  let topIndex = -1;
  times.forEach((ms, i) => {
    if (ms > 0 && (topIndex < 0 || ms > times[topIndex])) topIndex = i;
  });
  const top = topIndex >= 0 ? BUSINESSES[topIndex] : null;

  const stats = [
    { label: "Earned this run", value: money(Number(data.lifetime) || 0), valueClass: "text-[var(--game-success)]" },
    { label: "Investors", value: String(Number(data.investors) || 0), valueClass: "text-[var(--game-accent)]" },
    {
      label: "Most-played tech era",
      value: top ? `${top.name} (${top.era}) · ${durationLabel(times[topIndex])}` : "None recorded yet",
      valueClass: "text-[var(--game-fg)]",
    },
  ];

  return (
    <section>
      <h2 className="title-glow font-pixel text-sm text-[var(--game-accent)]">EMPIRE ANALYTICS</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-4 shadow-[4px_4px_0_0_#000]">
            <p className="font-pixel text-sm uppercase leading-5 text-[var(--game-muted)]">{s.label}</p>
            <p className={`mt-2 font-term text-2xl leading-7 ${s.valueClass}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 font-term text-base leading-5 text-[var(--game-dim)]">
        Era time counts every second a business produced profit, including runs while the browser was closed.
      </p>
    </section>
  );
}