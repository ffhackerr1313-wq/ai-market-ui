// Shared mutable state between IntersectionObserver (DOM) and useFrame (R3F).
// Plain object reference — no React state — so updating it never triggers re-renders.
export const sceneScroll = { section: 0 };
