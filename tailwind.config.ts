import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Signature accent — burnt vermillion / rust ink
        primary: {
          DEFAULT: "#A83A26",
          50: "#FBF1ED",
          100: "#F6DCD2",
          200: "#ECBCAB",
          300: "#E0967E",
          400: "#D26E51",
          500: "#C4452D",
          600: "#A83A26",
          700: "#88301F",
          800: "#6C2719",
          900: "#561F14",
        },
        // Supporting tone — deep pine / lexicon green
        secondary: {
          DEFAULT: "#1F5A4F",
          50: "#EDF4F1",
          100: "#D2E6DF",
          200: "#A4CCC1",
          300: "#71AE9F",
          400: "#438C7C",
          500: "#2A6F61",
          600: "#1F5A4F",
          700: "#1A4840",
          800: "#163A34",
          900: "#112E29",
        },
        accent: "#C2912E",
        // Warm stone — paper, taupe, espresso (replaces cold grays everywhere)
        neutral: {
          25: "#FBF8F1",
          50: "#F6F1E7",
          100: "#ECE5D6",
          200: "#DBD2BF",
          300: "#C2B8A0",
          400: "#A0937B",
          500: "#7E715B",
          600: "#615746",
          700: "#493F33",
          800: "#322B22",
          900: "#211C16",
        },
      },
      letterSpacing: {
        widest: "0.18em",
      },
      // Softer, rounder scale — editorial soul, modern surfaces
      borderRadius: {
        none: "0",
        sm: "0.5rem",
        DEFAULT: "0.75rem",
        md: "0.875rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        // Diffuse, layered — depth instead of hard offsets
        paper:
          "0 1px 2px rgba(33,28,22,0.04), 0 14px 34px -20px rgba(33,28,22,0.22)",
        lift:
          "0 8px 18px -10px rgba(33,28,22,0.16), 0 30px 56px -28px rgba(33,28,22,0.36)",
        glow: "0 10px 26px -10px rgba(168,58,38,0.5)",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(circle at 1px 1px, rgba(33,28,22,0.05) 1px, transparent 0)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "scale-in": "scaleIn 0.2s ease-out",
        rise: "rise 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "draw-rule": "drawRule 0.9s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        rise: {
          "0%": { transform: "translateY(14px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        drawRule: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
