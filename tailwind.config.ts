import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fff7e8",
        ink: "#24201c",
        corkRed: "#e94f37",
        leeBlue: "#277da1",
        posterYellow: "#f9c74f",
        grass: "#43aa8b",
        pinkPunch: "#f15bb5",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "Atkinson Hyperlegible", "Arial", "sans-serif"],
      },
      boxShadow: {
        poster: "4px 4px 0 #24201c",
      },
    },
  },
  plugins: [],
} satisfies Config;
