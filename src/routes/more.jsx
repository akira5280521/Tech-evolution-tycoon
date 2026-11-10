import { createFileRoute } from "@tanstack/react-router";
import MorePage from "@/components/game/MorePage";

export const Route = createFileRoute("/more")({
  ssr: false,
  head: () => ({ meta: [{ title: "More — Tech Evolution Tycoon" }] }),
  component: MorePage,
});
