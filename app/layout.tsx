import "./globals.css";
import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});
const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "SmartSched AI",
  description: "Hackathon-ready manufacturing production scheduling"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>{children}</body>
    </html>
  );
}
