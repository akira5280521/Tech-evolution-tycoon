import { createContext, useContext, useEffect, useRef, useState } from "react";
import { fullMoney } from "@/lib/fullNumber";
import { Link, useLocation } from "@tanstack/react-router";
import { Lightbulb } from "lucide-react";
import { hintPage, screenHint } from "@/lib/screenHint";
import { incomePerSecond, overclockOn } from "@/lib/empire";
import { money, reachedEraLabel } from "@/lib/gameConfig";
import { inGameMonth } from "@/lib/research";
import { monthName } from "@/lib/releaseMonths";
import { PREFS_EVENT } from "@/lib/gamePrefs";
import { HUB_LABEL, HUB_ROUTE } from "@/lib/hub";
import { progressLabel } from "@/lib/progress";
import BottomTabs from "./BottomTabs";
import { ItemHelp, TipCard } from "./HintSheet";
import NewsTicker from "./NewsTicker";
import { useGameState } from "./GameState";

export function BackButton({ to = "/" }) {
  return (
    <Link
      to={to}
      className="inline-flex min-h-12 shrink-0 items-center border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 font-pixel text-[0.55rem] text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]"
    >
      &lt; BACK
    </Link>
  );
}

// R&D points, short enough for the status bar.
export function rdPoints(n) {
  const v = Number(n) || 0;
  return v < 1000 ? v.toFixed(1) : money(v).replace(/^\$/, "");
}

// The one compact status bar at the top of every screen: cash, then one line
// with the era (left), income, R&D points and the calendar month (right).
// The parent sticks this block to the top so it stays visible while the page
// scrolls. The NEXT goal and starter goal live on the GAME screen only.
// The lightbulb (T3 item 64): tap for one line on what to do next on this
// screen. It glows softly when nothing is earning, but never opens by itself.
function HintBulb({ state }) {
  const location = useLocation();
  const page = hintPage(location.pathname, location.hash);
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [page]);
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => setOpen(false), 8000);
    return () => clearTimeout(t);
  }, [open]);
  const hint = screenHint(state, page);
  return (
    <>
      <button
        type="button"
        data-hint-bulb={hint.stuck ? "glow" : "idle"}
        aria-label="Hint for this screen"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`hit48 absolute right-9 top-0.5 flex h-6 w-7 items-center justify-center border-2 ${open ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"} ${hint.stuck && !open ? "hint-glow" : ""}`}
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
      </button>
      {open && hint.text && (
        <button
          type="button"
          data-hint-line
          onClick={() => setOpen(false)}
          className="absolute left-0 right-0 top-full z-40 mt-1 border-2 border-[var(--game-accent)] bg-[var(--game-card)] px-2 py-1 text-left font-term text-base leading-5 text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]"
        >
          {hint.text}
        </button>
      )}
    </>
  );
}

export function CashTicker({ state, cps }) {
  const era = reachedEraLabel(state);
  const when = inGameMonth(state);
  const oc = overclockOn(state, Date.now());
  return (
    <div data-cash-ticker className="space-y-1">
      <div data-cash-panel data-status-bar className="relative border-2 border-[var(--game-border-strong)] bg-[var(--game-bg-deep)] px-2 py-0.5 shadow-[3px_3px_0_0_#000]">
        <ItemHelp kind="money" state={state} name="the money panel" className="absolute right-0 top-0 my-0" />
        <HintBulb state={state} />
        <div className="flex items-baseline gap-2 pr-16">
          <span data-cash-label className="shrink-0 font-pixel text-[8px] leading-[10px] text-[var(--game-muted)]">CASH</span>
          <span data-cash data-exact={fullMoney(state.cash)} className="shrink-0 whitespace-nowrap font-term text-2xl leading-none text-[var(--game-success)]">{money(state.cash)}</span>
          {/* Fixed slot: an Overclock never changes the bar's height. */}
          <span data-overclock className="ml-auto min-w-0 flex-1 truncate whitespace-nowrap text-right font-pixel text-[0.45rem] leading-4 text-[var(--game-accent)]">
            {oc ? `OVERCLOCKED x1.5 · ${Math.ceil((state.lab.overclockUntil - Date.now()) / 60000)} MIN LEFT` : ""}
          </span>
        </div>
        <div data-status-line className="flex h-[1.15em] items-baseline gap-2 pr-8 whitespace-nowrap font-term text-[clamp(12px,3.8vw,16px)] leading-[1.15] tabular-nums">
          <span data-era-progress aria-label={era ? `Current era: ${era}` : "Current era"} className="shrink-0 text-[var(--game-muted)]">{era}</span>
          <span data-cash-rate data-exact={`${fullMoney(cps)}/s`} className="min-w-0 flex-1 truncate text-[var(--game-success)]">{money(cps)}/s income</span>
          <span data-rd-points aria-label={`R&D points: ${rdPoints(state.data)}`} className="shrink-0 text-[var(--game-accent)]">R&amp;D {rdPoints(state.data)}</span>
          <span data-calendar-month data-month={when.month} className="shrink-0 text-[var(--game-fg)]">{monthName(when.month)} {when.year}</span>
        </div>
      </div>
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

// A page shown inside another menu's sub-tab (BOARD inside BOOST, RUNS inside
// PROGRESS, the garage inside the bench) renders only its content: the outer
// menu already has the title, BACK and sub-tabs (T3 item 14).
export const EmbedCtx = createContext(false);
export function Embedded({ children }) {
  return <EmbedCtx.Provider value={true}>{children}</EmbedCtx.Provider>;
}

// Where you are, from HQ (T3 item 32): "HQ > PC BUILD BENCH". HQ is a link
// back to the hub from any menu.
function Breadcrumb({ title, via }) {
  const name = String(title || "").replace(/\s+/g, " ").trim();
  return (
    <nav data-breadcrumb aria-label="Where you are" className="mb-1 flex min-w-0 flex-wrap items-center gap-1 font-pixel text-[0.5rem] leading-5 text-[var(--game-muted)]">
      <Link to={HUB_ROUTE} data-back-hq className="hit48 relative inline-block underline decoration-dotted hover:text-[var(--game-accent)]">{HUB_LABEL}</Link>
      {via && <><span aria-hidden="true">&gt;</span><span>{via}</span></>}
      <span aria-hidden="true">&gt;</span>
      <span className="min-w-0 break-words text-[var(--game-fg)]">{name}</span>
    </nav>
  );
}

export default function ScreenShell({ title, subtitle, children, backTo = "/", titleIcon, crumbVia } = {}) {
  const embedded = useContext(EmbedCtx);
  const { state } = useGameState();
  if (embedded) return <div data-embedded className="space-y-3">{children}</div>;
  const cps = incomePerSecond(state, Date.now());
  return (
    <div className="screen-shell game-clip-x min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <StickyHud state={state} cps={cps} />
      {/* The page title scrolls away; only money and the ticker stay. */}
      <header className="safe-x border-b-2 border-[var(--game-border)] bg-[var(--game-bg)] px-3 pb-3 pt-2">
        <div className="mx-auto max-w-4xl">
          {title !== HUB_LABEL && <Breadcrumb title={title} via={crumbVia} />}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              {titleIcon && (
                <img
                  src={titleIcon}
                  alt=""
                  width={32}
                  height={32}
                  data-title-icon
                  className="pixel-art h-8 w-8 shrink-0"
                />
              )}
              <div className="min-w-0">
                <h1 className="title-glow whitespace-pre-line font-pixel text-sm leading-6 text-[var(--game-accent)]">{title}</h1>
                {subtitle && <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{subtitle}</p>}
              </div>
            </div>
            <BackButton to={backTo} />
          </div>
        </div>
      </header>
      <main className="safe-x mx-auto max-w-4xl space-y-3 px-3 py-4">{children}</main>
      <BottomTabs />
      <TipCard />
    </div>
  );
}

// Sub-tabs under a menu's title (T3 item 14: title + BACK, sub-tabs, content).
// tabs: [{ id, label, dot?, locked? }]. A locked tab is greyed with "Coming soon".
export function SubTabs({ tabs, active, onPick, name = "menu" }) {
  return (
    <div data-sub-tabs={name} role="tablist" className={`grid gap-2 ${tabs.length >= 4 ? "grid-cols-4" : tabs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={active === tab.id}
          aria-disabled={tab.locked ? "true" : undefined}
          data-sub-tab={tab.id}
          onClick={() => !tab.locked && onPick(tab.id)}
          className={`relative min-h-12 min-w-0 border-2 px-1 py-1 text-center font-pixel text-[0.5rem] leading-4 shadow-[3px_3px_0_0_#000] ${
            tab.locked
              ? "cursor-not-allowed border-[var(--game-border)] text-[var(--game-dim)]"
              : active === tab.id
              ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-black"
              : "border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-muted)]"
          }`}
        >
          {tab.label}
          {tab.locked && <span className="block font-term text-xs leading-4">Coming soon</span>}
          {tab.dot && <span data-sub-tab-dot aria-label="ready" className="absolute -right-1 -top-1 h-2.5 w-2.5 border border-black bg-[var(--game-danger)]" />}
        </button>
      ))}
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
      className={`min-h-12 w-full border-2 px-3 py-2 text-center shadow-[3px_3px_0_0_#000] ${
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
