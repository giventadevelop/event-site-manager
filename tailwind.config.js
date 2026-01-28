import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
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
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
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
        // Syro-Malabar Design System Colors (namespaced with syro- prefix to avoid conflicts)
        "syro-red": {
          DEFAULT: "#bf451e",
          darker: "#be1929",
          hover: "#990b3f",
          light: "#bf451e33",
        },
        "syro-blue": {
          DEFAULT: "#0b2848",
          secondary: "#011e94",
          light: "#798daf",
          dark: "#16253c",
        },
        "syro-orange": "#ff7903",
        "syro-purple": "#6e1b48",
        "syro-maroon": "#77121b",
        "syro-light-gray": "#eaebef",
        "syro-bg-gray": "#f5f6f7",
        "syro-text-gray": "#818181",
        "syro-medium-gray": "#7b869a",
        "syro-dark-gray": "#506276",
        "syro-table-border": "#eaebef",
        "syro-success": {
          DEFAULT: "#25d366",
          bg: "#25d36633",
        },
        "syro-warning": {
          DEFAULT: "#ff7903",
          bg: "#ffc81533",
        },
      },
      fontFamily: {
        // Syro-Malabar Design System Fonts (namespaced with syro- prefix)
        "syro-primary": ["Poppins", "Arial", "Helvetica", "sans-serif"],
        "syro-display": ["Playfair Display", "serif"],
      },
      fontSize: {
        // Syro-Malabar Design System Font Sizes (namespaced with syro- prefix)
        "syro-logo": "1.5rem",
        "syro-h1": "2.8rem",
        "syro-h2": "2.2rem",
        "syro-h3": "1.8rem",
        "syro-h4": "1.5rem",
        "syro-h6": "18px",
        "syro-body": "20px",
        "syro-label": "16px",
        "syro-small": "14px",
        "syro-section-title": "24px",
      },
      spacing: {
        // Syro-Malabar Design System Spacing (namespaced with syro- prefix)
        "syro-xs": "5px",
        "syro-sm": "10px",
        "syro-md": "15px",
        "syro-lg": "20px",
        "syro-xl": "30px",
        "syro-xxl": "40px",
        "syro-xxxl": "60px",
      },
      boxShadow: {
        // Syro-Malabar Design System Shadows (namespaced with syro- prefix)
        "syro-header": "#0b28487d 0px 10px 25px -10px",
        "syro-card": "rgba(50, 50, 93, 0.25) 0px 6px 12px -2px, rgba(0, 0, 0, 0.3) 0px 3px 7px -3px",
        "syro-card-hover": "rgba(0, 0, 0, 0.35) 0px 5px 15px",
      },
      screens: {
        // Syro-Malabar Design System Breakpoints (namespaced with syro- prefix)
        "syro-tablet": "991px",
        "syro-mobile": "576px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

