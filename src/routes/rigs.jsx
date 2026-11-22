import { createFileRoute } from "@tanstack/react-router";
import RigsHub from "@/components/game/RigsHub";

export const Route = createFileRoute("/rigs")({
  ssr: false,
  head: () => ({ meta: [{ title: "Rigs — Tech Evolution Tycoon" }] }),
  component: RigsHub,
});
