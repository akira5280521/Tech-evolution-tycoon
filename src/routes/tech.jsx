import { createFileRoute, redirect } from "@tanstack/react-router";

// TECH moved into the R&D menu as a tab (T3 item 18). Old links, and
// /tech#id deep links, land on R&D > TECH (focused on that project).
export const Route = createFileRoute("/tech")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const id = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    throw redirect({ to: "/research", hash: id ? `tech-${id}` : "tech", replace: true });
  },
});
