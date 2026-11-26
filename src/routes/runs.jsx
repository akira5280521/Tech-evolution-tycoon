import { createFileRoute, redirect } from "@tanstack/react-router";

// RUNS moved into PROGRESS (T3 item 26); old links land there.
export const Route = createFileRoute("/runs")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/progress", hash: "runs", replace: true });
  },
});
