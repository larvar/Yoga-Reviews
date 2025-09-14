import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}", // scan everything under src/
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Add patterns here if you ever build class names dynamically:
    // /^bg-(red|blue|green)-(100|500)$/,
    // /^text-(xs|sm|base|lg)$/,
  ],
};

export default config;
