import { BUSINESSES, FOREMAN_COST, UPGRADE_MS, eraOpen, investorsFor, money } from "@/lib/gameConfig";
import { LAB_CLEAN, empireFactors, hasPerk, isMastered, masteryNeed, overclockOn, upgradeOffer, upgradesOf } from "@/lib/empire";
import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { useGameState } from "./GameState";
import ScreenShell, { Embedded, GoldButton, Panel, SubTabs } from "./chrome";
import { HelpTip, ItemHelp } from "./HintSheet";
import { generationAt } from "@/lib/generations";
import PrestigeBar from "./PrestigeBar";
import PrestigeReport from "./PrestigeReport";
import BoardPage, { forkIsReady } from "./BoardPage";

// BOOST (T3 items 10, 12, 17, 25): NOW (boosts on a timer), UPGRADES (the
// Foreman perk, then upgrades you can afford first, owned ones folded away),
// BONUSES (the old BOARD: permanent bonuses, the fork and the token shop) and
// PRESTIGE (investors and starting over, moved off the GAME screen).
export const BOOST_TABS = ["now", "upgrades", "bonuses", "prestige"];

function boostTimers(state, now) {
  const out = [];
  if (now < (state.boostUntil || 0)) out.push({ id: "crate", name: "INCOME BOOST", text: "x1.15 income", until: state.boostUntil });
  if (overclockOn(state, now)) out.push({ id: "overclock", name: "OVERCLOCK", text: "faster income from the Lab", until: state.lab.overclockUntil });
  if (now < (state.lab?.cleanUntil || 0)) out.push({ id: "cleanroom", name: "CLEAN ROOM", text: `TECH research x${LAB_CLEAN.speed}`, until: state.lab.cleanUntil });
  const job = state.upgradeJob;
  if (job && job.readyAt > now) out.push({ id: "install", name: "INSTALLING UPGRADE", text: BUSINESSES[job.index]?.name || "an upgrade", until: job.readyAt });
  return out;
}

function left(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}:${String(s % 60).padStart(2, "0")}`;
}

// Whether a business has an upgrade it can buy right now (cash and owned count).
function upgradeReady(state, index) {
  const owned = state.biz[index]?.owned || 0;
  const offer = upgradeOffer(index);
  const up = upgradesOf(state, BUSINESSES[index].id);
  return ["rev", "spd"].some((kind) => !up[kind] && owned >= offer[kind].need && state.cash >= offer[kind].cost);
}

export function prestigeReady(state) {
  const claimable = investorsFor(state.lifetime);
  return !state.challenge && claimable > 0 && claimable >= Math.max(1, state.investors || 0);
}

export default function BoostPage() {
  const { state, markReadyView } = useGameState();
  const location = useLocation();
  const navigate = useNavigate();
  const hash = (location.hash || "").replace("#", "");
  const tab = BOOST_TABS.includes(hash) ? hash : "upgrades";
  useEffect(() => { markReadyView?.("boost"); }, [markReadyView, state.cash, state.modStamp]);
  const now = Date.now();
  const timers = boostTimers(state, now);
  const total = empireFactors(state, now).total;
  const anyUpgrade = BUSINESSES.some((cfg, i) => eraOpen(state, i) && upgradeReady(state, i));
  const tabs = [
    { id: "now", label: "NOW", dot: false },
    { id: "upgrades", label: "UPGRADES", dot: anyUpgrade || (!state.foreman && state.cash >= FOREMAN_COST) },
    { id: "bonuses", label: "BONUSES", dot: forkIsReady(state) },
    { id: "prestige", label: "PRESTIGE", dot: prestigeReady(state) },
  ];
  return (
    <ScreenShell title="BOOST" subtitle="">
      <p data-boost-total className="font-term text-lg leading-6 text-[var(--game-accent)]">
        All boosts: income x{total < 100 ? total.toFixed(2) : Math.round(total).toLocaleString("en-US")}
        {timers.length ? ` · ${timers.length} running now` : ""}
      </p>
      <SubTabs tabs={tabs} active={tab} onPick={(id) => navigate({ to: "/boost", hash: id, replace: true })} name="boost" />
      {tab === "now" && <NowTab timers={timers} now={now} />}
      {tab === "upgrades" && <UpgradesTab />}
      {tab === "bonuses" && <Embedded><BoardPage /></Embedded>}
      {tab === "prestige" && <PrestigeTab />}
    </ScreenShell>
  );
}

function NowTab({ timers, now }) {
  if (!timers.length) {
    return (
      <Panel>
        <p data-boost-now-empty className="font-term text-lg leading-6 text-[var(--game-muted)]">
          No boosts on a timer right now. Overclock and the clean room are in R&D &gt; LAB; the Daily Crate can give a timed income boost.
        </p>
      </Panel>
    );
  }
  return (
    <div data-boost-now className="space-y-2">
      {timers.map((t) => (
        <Panel key={t.id}>
          <div data-boost-timer={t.id} className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{t.name}</h2>
              <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{t.text}</p>
            </div>
            <span className="shrink-0 font-term text-xl text-[var(--game-fg)]">{left(t.until - now)}</span>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function PrestigeTab() {
  const { state, prestige, dismissPrestigeReport } = useGameState();
  return (
    <div data-boost-prestige>
      <PrestigeReport report={state.offlineReport ? null : state.prestigeReport} onDismiss={dismissPrestigeReport} />
      {state.challenge ? (
        <Panel>
          <p className="font-term text-lg leading-6 text-[var(--game-muted)]">You can't prestige during a challenge run.</p>
        </Panel>
      ) : (
        <PrestigeBar state={state} onPrestige={prestige} />
      )}
    </div>
  );
}

function ForemanPerk() {
  const { state, buyForeman } = useGameState();
  const hired = !!state.foreman;
  const afford = state.cash >= FOREMAN_COST;
  return (
    <Panel>
      <div data-foreman-perk={hired ? "hired" : "open"} data-help-scope className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-violet)]">PERK · FOREMAN</h2>
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {hired ? "Hired. RUN ALL is on the GAME screen: it starts every business at once." : "Adds a RUN ALL button on the GAME screen that starts every business at once. Kept for good."}
          </p>
        </div>
        <ItemHelp kind="foreman" state={state} name="the Foreman" className="my-0 self-start" />
      </div>
      {!hired && (
        <div className="mt-2">
          <GoldButton disabled={!afford} onClick={buyForeman} dataAttr="buy-foreman">
            <span className="block font-pixel text-[0.6rem]">HIRE THE FOREMAN</span>
            <span className="font-term text-xl">{money(FOREMAN_COST)}</span>
          </GoldButton>
        </div>
      )}
    </Panel>
  );
}

function UpgradesTab() {
  const { state, purchaseUpgrade, setAutoUpgrades } = useGameState();
  const open = BUSINESSES.map((cfg, index) => ({ cfg, index })).filter(({ index }) => eraOpen(state, index));
  const done = ({ cfg }) => { const up = upgradesOf(state, cfg.id); return up.rev && up.spd; };
  const active = open.filter((row) => !done(row) && (state.biz[row.index]?.owned || 0) > 0);
  const ready = active.filter(({ index }) => upgradeReady(state, index));
  const waiting = active.filter(({ index }) => !upgradeReady(state, index));
  const locked = open.filter((row) => (state.biz[row.index]?.owned || 0) <= 0);
  const owned = open.filter((row) => done(row) && (state.biz[row.index]?.owned || 0) > 0);
  const card = (row) => <BizUpgrades key={row.cfg.id} state={state} cfg={row.cfg} index={row.index} onBuy={purchaseUpgrade} />;
  return (
    <div data-boost-upgrades className="space-y-3">
      <ForemanPerk />
      {hasPerk(state, "auto-upgrades") && (
        <Panel>
          <h2 className="font-pixel text-[0.6rem] text-[var(--game-violet)]">PURCHASING DEPARTMENT</h2>
          <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">
            Buys the cheapest upgrade you can afford, one at a time.
          </p>
          <div className="mt-2">
            <GoldButton dataAttr="auto-upgrades" onClick={() => setAutoUpgrades(!state.autoUpgrades)}>
              <span className="font-pixel text-[0.6rem]">{state.autoUpgrades ? "AUTO-BUY: ON" : "AUTO-BUY: OFF"}</span>
            </GoldButton>
          </div>
        </Panel>
      )}
      {ready.map(card)}
      {waiting.map(card)}
      {locked.map(card)}
      {owned.length > 0 && (
        <details data-boost-owned className="border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-2 shadow-[3px_3px_0_0_#000]">
          <summary className="cursor-pointer font-pixel text-[0.6rem] leading-6 text-[var(--game-success)]">ALL BOUGHT ({owned.length})</summary>
          <div className="mt-2 space-y-3">{owned.map(card)}</div>
        </details>
      )}
    </div>
  );
}

function BizUpgrades({ state, cfg, index, onBuy }) {
  const owned = state.biz[index]?.owned || 0;
  const offer = upgradeOffer(index);
  const up = upgradesOf(state, cfg.id);
  const mastered = isMastered(state, index);
  const face = generationAt(cfg.id, owned, state?.techDone);
  const title = face?.name || cfg.name;
  const soon = cfg.placeholder ? <span className="mt-1 inline-block border border-[var(--game-muted)] px-1 font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)]">ICON SOON</span> : null;
  if (owned <= 0) {
    // The next era: show that it exists, keep its upgrades a surprise.
    return (
      <Panel>
        <div data-boost-locked={cfg.id} data-help-scope className="flex items-center gap-3">
          <img src={cfg.icon} alt="" className="pixel-art h-[64px] w-[64px] shrink-0 border-2 border-[var(--game-border-strong)] object-contain opacity-60 grayscale" />
          <div className="min-w-0 flex-1 opacity-60">
            <h2 className="break-words font-term text-2xl leading-6">{title}</h2>
            {soon}
            <p className="font-term text-base leading-5 text-[var(--game-muted)]">Buy your first {cfg.name} to see its upgrades.</p>
          </div>
          <ItemHelp kind="era" id={cfg.id} state={state} name={title} className="my-0 self-start" />
        </div>
      </Panel>
    );
  }
  return (
    <Panel>
      <div data-boost-biz={cfg.id} className="flex items-center gap-3">
        <img src={cfg.icon} alt="" className="pixel-art h-[64px] w-[64px] shrink-0 border-2 border-[var(--game-border-strong)] object-contain" />
        <div className="min-w-0 flex-1">
          <h2 className="break-words font-term text-2xl leading-6">{title}</h2>
          {soon}
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{owned} owned</p>
        </div>
        <ItemHelp kind="era" id={cfg.id} state={state} name={title} className="my-0 self-start" />
      </div>
      <UpgradeCard state={state} id={cfg.id} piece={offer.rev} owned={owned} bought={up.rev} cash={state.cash} job={state.upgradeJob} index={index} onBuy={() => onBuy(index, "rev")} />
      <UpgradeCard state={state} id={cfg.id} piece={offer.spd} owned={owned} bought={up.spd} cash={state.cash} job={state.upgradeJob} index={index} onBuy={() => onBuy(index, "spd")} />
      <p className="mt-3 flex items-start gap-2 break-words font-term text-base leading-5 text-[var(--game-muted)]">
        <span>
          ERA MASTERY: {owned >= masteryNeed(index) ? "✓" : "X"} {Math.min(owned, masteryNeed(index))}/{masteryNeed(index)} owned · {up.rev && up.spd ? "✓" : "X"} both upgrades
          {mastered ? " · +5% to all income this run" : " → +5% to all income this run"}
        </span>
        <HelpTip term="mastery" />
      </p>
    </Panel>
  );
}

function UpgradeCard({ piece, owned, bought, cash, onBuy, job, index, state, id }) {
  const locked = owned < piece.need;
  const afford = cash >= piece.cost;
  const installing = job && job.index === index && job.kind === piece.kind;
  const pct = installing ? Math.max(0, Math.min(100, ((Date.now() - job.startedAt) / UPGRADE_MS) * 100)) : 0;
  const busy = job && !installing;
  if (locked && !bought) {
    // Not unlocked yet: greyed out, name and effect stay hidden.
    return (
      <div data-upgrade-locked={piece.kind} data-help-scope className="mt-3 border-2 border-dashed border-[var(--game-border)] p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-pixel text-[0.6rem] leading-5 text-[var(--game-dim)] opacity-60">???</h3>
          <ItemHelp kind={`upgrade-${piece.kind}`} id={id} state={state} name="this locked upgrade" className="-mr-2 -mt-2.5" />
        </div>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)] opacity-60">
          Unlocks at {piece.need} owned · you have {owned}
        </p>
      </div>
    );
  }
  return (
    <div data-help-scope className="mt-3 border-2 border-[var(--game-border)] p-3">
      <div className="flex items-start gap-2">
        <h3 className="min-w-0 flex-1 break-words font-pixel text-[0.6rem] leading-5">{piece.name}</h3>
        <span className="shrink-0 border-2 border-[var(--game-accent)] px-1 font-pixel text-[0.5rem] text-[var(--game-accent)]">{piece.badge}</span>
        <ItemHelp kind={`upgrade-${piece.kind}`} id={id} state={state} name={piece.name} className="-mr-2 -mt-2.5" />
      </div>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">{piece.blurb}</p>
      {bought ? (
        <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">OWNED</p>
      ) : installing ? (
        <div className="mt-2">
          <p className="font-pixel text-[0.55rem] text-[var(--game-accent)]">INSTALLING (12 SECONDS)</p>
          <div className="mt-2 h-5 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)]">
            <div className="h-full bg-[var(--game-accent)]" style={{ width: `${pct}%` }} />
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <GoldButton disabled={!afford || busy} onClick={onBuy} dataAttr={`upgrade-${piece.kind}`}>
            <span className="block font-pixel text-[0.65rem]">BUY</span>
            <span className="font-term text-xl">{money(piece.cost)}</span>
          </GoldButton>
        </div>
      )}
    </div>
  );
}
