import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { FlaskConical } from "lucide-react";
import { HUB_ITEMS, HUB_LABEL } from "@/lib/hub";
import { companyName } from "@/lib/company";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";
import { hqCardHasDot, readyDots } from "@/lib/ready";
import { ReadyDot } from "./ReadyDot";

function GoButton({ id, disabled }) {
  const cls = `inline-flex min-h-11 min-w-14 shrink-0 self-center items-center justify-center border-2 px-3 font-pixel text-[0.55rem] shadow-[3px_3px_0_0_#000] ${
    disabled
      ? "cursor-not-allowed border-[var(--game-border)] bg-[var(--game-panel)] text-[var(--game-dim)]"
      : "border-[var(--game-accent)] bg-[var(--game-accent)] text-black"
  }`;
  return (
    <span
      aria-disabled={disabled ? "true" : undefined}
      data-action={`go-${id}`}
      className={cls}
    >
      GO &gt;
    </span>
  );
}

// The menu behind the top button beside TECH. Rigs, every facility and the
// Hardware Museum are listed; plants not unlocked this run stay visible as
// locked ? cards with the era they need, greyed Coming soon.
export default function RigsHub() {
  const { state, noteTutorialPage } = useGameState();
  useEffect(() => { noteTutorialPage?.("hq"); }, [noteTutorialPage]);
  const dots = readyDots(state);
  return (
    <ScreenShell title={HUB_LABEL} subtitle={`${companyName(state)}: your hardware. Pick a section.`}>
      {/* Research lives in R&D (T3 item 19): one tap from HQ. */}
      <Link
        to="/research"
        data-hub-rd
        className="relative flex min-h-14 items-center gap-3 border-2 border-[var(--game-accent)] bg-[var(--game-card)] p-3 shadow-[3px_3px_0_0_#000]"
      >
        <FlaskConical className="h-8 w-8 shrink-0 text-[var(--game-accent)]" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">R&amp;D &gt;</p>
          <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">The research queue, the TECH timeline, specialties and lab projects. RESEARCH SERVERS below make the points.</p>
        </div>
      </Link>
      <div data-hub-menu className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2">
        {HUB_ITEMS.map((item) => {
          const open = item.open(state);
          const museum = item.id === "museum";
          const icon = item.icon ? (
            <img
              src={item.icon}
              alt=""
              width={museum ? 16 : 40}
              height={museum ? 16 : 40}
              className={`pixel-art shrink-0 border-2 border-[var(--game-border-strong)] bg-[var(--game-bg)] ${museum ? "box-content h-8 w-8" : "h-10 w-10 object-contain"}`}
            />
          ) : null;
          if (!open) {
            return (
              <div
                key={item.id}
                aria-disabled="true"
                aria-label={`${item.label}, locked`}
                data-hub-item={item.id}
                data-locked=""
                className="flex min-h-20 gap-3 border-2 border-[var(--game-border)] bg-[var(--game-panel)] p-3 text-[var(--game-dim)] opacity-60 shadow-[3px_3px_0_0_#000]"
              >
                {icon}
                <div className="min-w-0 flex-1">
                  <p className="font-pixel text-[0.6rem] leading-5">??? <span className="text-[var(--game-dim)]">{item.label}</span></p>
                  <p data-hub-need className="break-words font-pixel text-[0.5rem] leading-4">{item.need?.(state) || "Unlocks later in the timeline."}</p>
                  <p className="mt-1 font-pixel text-[0.5rem] leading-4">COMING SOON</p>
                </div>
                <GoButton id={item.id} disabled />
              </div>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.to}
              params={item.params}
              data-hub-item={item.id}
              className="relative flex min-h-20 gap-3 border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3 shadow-[3px_3px_0_0_#000] hover:border-[var(--game-accent)]"
            >
              <ReadyDot show={hqCardHasDot(dots, item.id)} testId={item.id} />
              {icon}
              <div className="min-w-0 flex-1">
                <p className="font-pixel text-[0.6rem] leading-5 text-[var(--game-accent)]">{item.label} &gt;</p>
                <p className="break-words font-term text-base leading-5 text-[var(--game-fg)]">{item.text}</p>
              </div>
              <GoButton id={item.id} />
            </Link>
          );
        })}
      </div>
    </ScreenShell>
  );
}
