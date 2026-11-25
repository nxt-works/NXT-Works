import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { brand, footerSection } from "@/site.config";

export default function NotFound() {
  return (
    <main
      id="main"
      data-surface="ink"
      className="relative flex min-h-screen min-h-[100dvh] flex-col justify-between bg-ink text-bone"
    >
      {/* Minimal header — logo link home, nav intentionally omitted */}
      <header
        style={{
          paddingTop: "max(1.5rem, env(safe-area-inset-top))",
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
        className="mx-auto w-full max-w-[1600px] md:px-10 md:pt-8"
      >
        <Link
          href="/"
          aria-label={`${brand.name} — Back to home`}
          className="inline-flex min-h-[44px] min-w-[44px] items-center"
        >
          <Logo variant="light" className="h-6 w-auto" title="" />
        </Link>
      </header>

      {/* Main 404 statement */}
      <div
        style={{
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
        className="mx-auto w-full max-w-[1600px] py-16 md:px-10 md:py-24"
      >
        <div className="border-b border-bone/15 pb-4">
          <Label className="text-bone/75">404 — PAGE NOT FOUND</Label>
        </div>

        <h1 className="headline mt-8 max-w-[16ch] text-balance text-display text-bone md:mt-10">
          That page took a <span className="accent">wrong</span> turn.
        </h1>

        <p className="measure mt-6 text-lede text-bone/80">
          The link may be out of date, or the address might have a typo. Head back to the start and pick up from there.
        </p>

        <div className="mt-8 md:mt-10">
          <Button href="/">Back to home</Button>
        </div>
      </div>

      {/* Minimal footer line so nothing breaks when landing on an unknown route */}
      <footer
        style={{
          paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
        className="mx-auto w-full max-w-[1600px] md:px-10 md:pb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bone/12 pt-5">
          <p className="font-mono text-[12px] tracking-[0.12em] text-bone/65 uppercase">
            &copy; {footerSection.year} {brand.name}
          </p>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center font-mono text-[12px] tracking-[0.12em] text-bone/75 uppercase transition-colors hover:text-volt"
          >
            Home
          </Link>
        </div>
      </footer>
    </main>
  );
}
