import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#B4F000",
        secondary: "#5A6572",
        accent: "#E6EDF3",
        background: "#14181C",
        text: "#E6EDF3",
        error: "#FF4D4F",
      },
      fontFamily: {
        heading: ["var(--font-victory)", "sans-serif"],
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
