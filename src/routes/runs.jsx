import { createFileRoute } from "@tanstack/react-router";
import RunsPage from "@/components/game/RunsPage";

export const Route = createFileRoute("/runs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Challenges — PC Tycoon" }] }),
  component: RunsPage,
});
