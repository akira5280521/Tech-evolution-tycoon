import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { currentCoach } from "@/lib/tutorial";
import { useGameState } from "./GameState";
import CoachMark from "./CoachMark";

// One coach for the first-session tutorial and later facility tours, on
// every screen, so the guide can follow the player into HQ, a plant, or TECH.
export default function CoachHost() {
  const { state, tutorialNext, tutorialSkip, tourNext, tourSkip } = useGameState();
  const navigate = useNavigate();
  const location = useLocation();
  const coach = currentCoach(state);
  const opened = useRef(null);

  useEffect(() => {
    if (coach?.kind !== "tour" || !coach.route) return;
    if (opened.current === coach.tourId) return;
    opened.current = coach.tourId;
    if (location.pathname === coach.route) return;
    if (coach.route.startsWith("/facilities/")) {
      navigate({ to: "/facilities/$facilityId", params: { facilityId: coach.route.split("/").pop() } });
    } else {
      navigate({ to: coach.route });
    }
  }, [coach?.kind, coach?.tourId, coach?.route, location.pathname, navigate]);

  if (!coach) return null;
  return (
    <CoachMark
      state={state}
      onNext={(id) => (coach.kind === "tour" ? tourNext(id) : tutorialNext(id))}
      onSkip={() => (coach.kind === "tour" ? tourSkip(coach.tourId) : tutorialSkip())}
    />
  );
}
