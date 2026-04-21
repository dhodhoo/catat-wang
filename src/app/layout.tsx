import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import "./globals.css";

const bodyFont = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"]
});

export const metadata: Metadata = {
  title: "CatatWang",
  description: "Personal finance tracker via WhatsApp for Indonesia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${bodyFont.variable} ${monoFont.variable}`}>
        {children}
      </body>
    </html>
  );
}
