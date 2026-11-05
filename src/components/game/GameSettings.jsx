import { useEffect, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { getSaveData } from "@/lib/gameSave";
import AnalyticsPanel from "./AnalyticsPanel";
import BottomTabs from "./BottomTabs";

export default function GameSettings() {
  const [data, setData] = useState(undefined);
  const navigate = useNavigate();
  const router = useRouter();

  const goBack = () => {
    // TanStack Router's history keeps the back stack reliable inside Android WebView.
    if (router.history.canGoBack()) router.history.back();
    else navigate({ to: "/" });
  };

  // The save lives in this browser's storage; read it after mount.
  useEffect(() => {
    setData(getSaveData());
  }, []);

  return (
    <div className="min-h-screen bg-[var(--game-bg)] text-[var(--game-fg)]">
      <div className="crt-scanlines pointer-events-none fixed inset-0 z-50 opacity-30" />
      <header className="safe-top sticky top-0 z-20 border-b-2 border-[var(--game-border)] bg-[var(--game-bg-95)] px-3 pb-3 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-x-4">
          <h1 className="title-glow font-pixel text-sm text-[var(--game-accent)]">GAME SETTINGS</h1>
          <button
            type="button"
            onClick={goBack}
            className="flex min-h-[44px] select-none items-center gap-1 border-2 border-[var(--game-border-strong)] bg-[var(--game-panel)] px-3 py-2 font-pixel text-sm uppercase text-[var(--game-muted)] hover:border-[var(--game-accent)] hover:text-[var(--game-accent)]"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-3 pb-24 pt-5 overscroll-none">
        <AnalyticsPanel data={data} />
        {/*
          TODO (auth): when authentication is wired in, add a "Delete Account"
          section here — with a confirmation dialog and an API call that removes
          the account and its data. The game is local-only for now, so nothing
          functional is needed yet.
        */}
      </main>
      <BottomTabs />
    </div>
  );
}