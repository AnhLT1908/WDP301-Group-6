module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      clipPath: {
        trapezoid: "polygon(10% 0, 100% 0, 90% 100%, 0 100%)",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
