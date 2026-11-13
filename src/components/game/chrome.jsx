import { Link } from "@tanstack/react-router";
import BottomTabs from "./BottomTabs";
import { TipCard } from "./HintSheet";

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

export default function ScreenShell({ title, subtitle, children, backTo = "/" }) {
  return (
    <div className="screen-shell game-clip-x min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <header className="safe-top safe-x sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-3">
        <div className="mx-auto flex max-w-4xl items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="title-glow whitespace-pre-line font-pixel text-sm leading-6 text-[var(--game-accent)]">{title}</h1>
            {subtitle && <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{subtitle}</p>}
          </div>
          <BackButton to={backTo} />
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
