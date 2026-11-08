import { useEffect, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { getSaveData } from "@/lib/gameSave";
import AnalyticsPanel from "./AnalyticsPanel";
import AppVersionFooter from "./AppVersion";
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
    <div className="screen-shell game-root min-h-screen overflow-x-hidden bg-[var(--game-bg)] text-[var(--game-fg)]">
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
      <main className="safe-x mx-auto flex min-h-[60vh] max-w-4xl flex-col gap-3 px-3 pb-28 pt-5">
        <AnalyticsPanel data={data} />
        <section className="border-2 border-[var(--game-border-strong)] bg-[var(--game-card)] p-3">
          <h2 className="font-pixel text-[0.6rem]">ACCOUNT</h2>
          <p className="mt-2 font-term text-lg leading-6 text-[var(--game-muted)]">Coming soon</p>
        </section>
        <AppVersionFooter />
      </main>
      <BottomTabs />
    </div>
  );
}