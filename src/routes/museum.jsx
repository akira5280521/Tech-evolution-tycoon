import { createFileRoute } from "@tanstack/react-router";
import MuseumPage from "@/components/game/MuseumPage";
import { HUB_ROUTE } from "@/lib/hub";

export const Route = createFileRoute("/museum")({
  ssr: false,
  head: () => ({ meta: [{ title: "Hardware Museum — Tech Evolution Tycoon" }] }),
  component: () => <MuseumPage backTo={HUB_ROUTE} />,
});
