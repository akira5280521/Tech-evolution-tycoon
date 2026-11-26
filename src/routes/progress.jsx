import { createFileRoute } from "@tanstack/react-router";
import ProgressPage from "@/components/game/ProgressPage";

export const Route = createFileRoute("/progress")({
  ssr: false,
  head: () => ({ meta: [{ title: "Progress — Tech Evolution Tycoon" }] }),
  component: ProgressPage,
});
