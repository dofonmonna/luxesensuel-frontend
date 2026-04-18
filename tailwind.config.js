/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // ✅ Couleur principale de la marque
        sensual: {
          DEFAULT: "#CC0000",
          50:  "#fff5f5",
          100: "#ffe0e0",
          200: "#ffc0c0",
          300: "#ff8080",
          400: "#ff4040",
          500: "#CC0000",
          600: "#aa0000",
          700: "#880000",
          800: "#660000",
          900: "#440000",
        },
        // ✅ Orange pour promotions
        promo: {
          DEFAULT: "#FF6900",
          light: "#FF8C00",
          dark:  "#CC5500",
        },
        // ✅ Couleurs store (AliExpress-style)
        store: {
          bg:      "#F5F5F5",
          card:    "#FFFFFF",
          border:  "#E8E8E8",
          text:    "#111827",
          muted:   "#6B7280",
          light:   "#9CA3AF",
        },
        // Palette luxe originale conservée
        luxe: {
          violet:  "#7c3aed",
          purple:  "#9333ea",
          pink:    "#ec4899",
          rose:    "#f43f5e",
          orange:  "#f97316",
          amber:   "#f59e0b",
          yellow:  "#eab308",
          emerald: "#10b981",
          teal:    "#14b8a6",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', 'serif'],
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        // ✅ Gradients AliExpress-style
        'gradient-sensual':  'linear-gradient(135deg, #CC0000 0%, #FF4040 100%)',
        'gradient-promo':    'linear-gradient(135deg, #FF6900 0%, #FF8C00 100%)',
        'gradient-hero':     'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        'gradient-card':     'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.7) 100%)',
        // Gradients original conservés
        'gradient-luxe':     'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
        'gradient-violet':   'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
        'gradient-header':   'linear-gradient(90deg, #CC0000 0%, #aa0000 50%, #880000 100%)',
        'gradient-radial':   'radial-gradient(var(--tw-gradient-stops))',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
        "fade-in": {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(204,0,0,0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(204,0,0,0.3)" },
        },
        "shimmer": {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "countdown": {
          "0%":   { transform: "scale(1)" },
          "50%":  { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "fade-in":         "fade-in 0.5s ease-out",
        "slide-in":        "slide-in 0.3s ease-out",
        "float":           "float 6s ease-in-out infinite",
        "pulse-glow":      "pulse-glow 3s ease infinite",
        "shimmer":         "shimmer 2s linear infinite",
        "countdown":       "countdown 1s ease infinite",
      },
      boxShadow: {
        'card':    '0 2px 8px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.15)',
        'sensual': '0 4px 20px rgba(204,0,0,0.3)',
        'header':  '0 2px 8px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}