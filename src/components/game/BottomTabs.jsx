import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Flag, Gamepad2, Package, Settings, Trophy, Zap } from "lucide-react";

const TABS = [
  { id: "game", label: "GAME", to: "/", icon: Gamepad2, isActive: (p) => p === "/" },
  { id: "boost", label: "BOOST", to: "/boost", icon: Zap, isActive: (p) => p.startsWith("/boost") },
  { id: "board", label: "BOARD", to: "/board", icon: Package, isActive: (p) => p.startsWith("/board") },
  { id: "runs", label: "RUNS", to: "/runs", icon: Flag, isActive: (p) => p.startsWith("/runs") },
  { id: "badges", label: "BADGES", to: "/badges", icon: Trophy, isActive: (p) => p.startsWith("/badges") },
  { id: "more", label: "MORE", to: "/more", icon: Settings, isActive: (p) => p.startsWith("/more") || p.startsWith("/settings") },
];

const tabScroll = Object.fromEntries(TABS.map((tab) => [tab.id, 0]));
const tabStacks = Object.fromEntries(TABS.map((tab) => [tab.id, []]));

export default function BottomTabs() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // When a tab's route becomes active, restore the position it left off at.
  // The small delay lets the 200ms screen transition finish rendering first.
  useEffect(() => {
    const tab = TABS.find((t) => t.isActive(pathname));
    if (!tab) return undefined;
    const id = setTimeout(() => window.scrollTo(0, tabScroll[tab.id]), 250);
    return () => clearTimeout(id);
  }, [pathname]);

  const select = (tab) => {
    const active = TABS.find((t) => t.isActive(pathname));
    if (active && active.id !== tab.id) {
      tabScroll[active.id] = window.scrollY; // save the leaving tab's position
      // Save the leaving tab's deepest route so it can be restored later.
      const stack = tabStacks[active.id];
      if (pathname !== active.to && stack[stack.length - 1] !== pathname) stack.push(pathname);
    }
    if (active && active.id === tab.id) {
      // Re-selecting the active tab resets it to its root route and top.
      tabStacks[tab.id] = [];
      tabScroll[tab.id] = 0;
      navigate({ to: tab.to });
      window.scrollTo(0, 0);
      return;
    }
    // Returning to a tab resumes its saved nested route, if it has one.
    const stack = tabStacks[tab.id];
    navigate({ to: stack.length > 0 ? stack[stack.length - 1] : tab.to });
  };

  return (
    <nav
      aria-label="Main navigation"
      className="safe-nav fixed inset-x-0 bottom-0 z-30 w-full border-t-2 border-[var(--game-border)] bg-[var(--game-bg)]"
    >
      <div className="tab-bar mx-auto flex max-w-4xl">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => select(tab)}
              aria-current={active ? "page" : undefined}
              aria-label={tab.label}
              title={tab.label}
              data-tab={tab.id}
              className={`flex min-h-11 min-w-0 flex-1 basis-0 select-none flex-col items-center justify-center gap-1 overflow-hidden px-0.5 py-1.5 ${
                active
                  ? "text-[var(--game-accent)]"
                  : "text-[var(--game-muted)] hover:text-[var(--game-accent)]"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              {/* Pixel type is wide. On a narrow phone, or when the system text
                  size is bumped, the label ellipsizes inside its own column
                  instead of painting over the next tab. Under 360px the label
                  is clipped to the icon and the button name stays on aria-label. */}
              <span
                data-tab-label
                className="w-full min-w-0 text-center font-pixel text-[0.5rem] uppercase leading-tight tracking-normal"
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}