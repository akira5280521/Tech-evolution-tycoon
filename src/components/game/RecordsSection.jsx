import { COMPUTE_RECORDS, COMPUTE_RECORD_TOKENS, EXAFLOP_NOTE, MOORE_START, computePower, flopsLabel, mooreLine, moorePoints } from "@/lib/compute";
import { exhibitStatus } from "@/lib/museum";

// The museum's RECORDS wing: your compute power against the real record
// holders, and the PC chips against Moore's Law.
export default function RecordsSection({ state }) {
  const have = computePower(state);
  const passed = new Set(state.computeRecords || []);
  const next = COMPUTE_RECORDS.find((r) => !passed.has(r.id) && have < r.flops);
  return (
    <section data-records className="space-y-3">
      <div className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-2">
        <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">COMPUTE POWER</h2>
        <p data-compute={Math.round(have)} className="mt-1 font-pixel text-sm text-[var(--game-fg)]">{flopsLabel(have)}</p>
        <p className="mt-1 font-term text-lg leading-6 text-[var(--game-muted)]">
          Every supercomputer cabinet and compute card in your plants, at its double-precision peak, the measure the supercomputer lists use. Pass a record for +{COMPUTE_RECORD_TOKENS} era tokens. Records stay passed when you prestige.
        </p>
        {next && (
          <p data-compute-next={next.id} className="mt-1 font-term text-lg leading-6 text-[var(--game-fg)]">
            Next: {next.name}, {flopsLabel(next.flops)} ({next.year})
          </p>
        )}
      </div>
      {COMPUTE_RECORDS.map((r) => {
        const done = passed.has(r.id);
        return (
          <article key={r.id} data-record={r.id} data-passed={done ? "1" : "0"} className={`border-2 p-2 ${done ? "border-[var(--game-accent)] bg-[var(--game-card)]" : "border-[var(--game-border)] opacity-80"}`}>
            <h3 className={`break-words font-pixel text-[0.5rem] leading-4 ${done ? "text-[var(--game-accent)]" : "text-[var(--game-muted)]"}`}>
              {done ? "✓ " : ""}
              {r.name.toUpperCase()} · {r.year} · {flopsLabel(r.flops)}
            </h3>
            <p className="mt-1 break-words font-term text-lg leading-6 text-[var(--game-fg)]">{r.text}</p>
          </article>
        );
      })}
      <p className="break-words font-term text-lg leading-6 text-[var(--game-muted)]">{EXAFLOP_NOTE}</p>
      <MooreChart state={state} />
    </section>
  );
}

// Transistors per chip on a log scale, 1970 to 2020, with the doubling line.
const X0 = 1970;
const X1 = 2020;
const Y0 = 3; // 10^3
const Y1 = 10; // 10^10
const W = 320;
const H = 220;
const PAD = { l: 34, r: 8, t: 10, b: 24 };
const sx = (year) => PAD.l + ((year - X0) / (X1 - X0)) * (W - PAD.l - PAD.r);
const sy = (n) => PAD.t + (1 - (Math.log10(n) - Y0) / (Y1 - Y0)) * (H - PAD.t - PAD.b);

function MooreChart({ state }) {
  const points = moorePoints(state, exhibitStatus);
  const found = points.filter((p) => p.found).length;
  const lineEnd = Math.min(X1, MOORE_START.year + 2 * (Y1 - Math.log10(MOORE_START.transistors)) * Math.log2(10));
  const ticksY = [3, 5, 7, 9];
  const ticksX = [1970, 1980, 1990, 2000, 2010, 2020];
  const label = (e) => (e >= 9 ? `${10 ** (e - 9)}B` : e >= 6 ? `${10 ** (e - 6)}M` : `${10 ** (e - 3)}K`);
  return (
    <div data-moore className="border-2 border-[var(--game-border)] bg-[var(--game-card)] p-2">
      <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">MOORE'S LAW</h2>
      <p className="mt-1 font-term text-lg leading-6 text-[var(--game-muted)]">
        In 1965 Gordon Moore saw the number of parts on a chip doubling on a steady schedule; by 1975 he put it at every two years. The line starts at the {MOORE_START.name} (1971, about 2,250 transistors) and doubles every two years. Each square is a real chip from the PC parts; find them in the museum to fill them in.
      </p>
      <p data-moore-found={found} className="mt-1 font-pixel text-[0.5rem] text-[var(--game-fg)]">
        {found} / {points.length} CHIPS FOUND
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`Transistors per chip by year, ${found} of ${points.length} chips found, against a line doubling every two years`}>
        {ticksY.map((e) => (
          <g key={e}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(10 ** e)} y2={sy(10 ** e)} stroke="var(--game-border)" strokeWidth="1" />
            <text x={PAD.l - 4} y={sy(10 ** e) + 3} textAnchor="end" fontSize="9" fill="var(--game-muted)" fontFamily="var(--font-term, monospace)">
              {label(e)}
            </text>
          </g>
        ))}
        {ticksX.map((y) => (
          <text key={y} x={sx(y)} y={H - 6} textAnchor={y === X1 ? "end" : "middle"} fontSize="9" fill="var(--game-muted)" fontFamily="var(--font-term, monospace)">
            {y}
          </text>
        ))}
        <line
          data-moore-line
          x1={sx(MOORE_START.year)}
          y1={sy(MOORE_START.transistors)}
          x2={sx(lineEnd)}
          y2={sy(mooreLine(lineEnd))}
          stroke="var(--game-violet)"
          strokeWidth="2"
          strokeDasharray="4 3"
        />
        <rect x={sx(MOORE_START.year) - 3} y={sy(MOORE_START.transistors) - 3} width="6" height="6" fill="var(--game-violet)" />
        {points.map((p) => (
          <rect
            key={p.id}
            data-moore-point={p.id}
            data-found={p.found ? "1" : "0"}
            x={sx(p.year) - 3}
            y={sy(p.transistors) - 3}
            width="6"
            height="6"
            fill={p.found ? "var(--game-accent)" : "none"}
            stroke={p.found ? "var(--game-accent)" : "var(--game-dim)"}
            strokeWidth="1.5"
          >
            <title>{p.found ? `${p.name}, ${p.year}: ${p.transistors.toLocaleString("en-US")} transistors` : `A chip from ${p.year}`}</title>
          </rect>
        ))}
      </svg>
      <ul className="mt-2 space-y-1">
        {points
          .filter((p) => p.found)
          .map((p) => (
            <li key={p.id} className="break-words font-term text-base leading-5 text-[var(--game-fg)]">
              {p.year} · {p.name}: {p.transistors.toLocaleString("en-US")} transistors
            </li>
          ))}
      </ul>
    </div>
  );
}
