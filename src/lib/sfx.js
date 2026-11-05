// Retro sound effects synthesized with the Web Audio API: no files to load,
// instant playback, and works fully offline. Sounds are short arcade blips.

let ctx = null;

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function blip(freq, start, duration, gain = 0.12) {
  const ac = audio();
  if (!ac) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  vol.gain.setValueAtTime(gain, t);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(vol).connect(ac.destination);
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