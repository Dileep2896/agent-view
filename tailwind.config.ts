import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        night: { 950: "#060b14", 900: "#0b1322", 800: "#121c30", 700: "#1b2840" },
        accent: { DEFAULT: "#38bdf8", soft: "#7dd3fc" },
      },
      keyframes: {
        pulseSpan: { "0%,100%": { boxShadow: "0 0 0 0 rgba(56,189,248,0)" }, "50%": { boxShadow: "0 0 0 4px rgba(56,189,248,.45)" } },
        drift: { from: { backgroundPosition: "0 0, 0 0" }, to: { backgroundPosition: "400px 200px, -300px 300px" } },
      },
      animation: { pulseSpan: "pulseSpan 0.9s ease-in-out 2", drift: "drift 120s linear infinite" },
    },
  },
  plugins: [],
};
export default config;
