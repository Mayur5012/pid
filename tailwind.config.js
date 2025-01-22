/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee linear infinite",
        slamattack: "slam 0.7s ease-in-out",
        shake: "shake 0.5s ease-in-out",
        bounce: "bounce 1s infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        slam: {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "0",
          },
          "70%": {
            transform: "translateY(0) rotate(10deg)",
            opacity: "1",
          },
          "85%": {
            transform: "rotate(-5deg)",
          },
          "100%": {
            transform: "rotate(0deg)",
          },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },

        bounce: {
          "0%, 100%": {
            transform: "translateY(-25%)",
            animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)",
          },
          "50%": {
            transform: "translateY(0)",
            animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)",
          },
        },
      },
      rotate: {
        "y-180": "rotateY(180deg)",
      },
      gridTemplateRows: {
        "[auto,auto,1fr]": "auto auto 1fr",
      },
      colors: {
        cyberpurple: "#8e44ad",
        cyberpink: "#ff79c6",
        cyberyellow: "#FFD700",
        cyberred: "#FF4C4C",
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
      },
    },
    fontFamily: {
      premium: ["Cinzel", "serif"],
      orbitron: ["Orbitron", "sans-serif"],
      roboto: ["Roboto", "sans-serif"],
      vt323: ["VT323", "monospace"],
      body: [
        "Inter",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "system-ui",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
      sans: [
        "Inter",
        "ui-sans-serif",
        "system-ui",
        "-apple-system",
        "system-ui",
        "Segoe UI",
        "Roboto",
        "Helvetica Neue",
        "Arial",
        "Noto Sans",
        "sans-serif",
        "Apple Color Emoji",
        "Segoe UI Emoji",
        "Segoe UI Symbol",
        "Noto Color Emoji",
      ],
    },
  },
  variants: {
    extend: {
      animation: ["hover", "group-hover"],
      transform: ["hover", "group-hover"],
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
  ],
};
