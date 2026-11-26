import { createFileRoute, redirect } from "@tanstack/react-router";

// Rigs moved into the PC Build Bench as its SAVED BUILDS tab (T3 item 27).
export const Route = createFileRoute("/garage")({
  ssr: false,
  beforeLoad: () => {
    throw redirect({ to: "/facilities/$facilityId", params: { facilityId: "bench" }, hash: "saved", replace: true });
  },
});
