import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm parchment palette — inspired by CCAU design prototype
        paper: "#f1e4c8",       // warm parchment background
        cream: "#fbf2da",       // lighter cream
        creamLight: "#fef7e6",  // lightest cream — card backgrounds
        ink: "#2c1810",         // cacao deep — primary dark
        cacao: "#6b3d2a",       // medium brown — secondary text/stamps
        cacaoMid: "#4d2b1d",    // mid brown — body text
        corkRed: "#b8421f",     // burnt red — accents, CTAs
        posterYellow: "#c89432", // ochre — focus rings, highlights
        grass: "#5a6b2e",       // olive — music/community discipline
        pinkPunch: "#c98979",   // dusty pink — exhibition discipline
        leeBlue: "#277da1",     // kept for admin-side use
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "Helvetica Neue", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        poster: "5px 6px 0 #2c1810",
        paste: "3px 4px 0 #2c1810",
      },
    },
  },
  plugins: [],
} satisfies Config;
