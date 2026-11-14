import { createFileRoute } from "@tanstack/react-router";
import { ResearchPage } from "@/components/game/MorePage";

export const Route = createFileRoute("/research")({
  ssr: false,
  head: () => ({ meta: [{ title: "Research — Tech Evolution Tycoon" }] }),
  component: ResearchPage,
});
