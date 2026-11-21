import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { brand, colors, meta } from "@/site.config";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});
const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false, // labels only — not worth competing with the display face
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: meta.title,
  description: meta.description,
  openGraph: { title: meta.title, description: meta.description, siteName: brand.name },
};

export const viewport: Viewport = {
  themeColor: colors.ink,
  colorScheme: "dark",
};

/**
 * Runs synchronously before first paint (see Next docs: "preventing flash
 * before hydration"). Decides whether the intro plays, so the overlay is
 * either painted from frame one or never painted at all — no flash, and no
 * hydration mismatch because React never renders this attribute differently.
 * The server default is "seen", so no-JS visitors never get stuck behind it.
 */
const prePaintScript = `(function(){var d=document.documentElement;d.classList.add('js');var s='seen';try{if(!sessionStorage.getItem('${INTRO_STORAGE_KEY}')){s=matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'play'}}catch(e){}d.setAttribute('data-intro',s)})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-intro="seen"
      suppressHydrationWarning
      className={`${bricolage.variable} ${instrument.variable} ${geist.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body>
        <SmoothScroll>
          <ScrollProgress />
          {children}
          <Cursor />
        </SmoothScroll>
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
