/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}




export const theme = {
  extend: {
    colors: {
      primary: '#0F1C2E',
      accent: '#2F80ED',
      background: '#F5F6F8',
      cardBg: '#FFFFFF',
    },
    borderRadius: {
      card: '16px',
      large: '20px',
    },
    fontFamily: {
      inter: ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold', 'Inter_700Bold'],
    },
  },
};
export const plugins = [];
