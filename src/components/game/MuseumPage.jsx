import { useEffect, useState } from "react";
import { partLock } from "@/lib/facilities";
import { museumRows } from "@/lib/history";
import {
  ROOMS,
  STATUS_LABEL,
  WINGS,
  WING_TAB,
  decadeCounts,
  museumDecades,
  roomCounts,
  roomExhibits,
  roomFilters,
  roomHasNew,
  roomOf,
  sortExhibits,
  todayInHistory,
  wingCounts,
  wingHasNew,
} from "@/lib/museum";
import { readPrefs, writePrefs } from "@/lib/gamePrefs";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";
import MuseumSection from "./MuseumSection";

function chipClass({ on, gold, grey }) {
  return `relative shrink-0 min-h-11 overflow-visible whitespace-nowrap border-2 px-2 py-1 text-center font-pixel text-[8px] leading-4 shadow-[3px_3px_0_0_#000] ${
    grey
      ? "border-[var(--game-border)] text-[var(--game-dim)] opacity-60"
      : gold
        ? "border-[#e6c15a] bg-[#e6c15a]/10 text-[#e6c15a]"
        : on
          ? "border-[var(--game-accent)] text-[var(--game-accent)]"
          : "border-[var(--game-border-strong)] text-[var(--game-muted)]"
  }`;
}

const STATUS_COLOR = {
  owned: "border-[var(--game-accent)] text-[var(--game-accent)]",
  open: "border-[var(--game-violet)] text-[var(--game-violet)]",
  retired: "border-[var(--game-border-strong)] text-[var(--game-muted)]",
  seen: "border-[var(--game-violet)] text-[var(--game-violet)]",
  locked: "border-[var(--game-border)] text-[var(--game-dim)]",
};

function historyCounts(state) {
  const rows = museumRows(state);
  return rows.reduce((sum, row) => ({ found: sum.found + row.cards.filter((c) => c.found).length, total: sum.total + row.cards.length }), { found: 0, total: 0 });
}

function markViewed(id, viewed, setViewed) {
  if (!id || viewed.includes(id)) return;
  const next = writePrefs({ museumViewed: [...viewed, id] });
  setViewed(next.museumViewed);
}

// The Hardware Museum: decade chips, a four-tab section bar, scrolling room
// chips, and a grid of icons. Locked pieces show as silhouettes of the real
// icon. View-only: looking never changes the empire save.
export default function MuseumPage({ top = null }) {
  const { state } = useGameState();
  const [wingId, setWingId] = useState("parts");
  const wing = WINGS.find((w) => w.id === wingId) || WINGS[0];
  const [roomByWing, setRoomByWing] = useState({});
  const roomId = roomByWing[wing.id] || wing.rooms[0]?.id || null;
  const [decade, setDecade] = useState(null);
  const [maker, setMaker] = useState(null);
  const [sort, setSort] = useState("year");
  const [open, setOpen] = useState(null);
  const [viewed, setViewed] = useState(() => readPrefs().museumViewed || []);

  const pickWing = (id) => {
    setWingId(id);
    setMaker(null);
  };
  const pickRoom = (id) => {
    setRoomByWing((m) => ({ ...m, [wing.id]: id }));
    setMaker(null);
  };

  const filter = { decade };
  const hardwareWings = WINGS.filter((w) => w.rooms.length);
  const hardware = hardwareWings.reduce(
    (sum, w) => {
      const c = wingCounts(state, w, filter);
      return { found: sum.found + c.found, total: sum.total + c.total };
    },
    { found: 0, total: 0 },
  );
  const visit = (item) => {
    const room = roomOf(item);
    const where = ROOMS.find((r) => r.id === room);
    if (!where) return;
    setWingId(where.wing);
    setRoomByWing((m) => ({ ...m, [where.wing]: room }));
    setMaker(null);
    setOpen(item.id);
  };
  const history = todayInHistory(state, Date.now());
  const filters = roomId ? roomFilters(state, roomId) : { decades: [], makers: [] };
  const exhibits = sortExhibits(roomId ? roomExhibits(state, roomId, { decade, maker }) : [], sort);
  const decades = museumDecades();
  const wingProgress = wing.id === "history" ? historyCounts(state) : wingCounts(state, wing, filter);
  const hist = historyCounts(state);

  useEffect(() => {
    if (!open) return;
    const entry = (roomId ? roomExhibits(state, roomId) : []).find((e) => e.item.id === open);
    if (entry && entry.status !== "locked") markViewed(open, viewed, setViewed);
  }, [open, roomId, state, viewed]);

  return (
    <ScreenShell title={"HARDWARE\nMUSEUM"} subtitle="">
      {top}
      <section data-hw-museum className="space-y-3">
        <div data-museum-decades className="museum-chip-row flex flex-nowrap gap-2 overflow-x-auto pb-1">
          <button type="button" data-decade="all" onClick={() => setDecade(null)} className={chipClass({ on: decade == null })}>
            ALL
            <span className="block text-[var(--game-dim)]">{hardware.found}/{hardware.total}</span>
          </button>
          {decades.map((d) => {
            const c = decadeCounts(state, d);
            const empty = c.total === 0;
            return (
              <button
                key={d}
                type="button"
                data-decade={d}
                data-decade-empty={empty ? "1" : undefined}
                onClick={() => setDecade(d)}
                className={chipClass({ on: decade === d, grey: empty })}
              >
                {d}s
                <span className={`block ${empty ? "text-[var(--game-dim)]" : "text-[var(--game-dim)]"}`}>{empty ? "COMING SOON" : `${c.found}/${c.total}`}</span>
              </button>
            );
          })}
        </div>

        <div data-museum-wings className="grid grid-cols-4 gap-1 min-[360px]:gap-2">
          {WINGS.map((w) => {
            const c = w.rooms.length ? wingCounts(state, w, filter) : hist;
            const fresh = w.rooms.length ? wingHasNew(state, w, viewed, filter) : false;
            return (
              <button key={w.id} type="button" data-wing={w.id} onClick={() => pickWing(w.id)} className={`${chipClass({ on: w.id === wing.id })} min-w-0 w-full overflow-visible whitespace-nowrap px-0.5 text-[8px] leading-4`}>
                {fresh ? <span data-new-dot className="museum-new-dot" /> : null}
                {WING_TAB[w.id] || w.name}
                <span className="block text-[var(--game-dim)]">{c.found}/{c.total}</span>
              </button>
            );
          })}
        </div>

        {wing.id === "history" ? (
          <>
            {history.entries.length > 0 && (
              <div data-today className="border-2 border-[var(--game-violet-border)] bg-[var(--game-card)] p-2">
                <p className="font-pixel text-[0.5rem] text-[var(--game-violet)]">{history.today ? "TODAY IN HISTORY" : "COMING UP IN HISTORY"}</p>
                {history.entries.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    data-today-item={e.id}
                    onClick={() => visit(e.item)}
                    className="mt-1 flex w-full min-h-11 items-center gap-2 text-left"
                  >
                    <img src={e.item.icon} alt="" className={`h-10 w-10 shrink-0 border-2 border-[var(--game-border)] bg-black object-contain ${e.found ? "" : "museum-sil"}`} />
                    <span className="min-w-0 break-words font-term text-lg leading-6 text-[var(--game-fg)]">
                      {new Date(Date.UTC(2000, e.month - 1, e.day)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}, {e.year}:{" "}
                      {e.found ? e.text : "a piece you haven't found yet came out"}.
                    </span>
                  </button>
                ))}
              </div>
            )}
            <MuseumSection state={state} />
          </>
        ) : (
          <>
            <div data-museum-rooms className="museum-chip-row flex flex-nowrap gap-2 overflow-x-auto pb-1">
              {wing.rooms.map((room) => {
                const c = roomCounts(state, room.id, filter);
                const done = c.total > 0 && c.found === c.total;
                const empty = c.total === 0;
                const fresh = roomHasNew(state, room.id, viewed, filter);
                return (
                  <button
                    key={room.id}
                    type="button"
                    data-room={room.id}
                    data-room-complete={done ? "1" : undefined}
                    data-room-empty={empty ? "1" : undefined}
                    data-room-new={fresh ? "1" : undefined}
                    onClick={() => pickRoom(room.id)}
                    className={chipClass({ on: room.id === roomId, gold: done, grey: empty })}
                  >
                    {fresh ? <span data-new-dot className="museum-new-dot" /> : null}
                    {room.name}
                    <span className={`block ${done ? "text-[#e6c15a]" : "text-[var(--game-dim)]"}`}>
                      {empty ? "COMING SOON" : done ? `★ ${c.total}/${c.total}` : `${c.found}/${c.total}`}
                    </span>
                  </button>
                );
              })}
            </div>
            <div data-museum-progress className="flex items-center gap-2">
              <div className="museum-progress h-2 min-w-0 flex-1 border-2 border-[var(--game-border-strong)] bg-black">
                <div
                  className="h-full bg-[var(--game-accent)]"
                  style={{ width: `${wingProgress.total ? Math.round((100 * wingProgress.found) / wingProgress.total) : 0}%` }}
                />
              </div>
              <p className="shrink-0 font-pixel text-[0.4rem] leading-3 text-[var(--game-muted)]">
                {wingProgress.found}/{wingProgress.total}
              </p>
              <div data-museum-sort className="flex shrink-0 gap-1">
                <button type="button" data-sort="year" onClick={() => setSort("year")} className={chipClass({ on: sort === "year" })}>
                  YEAR
                </button>
                <button type="button" data-sort="owned" onClick={() => setSort("owned")} className={chipClass({ on: sort === "owned" })}>
                  OWNED FIRST
                </button>
              </div>
            </div>
            {filters.makers.length > 1 && (
              <label className="flex items-center gap-2 font-pixel text-[0.45rem] text-[var(--game-muted)]">
                MAKER
                <select
                  data-museum-maker
                  value={maker || ""}
                  onChange={(e) => setMaker(e.target.value || null)}
                  className="min-h-11 min-w-0 flex-1 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] px-2 font-term text-lg text-[var(--game-fg)]"
                >
                  <option value="">Every maker</option>
                  {filters.makers.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
            )}
            <div data-museum-grid className="grid grid-cols-4 gap-2 min-[480px]:grid-cols-6">
              {exhibits.map(({ item, status }) => {
                const locked = status === "locked";
                const fresh = !locked && !viewed.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-exhibit={item.id}
                    data-status={status}
                    onClick={() => setOpen(item.id)}
                    aria-label={locked ? `Locked exhibit from ${item.year}` : item.name}
                    className={`relative min-w-0 border-2 bg-black p-1 ${locked ? "border-[var(--game-border)]" : status === "owned" ? "border-[#e6c15a]" : "border-[var(--game-border-strong)]"}`}
                  >
                    {fresh ? <span data-new-dot className="museum-new-dot" /> : null}
                    <img src={item.icon} alt="" className={`aspect-square w-full object-contain ${locked ? "museum-sil" : status === "retired" ? "grayscale" : ""}`} />
                    <span className="block font-pixel text-[0.4rem] leading-3 text-[var(--game-muted)]">{locked ? `${Math.floor(item.year / 10) * 10}s` : item.year}</span>
                  </button>
                );
              })}
            </div>
            {!exhibits.length && <p className="font-term text-lg text-[var(--game-muted)]">{decade != null ? "Coming soon." : "Nothing here for that filter."}</p>}
          </>
        )}
      </section>
      {open && <ExhibitSheet state={state} id={open} roomId={roomId} onClose={() => setOpen(null)} />}
    </ScreenShell>
  );
}

function ExhibitSheet({ state, id, roomId, onClose }) {
  const entry = roomExhibits(state, roomId).find((e) => e.item.id === id);
  if (!entry) return null;
  const { item, status, maker } = entry;
  const locked = status === "locked";
  const why = locked ? (item.museumOnly ? `Opens in ${item.year}.` : partLock(state, item)) : null;
  return (
    <div
      role="dialog"
      aria-label={locked ? "Locked exhibit" : item.name}
      data-exhibit-sheet={item.id}
      className="hint-sheet fixed z-40 mx-auto max-w-md border-4 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[6px_6px_0_0_#000]"
    >
      <div className="flex gap-3">
        <img src={item.icon} alt="" className={`h-24 w-24 shrink-0 border-2 border-[var(--game-border)] bg-black object-contain ${locked ? "museum-sil" : status === "retired" ? "grayscale" : ""}`} />
        <div className="min-w-0">
          <p className={`inline-block border-2 px-1 font-pixel text-[0.45rem] leading-4 ${STATUS_COLOR[status]}`}>{STATUS_LABEL[status]}</p>
          <h2 className="mt-1 break-words font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{locked ? "???" : item.name}</h2>
          <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
            {locked ? `${Math.floor(item.year / 10) * 10}s` : item.year}
            {!locked && maker ? ` · ${maker}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-2 break-words font-term text-lg leading-6 text-[var(--game-fg)]">{locked ? why : item.spec.replace(/^\d{4}: /, "").replace(/^./, (c) => c.toUpperCase())}</p>
      <div className="mt-2 flex justify-end">
        <button type="button" data-exhibit-close onClick={onClose} className="min-h-11 border-2 border-[var(--game-border-strong)] px-3 font-pixel text-[0.5rem] text-[var(--game-fg)] shadow-[3px_3px_0_0_#000]">
          CLOSE
        </button>
      </div>
    </div>
  );
}
