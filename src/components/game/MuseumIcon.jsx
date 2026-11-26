import { useEffect, useState } from "react";
import { silhouetteOf } from "@/lib/silhouette";

// A museum piece's picture: full color when shown, otherwise its keyed-out
// shape in one dark shade (T4 item 21). `shade` is "museum-sil" or
// "museum-shadow"; empty means full color.
export default function MuseumIcon({ src, shade, className = "" }) {
  const [mask, setMask] = useState(null);
  useEffect(() => {
    if (!shade) return undefined;
    let live = true;
    silhouetteOf(src).then((url) => live && setMask(url));
    return () => {
      live = false;
    };
  }, [src, shade]);
  if (!shade) return <img src={src} alt="" className={className} />;
  return <img src={mask || src} alt="" data-sil={mask ? "ready" : "pending"} className={`${className} ${shade} ${mask ? "" : "opacity-0"}`} />;
}
