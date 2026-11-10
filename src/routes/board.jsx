import { createFileRoute } from "@tanstack/react-router";
import BoardPage from "@/components/game/BoardPage";

export const Route = createFileRoute("/board")({
  ssr: false,
  head: () => ({ meta: [{ title: "Investors — Tech Evolution Tycoon" }] }),
  component: BoardPage,
});
