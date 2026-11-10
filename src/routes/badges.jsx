import { createFileRoute } from "@tanstack/react-router";
import BadgesPage from "@/components/game/BadgesPage";

export const Route = createFileRoute("/badges")({
  ssr: false,
  head: () => ({ meta: [{ title: "Badges — Tech Evolution Tycoon" }] }),
  component: BadgesPage,
});
