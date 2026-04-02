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
        ink: "#101828",
        paper: "#faf7f2",
        coral: "#ef6f52",
        sand: "#f5ebda",
        moss: "#35594a"
      },
      boxShadow: {
        card: "0 12px 28px rgba(16, 24, 40, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
