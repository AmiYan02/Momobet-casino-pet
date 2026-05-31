import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        abyss: "#060807",
        charcoal: "#0a0f0c",
        moss: "#77b255",
        neon: "#75ff8f",
        toxic: "#97ff5d",
        glass: "rgba(11, 18, 14, 0.72)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(117, 255, 143, 0.18), 0 12px 48px rgba(87, 255, 144, 0.14)",
        card: "0 18px 50px rgba(0, 0, 0, 0.45)",
      },
      backgroundImage: {
        "hero-radial":
          "radial-gradient(circle at top, rgba(117,255,143,0.18), transparent 35%), radial-gradient(circle at 20% 20%, rgba(151,255,93,0.15), transparent 25%), radial-gradient(circle at 80% 0%, rgba(78, 110, 68, 0.24), transparent 30%)",
      },
    },
  },
  plugins: [],
};

export default config;
