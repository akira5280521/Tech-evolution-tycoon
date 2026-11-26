import { createFileRoute, redirect } from "@tanstack/react-router";
import MorePage from "@/components/game/MorePage";

export const Route = createFileRoute("/more")({
  ssr: false,
  // Stats, badges and the museum moved to PROGRESS (T3 item 26).
  beforeLoad: ({ location }) => {
    const hash = (location?.hash || "").replace("#", "");
    if (["stats", "badges", "museum"].includes(hash)) throw redirect({ to: "/progress", hash, replace: true });
  },
  head: () => ({ meta: [{ title: "More — Tech Evolution Tycoon" }] }),
  component: MorePage,
});
