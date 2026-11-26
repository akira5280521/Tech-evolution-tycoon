import { useLocation, useNavigate } from "@tanstack/react-router";
import { getSaveData } from "@/lib/gameSave";
import { useGameState } from "./GameState";
import ScreenShell, { Embedded, SubTabs } from "./chrome";
import RunsPage from "./RunsPage";
import BadgesPage from "./BadgesPage";
import MuseumPage from "./MuseumPage";
import { Stats } from "./MorePage";

// PROGRESS (T3 item 26): runs, badges, the Hardware Museum and stats, one tap
// from the bottom bar. MORE keeps settings and help.
export const PROGRESS_TABS = [
  { id: "runs", label: "RUNS" },
  { id: "badges", label: "BADGES" },
  { id: "museum", label: "MUSEUM" },
  { id: "stats", label: "STATS" },
];

export default function ProgressPage() {
  const { state } = useGameState();
  const location = useLocation();
  const navigate = useNavigate();
  const hash = (location.hash || "").replace("#", "");
  const tab = PROGRESS_TABS.some((t) => t.id === hash) ? hash : "runs";
  const pick = (id) => navigate({ to: "/progress", hash: id, replace: true });
  return (
    <ScreenShell title="PROGRESS" subtitle="">
      <SubTabs tabs={PROGRESS_TABS} active={tab} onPick={pick} name="progress" />
      <Embedded>
        {tab === "runs" && <RunsPage />}
        {tab === "badges" && <BadgesPage />}
        {tab === "museum" && <MuseumPage />}
        {tab === "stats" && <Stats state={state} data={getSaveData()} />}
      </Embedded>
    </ScreenShell>
  );
}
