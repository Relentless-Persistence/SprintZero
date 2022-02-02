module.exports = {
  purge: [ "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}" ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontSize:
      {
        "12": "12px",
        "14": "14px",
        "16": "16px",
        "18": "18px",
        "20": "20px",
      },
      spacing:
      {
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
