import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { brand, colors, meta } from "@/site.config";
import { INTRO_STORAGE_KEY } from "@/lib/intro";
import SmoothScroll from "@/components/providers/SmoothScroll";
import ScrollProgress from "@/components/ui/ScrollProgress";
import Cursor from "@/components/ui/Cursor";
import "./globals.css";

const __Bricolage_Grotesque = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  style: "normal",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});
const __Instrument_Serif = localFont({
  src: "./fonts/instrument-serif-latin-400-italic.woff2",
  variable: "--font-instrument",
  weight: "400",
  style: "italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});
const __Geist = localFont({
  src: "./fonts/geist-latin.woff2",
  variable: "--font-geist",
  weight: "100 900",
  style: "normal",
  display: "swap",
});
const __JetBrains_Mono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-jetbrains",
  weight: "400 500",
  style: "normal",
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
  viewportFit: "cover",
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
      className={`${__Bricolage_Grotesque.variable} ${__Instrument_Serif.variable} ${__Geist.variable} ${__JetBrains_Mono.variable}`}
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
