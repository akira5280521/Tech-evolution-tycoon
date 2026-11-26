import { createFileRoute } from "@tanstack/react-router";
import RdPage from "@/components/game/RdPage";

export const Route = createFileRoute("/research")({
  ssr: false,
  head: () => ({ meta: [{ title: "R&D — Tech Evolution Tycoon" }] }),
  component: RdPage,
});
