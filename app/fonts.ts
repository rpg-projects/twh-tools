// app/fonts.ts
import { Walter_Turncoat, Inter } from "next/font/google";

export const titleFont = Walter_Turncoat({
  subsets: ["latin"],
  weight: ["400"],
});

export const bodyFont = Inter({
  subsets: ["latin"],
});
