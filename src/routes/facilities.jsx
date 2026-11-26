import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { FACILITIES } from "@/lib/facilities";
import { HUB_ROUTE } from "@/lib/hub";

// HQ is the menu. /facilities and old /facilities#servers links land on the
// right sub-page, or back at HQ. This file is also the path layout for
// /facilities/$facilityId, so beforeLoad must not run the redirect when a
// child id is already in the path.
export const Route = createFileRoute("/facilities")({
  ssr: false,
  beforeLoad: ({ location }) => {
    const path = (location.pathname || "").replace(/\/+$/, "") || "/";
    if (path !== "/facilities") return;
    const id = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (id && FACILITIES.some((fac) => fac.id === id)) {
      throw redirect({ to: "/facilities/$facilityId", params: { facilityId: id }, replace: true });
    }
    throw redirect({ to: HUB_ROUTE, replace: true });
  },
  component: Outlet,
});
