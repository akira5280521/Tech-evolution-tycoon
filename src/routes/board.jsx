import { createFileRoute, redirect } from "@tanstack/react-router";

// BOARD merged into BOOST as the BONUSES tab (T3 item 25).
export const Route = createFileRoute("/board")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/boost", hash: "bonuses", replace: true });
  },
});
