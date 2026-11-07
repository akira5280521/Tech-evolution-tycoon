import { badgeList } from "@/lib/empire";
import { useGameState } from "./GameState";
import ScreenShell from "./chrome";

export default function BadgesPage() {
  const { state } = useGameState();
  const badges = badgeList(state);
  const earned = badges.filter((badge) => badge.earned).length;
  const groups = [...new Set(badges.map((badge) => badge.group))];
  return (
    <ScreenShell title={"BADGE\nCOLLECTION"} subtitle="">
      <p className="font-pixel text-sm text-[var(--game-accent)]">{earned} / {badges.length} COLLECTED</p>
      <p className="font-term text-lg leading-6 text-[var(--game-muted)]">
        Earn badges by unlocking new tech eras, stacking massive lifetime profit, mastering eras, and collapsing the timeline.
      </p>
      {groups.map((group) => (
        <section key={group}>
          <h2 className="font-pixel text-[0.65rem] text-[var(--game-violet)]">· {group}</h2>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {badges.filter((badge) => badge.group === group).map((badge) => (
              <article key={badge.id} className={`border-2 p-2 ${badge.earned ? "border-[var(--game-accent)]" : "border-[var(--game-border)] opacity-70"}`}>
                <div className="relative grid h-20 place-items-center border-2 border-[var(--game-border)] bg-black">
                  {badge.icon ? (
                    <img src={badge.icon} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-pixel text-[0.55rem] text-[var(--game-accent)]">{badge.name.slice(0, 3)}</span>
                  )}
                  {badge.earned && <span className="absolute bottom-1 right-1 bg-[var(--game-accent)] px-1 font-pixel text-[0.45rem] text-black">✓</span>}
                </div>
                <h3 className="mt-2 text-center font-pixel text-[0.5rem] leading-4">{badge.name}</h3>
                <p className="mt-1 text-center font-term text-base leading-5 text-[var(--game-muted)]">{badge.desc}</p>
                <p className={`mt-1 text-center font-pixel text-[0.45rem] ${badge.earned ? "text-[var(--game-success)]" : "text-[var(--game-dim)]"}`}>
                  {badge.earned ? "EARNED ✓" : "LOCKED"}
                </p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </ScreenShell>
  );
}
