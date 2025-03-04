import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
	"./app/globals.css",
  ],
  theme: {
    extend: {
      colors: {
        accordion: {
          light: '#f9fafb', // Light background for expanded state
          DEFAULT: '#ffffff', // Default background for collapsed state
          border: '#f0f4f8', // Very light border color for collapsed state
          borderExpanded: '#e5e7eb', // Slightly darker but still light border color for expanded state
          hover: '#f3f4f6', // Hover background color
        },
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
    },
	},
  plugins: [],
};
export default config;
