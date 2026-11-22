import { memo, useEffect, useRef } from "react";
import {
  BUSINESSES,
  COMMISSION_MS,
  MILESTONES,
  buyCount,
  costOf,
  formatFlow,
  managerNeed,
  milestoneMult,
  money,
  nextMilestone,
} from "@/lib/gameConfig";
import { effectiveCycleMs, empireFactors, makesOf, managerPrice, supplyCap, supplyFactor, supplyFull, upgradesOf } from "@/lib/empire";
import { amount } from "./StorageSheet";
import { generationAt, generationPayMult } from "@/lib/generations";
import IconTile from "./IconTile";
import ProgressTrack from "./ProgressTrack";
import { ItemHelp } from "./HintSheet";

// Where long era names may break on a narrow card (a hyphen shows at the break).
const SOFT = "\u00AD";
const BREAKS = [
  ["Microprocessors", `Micro${SOFT}processors`],
  ["Superclusters", `Super${SOFT}clusters`],
  ["Supercomputers", `Super${SOFT}computers`],
  ["Workstations", `Work${SOFT}stations`],
  ["Multimedia", `Multi${SOFT}media`],
  ["Battlestations", `Battle${SOFT}stations`],
  ["Transistors", `Tran${SOFT}sistors`],
  ["Integrated", `Inte${SOFT}grated`],
  ["Computers", `Com${SOFT}puters`],
  ["Datacenters", `Data${SOFT}centers`],
  ["Accelerators", `Accel${SOFT}erators`],
  ["Minicomputers", `Mini${SOFT}computers`],
  ["Smartphones", `Smart${SOFT}phones`],
  ["Mainframes", `Main${SOFT}frames`],
];

function breakable(name) {
  return BREAKS.reduce((text, [word, soft]) => text.replace(word, soft), name);
}

// How far this business is from its next milestone, as a thin bar under the
// cycle line (from the previous milestone to the next one).
function MilestoneBar({ owned, next }) {
  const prev = [0, ...MILESTONES.map((ms) => ms.owned)].filter((n) => n < next).pop() || 0;
  const pct = Math.max(0, Math.min(100, ((owned - prev) / Math.max(1, next - prev)) * 100));
  return (
    <div data-milestone-bar aria-hidden="true" className="h-1.5 w-full border border-[var(--game-border)] bg-[var(--game-bg)]">
      <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
    </div>
  );
}

function BusinessRow({ index, row, cash, state, buyMode, onBuy, onHire, onRun, compact: compactPref, supplyCard = false, onNeed = null }) {
  // SUPPLY rows always use the compact card, with their bins shown on it.
  const compact = compactPref || supplyCard;
  const holdRef = useRef(null);
  const heldRef = useRef(false);
  useEffect(() => () => {
    if (holdRef.current) clearTimeout(holdRef.current);
  }, []);
  const stopHold = () => {
    if (holdRef.current) clearTimeout(holdRef.current);
    holdRef.current = null;
    window.removeEventListener("pointermove", moveHold);
    window.removeEventListener("pointerup", stopHold);
    window.removeEventListener("pointercancel", stopHold);
  };
  const moveHold = (event) => {
    const start = holdRef.origin;
    if (!start) return;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 14) stopHold();
  };
  const startHold = (event) => {
    if (!canBuy || (event.button && event.button !== 0)) return;
    heldRef.current = false;
    holdRef.origin = { x: event.clientX, y: event.clientY };
    let delay = 380;
    const arm = () => {
      holdRef.current = setTimeout(() => {
        heldRef.current = true;
        onBuy(index);
        delay = Math.max(55, Math.floor(delay * 0.72));
        arm();
      }, delay);
    };
    window.addEventListener("pointermove", moveHold);
    window.addEventListener("pointerup", stopHold);
    window.addEventListener("pointercancel", stopHold);
    arm();
  };
  const cfg = BUSINESSES[index];
  const st = row;
  const count = buyCount(buyMode, cfg, st.owned, cash);
  const cost = costOf(cfg, st.owned, count);
  const canBuy = cash >= cost;
  const mult = milestoneMult(st.owned);
  const next = nextMilestone(st.owned);
  const cycle = effectiveCycleMs(cfg, state);
  const cycleSeconds = (cycle / 1000).toFixed(cycle % 1000 ? 1 : 0);
  const rev = upgradesOf(state, cfg.id).rev ? 3 : 1;
  const fed = supplyFactor(state, cfg);
  const face = generationAt(cfg.id, st.owned, state?.techDone);
  const shownName = face?.name || cfg.name;
  const shownTag = face?.tagline || cfg.tagline;
  const shownEra = face?.year ? `c. ${face.year}` : cfg.era;
  const perCycle = cfg.revenue * generationPayMult(cfg.id, st.owned, state?.techDone) * rev * st.owned * mult * empireFactors(state, Date.now()).total * fed;
  // The materials this row is short of right now, for the warning line.
  const shortOf = st.owned > 0 && fed < 1 && cfg.uses
    ? Object.entries(cfg.uses).filter(([key, need]) => (state.supply?.[key] || 0) < need * st.owned).map(([key]) => key)
    : [];
  const commissioning = (st.commissionUntil || 0) > Date.now();
  const hireNeed = managerNeed(index);
  const hireLocked = st.owned < hireNeed;
  // Same price hire() charges, so a Master Key (free manager) lights the button.
  const hirePrice = managerPrice(state, index);
  const affordable = Number.isFinite(hirePrice) && cash >= hirePrice;
  const noBoss = state.challenge?.id === "noboss";
  const canHire = !commissioning && !st.manager && !hireLocked && !noBoss && affordable;
  const hireCostLine = hirePrice > 0 ? `${money(hirePrice)} cash · runs it automatically` : "Free · runs it automatically";

  return (
    <div data-row={cfg.id} data-help-scope className={`era-row ${(st.milestoneAt || 0) > Date.now() - 1500 ? "milestone-flash" : ""} grid grid-cols-[auto_minmax(0,1fr)] items-start border-2 border-[var(--game-border)] bg-[var(--game-card)] shadow-[4px_4px_0_0_#000] sm:grid-cols-[auto_minmax(0,1fr)_auto] ${compact ? "gap-2 p-2" : "gap-3 p-3"}`}>
      <IconTile cfg={cfg} st={st} onRun={() => onRun(index)} />

      <div className="min-w-0 space-y-2">
        <div className="flex items-start gap-1">
        <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h3 className="era-name min-w-0 break-words font-pixel text-sm leading-5 text-[var(--game-fg)] [overflow-wrap:anywhere]">{breakable(shownName)}</h3>
          <span className="border border-[var(--game-border-strong)] px-1 font-term text-sm leading-5 text-[var(--game-muted)]">
            {shownEra}
          </span>
          {cfg.placeholder && (
            <span className="border border-[var(--game-muted)] px-1 font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)]">ICON SOON</span>
          )}
          {mult > 1 && (
            <span className="border border-[var(--game-accent)] px-1 font-term text-sm leading-5 text-[var(--game-accent)]">
              ×{mult}
            </span>
          )}
        </div>
        <ItemHelp kind="era" id={cfg.id} state={state} name={shownName} className="-mr-2 -mt-2.5 mb-0" />
        </div>
        {!compact && <p className="font-term text-base leading-5 text-[var(--game-muted)]">{shownTag}</p>}
        {commissioning ? (
          <>
            <p className="font-pixel text-[0.55rem] leading-4 text-[var(--game-accent)]">BRINGING THE LINE ONLINE</p>
            <ProgressTrack cycleMs={COMMISSION_MS} cycleStart={(st.commissionUntil || 0) - COMMISSION_MS} progress={0} active loop={false} />
          </>
        ) : (
          <ProgressTrack
            cycleMs={cycle}
            progress={st.progress}
            cycleStart={st.cycleStart || 0}
            active={!!(st.manager || st.running)}
            loop={!!st.manager}
            holdUntil={st.holdUntil || 0}
          />
        )}
        {(cfg.uses || cfg.makes) && !compact && (
          <p className="font-term text-base leading-5 text-[var(--game-muted)]">
            {cfg.uses ? `Uses ${formatFlow(cfg.uses)} each` : ""}
            {cfg.uses && cfg.makes ? " · " : ""}
            {cfg.makes ? `Makes ${formatFlow(makesOf(state, cfg))} each` : ""}
          </p>
        )}
        {supplyCard && cfg.makes && (
          <p data-supply-bins className="flex flex-wrap gap-x-3 font-term text-base leading-5 text-[var(--game-muted)] tabular-nums">
            {Object.keys(cfg.makes).map((key) => {
              const full = supplyFull(state, key);
              return (
                <span key={key} data-bin={key} className={full ? "text-[var(--game-danger)]" : ""}>
                  {key} {amount(state?.supply?.[key] || 0)}/{amount(supplyCap(state, key))}
                  {full && <span data-full className="ml-1 font-pixel text-[0.4rem]">FULL</span>}
                </span>
              );
            })}
            <span>{st.manager ? "Manager: on" : "Manager: none"}</span>
          </p>
        )}
        {shortOf.length > 0 && (
          <p data-short className="font-term text-base leading-5 text-[var(--game-danger)]">
            {fed <= 0 ? `Out of ${shortOf.join(" and ")}: making nothing` : `Short of ${shortOf.join(" and ")}: running at ${Math.round(fed * 100)}%`}
          </p>
        )}
        {onNeed && shortOf.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {shortOf.map((key) => (
              <button
                key={key}
                type="button"
                data-needs={key}
                onClick={() => onNeed(key)}
                className="min-h-[44px] border-2 border-[var(--game-danger)] bg-[var(--game-panel)] px-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-danger)] shadow-[2px_2px_0_0_#000]"
              >
                Needs {key} &gt;
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-between gap-x-3 font-term text-base leading-5 text-[var(--game-muted)]">
          <span>
            {money(perCycle)} / {cycleSeconds}s cycle
          </span>
          <span data-next-milestone>
            {next
              ? `next ${next.speed ? `${next.speed}× speed` : `${next.mult}× pay`} at ${next.owned} · ${next.owned - st.owned} to go`
              : "all milestones earned"}
          </span>
        </div>
        {next && (
          <MilestoneBar owned={st.owned} next={next.owned} />
        )}
      </div>

      <div data-help-guard className="era-actions col-span-2 flex gap-2 sm:col-span-1 sm:w-44 sm:flex-col sm:justify-center">
        <button
          type="button"
          onClick={() => {
            if (heldRef.current) {
              heldRef.current = false;
              return;
            }
            onBuy(index);
          }}
          onPointerDown={startHold}
          disabled={!canBuy}
          aria-label={`Buy ${cfg.name}`}
          data-buy={cfg.id}
          className={`min-h-[44px] flex-1 select-none border-2 px-2 py-2 text-center shadow-[3px_3px_0_0_#000] sm:w-full ${
            canBuy
              ? "border-[var(--game-accent)] bg-[var(--game-accent)] text-[var(--game-accent-fg)] hover:bg-[var(--game-accent-hover)]"
              : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
          }`}
        >
          <span className="font-pixel text-sm uppercase leading-5">Buy ×{count}</span>
          <span className="mt-1 block font-term text-lg leading-5">{money(cost)}</span>
          {!canBuy && Number.isFinite(cost) && (
            <span data-need className="block font-term text-sm leading-4">need {money(cost - cash)} more</span>
          )}
        </button>

        {st.manager ? (
          <span className="flex-1 border-2 border-[var(--game-success-border)] bg-[var(--game-success-bg)] px-2 py-2 text-center font-term text-base leading-5 text-[var(--game-success)] shadow-[3px_3px_0_0_#000] sm:w-full">
            Auto ✓
            <span className="block text-sm leading-4 text-[var(--game-muted)]">{cfg.managerName}</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onHire(index)}
            disabled={!canHire}
            aria-label={`Hire ${cfg.managerName}`}
            data-hire={cfg.id}
            data-hire-blocked={!hireLocked && !affordable ? cfg.id : undefined}
            className={`min-h-[44px] flex-1 select-none border-2 px-2 py-2 text-center font-term text-base leading-5 shadow-[3px_3px_0_0_#000] sm:w-full ${
              canHire
                ? "border-[var(--game-success-border)] bg-[var(--game-success-panel)] text-[var(--game-success)] hover:bg-[var(--game-success-bg-hover)]"
                : "cursor-not-allowed border-[var(--game-border-strong)] bg-[var(--game-panel)] text-[var(--game-dim)]"
            }`}
          >
            <span className="block break-words">Hire {cfg.managerName}</span>
            <span className="block break-words text-sm leading-4">
              {hireLocked ? `Own ${hireNeed} to unlock · you have ${st.owned}` : hireCostLine}
            </span>
            {!hireLocked && !affordable && (
              <span data-hire-need className="block break-words font-term text-sm leading-4">need {money(hirePrice - cash)} more cash</span>
            )}
          </button>
        )}
        <ItemHelp kind="manager" id={cfg.id} state={state} name={cfg.managerName} className="my-0 self-center" />
      </div>
    </div>
  );
}

// Only re-render when this row's own slice of the game state changes: its
// business record (reference identity), the cash that gates its buy/hire
// buttons, the prestige multiplier, the buy mode, or the action callbacks.
// Idle rows then skip the parent's per-tick re-renders.
function arePropsEqual(prev, next) {
  return prev.index === next.index
    && prev.buyMode === next.buyMode
    && prev.compact === next.compact
    && prev.supplyCard === next.supplyCard
    && prev.onNeed === next.onNeed
    && prev.row === next.row
    && prev.cash === next.cash
    && prev.investors === next.investors
    && prev.modStamp === next.modStamp
    && prev.boostUntil === next.boostUntil
    && prev.supplyKey === next.supplyKey
    && !!prev.state?.shop?.freeManager === !!next.state?.shop?.freeManager
    && prev.state?.challenge?.id === next.state?.challenge?.id
    && prev.onBuy === next.onBuy
    && prev.onHire === next.onHire
    && prev.onRun === next.onRun;
}

export default memo(BusinessRow, arePropsEqual);