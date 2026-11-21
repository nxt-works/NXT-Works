import Intro from "@/components/intro/Intro";
import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <>
      <Intro />
      <main id="main">
        <Hero />
        <section id="services" className="min-h-svh bg-bone" data-surface="bone" />
      </main>
    </>
  );
}
