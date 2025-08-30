import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      clipPath: {
        custom:
          "polygon(0% 0%, 100% 0%, 100% 75%, 75% 75%, 75% 100%, 50% 75%, 0% 75%)",
      },
      colors: {
        "space-black": "#050714",
        "space-blue": "#0a1128",
        "space-purple": "#3a0ca3",
        "space-pink": "#f72585",
        "space-teal": "#4cc9f0",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      backgroundImage: {
        "space-gradient":
          "linear-gradient(to bottom, #050714, #0a1128, #240046)",
        "star-pattern": "url('/images/space-bg.webp')",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        scrolldown: "scrolldown 1.5s ease-in-out infinite",
        arrow: "arrow 1.5s ease-in-out infinite",
        "arrow-delay": "arrow 1.5s ease-in-out 0.75s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
        scrolldown: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(12px)" },
        },
        arrow: {
          "0%": { opacity: "0", transform: "translateY(-5px) rotate(45deg)" },
          "50%": { opacity: "1", transform: "translateY(0) rotate(45deg)" },
          "100%": { opacity: "0", transform: "translateY(5px) rotate(45deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
