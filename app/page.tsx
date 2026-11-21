import Intro from "@/components/intro/Intro";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/hero/Ticker";
import SectionPlaceholder from "@/components/sections/SectionPlaceholder";
import { sections } from "@/site.config";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        {/* HeroObject (3D browser slab) plugs into Hero's `object` prop — waiting for Opus */}
        <Hero ticker={<Ticker />} />

        {sections.map((section, i) => (
          <SectionPlaceholder
            key={section.id}
            id={section.id}
            index={i + 2}
            label={section.label}
            title={section.title}
            surface={section.surface}
          />
        ))}
      </main>
    </>
  );
}
