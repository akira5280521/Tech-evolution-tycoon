import { createFileRoute } from "@tanstack/react-router";
import ResearchPage from "@/components/game/ResearchPage";

export const Route = createFileRoute("/tech")({
  ssr: false,
  head: () => ({ meta: [{ title: "Research — Tech Evolution Tycoon" }] }),
  component: ResearchPage,
});
