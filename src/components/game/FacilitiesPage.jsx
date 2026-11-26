import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "@tanstack/react-router";
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
  benchJob,
  roomJob,
  stageJobs,
} from "@/lib/facilities";
import { extrasText, partValue } from "@/lib/plantValue";
import { toast } from "sonner";
import { playerYear, researchItem, serverOutput } from "@/lib/research";
import { HUB_ROUTE } from "@/lib/hub";
import { useGameState } from "./GameState";
import ScreenShell, { Embedded, GoldButton, Panel, SubTabs } from "./chrome";
import RigsGarage from "./RigsGarage";
import { HelpTip, ItemHelp } from "./HintSheet";
import FacilityRoom from "./FacilityRoom";
import RoomStatus, { MachineSpecBars } from "./RoomStatus";
import StageBar from "./StageBar";
import { machineSpec, specBars } from "@/lib/machineSpecs";

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
  const building = !part.starter && !!roomJob(state, facilityId);
  const affordable = open && !building && !lock && !part.soon && !fit.reason && !short.length && Number.isFinite(cost) && cash >= cost && owned < partMax(part, facilityId);
  const installs = stageJobs(state).filter((j) => j.kind === "install" && j.facilityId === facilityId && j.partId === part.id);
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
      {facilityId === "servers" && part.kind === "server" && (
        <div className={dim ? "opacity-60" : ""}>
          <MachineSpecBars bars={specBars(part)} real={machineSpec(part.id)?.real} />
        </div>
      )}
      {installs.length > 0 && (
        <div data-installing={installs.length} className="mt-2 space-y-1">
          {installs.slice(0, 3).map((job, i) => (
            <StageBar key={job.id} job={job} kind="install" title={i === 0 ? `COMING ONLINE: ${installs.length} of ${owned}` : undefined} />
          ))}
          {installs.length > 3 && <p className="font-term text-base leading-5 text-[var(--game-muted)]">+{installs.length - 3} more being installed</p>}
        </div>
      )}
      {part.soon ? (
        <p className="mt-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-muted)] opacity-60">COMING SOON</p>
      ) : (
        <div className="mt-2">
          <GoldButton dataAttr={`buy-${part.id}`} disabled={!affordable} onClick={onBuy}>
            <span className="font-pixel text-[0.55rem]">{lock ? lock : !open ? "LOCKED" : building ? "UNDER CONSTRUCTION" : facilityId === "bench" && owned > 0 && part.kind !== "stick" ? "ON THE BENCH" : `BUY ${money(cost)}`}</span>
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
  // Research servers (T3 item 52): machines, room equipment, and a pointer to
  // the Home PC parts on the bench.
  const [serverTab, setServerTab] = useState("machines");
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
  // Before Mainframes, the server room only lists the starter machine.
  // Other locked plants show the need, not a wall of greyed parts.
  if (starterOnly) parts = parts.filter((part) => part.starter);
  else if (!open) parts = [];
  if (research && open) {
    const kinds = SERVER_TABS.find((t) => t.id === serverTab)?.kinds || [];
    parts = parts.filter((part) => kinds.includes(part.kind));
  }
  const limited = research && open && /^(Power|Cooling) limited$/.test(row.limit || "");
  const showRoomTab = () => {
    setServerTab("room");
    setTimeout(() => document.querySelector("[data-server-tabs]")?.scrollIntoView({ block: "start" }), 50);
  };
  return (
    <Panel>
      <div id={facility.id} data-facility={facility.id} data-locked={open || starterOnly ? undefined : ""} className="scroll-mt-[var(--hud-h,0px)]">
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
          {bench ? `+${rate(row.perSecond)} R&D points a second` : research ? `+${rate(serverOutput(state).perSecond - serverOutput(state).bench)} R&D points a second` : money(row.perSecond) + "/s"}
          {!research && !bench && open && business > 0 ? ` · ${percent(row.share)} of the businesses` : ""}
        </p>
        {open ? (
          <>
            {bench ? (
              <p data-facility-limit className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
                {row.limit}
                {/Bottleneck/.test(row.limit || "") ? <HelpTip term="bottleneck" /> : null}
              </p>
            ) : row.tier ? (
              <p data-facility-tier className="break-words font-pixel text-[0.5rem] leading-4 text-[var(--game-accent)]">
                Training the {row.tier} model
              </p>
            ) : null}
            {limited && serverTab !== "room" && (
              <button type="button" data-limit-shortcut onClick={showRoomTab} className="mt-1 min-h-12 w-full border-2 border-[var(--game-danger)] px-2 text-left font-pixel text-[0.5rem] leading-4 text-[var(--game-danger)]">
                ADD ROOM EQUIPMENT &gt;
              </button>
            )}
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
              {!open ? " · COMING SOON" : ""}
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
        {open && !research && !bench && row.gpus > 0 && (
          <p data-card-memory className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            {Math.round(row.vram)} GB on the cards
          </p>
        )}
        {open && row.board && !bench && (
          <p data-board className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
            Memory: {row.board.used} of {row.board.slots} slots used on the {row.board.name}.
          </p>
        )}
        {open && bench && benchJob(state) && (
          <div data-bench-building className="mt-2">
            <StageBar job={benchJob(state)} kind="bench" title="SETTING UP THE PC" />
          </div>
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
        {research && open && <h3 data-machines-head className="mt-3 font-status text-lg font-bold leading-6 text-[var(--game-fg)]">MACHINES</h3>}
        {research && open && (
          <div data-server-tabs role="tablist" className="mt-2 grid scroll-mt-[var(--hud-h,0px)] grid-cols-3 gap-2">
            {SERVER_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={serverTab === t.id}
                data-server-tab={t.id}
                onClick={() => setServerTab(t.id)}
                className={`min-h-12 border-2 px-1 font-pixel text-[0.5rem] leading-4 ${serverTab === t.id ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {research && open && serverTab === "home" && (
          <div data-server-home className="mt-2 space-y-2">
            <p className="break-words font-term text-base leading-5 text-[var(--game-muted)]">
              Home PC parts (boards, CPUs, memory, cases, power supplies, sound and video) go on the PC Build Bench. Its PC makes R&amp;D points too.
            </p>
            {facilityUnlocked(state, "bench") ? (
              <Link to="/facilities/$facilityId" params={{ facilityId: "bench" }} data-server-bench-link className="flex min-h-12 items-center justify-center border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.55rem] text-black shadow-[3px_3px_0_0_#000]">
                PC BUILD BENCH &gt;
              </Link>
            ) : (
              <p aria-disabled="true" data-server-bench-locked className="border-2 border-[var(--game-border)] p-2 font-pixel text-[0.5rem] leading-4 text-[var(--game-dim)] opacity-60">
                PC BUILD BENCH · {facilityNeed("bench")} · COMING SOON
              </p>
            )}
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

const SERVER_TABS = [
  { id: "machines", label: "SERVER MACHINES", kinds: ["tabulator", "server"] },
  { id: "room", label: "ROOM EQUIPMENT", kinds: ["power", "cool", "disk", "link"] },
  { id: "home", label: "HOME PC PARTS", kinds: [] },
];

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

export default function FacilitiesPage({ facilityId }) {
  const { state, buyFacilityPart, rebuildFacilities, toggleBenchOc, noteTutorialPage, markReadyView } = useGameState();
  const facility = FACILITIES.find((item) => item.id === facilityId);
  const business = businessIncomePerSecond(state, Date.now());
  const report = facilityReport(state, business);
  const plantsOpen = facilitiesOpen(state);
  const location = useLocation();
  const navigate = useNavigate();
  // The bench's saved PCs (the old RIGS garage) are its SAVED BUILDS tab (T3 item 27).
  const benchView = facilityId === "bench" && (location.hash || "").replace("#", "") === "saved" ? "saved" : "build";
  const next = plantsOpen ? nextPurchase(state, business) : null;
  useEffect(() => {
    if (facilityId === "servers") noteTutorialPage?.("servers");
  }, [facilityId, noteTutorialPage]);
  useEffect(() => { markReadyView?.("hq", `${facilityId}:`); }, [markReadyView, facilityId, state.techDone]);
  if (!facility) return <Navigate to={HUB_ROUTE} replace />;
  const showRebuild = facilityId === "mine" || facilityId === "cluster";
  const showNext = showRebuild && plantsOpen && next;
  return (
    <ScreenShell title={facility.name} subtitle={facility.blurb} backTo={HUB_ROUTE} crumbVia="HARDWARE">
      {facilityId === "bench" && (
        <SubTabs
          tabs={[{ id: "build", label: "BUILD" }, { id: "saved", label: "SAVED BUILDS" }]}
          active={benchView}
          onPick={(id) => navigate({ to: "/facilities/$facilityId", params: { facilityId: "bench" }, hash: id === "saved" ? "saved" : "", replace: true })}
          name="bench"
        />
      )}
      {benchView === "saved" ? (
        <Embedded><RigsGarage /></Embedded>
      ) : (
      <>
      <FacilityRoom facilityId={facility.id} state={state} />
      {roomJob(state, facility.id) && (
        <div data-room-building className="status-frame p-3">
          <StageBar job={roomJob(state, facility.id)} kind="room" title={`BUILDING THE ${facility.name.toUpperCase()}`} />
          <p className="mt-1 font-term text-base leading-5 text-[#9690ac]">The crew keeps working while the app is closed. Parts can go in once it is built.</p>
        </div>
      )}
      <RoomStatus
        facilityId={facility.id}
        state={state}
        locked={!facilityUnlocked(state, facility.id) && facility.id !== "servers"}
        summary={facility.id === "servers" ? `+${rate(serverOutput(state).perSecond - serverOutput(state).bench)} R&D/s` : facility.id === "bench" ? `+${rate(report.bench.perSecond)} R&D/s` : `${money(report[facility.id]?.perSecond || 0)}/s`}
      />
      {facilityId === "servers" && (
        <Link to="/research" data-servers-rd className="flex min-h-12 items-center justify-between border-2 border-[var(--game-accent)] bg-[var(--game-panel)] px-3 font-pixel text-[0.55rem] text-[var(--game-accent)] shadow-[3px_3px_0_0_#000]">
          <span>R&amp;D: SPEND THESE POINTS</span>
          <span>&gt;</span>
        </Link>
      )}
      {showRebuild && plantsOpen && (
        <p className="break-words px-1 font-term text-base leading-5 text-[var(--game-muted)]">
          Both plants together pay {money(report.perSecond)}/s, {percent(report.share)} of the businesses. Short power or cooling throttles the cards. The cluster also needs enough memory for its model.
        </p>
      )}
      {showNext && (
        <p data-next-part className="break-words px-1 font-term text-base leading-5 text-[var(--game-accent)]">
          {`Best next part: ${next.name} for the ${next.facilityId === "mine" ? "mine" : "cluster"}${next.extras?.length ? `, with ${extrasText(next.extras)} to run it` : ""}, ${money(next.bundleCost || next.cost)}${next.payback ? `; pays for itself in about ${Math.max(1, Math.round(next.payback / 60))} min` : " to get it running"}.`}
        </p>
      )}
      {showRebuild && <RebuildPanel state={state} onRebuild={rebuildFacilities} />}
      <Plant facility={facility} state={state} report={report} business={business} cash={state.cash || 0} onBuy={buyFacilityPart} next={next} onToggleOc={toggleBenchOc} />
      </>
      )}
    </ScreenShell>
  );
}
