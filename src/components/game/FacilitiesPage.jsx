import { useState } from "react";
import { REFINED, money } from "@/lib/gameConfig";
import { businessIncomePerSecond, incomePerSecond } from "@/lib/empire";
import {
  FACILITIES,
  PARTS,
  facilitiesOpen,
  facilityHint,
  facilityNeed,
  facilityReport,
  diskSize,
  memSize,
  facilityUnlocked,
  partPlantOpen,
  fitPart,
  nextPurchase,
  partCost,
  partLock,
  partMax,
  REBUILD_SECONDS,
  rebuildCost,
  rebuildReady,
  partMaterials,
  partShort,
} from "@/lib/facilities";
import { extrasText, partValue } from "@/lib/plantValue";
import { toast } from "sonner";
import { playerYear, researchItem, serverOutput } from "@/lib/research";
import { HUB_ROUTE } from "@/lib/hub";
import { useGameState } from "./GameState";
import ScreenShell, { GoldButton, Panel } from "./chrome";
import { HelpTip, ItemHelp } from "./HintSheet";

function percent(share) {
  if (!(share > 0)) return "0%";
  const pct = share * 100;
  return pct >= 10 ? `${Math.round(pct)}%` : `${pct.toFixed(1)}%`;
}

function PartRow({ part, owned, open, cash, onBuy, facilityId, state, best, business }) {
  const cost = partCost(part, owned);
  // Memory goes in the board's slots: the board can refuse a stick (full, or
  // the wrong DDR generation), or a stick can replace others.
  const fit = fitPart(state.facilities?.[facilityId] || {}, facilityId, part.id);
  // Each part opens in its real year, once it's researched on TECH.
  const lock = open && !part.soon ? partLock(state, part, researchItem(part.research)?.name) : null;
  const dim = part.soon || !open || !!lock;
  const short = partShort(state, part);
  const mats = partMaterials(part);
  const affordable = open && !lock && !part.soon && !fit.reason && !short.length && Number.isFinite(cost) && cash >= cost && owned < partMax(part, facilityId);
  return (
    <div data-part={part.id} data-best-part={best ? "" : undefined} data-help-scope className={`border-2 ${best ? "border-[var(--game-accent)]" : "border-[var(--game-border)]"} bg-[var(--game-bg)] p-2`}>
      {best && <p className="mb-1 font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">BEST NEXT PART</p>}
      <div className="flex items-start justify-between gap-2">
        {part.icon && (
          // The art leaves a wide empty border; zoom in so the part fills the box.
          <div className={`h-14 w-14 shrink-0 overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] ${dim ? "opacity-60" : ""}`}>
            <img src={part.icon} alt="" className="pixel-art h-full w-full scale-[1.4] object-contain" />
          </div>
        )}
        <div className={`min-w-0 flex-1 ${dim ? "opacity-60" : ""}`}>
          <p className="break-words font-pixel text-[0.55rem] leading-4 text-[var(--game-fg)] [overflow-wrap:anywhere]">{part.name}</p>
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{part.spec}</p>
          {lock ? (
            <p data-part-lock className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{lock}.</p>
          ) : (
            <PartValue state={state} facilityId={facilityId} part={part} business={business} />
          )}
        </div>
        <span className="shrink-0 font-term text-base leading-5 text-[var(--game-accent)]">×{owned}</span>
        <ItemHelp kind="part" id={`${facilityId}:${part.id}`} state={state} name={part.name} className="-mr-1 -mt-2.5" />
      </div>
      {part.soon ? (
        <p className="mt-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)] opacity-60">COMING SOON</p>
      ) : (
        <div className="mt-2">
          <GoldButton dataAttr={`buy-${part.id}`} disabled={!affordable} onClick={onBuy}>
            <span className="font-pixel text-[0.55rem]">{!open || lock ? "LOCKED" : facilityId === "bench" && owned > 0 && part.kind !== "stick" ? "ON THE BENCH" : `BUY ${money(cost)}`}</span>
            {open && !lock && !(facilityId === "bench" && owned > 0 && part.kind !== "stick") && mats && (
              <span data-part-materials className={`block font-term text-base leading-5 ${short.length ? "text-[var(--game-danger)]" : ""}`}>
                {short.length
                  ? `Needs ${short.map((x) => `${x.need} ${REFINED[x.key]?.short || x.key} (have ${x.have})`).join(", ")}`
                  : `+ ${Object.entries(mats).map(([k, n]) => `${n} ${REFINED[k]?.short || k}`).join(", ")}`}
              </span>
            )}
          </GoldButton>
        </div>
      )}
    </div>
  );
}

function rate(n) {
  return n >= 10 ? n.toFixed(1) : n >= 0.1 ? n.toFixed(2) : n.toFixed(3);
}

// What this part would add right now, with what it needs to run.
function PartValue({ state, facilityId, part, business }) {
  const v = partValue(state, facilityId, part.id, business);
  if (!v) return null;
  const fit = fitPart(state.facilities?.[facilityId] || {}, facilityId, part.id);
  const note = fit.note ? ` Buying it ${fit.note}; what comes out sells back at half price.` : "";
  let text;
  let good = false;
  if (v.maxed) text = facilityId === "bench" ? "On the bench." : "At the most you can own.";
  else if (v.why) text = v.why;
  else {
    good = true;
    const gain = v.kind === "rd"
      ? [v.added > 0 ? `+${rate(v.added)} R&D/s` : null, v.awayHours > 0 ? `+${Number(v.awayHours.toFixed(1))} h away bank` : null].filter(Boolean).join(", ")
      : `+${money(v.added)}/s (+${(v.share * 100).toFixed(2)}%)`;
    const extras = v.extras?.length ? ` with ${extrasText(v.extras)} (${money(v.cost)} in all)` : "";
    const payback = v.payback ? ` · pays back in ${Math.max(1, Math.round(v.payback / 60)).toLocaleString("en-US")} min` : "";
    text = `${gain}${extras}${payback}`;
  }
  if (!v.maxed && note) text += note;
  return (
    <p data-part-value className={`break-words font-term text-base leading-5 ${good ? "text-[var(--game-success)]" : "text-[var(--game-muted)]"}`}>
      {text}
    </p>
  );
}

// Machine room: one generator and one air conditioner per computer. Racks:
// watts. Disk: what the newest machine needs.
function serverStockText(row) {
  const parts = [];
  const room = row.groups?.room;
  const rack = row.groups?.rack;
  if (room?.watts > 0) parts.push(`Machine room: ${room.watts} generator${room.watts === 1 ? "" : "s"} and coolers needed, ${room.power} generator${room.power === 1 ? "" : "s"}, ${room.cool} cooler${room.cool === 1 ? "" : "s"}`);
  if (rack?.watts > 0) parts.push(`Racks: ${Math.round(rack.watts)} W, ${Math.round(rack.power)} W of supplies, ${Math.round(rack.cool)} W of fans`);
  parts.push(`Disk: ${diskSize(row.storage)} of the ${diskSize(row.need)} the newest machine needs`);
  if (rack?.work > 0) parts.push(row.linkCap > 0 ? `Network: carries ${row.linkCap.toLocaleString("en-US")} of ${rack.work.toLocaleString("en-US")} rack work` : "Network: none, so each rack works alone at half speed");
  return parts.join(" · ");
}

function Plant({ facility, state, report, business, cash, onBuy, next, onToggleOc }) {
  const open = facilityUnlocked(state, facility.id);
  const row = report[facility.id];
  const research = facility.id === "servers";
  // Before Mainframes the server room opens only its tabulating corner: the
  // starter machine. The machine room stays greyed out until then.
  const starterOnly = research && !open;
  const bench = facility.id === "bench";
  const counts = state.facilities?.[facility.id] || {};
  const [benchTab, setBenchTab] = useState("cpu");
  const [showAll, setShowAll] = useState(false);
  let parts = PARTS.filter((part) => part.fits.includes(facility.id));
  // The bench has close to a hundred parts across 50 years: show one kind at a
  // time, only what the company's year has reached, newest first, and the
  // older ones on request.
  let hiddenOld = 0;
  let hiddenLater = 0;
  if (bench) {
    const year = playerYear(state);
    const kinds = BENCH_TABS.find(([id]) => id === benchTab)?.[2] || [benchTab];
    const all = parts.filter((part) => kinds.includes(part.kind)).sort((a, b) => b.year - a.year || b.cost - a.cost);
    const reached = all.filter((part) => part.year <= year);
    hiddenLater = all.length - reached.length;
    const keep = reached.filter((part, i) => showAll || i < BENCH_SHOWN || (counts[part.id] || 0) > 0);
    hiddenOld = reached.length - keep.length;
    parts = keep;
  }
  return (
    <Panel>
      <div data-facility={facility.id} data-locked={open ? undefined : ""}>
        <div data-help-scope className="flex items-start gap-2">
          <div className={`h-14 w-14 shrink-0 overflow-hidden border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] ${open || starterOnly ? "" : "opacity-60"}`}>
            <img src={facility.icon} alt="" className="pixel-art h-full w-full scale-[1.4] object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={`break-words font-pixel text-[0.6rem] leading-4 [overflow-wrap:anywhere] ${open || starterOnly ? "text-[var(--game-accent)]" : "text-[var(--game-dim)]"}`}>{facility.name}</h2>
          </div>
          <ItemHelp kind="facility" id={facility.id} state={state} name={facility.name} className="-mr-2 -mt-2.5" />
        </div>
        <p className={`mt-2 break-words font-term text-base leading-5 ${open ? "text-[var(--game-fg)]" : "text-[var(--game-muted)] opacity-60"}`}>{facility.blurb}</p>
        <p data-facility-yield className="mt-2 break-words font-term text-base leading-5 text-[var(--game-success)]">
          {bench ? `+${row.perSecond.toFixed(3)} R&D points a second` : research ? `+${(serverOutput(state).perSecond - serverOutput(state).bench).toFixed(2)} R&D points a second` : money(row.perSecond) + "/s"}
          {!research && !bench && open && business > 0 ? ` · ${percent(row.share)} of the businesses` : ""}
        </p>
        {open ? (
          <>
            <p data-facility-limit className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
              {row.limit}
              {row.tier ? ` · ${row.tier} model` : ""}
              {open && (/Bottleneck/.test(row.limit || "") ? <HelpTip term="bottleneck" /> : row.limit === "Network-limited" ? <HelpTip term="network" /> : null)}
            </p>
            <p data-facility-hint className="break-words font-term text-base leading-5 text-[var(--game-muted)]">{facilityHint(state, facility.id, business)}</p>
          </>
        ) : (
          // Not reached this run (or reset by a prestige): greyed out, with what it needs.
          <>
            {starterOnly && (
              <p data-tabulating-room className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
                TABULATING ROOM OPEN: the punch-card machine works from the start. The other machines:
              </p>
            )}
            <p data-facility-limit data-facility-needs className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-dim)]">
              {facilityNeed(facility.id)}
            </p>
          </>
        )}
        {open && facility.id === "bench" && (
          <p data-bench-build className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            Board: {row.board?.name || "none"} · CPU: {row.cpu?.name || "none"} · Memory: {memSize(row.ramMb)}
            {row.cpu ? ` of the ${memSize(row.needMb)} it wants` : ""}
            {row.board ? `, ${row.sticks} of ${row.board.slots} slots used` : ""}
            {row.memSpeed ? ` · memory at ${row.memSpeed} MT/s (rated ${row.rated})` : ""}
            {row.overclock > 1 ? " · overclocked +10%" : ""}
            {row.board && !row.board.builtin ? ` · Graphics: ${row.card?.name || (row.cpu?.igpu ? "on the CPU" : "none")} · Power: ${Math.round(row.draw)} W of ${row.supply || 0} W` : ""}
            {row.link ? ` · PCIe ${row.link}.0` : ""}
            {row.cpu && row.cpu.watts > 5 ? ` · Cooling: ${row.cooler ? `${row.cooler.name}, ${row.coolCap} W for ${Math.round(row.heat)} W` : "none"}` : ""}
            {row.board && !row.board.builtin ? ` · Drive: ${row.drive ? `${row.drive.name}, ${row.driveText}, ${Number(row.driveMbs.toFixed(1))} MB/s` : "none"}` : ""}
          </p>
        )}
        {open && research && row.gpus > 0 && (
          <p data-server-stock className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {serverStockText(row)}
          </p>
        )}
        {open && !research && row.gpus > 0 && (
          <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {Math.round(row.watts)} W of cards · {Math.round(row.power)} W power · {Math.round(row.cool)} W cooling · {Math.round(row.vram)} GB on the cards · {Math.round(row.ram)} GB RAM
          </p>
        )}
        {open && row.board && !bench && (
          <p data-board className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            Memory: {row.board.used} of {row.board.slots} slots used on the {row.board.name}.
          </p>
        )}
        {open && bench && row.canOc && (
          <div className="mt-2">
            <GoldButton dataAttr="bench-oc" onClick={onToggleOc}>
              <span className="font-pixel text-[0.55rem]">OVERCLOCK: {state.benchOc === false ? "OFF" : row.ocOn ? "ON" : "ON (TOO HOT, AT STOCK)"}</span>
            </GoldButton>
          </div>
        )}
        {open && bench && (
          <div role="tablist" className="mt-2 flex flex-wrap gap-2">
            {BENCH_TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={benchTab === id}
                data-bench-tab={id}
                onClick={() => setBenchTab(id)}
                className={`min-h-12 border-2 px-3 font-pixel text-[0.5rem] ${benchTab === id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-2 space-y-2">
          {parts.map((part) => (
            <PartRow
              key={part.id}
              part={part}
              owned={counts[part.id] || 0}
              open={partPlantOpen(state, facility.id, part)}
              cash={cash}
              onBuy={() => {
                const done = onBuy(facility.id, part.id);
                if (done?.ok && done.refund > 0) toast(`${part.name} installed`, { description: `It ${done.note}. ${money(done.refund)} back for the old sticks.` });
              }}
              facilityId={facility.id}
              state={state}
              best={next?.facilityId === facility.id && next?.partId === part.id}
              business={business}
            />
          ))}
        </div>
        {open && bench && hiddenOld > 0 && (
          <div className="mt-2">
            <GoldButton dataAttr="bench-show-all" onClick={() => setShowAll(true)}>
              <span className="font-pixel text-[0.55rem]">SHOW {hiddenOld} OLDER</span>
            </GoldButton>
          </div>
        )}
        {open && bench && hiddenLater > 0 && (
          <p data-bench-later className="mt-2 break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {hiddenLater} more come with later eras.
          </p>
        )}
      </div>
    </Panel>
  );
}

const BENCH_TABS = [
  ["board", "BOARDS", ["board"]],
  ["cpu", "CPUS", ["cpu", "fpu"]],
  ["stick", "MEMORY", ["stick", "cache"]],
  ["video", "GRAPHICS", ["video", "bridge", "accel"]],
  ["monitor", "DISPLAYS", ["monitor"]],
  ["sound", "SOUND", ["sound"]],
  ["addin", "CARDS", ["addin"]],
  ["psu", "POWER", ["psu"]],
  ["case", "CASES", ["case"]],
  ["drive", "DRIVES", ["drive", "media"]],
  ["net", "NETWORK", ["net", "modem"]],
  ["cooler", "COOLING", ["cooler"]],
];
const BENCH_SHOWN = 6;

// After a prestige or fork the plants start empty; this buys last run's
// layout back, cheapest parts first, as far as cash allows.
function RebuildPanel({ state, onRebuild }) {
  const left = rebuildCost(state);
  if (left.parts <= 0) return null;
  const cash = state.cash || 0;
  const now = Date.now();
  const ready = rebuildReady(state, { maxCost: Math.max(0, incomePerSecond(state, now)) * REBUILD_SECONDS, businessPerSecond: businessIncomePerSecond(state, now) });
  const first = ready.cheapestCost;
  const can = first != null && cash >= first;
  const later = left.parts - ready.parts;
  const press = () => {
    const done = onRebuild();
    if (done?.bought > 0) {
      const rest = rebuildCost(state).parts;
      toast(`Rebuilt ${done.bought} part${done.bought === 1 ? "" : "s"}`, { description: `${money(done.spent)} spent.${rest > 0 ? ` ${rest} more when cash and income allow.` : " Last run's plants are back."}` });
    }
  };
  return (
    <Panel>
      <div data-rebuild data-help-scope>
        <h2 className="font-pixel text-[0.6rem] text-[var(--game-accent)]">REBUILD LAST RUN'S PLANTS</h2>
        <p className="mt-1 break-words font-term text-base leading-5 text-[var(--game-fg)]">
          {left.parts} part{left.parts === 1 ? "" : "s"} to go. {ready.parts > 0 ? `${ready.parts} ready now` : "None ready yet"}
          {later > 0 ? `; ${later} wait until each pays for itself within 15 minutes` : ""}. Mine and cluster only, cheapest first, so power and cooling come with the cards.
        </p>
        <div className="mt-2">
          <GoldButton disabled={!can} onClick={press} dataAttr="rebuild">
            <span className="font-pixel text-[0.6rem]">{can ? "REBUILD" : first != null ? `NEED ${money(first)}` : "NOT YET"}</span>
          </GoldButton>
        </div>
      </div>
    </Panel>
  );
}

export default function FacilitiesPage() {
  const { state, buyFacilityPart, rebuildFacilities, toggleBenchOc } = useGameState();
  const business = businessIncomePerSecond(state, Date.now());
  const report = facilityReport(state, business);
  const open = facilitiesOpen(state);
  // The part that adds the most pay for its price (or starts a plant).
  const next = open ? nextPurchase(state, business) : null;
  return (
    <ScreenShell title="RIGS" subtitle="A side plant. It pays cash, and it never outgrows the businesses." backTo={HUB_ROUTE}>
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
      {open && (
        <p data-next-part className="break-words px-1 font-term text-base leading-5 text-[var(--game-accent)]">
          {next
            ? `Best next part: ${next.name} for the ${next.facilityId === "mine" ? "mine" : "cluster"}${next.extras?.length ? `, with ${extrasText(next.extras)} to run it` : ""}, ${money(next.bundleCost || next.cost)}${next.payback ? `; pays for itself in about ${Math.max(1, Math.round(next.payback / 60))} min` : " to get it running"}.`
            : report.capped
              ? "Both plants are at the income cap; more parts won't add pay."
              : "No part pays for itself within 15 minutes right now."}
        </p>
      )}
      <RebuildPanel state={state} onRebuild={rebuildFacilities} />
      {FACILITIES.map((facility) => (
        <Plant key={facility.id} facility={facility} state={state} report={report} business={business} cash={state.cash || 0} onBuy={buyFacilityPart} next={next} onToggleOc={toggleBenchOc} />
      ))}
    </ScreenShell>
  );
}
