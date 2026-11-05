import { useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { Gamepad2, Settings as SettingsIcon } from "lucide-react";

const TABS = [
  { id: "game", label: "GAME", to: "/", icon: Gamepad2, isActive: (p) => p === "/" },
  {
    id: "settings",
    label: "SETTINGS",
    to: "/settings",
    icon: SettingsIcon,
    isActive: (p) => p.startsWith("/settings"),
  },
];

// Per-tab navigation state, kept at module scope so it survives tab switches.
const tabScroll = { game: 0, settings: 0 };
// Per-tab route stacks: each records the nested routes visited inside a tab so
// returning to it can land back where the player left off. The roots ('/' and
// '/settings') are not pushed — only nested routes, if any are added, go here.
const tabStacks = { game: [], settings: [] };

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
      className="safe-bottom fixed inset-x-0 bottom-0 z-30 w-full border-t-2 border-[var(--game-border)] bg-[var(--game-bg)]"
    >
      <div className="mx-auto flex max-w-4xl">
        {TABS.map((tab) => {
          const active = tab.isActive(pathname);
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => select(tab)}
              aria-current={active ? "page" : undefined}
              data-tab={tab.id}
              className={`flex min-h-[56px] min-w-0 flex-1 select-none items-center justify-center gap-2 px-2 py-2 ${
                active
                  ? "text-[var(--game-accent)]"
                  : "text-[var(--game-muted)] hover:text-[var(--game-accent)]"
              }`}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="font-pixel text-sm uppercase tracking-wider">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}