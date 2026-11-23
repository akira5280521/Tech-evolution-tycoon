import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { incomePerSecond, overclockOn } from "@/lib/empire";
import { money } from "@/lib/gameConfig";
import { PREFS_EVENT } from "@/lib/gamePrefs";
import { progressLabel } from "@/lib/progress";
import BottomTabs from "./BottomTabs";
import { TechHqLinks } from "./TopBar";
import { ItemHelp, TipCard } from "./HintSheet";
import NewsTicker from "./NewsTicker";
import StarterGoal from "./StarterGoal";
import { useGameState } from "./GameState";

export function BackButton({ to = "/" }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-11 shrink-0 items-center border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 font-pixel text-[0.55rem] text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]"
    >
      &lt; BACK
    </Link>
  );
}

// Cash and the news ticker, shared by the game screen and every other tab.
// The parent sticks this block to the top so it stays visible while the page scrolls.
export function CashTicker({ state, cps }) {
  return (
    <div data-cash-ticker className="space-y-1.5">
      <div data-cash-panel className="relative border-2 border-[var(--game-border-strong)] bg-[var(--game-bg-deep)] px-2 py-0.5 text-center shadow-[3px_3px_0_0_#000]">
        <ItemHelp kind="money" state={state} name="the money panel" className="absolute right-0 top-0 my-0" />
        <div data-cash-label className="font-pixel text-[8px] leading-[10px] text-[var(--game-muted)]">CASH</div>
        <div data-cash className="break-all font-term text-3xl leading-none text-[var(--game-success)]">{money(state.cash)}</div>
        {/* One fixed line: cash and income only. What this run earned shows on
            the locked next-era row and in MORE > STATS. */}
        <div data-cash-rate className="h-[1.15em] truncate whitespace-nowrap font-term text-[clamp(12px,4.2vw,16px)] leading-[1.15] tabular-nums text-[var(--game-success)]">
          {money(cps)}/s income
        </div>
        {overclockOn(state, Date.now()) && (
          <div data-overclock className="font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
            OVERCLOCKED x1.5 · {Math.ceil((state.lab.overclockUntil - Date.now()) / 60000)} MIN LEFT
          </div>
        )}
      </div>
      <StarterGoal state={state} />
      <NewsTicker state={state} />
    </div>
  );
}

// The most of the screen (above the tab bar) the sticky money bar may take.
// Past this, with big text or a short landscape screen, it scrolls with the
// page instead so it never hides what the player is reading.
const HUD_MAX_SHARE = 0.35;

// Money and the news ticker, stuck to the top of the screen while it fits.
// Publishes its height as --hud-h (0 when it isn't sticky) for anything that
// sticks below it.
export function StickyHud({ state, cps }) {
  const ref = useRef(null);
  const [fits, setFits] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return undefined;
    const root = document.documentElement;
    const update = () => {
      const h = Math.ceil(el.getBoundingClientRect().height);
      const bar = parseFloat(getComputedStyle(root).getPropertyValue("--tabbar-h")) || 0;
      const ok = h <= (window.innerHeight - bar) * HUD_MAX_SHARE;
      setFits(ok);
      root.style.setProperty("--hud-h", `${ok ? h : 0}px`);
    };
    update();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(update) : null;
    ro?.observe(el);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.addEventListener(PREFS_EVENT, update);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.removeEventListener(PREFS_EVENT, update);
      root.style.setProperty("--hud-h", "0px");
    };
  }, []);
  return (
    <div ref={ref} data-sticky-hud data-hud-fits={fits ? "yes" : "no"} className="hud-sticky safe-top safe-x px-3 pb-1">
      <div className="mx-auto max-w-4xl">
        <CashTicker state={state} cps={cps} />
      </div>
    </div>
  );
}

export default function ScreenShell({ title, subtitle, children, backTo = "/" }) {
  const { state } = useGameState();
  const cps = incomePerSecond(state, Date.now());
  return (
    <div className="screen-shell game-clip-x min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <StickyHud state={state} cps={cps} />
      {/* The page title scrolls away; only money and the ticker stay. */}
      <header className="safe-x border-b-2 border-[var(--game-border)] bg-[var(--game-bg)] px-3 pb-3 pt-2">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="title-glow whitespace-pre-line font-pixel text-sm leading-6 text-[var(--game-accent)]">{title}</h1>
              {subtitle && <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{subtitle}</p>}
            </div>
            <BackButton to={backTo} />
          </div>
          <div className="mt-2">
            <TechHqLinks state={state} />
          </div>
        </div>
      </header>
      <main className="safe-x mx-auto max-w-4xl space-y-3 px-3 py-4">{children}</main>
      <BottomTabs />
      <TipCard />
    </div>
  );
}

export function Panel({ children, className = "" }) {
  return (
    <section className={`border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[4px_4px_0_0_#000] ${className}`}>
      {children}
    </section>
  );
}

export function GoldButton({ children, disabled, onClick, dataAttr }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      data-action={dataAttr}
      className={`w-full border-2 px-3 py-2 text-center shadow-[3px_3px_0_0_#000] ${
        disabled
          ? "cursor-not-allowed border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)]"
          : "border-[var(--game-accent)] bg-[var(--game-accent)] text-black"
      }`}
    >
      {children}
    </button>
  );
}

// A pixel-style progress bar for a timed job: chunky blocks that fill as it
// runs, with "42% · 1h 12m left" under it. `progress` is from lib/progress.
export function ProgressBar({ progress, label, dataAttr = "" }) {
  if (!progress) return null;
  const text = progressLabel(progress);
  return (
    <div data-progress-bar={dataAttr} data-pct={progress.pct} className="mt-2">
      <div
        role="progressbar"
        aria-label={label || "Progress"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.pct}
        className="h-4 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-px shadow-[2px_2px_0_0_#000]"
      >
        <div
          className="h-full bg-[var(--game-accent)] transition-[width] duration-700 ease-linear"
          style={{
            width: `${progress.pct}%`,
            backgroundImage: "repeating-linear-gradient(90deg, transparent 0 6px, rgba(0,0,0,0.35) 6px 8px)",
          }}
        />
      </div>
      <p data-progress-text className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">{text}</p>
    </div>
  );
}
