import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: "#071116",
        panel: "#0d1a22",
        line: "#1a3540",
        accent: "#38f2c2",
        accent2: "#5cb8ff",
        text: "#e6f3f7",
        muted: "#8ba7b1",
        warn: "#ffb86b"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(56, 242, 194, 0.2), 0 16px 48px rgba(2, 12, 18, 0.45)"
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(92, 184, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(92, 184, 255, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;
