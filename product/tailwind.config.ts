import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark gaming palette, keeping navy/gold continuity with the marketing deck
        bg: {
          DEFAULT: "#070B14",   // near-black navy (page bg)
          elevated: "#0E1423",  // card bg
          hover: "#141B2D",     // card hover
        },
        border: {
          DEFAULT: "#1E2A44",
          bright: "#2A3A5C",
        },
        ink: {
          DEFAULT: "#E6EDF5",   // primary text
          muted: "#8A95A8",     // secondary text
          dim: "#5A6478",       // tertiary text
        },
        navy: "#0B2545",
        gold: "#F5C518",        // predicted / premium accent
        teal: "#22D3EE",        // streaming active accent
        lime: "#10F5A3",        // success / ready
        rose: "#F43F5E",        // warning / traditional-install red
      },
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        "glow-gold": "0 0 24px rgba(245, 197, 24, 0.35)",
        "glow-teal": "0 0 20px rgba(34, 211, 238, 0.35)",
      },
      keyframes: {
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "70%": { transform: "scale(1.2)", opacity: "0" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
      animation: {
        "pulse-ring": "pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
        "slide-in-right": "slide-in-right 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
