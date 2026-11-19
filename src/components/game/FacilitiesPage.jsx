import { money } from "@/lib/gameConfig";
import { businessIncomePerSecond } from "@/lib/empire";
import {
  FACILITIES,
  MAX_PART,
  PARTS,
  facilitiesOpen,
  facilityHint,
  facilityReport,
  facilityUnlocked,
  partCost,
} from "@/lib/facilities";
import { serverOutput } from "@/lib/research";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";

function percent(share) {
  if (!(share > 0)) return "0%";
  const pct = share * 100;
  return pct >= 10 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
}

function PartRow({ part, owned, open, cash, onBuy }) {
  const cost = partCost(part, owned);
  const affordable = open && !part.soon && Number.isFinite(cost) && cash >= cost && owned < MAX_PART;
  return (
    <div data-part={part.id} className={`border-2 border-[var(--game-border)] bg-[var(--game-bg)] p-2 ${part.soon || !open ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-fg)] [overflow-wrap:anywhere]">{part.name}</p>
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{part.spec}</p>
        </div>
        <span className="shrink-0 font-term text-base leading-5 text-[var(--game-accent)]">×{owned}</span>
      </div>
      {part.soon ? (
        <p className="mt-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)]">COMING SOON</p>
      ) : (
        <div className="mt-2">
          <GoldButton dataAttr={`buy-${part.id}`} disabled={!affordable} onClick={onBuy}>
            <span className="font-pixel text-[0.55rem]">{open ? `BUY ${money(cost)}` : "LOCKED"}</span>
          </GoldButton>
        </div>
      )}
    </div>
  );
}

function Plant({ facility, state, report, business, cash, onBuy }) {
  const open = facilityUnlocked(state, facility.id);
  const row = report[facility.id];
  const research = facility.id === "servers";
  const counts = state.facilities?.[facility.id] || {};
  const parts = PARTS.filter((part) => part.fits.includes(facility.id));
  return (
    <Panel>
      <div data-facility={facility.id}>
        <div className="flex items-start gap-2">
          <img src="/icons/placeholder-era.svg" alt="" className="pixel-art h-12 w-12 shrink-0 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] object-contain" />
          <div className="min-w-0">
            <h2 className="break-words font-pixel text-[0.6rem] leading-4 text-[var(--game-accent)] [overflow-wrap:anywhere]">{facility.name}</h2>
            <p className="font-pixel text-[0.45rem] leading-4 text-[var(--game-muted)]">ICON SOON</p>
          </div>
        </div>
        <p className="mt-2 break-words font-term text-base leading-5 text-[var(--game-fg)]">{facility.blurb}</p>
        <p data-facility-yield className="mt-2 break-words font-term text-base leading-5 text-[var(--game-success)]">
          {research ? `+${serverOutput(state).perSecond.toFixed(2)} R&D points a second` : money(row.perSecond) + "/s"}
          {!research && open && business > 0 ? ` · ${percent(row.share)} of the businesses` : ""}
        </p>
        <p data-facility-limit className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
          {open ? row.limit : facility.id === "servers" ? "Requires 1971" : "Locked"}
          {row.tier ? ` · ${row.tier} model` : ""}
        </p>
        <p data-facility-hint className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{facilityHint(state, facility.id, business)}</p>
        {open && row.gpus > 0 && (
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {Math.round(row.watts)} W of cards · {Math.round(row.power)} W power · {Math.round(row.cool)} W cooling · {Math.round(row.vram)} GB on the cards · {Math.round(row.ram)} GB RAM
          </p>
        )}
        <div className="mt-2 space-y-2">
          {parts.map((part) => (
            <PartRow
              key={part.id}
              part={part}
              owned={counts[part.id] || 0}
              open={open}
              cash={cash}
              onBuy={() => onBuy(facility.id, part.id)}
            />
          ))}
        </div>
      </div>
    </Panel>
  );
}

export default function FacilitiesPage() {
  const { state, buyFacilityPart } = useGameState();
  const business = businessIncomePerSecond(state, Date.now());
  const report = facilityReport(state, business);
  const open = facilitiesOpen(state);
  return (
    <ScreenShell title="FACILITIES" subtitle="A side plant. It pays cash, and it never outgrows the businesses.">
      {!open && (
        <Panel>
          <p data-facilities-locked className="break-words font-term text-base leading-5 text-[var(--game-fg)]">
            The plant opens when you own an AI Accelerator. Until then every part stays locked.
          </p>
        </Panel>
      )}
      {open && (
        <p className="break-words px-1 font-term text-base leading-5 text-[var(--game-muted)]">
          Both plants together pay {money(report.perSecond)}/s, {percent(report.share)} of the businesses. Short power or cooling throttles the cards. The cluster also needs enough memory for its model.
        </p>
      )}
      {FACILITIES.map((facility) => (
        <Plant key={facility.id} facility={facility} state={state} report={report} business={business} cash={state.cash || 0} onBuy={buyFacilityPart} />
      ))}
    </ScreenShell>
  );
}
