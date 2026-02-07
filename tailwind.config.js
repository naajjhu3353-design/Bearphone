/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // BEAR PHONE Custom Colors
        electric: {
          DEFAULT: "#007AFF",
          light: "#3395FF",
          dark: "#0056B3",
          glow: "rgba(0, 122, 255, 0.5)",
        },
        carbon: {
          DEFAULT: "#0F111A",
          light: "#1A1D2A",
          lighter: "#252A3A",
          dark: "#08090F",
        },
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glow: "0 0 20px rgba(0, 122, 255, 0.5)",
        "glow-lg": "0 0 40px rgba(0, 122, 255, 0.6)",
        "glow-sm": "0 0 10px rgba(0, 122, 255, 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0, 122, 255, 0.5)" },
          "50%": { boxShadow: "0 0 40px rgba(0, 122, 255, 0.8)" },
        },
        "text-glow": {
          "0%, 100%": { textShadow: "0 0 10px rgba(0, 122, 255, 0.5)" },
          "50%": { textShadow: "0 0 20px rgba(0, 122, 255, 0.8), 0 0 30px rgba(0, 122, 255, 0.6)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "claw-swipe": {
          "0%": { transform: "translateX(-100%) rotate(-15deg)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateX(100%) rotate(-15deg)", opacity: "0" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "text-glow": "text-glow 2s ease-in-out infinite",
        "float": "float 3s ease-in-out infinite",
        "claw-swipe": "claw-swipe 1.5s ease-in-out",
        "spin-slow": "spin-slow 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
