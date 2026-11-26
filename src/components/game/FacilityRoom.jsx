import { useEffect, useRef, useState } from "react";
import { isPageHidden } from "@/lib/pageVisibility";
import { PREFS_EVENT, readPrefs } from "@/lib/gamePrefs";
import {
  pickPlacements,
  pickBase,
  resolveMonitorMode,
  monitorFlickerKind,
  resolveServersStage,
  roomFor,
} from "@/lib/rooms";

const FLICKER = {
  green: [1, 0.58, 0.48],
  amber: [1, 0.58, 0.48],
  color: [1, 0.46, 0.36],
  lcd_oled: [1],
};

function useReducedMotion() {
  const [reduce, setReduce] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);
  return reduce;
}

function useMonitorPref() {
  const [pref, setPref] = useState(() => (typeof window !== "undefined" ? readPrefs().monitorDisplay : "era"));
  useEffect(() => {
    const on = () => setPref(readPrefs().monitorDisplay);
    window.addEventListener(PREFS_EVENT, on);
    return () => window.removeEventListener(PREFS_EVENT, on);
  }, []);
  return pref;
}

// 24-frame, 70 ms loop. Pauses when the page is hidden, the room is off-screen,
// or the player asked for reduced motion (holds frame 0).
function useRoomFrame(animate, durationMs, frames) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [frame, setFrame] = useState(0);
  const [onScreen, setOnScreen] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver !== "function") return undefined;
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!animate || reduce || frames <= 1) {
      setFrame(0);
      return undefined;
    }
    // Off-screen: no timer at all (T5 item 45, battery). On screen: wake once
    // per frame step instead of every display frame, and stop while hidden.
    if (!onScreen) return undefined;
    let timer = 0;
    let current = 0;
    const step = () => {
      timer = 0;
      if (isPageHidden()) return;
      current = (current + 1) % frames;
      setFrame(current);
      timer = setTimeout(step, durationMs);
    };
    const onVis = () => {
      if (!isPageHidden() && !timer) timer = setTimeout(step, durationMs);
    };
    timer = setTimeout(step, durationMs);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [animate, durationMs, frames, reduce, onScreen]);
  return { frame, ref, reduce };
}

// A soft pixel shadow under the machines that stand on the server room floor,
// so they sit on it instead of floating (item 1).
const FLOOR_SHADOW = "/rooms/shared/floor-shadow.png";
function standsOnFloor(room, slot, variant) {
  if (room.facilityId !== "servers" || !variant.sprite || !variant.unlockId) return false;
  if (/^l-/.test(variant.unlockId)) return false;
  const bottom = variant.y + variant.h;
  return bottom >= 125 && bottom <= 192 && variant.h >= 24;
}

function layerStyle(x, y, w, h, room) {
  return {
    left: `${(x / room.width) * 100}%`,
    top: `${(y / room.height) * 100}%`,
    width: `${(w / room.width) * 100}%`,
    height: `${(h / room.height) * 100}%`,
  };
}

function FlickerScreen({ screen, kind, frame, reduce, room, screenKey }) {
  const steps = FLICKER[kind] || FLICKER.color;
  const brightness = reduce || steps.length <= 1 ? 1 : steps[frame % steps.length];
  return (
    <img
      src={screen.sprite}
      alt=""
      data-room-screen={screenKey}
      className="facility-room-layer pixel-art"
      style={{ ...layerStyle(screen.x, screen.y, screen.w, screen.h, room), opacity: brightness, zIndex: 35 }}
      draggable={false}
    />
  );
}

function LayeredRoom({ room, state }) {
  const pref = useMonitorPref();
  const anyAnim = (room.slots || []).some((s) => (s.variants || []).some((v) => v.animation));
  const duration = 70;
  const frames = 24;
  const { frame, ref, reduce } = useRoomFrame(anyAnim, duration, frames);

  // Worked out on every render. `state` is one object the game changes in
  // place, so a memo keyed on it never refreshed: the base art swapped with
  // the era but the machines stayed as they were until the app reopened
  // (items 2 and 49).
  const drawn = [];
  const ctx = room.facilityId === "servers" ? { stage: resolveServersStage(state) } : {};
  for (const slot of [...(room.slots || [])].sort((a, b) => (a.z || 0) - (b.z || 0))) {
    for (const variant of pickPlacements(state, slot, room.facilityId, ctx)) {
      drawn.push({ slot, variant });
    }
  }

  const base = pickBase(room, state);

  return (
    <div ref={ref} data-facility-room={room.facilityId} className="facility-room" style={{ aspectRatio: `${room.width} / ${room.height}` }}>
      <img
        src={base.sprite}
        alt=""
        className="facility-room-layer pixel-art"
        style={{ left: 0, top: 0, width: "100%", height: "100%", zIndex: 0 }}
        draggable={false}
      />
      {drawn.map(({ slot, variant }) => {
        const z = slot.z || variant.z || 1;
        const anim = variant.animation;
        const nodes = [];
        if (standsOnFloor(room, slot, variant)) {
          nodes.push(
            <img
              key={`${slot.id}-${variant.x}-${variant.y}-shadow`}
              src={FLOOR_SHADOW}
              alt=""
              data-room-shadow={slot.id}
              className="facility-room-layer pixel-art"
              style={{ ...layerStyle(variant.x - variant.w * 0.04, variant.y + variant.h - 4, variant.w * 1.08, 8, room), zIndex: z }}
              draggable={false}
            />,
          );
        }
        if (anim?.kind === "strip" && variant.strip) {
          const fw = variant.w;
          const fh = variant.h;
          const n = anim.frames || frames;
          const show = (reduce ? 0 : frame) % n;
          nodes.push(
            <div
              key={`${slot.id}-${variant.x}-${variant.y}`}
              data-room-slot={slot.id}
              data-room-unlock={variant.unlockId || undefined}
              className="facility-room-layer facility-room-strip pixel-art"
              style={{
                ...layerStyle(variant.x, variant.y, fw, fh, room),
                zIndex: z,
                overflow: "hidden",
              }}
            >
              <img
                src={variant.strip}
                alt=""
                draggable={false}
                className="pixel-art"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: `${n * 100}%`,
                  maxWidth: "none",
                  transform: `translateX(-${(show * 100) / n}%)`,
                  imageRendering: "pixelated",
                }}
              />
            </div>,
          );
        } else if (variant.sprite) {
          nodes.push(
            <img
              key={`${slot.id}-${variant.x}-${variant.y}`}
              src={variant.sprite}
              alt=""
              data-room-slot={slot.id}
              data-room-unlock={variant.unlockId || undefined}
              className="facility-room-layer pixel-art"
              style={{ ...layerStyle(variant.x, variant.y, variant.w, variant.h, room), zIndex: z }}
              draggable={false}
            />,
          );
        }
        if (variant.screenVariants) {
          const mode = resolveMonitorMode(pref, variant.eraDefault);
          const screen = variant.screenVariants[mode] || variant.screenVariants[variant.eraDefault] || variant.screenVariants.color;
          if (screen) {
            const mon = room.monitorDisplay?.monitors?.find((m) => m.unlockId === variant.unlockId);
            const kind = monitorFlickerKind(mon?.phosphorOrPanel, mode);
            nodes.push(
              <FlickerScreen
                key={`${slot.id}-screen`}
                screen={screen}
                kind={kind}
                frame={frame}
                reduce={reduce}
                room={room}
                screenKey={`${variant.unlockId}+${mode}`}
              />,
            );
          }
        }
        return nodes;
      })}
    </div>
  );
}

export default function FacilityRoom({ facilityId, state }) {
  const room = roomFor(facilityId);
  if (!room?.ready) {
    return (
      <div data-facility-room={facilityId} data-room-soon="" className="facility-room-soon">
        Room coming soon
      </div>
    );
  }
  return <LayeredRoom room={room} state={state} />;
}
