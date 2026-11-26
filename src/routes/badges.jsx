import { createFileRoute, redirect } from "@tanstack/react-router";

// Badges moved into PROGRESS (T3 item 26); old links land there.
export const Route = createFileRoute("/badges")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/progress", hash: "badges", replace: true });
  },
});
