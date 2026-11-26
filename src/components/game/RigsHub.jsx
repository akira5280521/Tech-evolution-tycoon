import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { FlaskConical, Gamepad2, Trophy, Zap } from "lucide-react";
import { HUB_ITEMS, HUB_LABEL } from "@/lib/hub";
import { companyName } from "@/lib/company";
import { investorsFor } from "@/lib/gameConfig";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";
import { hqCardHasDot, readyDots } from "@/lib/ready";
import { ReadyDot } from "./ReadyDot";

function GoButton({ id, disabled }) {
  const cls = `inline-flex min-h-11 min-w-14 shrink-0 self-center items-center justify-center border-2 px-3 font-pixel text-[0.55rem] shadow-[3px_3px_0_0_#000] ${
    disabled
      ? "cursor-not-allowed border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)]"
      : "border-[var(--game-accent)] bg-[var(--game-accent)] text-black"
  }`;
  return (
    <span aria-disabled={disabled ? "true" : undefined} data-action={`go-${id}`} className={cls}>
      GO &gt;
    </span>
  );
}

const tileBase = "relative flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 border-2 p-2 text-center shadow-[3px_3px_0_0_#000]";

// One room on a floor card: a small tappable tile. Locked rooms are greyed
// with "Coming soon" and can't be tapped.
function RoomTile({ id, label, to, hash, locked, dot, need }) {
  if (locked) {
    return (
      <div aria-disabled="true" data-hub-room={id} data-locked="" className={`${tileBase} border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)] opacity-60`}>
        <span className="font-pixel text-[0.5rem] leading-4">??? {label}</span>
        <span className="font-term text-sm leading-4">{need || "Coming soon"}</span>
      </div>
    );
  }
  return (
    <Link to={to} hash={hash || undefined} data-hub-room={id} className={`${tileBase} border-[var(--game-border-strong)] bg-[var(--game-bg)] text-[var(--game-fg)] hover:border-[var(--game-accent)]`}>
      <ReadyDot show={!!dot} testId={`room-${id}`} />
      <span className="font-pixel text-[0.5rem] leading-4">{label}</span>
    </Link>
  );
}

// A department: a card labelled with its floor, a heading that opens the
// department, and its rooms as tiles.
function Floor({ id, floor, title, icon: Icon, to, dot, children, headAttr }) {
  return (
    <section data-hq-floor={id} className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-2 shadow-[4px_4px_0_0_#000]">
      <Link to={to} {...headAttr} className="relative flex min-h-11 items-center gap-2 px-1">
        <span data-floor-label className="shrink-0 border-2 border-[var(--game-violet-border)] px-1 font-pixel text-[0.5rem] leading-5 text-[var(--game-violet)]">{floor}</span>
        <Icon className="h-5 w-5 shrink-0 text-[var(--game-accent)]" aria-hidden="true" />
        <span className="min-w-0 flex-1 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{title} &gt;</span>
        <ReadyDot show={!!dot} testId={`floor-${id}`} />
      </Link>
      <div className="mt-2 grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">{children}</div>
    </section>
  );
}

// HQ (T3 item 32): the company building, one card per department, top floor
// first. Each card lists its rooms; a red dot means something is ready there,
// a grey tile is a room not open yet.
export default function RigsHub() {
  const { state, noteTutorialPage } = useGameState();
  useEffect(() => { noteTutorialPage?.("hq"); }, [noteTutorialPage]);
  const dots = readyDots(state);
  const research = dots.research || [];
  const prestigeOpen = (state.investors || 0) > 0 || !!state.prestiged || (state.lifetime || 0) >= 1e8 || investorsFor(state.lifetime) > 0;
  const plantDot = HUB_ITEMS.some((item) => item.open(state) && hqCardHasDot(dots, item.id));
  return (
    <ScreenShell title={HUB_LABEL} subtitle={`${companyName(state)}: your company, floor by floor.`}>
      <div data-hq-floors className="space-y-3">
        <Floor id="boost" floor="4F" title="BOARDROOM · BOOST" icon={Zap} to="/boost" dot={(dots.boost || []).length > 0}>
          <RoomTile id="boost-now" label="NOW" to="/boost" hash="now" />
          <RoomTile id="boost-upgrades" label="UPGRADES" to="/boost" hash="upgrades" dot={(dots.boost || []).length > 0} />
          <RoomTile id="boost-bonuses" label="BONUSES" to="/boost" hash="bonuses" />
          <RoomTile id="boost-prestige" label="PRESTIGE" to="/boost" hash="prestige" locked={!prestigeOpen} need="Later" />
        </Floor>
        <Floor id="rd" floor="3F" title="R&D LAB" icon={FlaskConical} to="/research" headAttr={{ "data-hub-rd": "" }} dot={research.length > 0 || (dots.tech || []).length > 0}>
          <RoomTile id="rd-queue" label="QUEUE" to="/research" hash="" />
          <RoomTile id="rd-tech" label="TECH" to="/research" hash="tech" dot={(dots.tech || []).length > 0} />
          <RoomTile id="rd-specialty" label="SPECIALTY" to="/research" hash="specialty" dot={research.some((k) => k.startsWith("specialty:"))} />
          <RoomTile id="rd-lab" label="LAB" to="/research" hash="lab" dot={research.some((k) => k.startsWith("lab:"))} />
        </Floor>
        <section data-hq-floor="plants" className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-2 shadow-[4px_4px_0_0_#000]">
          <div className="relative flex min-h-11 items-center gap-2 px-1">
            <span data-floor-label className="shrink-0 border-2 border-[var(--game-violet-border)] px-1 font-pixel text-[0.5rem] leading-5 text-[var(--game-violet)]">2F</span>
            <span className="min-w-0 flex-1 font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">HARDWARE · PLANTS</span>
            <ReadyDot show={plantDot} testId="floor-plants" />
          </div>
          <div data-hub-menu className="mt-2 grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
            {HUB_ITEMS.map((item) => <PlantCard key={item.id} item={item} state={state} dots={dots} />)}
          </div>
        </section>
        <Floor id="progress" floor="1F" title="ARCHIVES · PROGRESS" icon={Trophy} to="/progress">
          <RoomTile id="progress-runs" label="RUNS" to="/progress" hash="runs" />
          <RoomTile id="progress-badges" label="BADGES" to="/progress" hash="badges" />
          <RoomTile id="progress-museum" label="MUSEUM" to="/progress" hash="museum" />
          <RoomTile id="progress-stats" label="STATS" to="/progress" hash="stats" />
        </Floor>
        <Floor id="game" floor="G" title="SHOP FLOOR · GAME" icon={Gamepad2} to="/">
          <RoomTile id="game-businesses" label="BUSINESSES" to="/" />
        </Floor>
      </div>
    </ScreenShell>
  );
}

function PlantCard({ item, state, dots }) {
  const open = item.open(state);
  const icon = item.icon ? (
    <img src={item.icon} alt="" width={40} height={40} className="pixel-art h-10 w-10 shrink-0 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] object-contain" />
  ) : null;
  if (!open) {
    return (
      <div
        aria-disabled="true"
        aria-label={`${item.label}, locked`}
        data-hub-item={item.id}
        data-locked=""
        className="flex min-h-16 gap-3 border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-2 text-[var(--game-dim)] opacity-60"
      >
        {icon}
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[0.55rem] leading-5">??? <span className="text-[var(--game-dim)]">{item.label}</span></p>
          <p data-hub-need className="break-words font-pixel text-[0.5rem] leading-4">{item.need?.(state) || "Unlocks later in the timeline."}</p>
          <p className="mt-1 font-pixel text-[0.5rem] leading-4">COMING SOON</p>
        </div>
        <GoButton id={item.id} disabled />
      </div>
    );
  }
  return (
    <Link
      to={item.to}
      params={item.params}
      data-hub-item={item.id}
      className="relative flex min-h-16 gap-3 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] p-2 hover:border-[var(--game-accent)]"
    >
      <ReadyDot show={hqCardHasDot(dots, item.id)} testId={item.id} />
      {icon}
      <div className="min-w-0 flex-1">
        <p className="font-pixel text-[0.55rem] leading-5 text-[var(--game-accent)]">{item.label} &gt;</p>
        <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">{item.text}</p>
      </div>
      <GoButton id={item.id} />
    </Link>
  );
}
