import { useEffect, useState } from "react";

// A two-tap confirm (T4 item 37): the first tap arms, the second does it.
// Only prestige and selling stock ask; everything else acts on one tap.
// The arm drops after a few seconds so a stray tap later never fires it.
export function useArm(ms = 5000) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), ms);
    return () => clearTimeout(t);
  }, [armed, ms]);
  return [armed, () => setArmed(true), () => setArmed(false)];
}
