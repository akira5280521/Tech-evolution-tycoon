import { createFileRoute } from "@tanstack/react-router";
import BoostPage from "@/components/game/BoostPage";

export const Route = createFileRoute("/boost")({
  ssr: false,
  head: () => ({ meta: [{ title: "Upgrades — PC Tycoon" }] }),
  component: BoostPage,
});
