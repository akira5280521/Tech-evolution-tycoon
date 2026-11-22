// The hardware hub: the button beside TECH at the top of the game screen.
// It opens a menu of sub-buttons; RIGS (the plants) is the first. Later
// sections join HUB_ITEMS when they are built (no placeholders).
import { anyFacilityOpen } from "./facilities.js";

// The top button's name, in one place so it can be renamed.
export const HUB_LABEL = "RIGS";
export const HUB_ROUTE = "/rigs";

export const HUB_ITEMS = [
  {
    id: "rigs",
    label: "RIGS",
    to: "/facilities",
    text: "Research servers that make R&D points, then the Bitbark mine and the AI training cluster that pay cash.",
    open: (state) => anyFacilityOpen(state),
  },
];

// The hub opens once any of its sections does.
export function hubOpen(state) {
  return HUB_ITEMS.some((item) => item.open(state));
}
