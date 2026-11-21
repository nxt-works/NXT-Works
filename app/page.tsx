import Intro from "@/components/intro/Intro";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        <Hero />
        <section id="services" className="min-h-svh bg-bone" data-surface="bone" />
      </main>
    </>
  );
}
