"use client";
import { ReactNode, CSSProperties } from "react";
import { use3DTilt } from "../hooks/use3DTilt";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  maxTilt?: number;
}

export default function TiltCard({ children, className, style, maxTilt = 12 }: TiltCardProps) {
  const { ref, onMouseMove, onMouseLeave } = use3DTilt(maxTilt);

  return (
    <div
      ref={ref}
      className={className}
      style={{ position: "relative", ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div
        data-tilt-shine=""
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          zIndex: 10,
        }}
      />
      {children}
    </div>
  );
}
