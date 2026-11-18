import { isPageHidden } from "@/lib/pageVisibility";

// Retro audio from the Web Audio API: short square-wave effects and a quiet
// looping chiptune. One master gain, then a music bus and an effects bus, so
// each has its own volume. Hiding the app or locking the screen suspends the
// context (a real pause). Coming back resumes it only if the master sound
// switch is still on.

let ctx = null;
let master = null;
let musicGain = null;
let effectsGain = null;
let audible = true;
let userSound = true;
let musicVolume = 0.7;
let effectsVolume = 1;
let musicMuted = false;
let effectsMuted = false;
let musicTimer = null;
let step = 0;

const TUNE = [220, 261.63, 329.63, 261.63, 196, 246.94, 293.66, 246.94];

function audio() {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    musicGain = ctx.createGain();
    effectsGain = ctx.createGain();
    master.connect(ctx.destination);
    musicGain.connect(master);
    effectsGain.connect(master);
    applyBuses();
  }
  if (audible && ctx.state === "suspended") ctx.resume();
  return ctx;
}

function musicLevel() {
  if (!audible || !userSound || musicMuted) return 0;
  return musicVolume * 0.045;
}

function effectsLevel() {
  if (!audible || !userSound || effectsMuted) return 0;
  return effectsVolume;
}

function applyBuses() {
  if (!ctx || !musicGain || !effectsGain) return;
  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  effectsGain.gain.cancelScheduledValues(now);
  musicGain.gain.value = musicLevel();
  effectsGain.gain.value = effectsLevel();
}

function stopMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
}

function playStep() {
  if (musicLevel() <= 0) return;
  try {
    const ac = audio();
    if (!ac || !musicGain) return;
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const vol = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(TUNE[step % TUNE.length], t);
    step += 1;
    vol.gain.setValueAtTime(1, t);
    vol.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(vol).connect(musicGain);
    osc.start(t);
    osc.stop(t + 0.4);
  } catch {
    /* the browser hasn't allowed audio yet */
  }
}

function ensureMusic() {
  if (musicTimer || musicLevel() <= 0) return;
  if (!audio()) return;
  playStep();
  musicTimer = setInterval(playStep, 480);
}

function syncFromPage() {
  audible = userSound && !isPageHidden();
  if (!ctx || !master) {
    if (audible) ensureMusic();
    return;
  }
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.value = audible ? 1 : 0;
  applyBuses();
  if (!audible) {
    stopMusic();
    if (ctx.state === "running") ctx.suspend();
    return;
  }
  const resume = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
  resume.then(() => {
    if (audible) ensureMusic();
  }).catch(() => {});
}

export function setSoundEnabled(on) {
  userSound = !!on;
  syncFromPage();
}

export function isSoundEnabled() {
  return userSound;
}

// Volumes are 0–100. Mutes are independent of the master SOUND switch.
export function applyAudioPrefs(prefs) {
  if (!prefs) return;
  userSound = prefs.sound !== false;
  musicVolume = Math.max(0, Math.min(100, Number(prefs.musicVolume) || 0)) / 100;
  effectsVolume = Math.max(0, Math.min(100, Number(prefs.effectsVolume) || 0)) / 100;
  musicMuted = !!prefs.musicMuted;
  effectsMuted = !!prefs.effectsMuted;
  if (musicLevel() <= 0) stopMusic();
  syncFromPage();
}

function blip(freq, start, duration, gain = 0.12) {
  if (!audible || effectsLevel() <= 0) return;
  const ac = audio();
  if (!ac || !effectsGain) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const vol = ac.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  vol.gain.setValueAtTime(gain, t);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(vol).connect(effectsGain);
  osc.start(t);
  osc.stop(t + duration);
}

export function playBuy() {
  blip(392, 0, 0.07);
  blip(659.25, 0.07, 0.1);
}

export function playCollect() {
  blip(987.77, 0, 0.06);
  blip(1318.51, 0.06, 0.18);
}

export function isAudioAudible() {
  return audible;
}

if (typeof window !== "undefined") {
  document.addEventListener("visibilitychange", syncFromPage);
  window.addEventListener("pagehide", () => {
    audible = false;
    stopMusic();
    if (ctx && ctx.state === "running") ctx.suspend();
  });
  window.addEventListener("pageshow", syncFromPage);
  window.addEventListener("blur", () => {
    audible = false;
    if (master && ctx) master.gain.value = 0;
    stopMusic();
    if (ctx && ctx.state === "running") ctx.suspend();
  });
  window.addEventListener("focus", syncFromPage);
}
