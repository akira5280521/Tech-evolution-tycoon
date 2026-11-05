// Serves the offline cache worker at /api/sw. The Service-Worker-Allowed header
// lets it control the whole site even though it is served under /api/.
import { createFileRoute } from "@tanstack/react-router";
import { swScript } from "@/lib/swScript";

export const Route = createFileRoute("/api/sw")({
  server: {
    handlers: {
      GET: async () =>
        new Response(swScript, {
          headers: {
            "Content-Type": "application/javascript",
            "Service-Worker-Allowed": "/",
            "Cache-Control": "no-cache",
          },
        }),
    },
  },
});