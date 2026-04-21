import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1c1917",
        paper: "#fafaf9",
        coral: "#ef4444",
        sand: "#f5f5f4",
        moss: "#059669",
        income: "#10b981",
        expense: "#ef4444"
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
