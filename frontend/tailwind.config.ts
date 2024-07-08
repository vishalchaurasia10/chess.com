import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        firaCode: ["Fira Code", "monospace"],
      },
    },
  },
  daisyui: {
    themes: ["dracula"],
  },
  plugins: [
    require('daisyui'),
  ],
};
export default config;
