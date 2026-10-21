/** Motion tokens (motion-foundations convention): every animation imports these, no inline numbers. */
export const motionTokens = {
  duration: { fast: 0.15, normal: 0.3, slow: 0.6, story: 1.2 },
  easing: { smooth: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  distance: { sm: 8, md: 16, lg: 32, xl: 64 },
  scale: { press: 0.97, subtle: 0.98, pop: 1.03 },
  stagger: { tight: 0.05, normal: 0.08 },
} as const;

export const springs = {
  snappy: { type: "spring", stiffness: 500, damping: 32 },
  gentle: { type: "spring", stiffness: 220, damping: 26 },
} as const;
