import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "The Wild Book — A Visual Library of Extraordinary Animals",
    template: "%s — The Wild Book",
  },
  description:
    "An immersive natural history book of the world's most extraordinary animals — on land, in the air and beneath the sea — told through photography, motion and verified science.",
};

export const viewport: Viewport = {
  themeColor: "#02060b",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-dvh bg-abyss text-ivory">
        {children}
        <div aria-hidden className="grain" />
      </body>
    </html>
  );
}
