import { Suspense, lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";

// Route-level code splitting: the settings screen ships in its own chunk.
const GameSettings = lazy(() => import("@/components/game/GameSettings"));

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Settings — PC Tycoon" }],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--game-bg)] font-pixel text-sm text-[var(--game-muted)]">
          LOADING…
        </div>
      }
    >
      <GameSettings />
    </Suspense>
  );
}