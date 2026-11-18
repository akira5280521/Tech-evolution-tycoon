import { useEffect, useState } from "react";
import { toast } from "sonner";
import { WEB_VERSION_CODE, WEB_VERSION_NAME } from "@/lib/appVersion";
import { PREFS_EVENT, readPrefs, writePrefs } from "@/lib/gamePrefs";
import { applyAudioPrefs } from "@/lib/sfx";
import { requestNotifyPermission, cancelCapNotification } from "@/lib/capNotify";
import { openAchievements } from "@/lib/achievements";
import { WhatsNewDialog } from "./WhatsNew";
import { useCloud } from "./CloudSync";
import { Panel } from "./chrome";

const choice = "min-h-11 border-2 px-1 font-pixel text-[0.5rem]";
const on = "border-[var(--game-accent)] text-[var(--game-accent)]";
const off = "border-[var(--game-border-strong)] text-[var(--game-muted)]";

function usePrefs() {
  const [prefs, setPrefs] = useState(() => readPrefs());
  useEffect(() => {
    applyAudioPrefs(readPrefs());
    const on = () => setPrefs(readPrefs());
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
        <button type="button" data-sound onClick={() => set({ sound: !prefs.sound })} className={`${choice} ${prefs.sound ? on : off}`}>
          SOUND: {prefs.sound ? "ON" : "OFF"}
        </button>
        <button type="button" data-haptics onClick={() => set({ haptics: !prefs.haptics })} className={`${choice} ${prefs.haptics ? on : off}`}>
          VIBRATION: {prefs.haptics ? "ON" : "OFF"}
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
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Numbers: 1.20B, 1.2e9, or 1.2 billion.</p>
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
      <button type="button" data-contrast onClick={() => set({ contrast: !prefs.contrast })} className={`${choice} mt-3 w-full ${prefs.contrast ? on : off}`}>
        HIGH CONTRAST: {prefs.contrast ? "ON" : "OFF"}
      </button>
    </Panel>
  );
}

export function AwayReminder() {
  const [prefs, set] = usePrefs();
  const toggle = async () => {
    if (prefs.notifyCap) {
      set({ notifyCap: false });
      await cancelCapNotification();
      return;
    }
    const ok = await requestNotifyPermission();
    if (!ok) {
      set({ notifyCap: false });
      toast("Notifications stay off", { description: "Allow notifications for this app if you want a reminder when away time fills up." });
      return;
    }
    set({ notifyCap: true });
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">AWAY TIME</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">
        Optional. A notification when managers hit the away-time cap. Off unless you turn it on. Opening the game clears the reminder.
      </p>
      <button type="button" data-notify-cap onClick={toggle} className={`${choice} mt-3 w-full ${prefs.notifyCap ? on : off}`}>
        CAP REMINDER: {prefs.notifyCap ? "ON" : "OFF"}
      </button>
    </Panel>
  );
}

export function FeedbackButton() {
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
    ].join("\n");
    const href = `mailto:akira5280622@gmail.com?subject=${encodeURIComponent("Tech Evolution Tycoon feedback")}&body=${encodeURIComponent(body)}`;
    window.location.href = href;
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">FEEDBACK</h2>
      <p className="mt-2 font-term text-base leading-5 text-[var(--game-muted)]">Opens your email app with the version filled in. Write whatever you want above the line.</p>
      <button type="button" data-feedback onClick={send} className={`${choice} mt-3 w-full ${on}`}>
        SEND FEEDBACK
      </button>
    </Panel>
  );
}

export function AchievementsButton() {
  const cloud = useCloud();
  const [busy, setBusy] = useState(false);
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
        <button type="button" data-reset-start onClick={() => setStep(1)} className="mt-3 min-h-11 w-full border-2 border-[var(--game-danger)] px-3 font-pixel text-[0.55rem] text-[var(--game-danger)]">
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
              className="min-h-11 flex-1 border-2 border-[var(--game-danger)] bg-[var(--game-danger)] px-2 font-pixel text-[0.55rem] text-black disabled:opacity-50"
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
