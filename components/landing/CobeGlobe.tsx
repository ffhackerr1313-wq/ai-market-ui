"use client";
import { useEffect, useRef } from "react";
import createGlobe from "cobe";

export default function CobeGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    let phi = 1.18; // Start centred on India

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = {
      devicePixelRatio: 2,
      width:  800,
      height: 800,
      phi:    1.18,
      theta:  0.18,
      dark:   1,
      diffuse: 1.4,
      mapSamples:    16000,
      mapBrightness: 8,
      baseColor:   [0.01, 0.05, 0.12],
      markerColor: [0.0,  1.0,  0.63],
      glowColor:   [0.0,  0.87, 0.98],
      markers: [
        { location: [19.0760, 72.8777], size: 0.10 },
        { location: [28.6139, 77.2090], size: 0.07 },
        { location: [12.9716, 77.5946], size: 0.06 },
        { location: [22.5726, 88.3639], size: 0.05 },
        { location: [17.3850, 78.4867], size: 0.05 },
      ],
      onRender: (state: Record<string, number>) => {
        phi += 0.003;
        state.phi = phi;
      },
    };
    const globe = createGlobe(canvasRef.current, opts);

    return () => globe.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={800}
      style={{
        width:  "clamp(280px, 40vw, 460px)",
        height: "clamp(280px, 40vw, 460px)",
        opacity: 0.88,
        filter: "drop-shadow(0 0 40px rgba(0,223,251,0.25))",
      }}
    />
  );
}
