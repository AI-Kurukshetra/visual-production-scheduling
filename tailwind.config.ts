/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d7eaff",
          200: "#b3d7ff",
          300: "#7fbcff",
          400: "#4a9eff",
          500: "#1f7eff",
          600: "#0f5fe6",
          700: "#0b49b3",
          800: "#093a8a",
          900: "#072d6b"
        }
      },
      boxShadow: {
        glow: "0 10px 30px rgba(31, 126, 255, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
