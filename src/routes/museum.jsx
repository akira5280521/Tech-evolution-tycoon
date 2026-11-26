import { createFileRoute, redirect } from "@tanstack/react-router";

// The Hardware Museum moved into PROGRESS (T3 item 26); old links land there.
export const Route = createFileRoute("/museum")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/progress", hash: "museum", replace: true });
  },
});
