/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        "primary":    "#4645D7",
        "secondary":  "#9EFEFD",
        "tertiary":   "#A896F6",
        "pink":       "#ff4ecb",
        "background": "#01010A",
        "panel":      "#070818",
        "on-surface": "#f7f3ff",
        "on-surface-variant": "#b9b5d6",
        "surface-container":  "rgba(14,16,44,.8)",
        "surface-container-high": "rgba(7,8,24,.72)",
        "outline-variant": "rgba(168,150,246,.32)",
        "error":  "#ff6b6b",
        "on-primary": "#ffffff",
        "on-secondary": "#003333",
        "primary-container": "#302fa0",
        "on-primary-container": "#e0e0ff",
      },
      fontFamily: {
        serif:  ['Georgia', '"Times New Roman"', 'serif'],
        sans:   ['Inter', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm:   '6px',
        md:   '13px',
        lg:   '18px',
        xl:   '24px',
        '2xl': '30px',
        full: '999px',
      },
      spacing: {
        'nav-h': '72px',
        'section': '64px',
      },
      maxWidth: {
        container: '1220px',
      },
      boxShadow: {
        mfc:   '0 0 34px rgba(70,69,215,.25), 0 0 80px rgba(158,254,253,.08)',
        card:  '0 0 24px rgba(70,69,215,.12)',
        glow:  '0 0 28px rgba(168,150,246,.36)',
        'glow-mint': '0 0 16px rgba(158,254,253,.7)',
      },
    }
  },
  plugins: [],
}
