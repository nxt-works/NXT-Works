import Logo from "@/components/Logo";

// Checkpoint A preview: design tokens + logo variants. Replaced in Checkpoint C.
export default function Home() {
  return (
    <main className="min-h-dvh">
      <section className="grid min-h-[60vh] place-items-center gap-10 bg-ink p-10">
        <Logo className="w-[min(70vw,520px)]" />
        <p className="label text-smoke">01 / 09 — Design system preview</p>
        <h1 className="headline text-display text-bone">
          We build what&apos;s <span className="accent">next</span>
        </h1>
      </section>
      <section data-surface="bone" className="grid min-h-[40vh] place-items-center gap-8 bg-bone p-10 text-ink">
        <Logo variant="dark" className="w-[min(60vw,420px)]" />
        <Logo variant="dark" mark className="w-12" />
      </section>
    </main>
  );
}
