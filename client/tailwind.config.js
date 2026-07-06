/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#4645D7",
        "on-primary": "#ffffff",
        "primary-container": "#302fa0",
        "on-primary-container": "#e0e0ff",
        "primary-fixed": "#4645D7",
        "primary-fixed-dim": "#302fa0",
        "on-primary-fixed": "#ffffff",
        "on-primary-fixed-variant": "#e0e0ff",
        "secondary": "#9EFEFD",
        "on-secondary": "#003333",
        "secondary-container": "#004d4d",
        "on-secondary-container": "#9EFEFD",
        "secondary-fixed": "#9EFEFD",
        "secondary-fixed-dim": "#5bcbc9",
        "on-secondary-fixed": "#003333",
        "on-secondary-fixed-variant": "#004d4d",
        "tertiary": "#A896F6",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#5c47b5",
        "on-tertiary-container": "#d6ccff",
        "tertiary-fixed": "#A896F6",
        "tertiary-fixed-dim": "#8670df",
        "on-tertiary-fixed": "#ffffff",
        "on-tertiary-fixed-variant": "#d6ccff",
        "background": "#01010A",
        "on-background": "#e8e0e5",
        "surface": "#01010A",
        "surface-dim": "#01010A",
        "surface-bright": "#1a1a3a",
        "on-surface": "#e8e0e5",
        "on-surface-variant": "#a09eb5",
        "surface-container-lowest": "#01010A",
        "surface-container-low": "#050515",
        "surface-container": "#0a0a20",
        "surface-container-high": "#10102b",
        "surface-container-highest": "#151535",
        "surface-tint": "#4645D7",
        "outline": "#504d65",
        "outline-variant": "#302f45",
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
        "inverse-surface": "#e8e0e5",
        "inverse-on-surface": "#01010A",
        "inverse-primary": "#8b8aff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "section-gap": "120px",
        "container-max": "1440px",
        "gutter": "24px",
        "margin-desktop": "80px",
        "margin-mobile": "20px"
      },
      fontFamily: {
        "title-md": ["Playfair Display", "serif"],
        "label-sm": ["Manrope", "sans-serif"],
        "body-md": ["Manrope", "sans-serif"],
        "headline-lg": ["Playfair Display", "serif"],
        "headline-lg-mobile": ["Playfair Display", "serif"],
        "display-xl": ["Playfair Display", "serif"],
        "body-lg": ["Manrope", "sans-serif"]
      },
      fontSize: {
        "title-md": ["24px", { "lineHeight": "1.4", "fontWeight": "500" }],
        "label-sm": ["12px", { "lineHeight": "1.2", "letterSpacing": "0.1em", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-lg": ["48px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "headline-lg-mobile": ["32px", { "lineHeight": "1.2", "fontWeight": "600" }],
        "display-xl": ["72px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    }
  },
  plugins: [],
}
