import { useLocation, useNavigate } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { BUSINESSES, money } from "@/lib/gameConfig";
import { SPECIALTIES, canCommit, dataPerSecond, establishedCount, masteredCount, specialtySlots } from "@/lib/empire";
import { getSaveData } from "@/lib/gameSave";
import { useGameState } from "./GameState";
import AnalyticsPanel from "./AnalyticsPanel";
import TokenShop from "./TokenShop";
import ScreenShell, { GoldButton, Panel } from "./chrome";

const TABS = [
  { id: "howto", label: "HOW TO PLAY" },
  { id: "settings", label: "SETTINGS" },
  { id: "stats", label: "STATS" },
  { id: "research", label: "RESEARCH" },
  { id: "market", label: "MARKET" },
];

export function MoreLinks({ active }) {
  const navigate = useNavigate();
  return (
    <div data-more-tabs className="flex gap-2 overflow-x-auto pb-1">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => navigate({ to: "/more", hash: tab.id })}
          className={`min-h-16 min-w-24 shrink-0 border-2 px-2 py-2 text-center font-pixel text-[0.5rem] leading-4 shadow-[3px_3px_0_0_#000] ${
            active === tab.id
              ? "border-[var(--game-accent)] text-[var(--game-accent)]"
              : "border-[var(--game-border-strong)] text-[var(--game-muted)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function MorePage() {
  const location = useLocation();
  const hash = (location.hash || "#settings").replace("#", "");
  const tab = TABS.some((entry) => entry.id === hash) ? hash : "settings";
  const { state, reset, purchaseShop, chooseSpecialty } = useGameState();
  const data = getSaveData();

  if (tab === "research") {
    return (
      <ScreenShell title={"RESEARCH\nLAB"} subtitle="">
        <ResearchBody state={state} onCommit={chooseSpecialty} />
      </ScreenShell>
    );
  }

  return (
    <ScreenShell title={"GAME\nSETTINGS"} subtitle="">
      <MoreLinks active={tab} />
      {tab === "settings" && (
        <>
          <AnalyticsPanel data={data} />
          <button type="button" onClick={reset} className="min-h-11 border-2 border-[var(--game-danger)] px-3 font-pixel text-[0.55rem] text-[var(--game-danger)]">
            RESET SAVE
          </button>
        </>
      )}
      {tab === "howto" && <HowTo />}
      {tab === "stats" && <Stats state={state} />}
      {tab === "market" && (
        <Panel className="border-[var(--game-accent)]">
          <h2 className="font-pixel text-[0.7rem] text-[var(--game-accent)]">MARKET</h2>
          <div className="mt-3">
            <TokenShop state={state} onBuy={purchaseShop} />
          </div>
        </Panel>
      )}
    </ScreenShell>
  );
}

function HowTo() {
  const lines = [
    "Tap a machine to run one batch. Hire its manager and it keeps running.",
    "Buy x1, x10, x100, or MAX. Milestones multiply that whole era.",
    "Prestige on the game tab recruits investors. The first one needs $1T lifetime earnings.",
    "Named upgrades and era mastery never reset. The owned count for mastery is lower on steep early eras and higher on tubes and quantum.",
    "Era tokens pay for the shop on the Board tab. Only the daily crate is free from the start.",
    "Fork the timeline once you can pay the investor bill. Each fork costs more. Singularity maxes at x4, and the income ceiling rises with it instead of cutting off flat.",
    "Close the tab and hired crews earn for up to 8 hours. Sound goes quiet while the app is hidden.",
  ];
  return (
    <Panel>
      <ul className="space-y-2">
        {lines.map((line) => (
          <li key={line} className="font-term text-lg leading-6">{line}</li>
        ))}
      </ul>
    </Panel>
  );
}

function Stats({ state }) {
  return (
    <Panel>
      {BUSINESSES.map((cfg, index) => {
        const st = state.biz[index];
        const minutes = Math.floor((st?.activeMs || 0) / 60000);
        return (
          <p key={cfg.id} className="font-term text-lg leading-6">
            {cfg.name}: {st?.owned || 0} owned · {st?.manager ? "manager" : "manual"} · {minutes}m active
          </p>
        );
      })}
    </Panel>
  );
}

export function ResearchBody({ state, onCommit }) {
  const rate = dataPerSecond(state);
  const slots = specialtySlots(state);
  const picked = state.specialties || [];
  return (
    <>
      <Panel>
        <p className="font-pixel text-[0.55rem] text-[var(--game-muted)]">DATA BANK</p>
        <p className="font-term text-5xl leading-none text-[var(--game-success)]">{(state.data || 0).toFixed(1)}</p>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          +{rate.toFixed(2)}/s from {establishedCount(state)} established {establishedCount(state) === 1 ? "era" : "eras"} and {masteredCount(state)} mastered. Research is permanent - no reset ever takes it.
        </p>
      </Panel>
      <Panel>
        <h2 className="flex items-center gap-2 font-pixel text-[0.7rem]">
          <FlaskConical className="h-4 w-4 text-[var(--game-accent)]" aria-hidden="true" />
          COMPANY SPECIALTY
        </h2>
        <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
          Pick one branch for good. The other two are lost until the timeline is forked. Slots open: {slots}. Committed: {picked.length}.
        </p>
        {SPECIALTIES.map((spec) => {
          const owned = picked.includes(spec.id);
          const open = canCommit(state, spec.id);
          return (
            <div key={spec.id} className="mt-3 border-2 border-[var(--game-border)] p-3">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-pixel text-[0.65rem]">{spec.name}</h3>
                <span className="font-term text-lg text-[var(--game-muted)]">{spec.cost} DATA</span>
              </div>
              <p className="mt-2 font-term text-lg leading-6">{spec.blurb}</p>
              {owned ? (
                <p className="mt-2 font-pixel text-[0.55rem] text-[var(--game-success)]">COMMITTED</p>
              ) : (
                <div className="mt-2">
                  <GoldButton disabled={!open} onClick={() => onCommit(spec.id)} dataAttr={spec.id}>
                    <span className="font-pixel text-[0.6rem]">COMMIT TO {spec.name}</span>
                  </GoldButton>
                </div>
              )}
            </div>
          );
        })}
      </Panel>
    </>
  );
}
