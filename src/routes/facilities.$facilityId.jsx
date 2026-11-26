import { createFileRoute } from "@tanstack/react-router";
import FacilitiesPage from "@/components/game/FacilitiesPage";

export const Route = createFileRoute("/facilities/$facilityId")({
  ssr: false,
  head: () => ({ meta: [{ title: "Facilities — Tech Evolution Tycoon" }] }),
  component: FacilityRoute,
});

function FacilityRoute() {
  const { facilityId } = Route.useParams();
  return <FacilitiesPage facilityId={facilityId} />;
}
