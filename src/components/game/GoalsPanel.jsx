import { useEffect, useState } from "react";
import { BUSINESSES, pluralName } from "@/lib/gameConfig";
import { COMPANY_NAME_MAX, STARTER_GOALS, contractOffer, contractSpec, starterGoalsDone } from "@/lib/goals";
import { tutorialActive } from "@/lib/tutorial";

const ASK_KEY = "tet-name-later";

function readLater() {
  try {
    return window.sessionStorage.getItem(ASK_KEY) === "1";
  } catch {
    return false;
  }
}

function clock(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

const rowName = (id) => BUSINESSES.find((cfg) => cfg.id === id)?.name || id;
const rowPlural = (id) => pluralName(rowName(id));
const count = (n) => Math.floor(n).toLocaleString("en-US");

// The name field, shared by the first-run card and More > Settings.
export function CompanyNameForm({ current = "", onSave, button = "SAVE", autoFocus = false }) {
  const [value, setValue] = useState(current);
  const [error, setError] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (!onSave(value)) setError("Use letters or numbers.");
    else setError("");
  };
  return (
    <form onSubmit={submit} className="mt-2 flex flex-wrap items-stretch gap-2">
      <input
        data-company-input
        value={value}
        maxLength={COMPANY_NAME_MAX}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Company name"
        aria-label="Company name"
        className="min-h-11 min-w-0 flex-1 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] px-2 font-term text-xl text-[var(--game-fg)]"
      />
      <button
        type="submit"
        data-company-save
        className="min-h-11 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-black shadow-[2px_2px_0_0_#000]"
      >
        {button}
      </button>
      {error && <p className="w-full font-term text-base text-[var(--game-danger)]">{error}</p>}
    </form>
  );
}

function NameCard({ onSave }) {
  const [later, setLater] = useState(readLater);
  if (later) return null;
  const skip = () => {
    try {
      window.sessionStorage.setItem(ASK_KEY, "1");
    } catch {
      /* private mode: just hide it for now */
    }
    setLater(true);
  };
  return (
    <section data-name-card className="border-2 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">NAME YOUR COMPANY</h2>
      <p className="mt-1 font-term text-lg leading-6">It shows up in the news ticker as you grow. You can change it later in More &gt; Settings.</p>
      <CompanyNameForm onSave={onSave} />
      <button type="button" data-name-later onClick={skip} className="mt-1 min-h-9 font-term text-base text-[var(--game-muted)] underline">
        Later
      </button>
    </section>
  );
}

function StarterGoals({ state }) {
  const done = starterGoalsDone(state);
  if (STARTER_GOALS.every((g) => done.includes(g.id))) return null;
  const count = STARTER_GOALS.filter((g) => done.includes(g.id)).length;
  return (
    <section data-starter-goals className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">STARTER GOALS</h2>
        <span className="font-pixel text-[0.5rem] text-[var(--game-muted)]">{count}/{STARTER_GOALS.length}</span>
      </div>
      <ul className="mt-2 space-y-1">
        {STARTER_GOALS.map((g) => {
          const ok = done.includes(g.id);
          return (
            <li key={g.id} data-goal={g.id} data-goal-done={ok ? "yes" : "no"} className={`flex items-center gap-2 font-term text-lg leading-6 ${ok ? "text-[var(--game-dim)] line-through" : ""}`}>
              <span aria-hidden="true" className={`inline-flex h-5 w-5 shrink-0 items-center justify-center border-2 text-sm leading-none ${ok ? "border-[var(--game-success)] text-[var(--game-success)]" : "border-[var(--game-border-strong)]"}`}>
                {ok ? "✓" : ""}
              </span>
              <span className="min-w-0 flex-1">{g.label}</span>
              <span className="shrink-0 font-term text-base text-[var(--game-accent)] no-underline">+{g.tokens} token{g.tokens === 1 ? "" : "s"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ContractCard({ state, now, onTake }) {
  const active = state.contract;
  if (active) {
    const spec = contractSpec(active.id);
    if (!spec) return null;
    const made = Math.min(spec.units, Math.floor(active.made || 0));
    const pct = Math.min(100, (made / spec.units) * 100);
    return (
      <section data-contract={spec.id} data-contract-state="active" className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <h2 className="font-pixel text-[0.6rem] text-[var(--game-violet)]">CONTRACT · {spec.client.toUpperCase()}</h2>
          <span className="font-pixel text-[0.5rem] text-[var(--game-muted)]">{spec.year}</span>
        </div>
        <p className="mt-1 font-term text-lg leading-6">
          Make {count(spec.units)} {spec.unit} with your {rowPlural(spec.row)}. <span className="text-[var(--game-accent)]">{clock(active.endsAt - now)} left</span>
        </p>
        <div className="mt-2 h-3 border-2 border-[var(--game-violet-border)] bg-[var(--game-bg)]">
          <div className="h-full bg-[var(--game-violet)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">
          {count(made)} / {count(spec.units)} · Reward: +{spec.tokens} era tokens, +{spec.data} data
        </p>
      </section>
    );
  }
  const spec = contractOffer(state, now);
  if (!spec) return null;
  return (
    <section data-contract={spec.id} data-contract-state="offer" className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000]">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
        <h2 className="font-pixel text-[0.6rem] text-[var(--game-violet)]">NEW CONTRACT</h2>
        <span className="font-pixel text-[0.5rem] text-[var(--game-muted)]">{spec.year}</span>
      </div>
      <p className="mt-1 font-term text-lg leading-6">{spec.text}</p>
      <p className="mt-1 font-term text-lg leading-6 text-[var(--game-accent)]">
        Make {count(spec.units)} {spec.unit} with your {rowPlural(spec.row)} in {spec.minutes} minutes.
      </p>
      <p className="font-term text-base leading-5 text-[var(--game-muted)]">
        Reward: +{spec.tokens} era tokens, +{spec.data} data. Each batch makes one for every {rowName(spec.row)} you own. Missing it costs nothing.
      </p>
      <div className="mt-2 flex gap-2">
        <button type="button" data-contract-accept onClick={() => onTake(true)} className="min-h-11 flex-1 border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-black shadow-[2px_2px_0_0_#000]">
          ACCEPT
        </button>
        <button type="button" data-contract-later onClick={() => onTake(false)} className="min-h-11 border-2 border-[var(--game-border-strong)] px-3 font-pixel text-[0.55rem] text-[var(--game-muted)] shadow-[2px_2px_0_0_#000]">
          LATER
        </button>
      </div>
    </section>
  );
}

// Company name, starter goals and contracts, at the top of the Game screen.
// Stays out of the way while the first-session tutorial is running.
export default function GoalsPanel({ state, onName, onTakeContract }) {
  const [now, setNow] = useState(() => Date.now());
  const ticking = !!state.contract;
  useEffect(() => {
    if (!ticking) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [ticking]);
  if (tutorialActive(state)) return null;
  const t = ticking ? now : Date.now();
  const askName = !state.companyName && ((state.lifetime || 0) > 0 || (state.careerEarnings || 0) > 0);
  return (
    <>
      {askName && <NameCard onSave={onName} />}
      <ContractCard state={state} now={t} onTake={onTakeContract} />
      <StarterGoals state={state} />
    </>
  );
}
