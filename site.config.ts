/**
 * SITE CONFIG — the single source of truth for brand text, colours and links.
 *
 * Renaming the agency? Change `brand` below. Nothing else in the codebase
 * hardcodes the name. (The logo artwork lives only in components/Logo.tsx
 * and app/icon.svg.)
 *
 * Colours here are mirrored as CSS custom properties in app/globals.css
 * (@theme block). If you change a hex value, change it there too — CSS
 * cannot import TS at build time without extra tooling, and keeping a
 * duplicated 5-line palette is cheaper than that tooling.
 */

export const brand = {
  name: "NXT Agency",
  /** Short form used in tight places (eyebrow labels, ticker). */
  short: "NXT",
  tagline: "Websites, dashboards and automations for growing businesses.",
  email: "hello@nxt.agency",
  /** Used for metadataBase / canonical URLs. */
  url: "https://nxt.agency",
} as const;

export const colors = {
  ink: "#0C0C0D",
  bone: "#EDE8DF",
  volt: "#C8FF3D",
  graphite: "#1A1A1C",
  smoke: "#8A867D",
} as const;

/** The one easing curve used across the site (CSS + GSAP). */
export const easing = {
  css: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** GSAP CustomEase-free equivalent: registered in lib/gsap.ts as "nxt". */
  name: "nxt",
} as const;

export type SectionId =
  | "services"
  | "proof"
  | "demos"
  | "process"
  | "team"
  | "packages"
  | "faq"
  | "contact";

/** Ordered list of page sections. Index labels ("02 / 09") derive from this order. */
export const sections: {
  id: SectionId;
  label: string;
  /** Headline split into [before, italicWord, after] — one serif-italic word per headline. */
  title: [string, string, string];
  surface: "ink" | "bone";
}[] = [
  { id: "services", label: "Services Journey", title: ["From first call to ", "launch", "."], surface: "bone" },
  { id: "proof", label: "Proof", title: ["Work that ", "earns", " its keep."], surface: "ink" },
  { id: "demos", label: "Demos", title: ["Click it. ", "Break", " it. Try it."], surface: "bone" },
  { id: "process", label: "Process", title: ["Four steps. ", "Zero", " mystery."], surface: "ink" },
  { id: "team", label: "Team", title: ["Five people. ", "One", " standard."], surface: "bone" },
  { id: "packages", label: "Packages", title: ["Pick a ", "starting", " point."], surface: "ink" },
  { id: "faq", label: "FAQ", title: ["Fair ", "questions", ", straight answers."], surface: "bone" },
  { id: "contact", label: "Contact", title: ["Let's build your ", "next", " thing."], surface: "ink" },
];

/** Total screens incl. the hero — used for "01 / 09" style index labels. */
export const sectionCount = sections.length + 1;

export const nav = {
  links: [
    { label: "Services", href: "#services" },
    { label: "Proof", href: "#proof" },
    { label: "Process", href: "#process" },
    { label: "Team", href: "#team" },
    { label: "Packages", href: "#packages" },
  ],
  cta: { label: "Start a project", href: "#contact" },
} as const;

export const hero = {
  eyebrow: `${brand.short} AGENCY / WEBSITES, DASHBOARDS, AUTOMATIONS`,
  /** Headline split around the single serif-italic accent word. */
  headline: { before: "We build what's ", accent: "next", after: " for your business." },
  subline: "Websites, dashboards and automations for growing businesses. Built fast. Built to last.",
  primaryCta: { label: "Start a project", href: "#contact" },
  secondaryCta: { label: "See how it works", href: "#services" },
  /** Small annotation beside the 3D object. */
  figure: "FIG. 01 — THE NEXT PAGE",
  status: "Booking projects for Q1 2027",
  ticker: [
    "Websites that sell",
    "Dashboards your team actually opens",
    "Automations that hand back hours",
    "Shipped in weeks, not quarters",
    "Small team. Big output.",
    "CRM without the clutter",
    "Fast by default",
  ],
} as const;

export const servicesJourney = {
  eyebrow: "Services Journey",
  stage: {
    sceneLabels: ["01 / WEBSITE", "02 / DASHBOARD", "03 / AUTOMATION"] as const,
    sampleData: "SAMPLE DATA",
    taskDone: "Task done",
    automationNodes: ["Trigger", "Route", "Sync", "Notify"] as const,
  },
  steps: [
    {
      id: "websites",
      number: "01",
      kicker: "Websites",
      headline: ["Pages that make people ", "act", "."] as [string, string, string],
      body: "Fast, clear websites built around one job: turning visitors into enquiries.",
      points: ["Design and build", "Phone-first", "Live in weeks"] as const,
    },
    {
      id: "dashboards",
      number: "02",
      kicker: "Dashboards and CRM",
      headline: ["See your whole business on ", "one", " screen."] as [string, string, string],
      body: "Track leads, orders and payments in one place your team will actually open.",
      points: ["Lead and customer tracking", "Reports that update themselves", "Roles and access"] as const,
    },
    {
      id: "automations",
      number: "03",
      kicker: "Automations",
      headline: ["Let the boring work run ", "itself", "."] as [string, string, string],
      body: "Connect your tools so follow-ups, invoices and reminders happen without anyone clicking.",
      points: ["WhatsApp and email flows", "Forms into sheets into CRM", "Alerts when something needs you"] as const,
    },
  ],
  closing: {
    text: "Something else in mind? Tell us. We build custom too.",
    cta: { label: "Start a project", href: "#contact" },
  },
} as const;

export const social = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
] as const;

export const meta = {
  title: `${brand.name} — Websites, dashboards & automations`,
  description: `${brand.name} is a student-run studio building websites, CRM dashboards and automations for growing businesses. Built fast. Built to last.`,
} as const;
