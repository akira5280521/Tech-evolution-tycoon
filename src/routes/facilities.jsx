import { createFileRoute } from "@tanstack/react-router";
import FacilitiesPage from "@/components/game/FacilitiesPage";

export const Route = createFileRoute("/facilities")({
  ssr: false,
  head: () => ({ meta: [{ title: "Facilities — Tech Evolution Tycoon" }] }),
  component: FacilitiesPage,
});
