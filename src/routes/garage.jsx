import { createFileRoute } from "@tanstack/react-router";
import RigsGarage from "@/components/game/RigsGarage";

export const Route = createFileRoute("/garage")({
  ssr: false,
  head: () => ({ meta: [{ title: "Rigs — Tech Evolution Tycoon" }] }),
  component: RigsGarage,
});
