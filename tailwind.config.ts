// tailwind.config.ts
const config = {
  theme: {
    extend: {
      keyframes: {
        fill: {
          "0%": { height: "0%" },
          "100%": { height: "100%" },
        },
      },
      animation: {
        // '3s' é o tempo, 'infinite' faz repetir
        fill: "fill 3s ease-in-out infinite",
      },
    },
  },
};
