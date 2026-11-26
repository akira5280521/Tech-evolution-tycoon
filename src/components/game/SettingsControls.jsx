import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WEB_VERSION_CODE, WEB_VERSION_NAME } from "@/lib/appVersion";
import { PREFS_EVENT, readPrefs, writePrefs } from "@/lib/gamePrefs";
import { applyAudioPrefs } from "@/lib/sfx";
import { cancelCapNotification, notificationPermission, notifyFailReason, openNotificationSettings, requestNotifyPermission } from "@/lib/capNotify";
import { achievementsLive, openAchievements } from "@/lib/achievements";
import { WhatsNewDialog } from "./WhatsNew";
import { useCloud } from "./CloudSync";
import { Panel } from "./chrome";
import { statsText } from "@/lib/statsText";

const choice = "min-h-12 border-2 px-1 font-pixel text-[0.5rem]";
const on = "border-[var(--game-accent)] text-[var(--game-accent)]";
const off = "border-[var(--game-border-strong)] text-[var(--game-muted)]";

function usePrefs() {
  const [prefs, setPrefs] = useState(() => readPrefs());
  useEffect(() => {
    const on = () => {
      const next = readPrefs();
      applyAudioPrefs(next);
      setPrefs(next);
    };
    on();
    window.addEventListener(PREFS_EVENT, on);
    return () => window.removeEventListener(PREFS_EVENT, on);
  }, []);
  const set = (partial) => {
    const next = writePrefs(partial);
    applyAudioPrefs(next);
    setPrefs(next);
    return next;
  };
  return [prefs, set];
}

export function PlayToggles() {
  const [prefs, set] = usePrefs();
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">PLAY</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <button type="button" data-compact onClick={() => set({ compact: !prefs.compact })} className={`${choice} ${off}`}>
          COMPACT ROWS: {prefs.compact ? "ON" : "OFF"}
        </button>
        <button type="button" data-collapse-maxed onClick={() => set({ collapseMaxed: !prefs.collapseMaxed })} className={`${choice} ${prefs.collapseMaxed ? on : off}`}>
          COLLAPSE MAXED: {prefs.collapseMaxed ? "ON" : "OFF"}
        </button>
        <button type="button" data-sound onClick={() => set({ sound: !prefs.sound })} className={`${choice} ${prefs.sound ? on : off}`}>
          SOUND: {prefs.sound ? "ON" : "OFF"}
        </button>
        <button type="button" data-haptics onClick={() => set({ haptics: !prefs.haptics })} className={`${choice} ${prefs.haptics ? on : off}`}>
          VIBRATION: {prefs.haptics ? "ON" : "OFF"}
        </button>
        <button type="button" data-tap-sound aria-pressed={prefs.tapSound} onClick={() => set({ tapSound: !prefs.tapSound })} className={`${choice} ${prefs.tapSound ? on : off}`}>
          TAP SOUND: {prefs.tapSound ? "ON" : "OFF"}
        </button>
        <button type="button" data-tap-haptic aria-pressed={prefs.tapHaptic} onClick={() => set({ tapHaptic: !prefs.tapHaptic })} className={`${choice} ${prefs.tapHaptic ? on : off}`}>
          TAP VIBRATION: {prefs.tapHaptic ? "ON" : "OFF"}
        </button>
        <button type="button" data-starter-goals onClick={() => set({ goalsHidden: !prefs.goalsHidden })} className={`${choice} ${prefs.goalsHidden ? off : on}`}>
          STARTER GOALS: {prefs.goalsHidden ? "HIDDEN" : "ON"}
        </button>
      </div>
      <Volume
        label="MUSIC"
        value={prefs.musicVolume}
        muted={prefs.musicMuted}
        onValue={(musicVolume) => set({ musicVolume })}
        onMute={() => set({ musicMuted: !prefs.musicMuted })}
      />
      <Volume
        label="EFFECTS"
        value={prefs.effectsVolume}
        muted={prefs.effectsMuted}
        onValue={(effectsVolume) => set({ effectsVolume })}
        onMute={() => set({ effectsMuted: !prefs.effectsMuted })}
      />
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
        Sound off silences both. Music and effects each have their own volume. Leaving the app or locking the screen pauses them, and they come back if sound is still on.
      </p>
    </Panel>
  );
}

function Volume({ label, value, muted, onValue, onMute }) {
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-pixel text-[0.5rem]">{label}: {muted ? "MUTED" : `${value}%`}</p>
        <button type="button" data-mute={label.toLowerCase()} onClick={onMute} className={`${choice} px-2 ${muted ? on : off}`}>
          {muted ? "UNMUTE" : "MUTE"}
        </button>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={value}
        aria-label={`${label} volume`}
        data-volume={label.toLowerCase()}
        onChange={(e) => onValue(Number(e.target.value))}
        className="mt-2 w-full accent-[var(--game-accent)]"
      />
    </div>
  );
}

export function DisplaySettings() {
  const [prefs, set] = usePrefs();
  const formats = [
    ["short", "SHORT"],
    ["scientific", "SCIENTIFIC"],
    ["words", "FULL NAMES"],
  ];
  const sizes = [
    ["normal", "NORMAL"],
    ["large", "LARGE"],
    ["xl", "EXTRA LARGE"],
  ];
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">DISPLAY</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Numbers: 1.20B, 1.2e9, or 1.2 billion. Long-press money or an amount to see the exact value.</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {formats.map(([id, label]) => (
          <button key={id} type="button" data-format={id} aria-pressed={prefs.numberFormat === id} onClick={() => set({ numberFormat: id })} className={`${choice} ${prefs.numberFormat === id ? on : off}`}>
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 font-term text-base leading-5 text-[var(--game-muted)]">Text size. If the money bar gets too tall, it scrolls with the page.</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {sizes.map(([id, label]) => (
          <button key={id} type="button" data-text-size={id} aria-pressed={prefs.textSize === id} onClick={() => set({ textSize: id })} className={`${choice} ${prefs.textSize === id ? on : off}`}>
            {label}
          </button>
        ))}
      </div>
      <p className="mt-3 font-pixel text-[0.5rem] leading-4 text-[var(--game-fg)]">MONITOR DISPLAY</p>
      <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">The picture on facility room monitors. Era-accurate is the default and uses the real phosphor or palette for each unlock.</p>
      <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-label="Monitor display">
        {[
          ["era", "ERA-ACCURATE"],
          ["green", "GREEN"],
          ["amber", "AMBER"],
          ["color", "COLOR"],
        ].map(([id, label]) => (
          <button key={id} type="button" data-monitor-display={id} aria-pressed={prefs.monitorDisplay === id} onClick={() => set({ monitorDisplay: id })} className={`${choice} ${prefs.monitorDisplay === id ? on : off}`}>
            {label}
          </button>
        ))}
      </div>
      <button type="button" data-contrast onClick={() => set({ contrast: !prefs.contrast })} className={`${choice} mt-3 w-full ${prefs.contrast ? on : off}`}>
        HIGH CONTRAST: {prefs.contrast ? "ON" : "OFF"}
      </button>
      <button type="button" data-colorblind-toggle onClick={() => set({ colorblind: !prefs.colorblind })} className={`${choice} mt-3 w-full ${prefs.colorblind ? on : off}`}>
        COLORBLIND COLORS: {prefs.colorblind ? "ON" : "OFF"}
      </button>
      <p className="mt-1 font-term text-base leading-5 text-[var(--game-muted)]">Good news shows in blue and warnings in orange, in place of green and red.</p>
    </Panel>
  );
}

export function AwayReminder() {
  const [prefs, set] = usePrefs();
  const [perm, setPerm] = useState("unknown");
  const [help, setHelp] = useState("");
  const anyOn = (next) => !!(next.notifyCap || next.notifyResearch || next.notifyBins);
  const explain = (status) => {
    if (status === "granted") return "";
    if (status === "denied") return "Android is blocking notifications for this app. Your choice is saved; allow notifications in settings and they start working.";
    const why = notifyFailReason();
    return `This install can't post notifications yet${why ? ` (${why})` : ""}. Your choice is saved.`;
  };
  // The switch always saves. Android's permission is asked for separately, so
  // a missing or slow prompt can't leave the switch stuck on OFF.
  const toggle = (key) => {
    const next = { [key]: !prefs[key] };
    const after = set(next);
    if (!next[key]) {
      if (!anyOn(after)) {
        void cancelCapNotification();
        setHelp("");
      }
      return;
    }
    void requestNotifyPermission().then((status) => {
      setPerm(status);
      setHelp(explain(status));
    });
  };
  useEffect(() => {
    const check = () => {
      if (document.hidden) return;
      void notificationPermission().then((status) => {
        setPerm(status);
        setHelp(anyOn(readPrefs()) ? explain(status) : "");
      });
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => document.removeEventListener("visibilitychange", check);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">NOTIFICATIONS</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
        Optional. Reminders when away time fills, research finishes, or bins are full. Off unless you turn them on. Opening the game clears them. Each kind notifies at most once every 30 minutes.
      </p>
      <button type="button" data-notify-cap onClick={() => toggle("notifyCap")} className={`${choice} mt-3 w-full ${prefs.notifyCap ? on : off}`}>
        CAP REMINDER: {prefs.notifyCap ? "ON" : "OFF"}
      </button>
      <button type="button" data-notify-research onClick={() => toggle("notifyResearch")} className={`${choice} mt-2 w-full ${prefs.notifyResearch ? on : off}`}>
        RESEARCH DONE: {prefs.notifyResearch ? "ON" : "OFF"}
      </button>
      <button type="button" data-notify-bins onClick={() => toggle("notifyBins")} className={`${choice} mt-2 w-full ${prefs.notifyBins ? on : off}`}>
        BINS FULL: {prefs.notifyBins ? "ON" : "OFF"}
      </button>
      {anyOn(prefs) && perm !== "unknown" ? (
        <p data-notify-perm={perm} className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
          Android permission: {perm === "granted" ? "ALLOWED" : "NOT ALLOWED"}
        </p>
      ) : null}
      {help ? (
        <div className="mt-2">
          <p data-notify-help className="font-term text-base leading-5 text-[var(--game-fg)]">{help}</p>
          <button
            type="button"
            data-notify-settings
            onClick={() => { void openNotificationSettings(); }}
            className={`${choice} mt-2 w-full ${on}`}
          >
            OPEN NOTIFICATION SETTINGS
          </button>
        </div>
      ) : null}
    </Panel>
  );
}

// Mail apps cut very long links, so the stats are trimmed to fit.
const MAX_STATS = 1800;

export function FeedbackButton({ state }) {
  const [withStats, setWithStats] = useState(true);
  const send = async () => {
    let version = WEB_VERSION_NAME;
    let code = String(WEB_VERSION_CODE);
    try {
      const cap = window.Capacitor;
      if (cap && typeof cap.isNativePlatform === "function" && cap.isNativePlatform()) {
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo();
        if (info?.version) version = String(info.version);
        if (info?.build) code = String(info.build);
      }
    } catch {
      /* the web version is already filled in */
    }
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const android = (ua.match(/Android\s+([\d.]+)/) || [])[1] || "";
    const model = (ua.match(/Android\s+[\d.]+;\s*([^;)]+?)(?:\s+Build\/|\))/ ) || [])[1] || "";
    const body = [
      "",
      "",
      "---",
      `App version: ${version}`,
      `versionCode: ${code}`,
      `Android version: ${android || "not available"}`,
      `Device: ${model.trim() || "not available"}`,
    ];
    if (withStats && state) {
      let stats = statsText(state, { version, code });
      if (stats.length > MAX_STATS) stats = `${stats.slice(0, MAX_STATS)}\n(trimmed; use COPY MY STATS for the rest)`;
      body.push("", stats);
    }
    const text = body.join("\n");
    const href = `mailto:akira5280622@gmail.com?subject=${encodeURIComponent("Tech Evolution Tycoon feedback")}&body=${encodeURIComponent(text)}`;
    window.location.href = href;
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">FEEDBACK</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Opens your email app with the version filled in. Write whatever you want above the line. You see the whole message before anything is sent.</p>
      <button type="button" data-feedback-stats aria-pressed={withStats} onClick={() => setWithStats((v) => !v)} className={`${choice} mt-3 w-full ${withStats ? on : off}`}>
        INCLUDE MY STATS AND RECENT ERRORS: {withStats ? "ON" : "OFF"}
      </button>
      <button type="button" data-feedback onClick={send} className={`${choice} mt-2 w-full ${on}`}>
        SEND FEEDBACK
      </button>
    </Panel>
  );
}

export function AchievementsButton() {
  const cloud = useCloud();
  const [busy, setBusy] = useState(false);
  if (!achievementsLive()) {
    return (
      <button
        type="button"
        data-achievements="soon"
        disabled
        aria-disabled="true"
        className={`${choice} mt-3 h-auto w-full cursor-not-allowed whitespace-normal border-[var(--game-muted)] py-2 leading-5 text-[var(--game-muted)]`}
      >
        <span className="block">ACHIEVEMENTS</span>
        <span className="block">COMING SOON</span>
      </button>
    );
  }
  if (!cloud.configured) return null;
  const open = async () => {
    setBusy(true);
    const result = await openAchievements();
    setBusy(false);
    if (!result.ok && result.reason) toast("Achievements", { description: result.reason });
  };
  return (
    <button type="button" data-achievements disabled={busy} onClick={open} className={`${choice} mt-3 w-full ${on} disabled:opacity-60`}>
      {busy ? "OPENING…" : "ACHIEVEMENTS"}
    </button>
  );
}

export function WhatsNewButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" data-show-notes onClick={() => setOpen(true)} className={`${choice} w-full ${off}`}>
        WHAT'S NEW
      </button>
      {open ? <WhatsNewDialog onClose={() => setOpen(false)} /> : null}
    </>
  );
}

export function ResetProgress({ onReset }) {
  const cloud = useCloud();
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState("");
  const close = () => {
    setStep(0);
    setTyped("");
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem] text-[var(--game-danger)]">RESET</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Clears this phone's empire and starts a new game. Sound and display settings stay.</p>
      {step === 0 && (
        <button type="button" data-reset-start onClick={() => setStep(1)} className="mt-3 min-h-12 w-full border-2 border-[var(--game-danger)] px-3 font-pixel text-[0.55rem] text-[var(--game-danger)]">
          RESET PROGRESS
        </button>
      )}
      {step === 1 && (
        <div className="mt-3 space-y-2" data-reset-confirm>
          <p className="font-term text-lg leading-6 text-[var(--game-danger)]">
            This cannot be undone on this phone.
            {cloud.signedIn ? " The next cloud save will replace your Play Games copy with this fresh game." : " A Play Games cloud save is only replaced if you are signed in and the game saves again."}
          </p>
          <label className="block font-term text-lg leading-6" htmlFor="reset-word">
            Type RESET to confirm
            <input
              id="reset-word"
              data-reset-word
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              className="mt-1 w-full border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] px-2 py-2 font-pixel text-[0.6rem] text-[var(--game-fg)]"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              data-reset-go
              disabled={typed !== "RESET"}
              onClick={() => {
                onReset();
                close();
              }}
              className="min-h-12 flex-1 border-2 border-[var(--game-danger)] bg-[var(--game-danger)] px-2 font-pixel text-[0.55rem] text-black disabled:opacity-50"
            >
              ERASE SAVE
            </button>
            <button type="button" onClick={close} className={`${choice} flex-1 ${off}`}>
              CANCEL
            </button>
          </div>
        </div>
      )}
    </Panel>
  );
}
