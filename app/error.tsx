"use client";

import { useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Label from "@/components/ui/Label";
import { brand, footerSection } from "@/site.config";

type ErrorPageProps = {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
};

export default function ErrorPage({ error, retry, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleRetry = () => {
    if (typeof retry === "function") {
      retry();
    } else if (typeof reset === "function") {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <main
      id="main"
      data-surface="ink"
      className="relative flex min-h-screen min-h-[100dvh] flex-col justify-between bg-ink text-bone"
    >
      {/* Minimal header — logo link home */}
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

      {/* Calm recovery message */}
      <div
        style={{
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
        className="mx-auto w-full max-w-[1600px] py-16 md:px-10 md:py-24"
      >
        <div className="border-b border-bone/15 pb-4">
          <Label className="text-bone/75">ERROR — TEMPORARY HICCUP</Label>
        </div>

        <h1 className="headline mt-8 max-w-[16ch] text-balance text-display text-bone md:mt-10">
          Something hit a <span className="accent">snag</span>.
        </h1>

        <p className="measure mt-6 text-lede text-bone/80">
          Nothing you did caused this. Give it another try, or head back to the home page.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
          <button
            type="button"
            onClick={handleRetry}
            data-cursor="grow"
            data-cursor-surface="volt"
            className="group/btn relative inline-flex h-12 min-h-[44px] items-center gap-3 overflow-hidden rounded-full bg-volt pr-2 pl-6 text-[0.9375rem] font-medium tracking-[-0.01em] text-ink transition-colors duration-300 md:h-14 md:pl-7 md:text-base"
          >
            <span>Try again</span>
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-full bg-ink text-volt transition-transform duration-500 group-hover/btn:rotate-45 md:size-10"
            >
              <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M2 10 10 2M4 2h6v6" strokeLinecap="square" />
              </svg>
            </span>
          </button>

          <Button href="/" variant="outline">
            Back to home
          </Button>
        </div>
      </div>

      {/* Minimal footer line */}
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
