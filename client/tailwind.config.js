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
        "on-tertiary-fixed-variant": "#464740",
        "tertiary-fixed": "#e4e3d8",
        "surface-container-lowest": "#100d10",
        "inverse-surface": "#e8e0e5",
        "primary-fixed": "#f4d9ff",
        "error": "#ffb4ab",
        "outline": "#978e98",
        "primary-fixed-dim": "#ddbaee",
        "surface-bright": "#3c383c",
        "on-primary-fixed": "#290f39",
        "surface": "#151216",
        "surface-dim": "#151216",
        "surface-container-high": "#2c292c",
        "tertiary-fixed-dim": "#c7c7bd",
        "on-tertiary": "#30312a",
        "secondary-fixed-dim": "#d7bcf4",
        "on-error": "#690005",
        "on-tertiary-container": "#a2a299",
        "tertiary-container": "#383932",
        "on-primary-container": "#b795c8",
        "background": "#151216",
        "surface-container": "#211f22",
        "inverse-primary": "#705381",
        "inverse-on-surface": "#332f33",
        "on-surface": "#e8e0e5",
        "on-primary": "#402550",
        "on-error-container": "#ffdad6",
        "tertiary": "#c7c7bd",
        "on-primary-fixed-variant": "#583c68",
        "error-container": "#93000a",
        "on-background": "#e8e0e5",
        "surface-tint": "#ddbaee",
        "on-tertiary-fixed": "#1b1c16",
        "outline-variant": "#4b454d",
        "on-secondary-container": "#c5aae2",
        "surface-container-highest": "#373437",
        "on-secondary": "#3b2655",
        "secondary": "#d7bcf4",
        "primary-container": "#482d58",
        "surface-container-low": "#1d1b1e",
        "on-surface-variant": "#cec3ce",
        "secondary-fixed": "#eedbff",
        "secondary-container": "#523d6d",
        "surface-variant": "#373437",
        "primary": "#ddbaee",
        "on-secondary-fixed-variant": "#523d6d",
        "on-secondary-fixed": "#25103e"
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
