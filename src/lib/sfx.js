// Retro sound effects synthesized with the Web Audio API: no files to load,
// instant playback, and works fully offline. Sounds are short arcade blips.
// There is no music track. Every blip goes through one master gain so a hidden
// tab, a minimized window, or a blurred app mutes the whole graph at once.

let ctx = null;
let master = null;
let audible = true;
let userSound = true;

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.setValueAtTime(audible ? 1 : 0, ctx.currentTime);
    master.connect(ctx.destination);
  }
  // resume() has to run inside the gesture that starts the first blip.
  // Later calls are no-ops while the context is already running.
  if (audible && ctx.state === "suspended") ctx.resume();
  return ctx;
}

function setAudible(on) {
  audible = on;
  if (!ctx || !master) return;
  // Assigning .value is immediate. A scheduled automation never lands while the
  // context is still suspended, which is exactly when a hidden tab must go quiet.
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.value = on ? 1 : 0;
  if (on && ctx.state === "suspended") ctx.resume();
}

// Hidden tab or minimized window (visibility), or the app losing focus (blur).
// Sounds that would have started while away are dropped; they are not replayed.
function syncFromPage() {
  const visible = typeof document === "undefined" || !document.hidden;
  setAudible(userSound && visible);
}

export function setSoundEnabled(on) {
  userSound = !!on;
  syncFromPage();
}

export function isSoundEnabled() {
  return userSound;
}

function blip(freq, start, duration, gain = 0.12) {
  if (!audible) return;
  const ac = audio();
  if (!ac || !master) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  vol.gain.setValueAtTime(gain, t);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(vol).connect(master);
  osc.start(t);
  osc.stop(t + duration);
}

// Purchase: quick two-note register "ka-ching" (G4 -> E5).
export function playBuy() {
  blip(392, 0, 0.07);
  blip(659.25, 0.07, 0.1);
}

// Collect: classic rising coin blip (B5 -> E6).
export function playCollect() {
  blip(987.77, 0, 0.06);
  blip(1318.51, 0.06, 0.18);
}

export function isAudioAudible() {
  return audible;
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", syncFromPage);
  window.addEventListener("pagehide", () => setAudible(false));
  window.addEventListener("pageshow", syncFromPage);
  window.addEventListener("blur", () => setAudible(false));
  window.addEventListener("focus", syncFromPage);
}
