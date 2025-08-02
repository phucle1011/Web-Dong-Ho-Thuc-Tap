/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  // Thêm dòng này để Tailwind luôn thắng
  important: "#root", // hoặc true (ưu tiên toàn cục)
  theme: {
    extend: {},
  },
  plugins: [],
};

