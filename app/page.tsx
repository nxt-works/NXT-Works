import Intro from "@/components/intro/Intro";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/hero/Ticker";
import SectionPlaceholder from "@/components/sections/SectionPlaceholder";
import ServicesJourney from "@/components/sections/ServicesJourney";
import LiveDemos from "@/components/sections/LiveDemos";
import { sections } from "@/site.config";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        {/* HeroObject (3D slab) kept in components/hero/HeroObject.tsx for Stage 2 reuse */}
        <Hero ticker={<Ticker />} />

        {sections.map((section, i) => {
          if (section.id === "services") return <ServicesJourney key={section.id} />;
          if (section.id === "demos") return <LiveDemos key={section.id} />;
          return (
            <SectionPlaceholder
              key={section.id}
              id={section.id}
              index={i + 2}
              label={section.label}
              title={section.title}
              surface={section.surface}
            />
          );
        })}
      </main>
    </>
  );
}
