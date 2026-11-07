import { createFileRoute } from "@tanstack/react-router";
import MorePage from "@/components/game/MorePage";

export const Route = createFileRoute("/more")({
  ssr: false,
  head: () => ({ meta: [{ title: "More — PC Tycoon" }] }),
  component: MorePage,
});
