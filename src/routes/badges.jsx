import { createFileRoute, redirect } from "@tanstack/react-router";

// Badges moved into the More menu; old links land there.
export const Route = createFileRoute("/badges")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/more", hash: "badges", replace: true });
  },
});
