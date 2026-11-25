import dynamic from "next/dynamic";
import Intro from "@/components/intro/Intro";
import Nav from "@/components/nav/Nav";
import Hero from "@/components/hero/Hero";
import Ticker from "@/components/hero/Ticker";
import SectionPlaceholder from "@/components/sections/SectionPlaceholder";
import { sections, showUnfinishedSections, sectionReady } from "@/site.config";

const ServicesJourney = dynamic(() => import("@/components/sections/ServicesJourney"));
const LiveDemos = dynamic(() => import("@/components/sections/LiveDemos"));
const ProcessSection = dynamic(() => import("@/components/sections/ProcessSection"));
const TeamSection = dynamic(() => import("@/components/sections/TeamSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"));
const Footer = dynamic(() => import("@/components/sections/Footer"));

export default function Home() {
  return (
    <>
      <Intro />
      <Nav />
      <main id="main">
        <Hero ticker={<Ticker />} />

        {sections.map((section, i) => {
          const isReady = sectionReady[section.id];
          const isVisible = showUnfinishedSections || isReady;
          if (!isVisible) return null;

          if (section.id === "services") return <ServicesJourney key={section.id} />;
          if (section.id === "demos") return <LiveDemos key={section.id} />;
          if (section.id === "process") return <ProcessSection key={section.id} />;
          if (section.id === "team") return <TeamSection key={section.id} />;
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
