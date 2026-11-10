import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Route-level code splitting: the game screen ships in its own chunk.
const GameScreen = lazy(() => import("@/components/game/GameScreen"));

export const Route = createFileRoute("/")({
  component: GamePage,
  head: () => ({
    meta: [
      { title: "Tech Evolution Tycoon — an idle history of computing" },
      {
        name: "description",
        content: "Build a computing empire from vacuum tubes to quantum servers in this 16-bit idle tycoon game.",
      },
    ],
  }),
});

function GamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--game-bg)] font-pixel text-sm text-[var(--game-muted)]">
          LOADING…
        </div>
      }
    >
      <GameScreen />
    </Suspense>
  );
}