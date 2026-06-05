import type { Metadata } from "next";
import "./globals.css";
import BootSequence from "@/components/intro/BootSequence";

export const metadata: Metadata = {
  title: "JARVIS · AI Predictor & Portfolio Management — Built by Tanishq Verma",
  description: "Next-generation AI trading operating system — powered by LSTM + ICT",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Preload Jarvis HUD fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ margin: 0, padding: 0, background: "#000308" }}>
        {/*
          BootSequence replaces IntroGate.
          - gateWithStorage=true  → plays once per browser session, then skips
          - gateWithStorage=false → always plays (useful during development)
        */}
        <BootSequence gateWithStorage={true}>
          {children}
        </BootSequence>
      </body>
    </html>
  );
}
