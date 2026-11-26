// Room status panel (T5 item 53): below each room scene, one bar per thing
// the room runs on (compute, storage, heat, power, ...), each with a white
// marker at its limit. A bar past its limit turns red with a boxed alert
// naming what to add. Display only; mockup A (ingame_status_A_clean_v2).
import { roomStatus } from "@/lib/roomStatus";

const TONES = { blue: "#5698ec", green: "#56ce74", orange: "#ec9a4e", yellow: "#ecc84e", red: "#e24a4a" };

// 10x10 pixel icons, drawn after the mockup's (a chip, a disk platter, a
// flame, a lightning bolt, a memory stick, a network plug).
function StatIcon({ kind, color }) {
  const p = { fill: color };
  return (
    <svg viewBox="0 0 10 10" width="20" height="20" shapeRendering="crispEdges" aria-hidden="true" className="shrink-0">
      {kind === "cpu" && (
        <>
          <rect x="2" y="2" width="6" height="6" {...p} />
          <rect x="4" y="4" width="2" height="2" fill="#0a0812" />
          {[3, 5, 7].map((i) => (
            <g key={i}>
              <rect x={i - 0.5} y="0" width="1" height="1.5" {...p} />
              <rect x={i - 0.5} y="8.5" width="1" height="1.5" {...p} />
              <rect x="0" y={i - 0.5} width="1.5" height="1" {...p} />
              <rect x="8.5" y={i - 0.5} width="1.5" height="1" {...p} />
            </g>
          ))}
        </>
      )}
      {kind === "disk" && (
        <>
          <rect x="2" y="1" width="6" height="8" {...p} />
          <rect x="1" y="2" width="8" height="6" {...p} />
          <rect x="4" y="4" width="2" height="2" fill="#0a0812" />
        </>
      )}
      {kind === "heat" && (
        <>
          <rect x="4" y="0" width="2" height="2" {...p} />
          <rect x="3" y="2" width="4" height="2" {...p} />
          <rect x="2" y="4" width="6" height="4" {...p} />
          <rect x="3" y="8" width="4" height="2" {...p} />
          <rect x="4" y="5" width="2" height="3" fill="#f0c45a" />
        </>
      )}
      {kind === "bolt" && (
        <>
          <rect x="5" y="0" width="3" height="2" {...p} />
          <rect x="4" y="2" width="3" height="2" {...p} />
          <rect x="2" y="4" width="6" height="2" {...p} />
          <rect x="4" y="6" width="3" height="2" {...p} />
          <rect x="3" y="8" width="2" height="2" {...p} />
        </>
      )}
      {kind === "ram" && (
        <>
          <rect x="0" y="2" width="10" height="5" {...p} />
          <rect x="1" y="3" width="2" height="2" fill="#0a0812" />
          <rect x="4" y="3" width="2" height="2" fill="#0a0812" />
          <rect x="7" y="3" width="2" height="2" fill="#0a0812" />
          {[1, 3, 5, 7].map((x) => <rect key={x} x={x} y="7" width="1" height="2" {...p} />)}
        </>
      )}
      {kind === "link" && (
        <>
          <rect x="1" y="1" width="8" height="5" {...p} />
          <rect x="3" y="3" width="4" height="2" fill="#0a0812" />
          <rect x="4" y="6" width="2" height="3" {...p} />
          <rect x="1" y="8" width="8" height="1" {...p} />
        </>
      )}
    </svg>
  );
}

function StatusBar({ b }) {
  const color = b.bad ? TONES.red : TONES[b.tone] || TONES.blue;
  const empty = b.value <= 0 && b.limit <= 0;
  return (
    <div data-status-bar={b.id} data-bad={b.bad ? "" : undefined}>
      <div className="flex items-center gap-2">
        <StatIcon kind={b.icon} color={color} />
        <span className="font-status text-base font-bold leading-5">{b.label}</span>
        <span data-status-value className={`ml-auto text-right font-status text-sm leading-5 ${b.bad ? "text-[#ffb4b4]" : "text-[#9690ac]"}`}>{b.text}</span>
      </div>
      <div className="relative mt-1 mb-3">
        <div className="status-track h-4 w-full overflow-hidden">
          {!empty && <div className="status-fill h-full" style={{ width: `${Math.min(100, b.fill * 100)}%`, backgroundColor: color }} />}
        </div>
        {!empty && b.limit > 0 && (
          <div data-status-mark aria-hidden="true" className="pointer-events-none absolute -top-0.5" style={{ left: `calc(${(b.mark * 100).toFixed(2)}% - 1.5px)` }}>
            <div className="h-[22px] w-[3px] bg-white" />
            <div className="-ml-[4px] h-0 w-0 border-x-[5.5px] border-b-[6px] border-x-transparent border-b-white" />
          </div>
        )}
      </div>
      {b.alert && (
        <p data-status-alert role="status" className="mb-2 border-2 border-[#e24a4a] bg-[#46161e] px-2 py-1 font-status text-sm leading-5 text-[#ffb4b4]">
          ! {b.alert}
        </p>
      )}
    </div>
  );
}

export default function RoomStatus({ facilityId, state, summary, locked = false }) {
  const status = roomStatus(state, facilityId);
  return (
    <section data-room-status={facilityId} data-locked={locked ? "" : undefined} aria-label="Room status" className={`status-frame p-3 ${locked ? "opacity-60" : ""}`}>
      <div className="flex items-baseline gap-2 border-b border-[#7060a4] pb-2">
        <h3 className="font-status text-lg font-bold leading-6">ROOM STATUS</h3>
        <span data-status-summary className="ml-auto text-right font-status text-sm leading-5 text-[#56ce74]">
          {locked ? "COMING SOON" : `${status.online.toLocaleString("en-US")} online${status.installing ? ` · ${status.installing} installing` : ""}${summary ? `  ${summary}` : ""}`}
        </span>
      </div>
      <div className="mt-3">
        {status.bars.map((b) => (
          <StatusBar key={b.id} b={locked ? { ...b, alert: null, bad: false } : b} />
        ))}
      </div>
    </section>
  );
}

// Per-machine spec bars (T5 item 54): log-scale bars from the real model's
// figures, compact enough for a part card.
const SPEC_TONES = { speed: TONES.blue, memory: TONES.green, storage: "#9a7ee8", power: TONES.yellow, heat: TONES.orange };
const SPEC_ICONS = { speed: "cpu", memory: "ram", storage: "disk", power: "bolt", heat: "heat" };

export function MachineSpecBars({ bars, real }) {
  if (!bars?.length) return null;
  return (
    <div data-spec-bars className="status-frame mt-2 px-2 py-1.5">
      {real && <p data-spec-real className="mb-1 font-status text-xs leading-4 text-[#9690ac]">Real model: {real}</p>}
      {bars.map((b) => (
        <div key={b.id} data-spec-bar={b.id} className="flex items-center gap-1.5 py-0.5">
          <StatIcon kind={SPEC_ICONS[b.id]} color={SPEC_TONES[b.id]} />
          <span className="w-[4.5rem] shrink-0 font-status text-xs font-bold leading-4">{b.label}</span>
          <div className="status-track h-3 min-w-0 flex-1 overflow-hidden">
            <div className="status-fill h-full" style={{ width: `${(b.frac * 100).toFixed(1)}%`, backgroundColor: SPEC_TONES[b.id] }} />
          </div>
          <span data-spec-value className="w-[4.75rem] shrink-0 text-right font-status text-xs leading-4 text-[#ece8f6]">{b.text}</span>
        </div>
      ))}
    </div>
  );
}
