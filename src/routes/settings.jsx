import { createFileRoute } from "@tanstack/react-router";
import MorePage from "@/components/game/MorePage";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({ meta: [{ title: "Settings — PC Tycoon" }] }),
  component: MorePage,
});