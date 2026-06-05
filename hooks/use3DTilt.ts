import { useRef, useCallback } from "react";

export function use3DTilt(maxTilt = 12) {
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const rx = (ny - 0.5) * -maxTilt * 2;
      const ry = (nx - 0.5) * maxTilt * 2;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
      el.style.transition = "transform 0.05s linear";
      const shine = el.querySelector<HTMLElement>("[data-tilt-shine]");
      if (shine) {
        shine.style.background = `radial-gradient(circle at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.09) 0%, transparent 62%)`;
        shine.style.transition = "background 0.05s linear";
      }
    },
    [maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    el.style.transition = "transform 0.55s cubic-bezier(0.34,1.56,0.64,1)";
    const shine = el.querySelector<HTMLElement>("[data-tilt-shine]");
    if (shine) {
      shine.style.background = "transparent";
      shine.style.transition = "background 0.4s ease";
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
