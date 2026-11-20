import { useRef, useState } from "react";
import { toast } from "sonner";
import { WEB_VERSION_CODE, WEB_VERSION_NAME } from "@/lib/appVersion";
import { copyText } from "@/lib/clipboard";
import { statsText } from "@/lib/statsText";
import { Panel } from "./chrome";

async function installedVersion() {
  try {
    const cap = window.Capacitor;
    if (cap?.isNativePlatform?.()) {
      const { App } = await import("@capacitor/app");
      const info = await App.getInfo();
      if (info?.version) return { version: info.version, code: info.build || "" };
    }
  } catch {
    /* use the web version below */
  }
  return { version: WEB_VERSION_NAME, code: WEB_VERSION_CODE };
}

// Plain-text progress a tester can paste into a message. Shown so the player
// sees exactly what they're sharing; nothing is sent anywhere.
export default function CopyStats({ state }) {
  const [text, setText] = useState("");
  const field = useRef(null);
  const copy = async () => {
    const next = statsText(state, await installedVersion());
    setText(next);
    await new Promise((r) => requestAnimationFrame(r));
    const ok = await copyText(next, field.current);
    if (ok) toast("Stats copied", { description: "Paste them into a message. Nothing was sent anywhere." });
    else toast("Couldn't copy", { description: "Select the text below and copy it by hand." });
  };
  return (
    <Panel>
      <h2 className="font-pixel text-[0.6rem]">SHARE YOUR STATS</h2>
      <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">
        Copies your progress as plain text (play time, eras reached and when, prestiges, R&amp;D) to paste into a message. No name, account or device details, and nothing is sent.
      </p>
      <button
        type="button"
        data-copy-stats
        onClick={copy}
        className="mt-3 min-h-11 w-full border-2 border-[var(--game-accent)] bg-[var(--game-accent)] px-3 font-pixel text-[0.6rem] text-[var(--game-accent-fg)] shadow-[3px_3px_0_0_#000]"
      >
        COPY MY STATS
      </button>
      {text ? (
        <textarea
          ref={field}
          data-stats-text
          readOnly
          value={text}
          rows={Math.min(18, text.split("\n").length + 1)}
          className="mt-3 w-full border-2 border-[var(--game-border)] bg-[var(--game-bg-deep)] p-2 font-term text-base leading-5 text-[var(--game-fg)]"
        />
      ) : null}
    </Panel>
  );
}
