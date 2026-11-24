import { useState } from "react";
import { partLock } from "@/lib/facilities";
import { ROOMS, STATUS_LABEL, WINGS, roomCounts, roomExhibits, roomFilters, roomOf, todayInHistory, wingCounts } from "@/lib/museum";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";
import MuseumSection from "./MuseumSection";
import RecordsSection from "./RecordsSection";

const chip = (on) =>
  `min-h-11 border-2 px-2 py-1 text-center font-pixel text-[0.45rem] leading-4 shadow-[3px_3px_0_0_#000] ${
    on ? "border-[var(--game-accent)] text-[var(--game-accent)]" : "border-[var(--game-border-strong)] text-[var(--game-muted)]"
  }`;

const STATUS_COLOR = {
  owned: "border-[var(--game-accent)] text-[var(--game-accent)]",
  open: "border-[var(--game-violet)] text-[var(--game-violet)]",
  retired: "border-[var(--game-border-strong)] text-[var(--game-muted)]",
  seen: "border-[var(--game-violet)] text-[var(--game-violet)]",
  locked: "border-[var(--game-border)] text-[var(--game-dim)]",
};

// The Hardware Museum: wings of rooms, each an icon grid of every piece of
// hardware in the game. Locked pieces show as silhouettes. View-only.
export default function MuseumPage({ top = null }) {
  const { state } = useGameState();
  const [wingId, setWingId] = useState("parts");
  const wing = WINGS.find((w) => w.id === wingId) || WINGS[0];
  const [roomByWing, setRoomByWing] = useState({});
  const roomId = roomByWing[wing.id] || wing.rooms[0]?.id || null;
  const [decade, setDecade] = useState(null);
  const [maker, setMaker] = useState(null);
  const [open, setOpen] = useState(null);

  const pickWing = (id) => {
    setWingId(id);
    setDecade(null);
    setMaker(null);
  };
  const pickRoom = (id) => {
    setRoomByWing((m) => ({ ...m, [wing.id]: id }));
    setDecade(null);
    setMaker(null);
  };

  const hardware = WINGS.filter((w) => w.rooms.length).reduce(
    (sum, w) => {
      const c = wingCounts(state, w);
      return { found: sum.found + c.found, total: sum.total + c.total };
    },
    { found: 0, total: 0 },
  );
  // Jump to an exhibit from the Today in History card.
  const visit = (item) => {
    const room = roomOf(item);
    const where = ROOMS.find((r) => r.id === room);
    if (!where) return;
    setWingId(where.wing);
    setRoomByWing((m) => ({ ...m, [where.wing]: room }));
    setDecade(null);
    setMaker(null);
    setOpen(item.id);
  };
  const history = todayInHistory(state, Date.now());
  const filters = roomId ? roomFilters(state, roomId) : { decades: [], makers: [] };
  const exhibits = roomId ? roomExhibits(state, roomId, { decade, maker }) : [];

  return (
    <ScreenShell title={"HARDWARE\nMUSEUM"} subtitle="">
      {top}
      <section data-hw-museum className="space-y-3">
        <p className="font-pixel text-sm text-[var(--game-accent)]">{hardware.found} / {hardware.total} EXHIBITS</p>
        <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
          Every piece of hardware in the game, oldest first. Pieces open as you reach their years and research them. Company names are parody; models, years and specs are real.
        </p>
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
                <img src={e.item.icon} alt="" className={`h-10 w-10 shrink-0 border-2 border-[var(--game-border)] bg-black object-contain ${e.found ? "" : "brightness-0 invert opacity-20"}`} />
                <span className="min-w-0 break-words font-term text-lg leading-6 text-[var(--game-fg)]">
                  {new Date(Date.UTC(2000, e.month - 1, e.day)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}, {e.year}:{" "}
                  {e.found ? e.text : "a piece you haven't found yet came out"}.
                </span>
              </button>
            ))}
          </div>
        )}
        <div data-museum-wings className="grid grid-cols-2 gap-2">
          {WINGS.map((w) => {
            const c = w.rooms.length ? wingCounts(state, w) : null;
            return (
              <button key={w.id} type="button" data-wing={w.id} onClick={() => pickWing(w.id)} className={chip(w.id === wing.id)}>
                {w.name}
                {c && <span className="block text-[var(--game-dim)]">{c.found}/{c.total}</span>}
              </button>
            );
          })}
        </div>

        {wing.id === "history" ? (
          <MuseumSection state={state} />
        ) : wing.id === "records" ? (
          <RecordsSection state={state} />
        ) : (
          <>
            <div data-museum-rooms className="grid grid-cols-3 gap-2">
              {wing.rooms.map((room) => {
                const c = roomCounts(state, room.id);
                const done = c.total > 0 && c.found === c.total;
                return (
                  <button key={room.id} type="button" data-room={room.id} data-room-complete={done ? "1" : undefined} onClick={() => pickRoom(room.id)} className={chip(room.id === roomId)}>
                    {room.name}
                    <span className={`block ${done ? "text-[var(--game-success)]" : "text-[var(--game-dim)]"}`}>{done ? `★ ${c.total}/${c.total}` : `${c.found}/${c.total}`}</span>
                  </button>
                );
              })}
            </div>
            {filters.decades.length > 1 && (
              <div data-museum-decades className="flex flex-wrap gap-2">
                <button type="button" onClick={() => setDecade(null)} className={chip(decade == null)}>ALL</button>
                {filters.decades.map((d) => (
                  <button key={d} type="button" data-decade={d} onClick={() => setDecade(d)} className={chip(decade === d)}>
                    {d}s
                  </button>
                ))}
              </div>
            )}
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
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-exhibit={item.id}
                    data-status={status}
                    onClick={() => setOpen(item.id)}
                    aria-label={locked ? `Locked exhibit from ${item.year}` : item.name}
                    className={`min-w-0 border-2 bg-black p-1 ${locked ? "border-[var(--game-border)]" : status === "owned" ? "border-[var(--game-accent)]" : "border-[var(--game-border-strong)]"}`}
                  >
                    <img src={item.icon} alt="" className={`aspect-square w-full object-contain ${locked ? "brightness-0 invert opacity-20" : status === "retired" ? "grayscale" : ""}`} />
                    <span className="block font-pixel text-[0.4rem] leading-3 text-[var(--game-muted)]">{locked ? `${Math.floor(item.year / 10) * 10}s` : item.year}</span>
                  </button>
                );
              })}
            </div>
            {!exhibits.length && <p className="font-term text-lg text-[var(--game-muted)]">Nothing here for that filter.</p>}
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
        <img src={item.icon} alt="" className={`h-24 w-24 shrink-0 border-2 border-[var(--game-border)] bg-black object-contain ${locked ? "brightness-0 invert opacity-20" : status === "retired" ? "grayscale" : ""}`} />
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
