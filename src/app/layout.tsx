import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { MusicPlayer } from "@/components/MusicPlayer";

const display = Bodoni_Moda({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Founders Arena: The Dungeon",
  description:
    "Ideas go in. Founders come out. Six AI council members put your startup decision on trial before you act.",
  applicationName: "Founders Arena",
};

export const viewport: Viewport = {
  themeColor: "#050305",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className={`${display.variable} ${mono.variable} antialiased`}>
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
