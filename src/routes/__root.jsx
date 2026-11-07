import { useEffect } from "react";
import { HeadContent, Outlet, Scripts, createRootRoute, useLocation } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { DefaultCatchBoundary } from "@/components/DefaultCatchBoundary";
import { NotFound } from "@/components/NotFound";
import { Toaster } from "@/components/ui/sonner";
import { GameStateProvider } from "@/components/game/GameState";
import { UpdateCheckProvider } from "@/components/game/UpdateNotice";
import { AuthProvider } from "@/lib/AuthContext";
import { installNativeLifecycle } from "@/lib/nativeShell";
import { Base44Scripts } from "base44:document";
import appCss from "@/index.css?url";

export const Route = createRootRoute({
  // Per-page <title>/meta come from each route's head(); this is the shared base.
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "PC Tycoon" },
      { name: "description", content: "Build a computing empire from vacuum tubes to quantum servers in this 16-bit idle tycoon game." },
    ],
    // No icon link: the platform adds the app's logo when serving.
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  errorComponent: DefaultCatchBoundary,
  notFoundComponent: () => <NotFound />,
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootComponent() {
  const location = useLocation();
  // Offline mode: after the first online visit, the shell, fonts, and pixel art
  // are cached so the game runs with no signal.
  useEffect(() => {
    installNativeLifecycle();
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/api/sw", { scope: "/" }).catch(() => {
      /* caching unavailable in this context — the game still works online */
    });
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <AuthProvider>
        <GameStateProvider>
        <UpdateCheckProvider>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
        </UpdateCheckProvider>
        </GameStateProvider>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

// The document. There is no index.html: the server renders <html> from here.
function RootDocument({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      {/* data-react-root: the builder's preview bridge looks for #root and falls back to this. */}
      <body data-react-root="true">
        {children}
        <Base44Scripts />
        <Scripts />
      </body>
    </html>
  );
}