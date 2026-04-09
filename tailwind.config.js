 /** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],

  theme: {
    extend: {
      keyframes: {
        fade: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" }
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" }
        },
        scale: {
          "0%": { transform: "scale(0.95)" },
          "100%": { transform: "scale(1)" }
        }
      },

      animation: {
        fade: "fade 0.6s ease-in-out",
        pulse: "pulse 2s infinite",
        scale: "scale 0.3s ease-in-out"
      },

      colors: {
        /* ===== BASE (AliExpress style) ===== */
        primary: "#ff4747",        // CTA principal (rouge AliExpress)
        primaryHover: "#e63939",
        secondary: "#111827",      // texte principal

        background: "#f5f5f5",     // fond global
        surface: "#ffffff",        // cartes

        border: "#e5e7eb",

        text: {
          primary: "#111827",
          secondary: "#4b5563",
          muted: "#9ca3af"
        },

        /* ===== ACTIONS ===== */
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        info: "#3b82f6",

        /* ===== PRIX / PROMO ===== */
        price: "#ff4747",
        discount: "#ff6a00",
        badge: "#ffe4e6",

        /* ===== UI UX ===== */
        overlay: "rgba(0,0,0,0.4)",
        shadow: "0 2px 8px rgba(0,0,0,0.08)"
      },

      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
        serif: ["Cormorant Garamond", "serif"]
      },

      boxShadow: {
        card: "0 2px 8px rgba(0,0,0,0.08)",
        hover: "0 4px 20px rgba(0,0,0,0.12)"
      },

      borderRadius: {
        xl: "12px",
        "2xl": "16px"
      }
    }
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none"
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none"
        }
      });
    }
  ]
};