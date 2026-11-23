import Intro from "@/components/intro/Intro";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/hero/Ticker";
import SectionPlaceholder from "@/components/sections/SectionPlaceholder";
import ServicesJourney from "@/components/sections/ServicesJourney";
import LiveDemos from "@/components/sections/LiveDemos";
import ProcessSection from "@/components/sections/ProcessSection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import Footer from "@/components/sections/Footer";
import { sections, showUnfinishedSections, sectionReady } from "@/site.config";

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        {/* HeroObject (3D slab) kept in components/hero/HeroObject.tsx for Stage 2 reuse */}
        <Hero ticker={<Ticker />} />

        {sections.map((section, i) => {
          const isReady = sectionReady[section.id];
          const isVisible = showUnfinishedSections || isReady;
          if (!isVisible) return null;

          if (section.id === "services") return <ServicesJourney key={section.id} />;
          if (section.id === "demos") return <LiveDemos key={section.id} />;
          if (section.id === "process") return <ProcessSection key={section.id} />;
          if (section.id === "faq") return <FaqSection key={section.id} />;
          if (section.id === "contact") return <ContactSection key={section.id} />;
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
      <Footer />
    </>
  );
}
