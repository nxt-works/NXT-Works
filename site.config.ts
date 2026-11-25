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

// Set showUnfinishedSections to true to preview everything. Set a section to ready when it is built.
export const showUnfinishedSections = false;

/** List indicating which sections are ready to be shown. */
export const sectionReady: Record<SectionId, boolean> = {
  services: true,
  proof: false,
  demos: true,
  process: true,
  team: true,
  packages: false,
  faq: true,
  contact: true,
};

/** Helper to check whether a section should currently be displayed. */
export function isSectionShowing(id: SectionId): boolean {
  return showUnfinishedSections || Boolean(sectionReady[id]);
}

export interface NavLinkItem {
  id: SectionId;
  label: string;
  href: string;
}

/**
 * ONE master list of navigation links across the site:
 * Services, Proof, Demos, Process, Team, Packages, FAQ.
 */
export const navLinks: NavLinkItem[] = [
  { id: "services", label: "Services", href: "#services" },
  { id: "proof", label: "Proof", href: "#proof" },
  { id: "demos", label: "Demos", href: "#demos" },
  { id: "process", label: "Process", href: "#process" },
  { id: "team", label: "Team", href: "#team" },
  { id: "packages", label: "Packages", href: "#packages" },
  { id: "faq", label: "FAQ", href: "#faq" },
];

/** Filtered list of visible nav links: only shown if its section is showing. */
export const visibleNavLinks: NavLinkItem[] = navLinks.filter((item) =>
  showUnfinishedSections || Boolean(sectionReady[item.id]),
);

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
  /** Visible links filtered from the ONE master navLinks list. */
  links: visibleNavLinks,
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

export const liveDemos = {
  eyebrow: "Demos",
  headline: ["Click it. ", "Break", " it. Try it."] as [string, string, string],
  subline: "Two small tools you can actually use. Nothing here is a screenshot.",
  note: "SAMPLE DATA / SIMULATED",
  tabs: [
    { id: "crm" as const, label: "Mini CRM" },
    { id: "automation" as const, label: "Automation" },
  ],
  miniCrm: {
    title: "Mini CRM",
    tag: "01 / PIPELINE",
    revenueLabel: "Sample revenue",
    columns: [
      { id: "new" as const, label: "New" },
      { id: "contacted" as const, label: "Contacted" },
      { id: "won" as const, label: "Won" },
    ],
    initialLeads: [
      { id: "lead-1", name: "Asha M.", service: "Website", amount: 45000, stage: "new" as const },
      { id: "lead-2", name: "Rohan K.", service: "Dashboard", amount: 85000, stage: "new" as const },
      { id: "lead-3", name: "Meera S.", service: "Automation", amount: 35000, stage: "contacted" as const },
      { id: "lead-4", name: "Kabir D.", service: "Website", amount: 60000, stage: "contacted" as const },
      { id: "lead-5", name: "Priya N.", service: "Dashboard", amount: 95000, stage: "won" as const },
    ],
    incomingLeads: [
      { id: "lead-6", name: "Dev P.", service: "Automation", amount: 40000, stage: "new" as const },
      { id: "lead-7", name: "Neha R.", service: "Website", amount: 55000, stage: "new" as const },
      { id: "lead-8", name: "Arjun T.", service: "Dashboard", amount: 110000, stage: "new" as const },
    ],
    maxLeads: 8,
    actions: {
      moveNext: "Move to next stage",
      alreadyWon: "Already in Won",
      addLead: "A new lead arrives",
      maxReached: "Board full (8 max)",
      reset: "Reset",
      close: "Close",
      emptyColumn: "No leads here yet",
      tapHint: "Tap any customer to move them forward.",
      resetStatus: "Mini CRM reset to 5 sample customers.",
      arrivedSuffix: "arrived in New.",
      movedVerb: "moved to",
    },
  },
  automationRunner: {
    title: "Automation",
    tag: "02 / WORKFLOW",
    runLabel: "Run it",
    runningLabel: "Running...",
    runAgainLabel: "Run again",
    doneLabel: "Done in 2 seconds (simulated)",
    idleHint: "Switch any step off to see what goes missing, then hit Run it.",
    runningStatus: "Running simulated automation...",
    skippedBadge: "Skipped",
    doneBadge: "Done",
    switchedOn: "switched on.",
    switchedOff: "switched off.",
    steps: [
      {
        id: "form",
        number: "01",
        title: "Customer fills a form",
        detail: "Website enquiry captured",
        skippedNote: "No lead captured. The enquiry is lost.",
      },
      {
        id: "whatsapp",
        number: "02",
        title: "WhatsApp reply goes out",
        detail: "Instant greeting sent",
        skippedNote: "No reply sent. The customer waits.",
      },
      {
        id: "sheet",
        number: "03",
        title: "Added to your sheet",
        detail: "Row logged automatically",
        skippedNote: "Not logged. Your team has no record.",
      },
      {
        id: "reminder",
        number: "04",
        title: "You get a reminder",
        detail: "Follow-up alert scheduled",
        skippedNote: "No alert fired. Follow-up slips.",
      },
    ],
  },
} as const;

export const processSection = {
  eyebrow: "Process",
  headline: ["Four steps. ", "Zero", " mystery."] as [string, string, string],
  subline: "No jargon, no surprises. Here is exactly how a project with us runs.",
  steps: [
    {
      id: "talk",
      number: "01",
      title: "Talk",
      body: "A short chat about what is slowing your business down. No pitch, just questions.",
    },
    {
      id: "plan",
      number: "02",
      title: "Plan",
      body: "We send a clear plan: what we will build, what it costs and how long it takes.",
    },
    {
      id: "build",
      number: "03",
      title: "Build",
      body: "You see progress every week and can change direction early, not at the end.",
    },
    {
      id: "launch",
      number: "04",
      title: "Launch and care",
      body: "We launch, show your team how it works, and stay close to fix and improve.",
    },
  ],
} as const;

export type TeamCharacterId =
  | "designer"
  | "frontend"
  | "automation"
  | "backend"
  | "client-lead";

export interface TeamMember {
  id: string;
  characterId: TeamCharacterId;
  name: string;
  role: string;
  /** Optional one-line "what I do" bio (may be empty). */
  bio: string;
  /** Optional photo path (e.g. "/team/member-1.jpg"). Leave empty to show the geometric character. */
  photo: string;
}

// PLACEHOLDER — team must replace every name, role, bio, and optional photo path before publishing.
export const teamSection = {
  eyebrow: "Team",
  headline: ["Five people. ", "One", " standard."] as [string, string, string],
  subline: "A small team, so you always talk to the people doing the work.",
  interactionHintDesktop: "Hover a character.",
  interactionHintTouch: "Tap a character.",
  ariaPrefix: "Say hi to",
  swipeHint: "Swipe to meet all five",
  members: [
    {
      id: "member-1",
      characterId: "designer",
      // PLACEHOLDER — replace before publishing
      name: "Member One",
      // PLACEHOLDER — replace before publishing
      role: "Designer",
      // PLACEHOLDER — optional one-line "what I do"
      bio: "",
      // PLACEHOLDER — optional photo path (replaces character in the same silhouette)
      photo: "",
    },
    {
      id: "member-2",
      characterId: "frontend",
      // PLACEHOLDER — replace before publishing
      name: "Member Two",
      // PLACEHOLDER — replace before publishing
      role: "Front-end developer",
      // PLACEHOLDER — optional one-line "what I do"
      bio: "",
      // PLACEHOLDER — optional photo path
      photo: "",
    },
    {
      id: "member-3",
      characterId: "automation",
      // PLACEHOLDER — replace before publishing
      name: "Member Three",
      // PLACEHOLDER — replace before publishing
      role: "Automation engineer",
      // PLACEHOLDER — optional one-line "what I do"
      bio: "",
      // PLACEHOLDER — optional photo path
      photo: "",
    },
    {
      id: "member-4",
      characterId: "backend",
      // PLACEHOLDER — replace before publishing
      name: "Member Four",
      // PLACEHOLDER — replace before publishing
      role: "Back-end and CRM developer",
      // PLACEHOLDER — optional one-line "what I do"
      bio: "",
      // PLACEHOLDER — optional photo path
      photo: "",
    },
    {
      id: "member-5",
      characterId: "client-lead",
      // PLACEHOLDER — replace before publishing
      name: "Member Five",
      // PLACEHOLDER — replace before publishing
      role: "Client lead",
      // PLACEHOLDER — optional one-line "what I do"
      bio: "",
      // PLACEHOLDER — optional photo path
      photo: "",
    },
  ] as TeamMember[],
} as const;

// DRAFT — team to review all FAQ questions and answers before final launch.
export const faqSection = {
  eyebrow: "FAQ",
  headline: ["Fair ", "questions", ", straight answers."] as [string, string, string],
  closing: {
    text: "Still have a question? Ask us.",
    cta: { label: "Start a project", href: "#contact" },
  },
  // DRAFT copy
  items: [
    {
      id: "who",
      number: "01",
      question: "Who is behind this?",
      answer:
        "A small team of five who build websites, dashboards and automations. We are new, and we say so. You will always talk directly to the people doing the work.",
    },
    {
      id: "what",
      number: "02",
      question: "What can you build?",
      answer:
        "Business websites, dashboards and CRMs, and automations that connect your tools. If it is something else, tell us. We will say honestly if it is not for us.",
    },
    {
      id: "cost",
      number: "03",
      question: "How much does it cost?",
      answer:
        "It depends on the project. After a short chat we send a clear quote before any work starts, so there are no surprises.",
    },
    {
      id: "timeline",
      number: "04",
      question: "How long does it take?",
      answer:
        "A simple website can be ready in a couple of weeks. Bigger tools take longer. Your plan will show dates, and you will see progress every week.",
    },
    {
      id: "tech",
      number: "05",
      question: "Do I need to understand technology?",
      answer:
        "No. We explain everything in plain words, and we show your team how to use what we build.",
    },
    {
      id: "after-launch",
      number: "06",
      question: "What happens after launch?",
      answer:
        "We stay available to fix problems and make improvements. We agree what support you get in the plan, before we start.",
    },
  ],
} as const;

export const contactSection = {
  eyebrow: "Contact",
  headline: ["Let's build your ", "next", " thing."] as [string, string, string],
  subline: "Four quick questions. No forms to dread.",

  // IMPORTANT — team must fill these in before publishing!
  // whatsappNumber: digits only with country code (e.g. "919876543210"). Leave empty to hide the WhatsApp button.
  whatsappNumber: "",
  // contactEmail: studio inbox address (e.g. "hello@nxt.agency"). Leave empty to hide the Email button.
  contactEmail: "",

  comingSoonNote: "Contact details coming soon.",
  privacyNote: "We only use this to reply to you.",
  actions: {
    back: "Back",
    next: "Next",
    review: "Review answers",
    edit: "Edit",
    sendWhatsApp: "Send on WhatsApp",
    sendEmail: "Send by email",
    startOver: "Start over",
  },
  errors: {
    needRequired: "Pick at least one option so we know what to focus on.",
    timelineRequired: "Pick a rough timeline to continue.",
    budgetRequired: "Pick a rough budget range to continue.",
    nameRequired: "Please tell us your name so we know who we are replying to.",
    reachInvalid: "Please enter a valid email address or a phone number with at least 8 digits.",
  },
  questions: {
    needs: {
      heading: "What do you need?",
      hint: "Choose one or more.",
      options: [
        { id: "website", label: "Website", phrase: "a website" },
        { id: "dashboard", label: "Dashboard or CRM", phrase: "a dashboard or CRM" },
        { id: "automation", label: "Automation", phrase: "an automation" },
        { id: "unsure", label: "Not sure yet", phrase: "help figuring out what to build" },
      ],
    },
    timeline: {
      heading: "When do you need it?",
      hint: "Choose one.",
      options: [
        { id: "asap", label: "As soon as possible", phrase: "as soon as possible" },
        { id: "1-2-months", label: "In 1 to 2 months", phrase: "in 1 to 2 months" },
        { id: "exploring", label: "Just exploring", phrase: "no fixed date yet (just exploring)" },
      ],
    },
    // PLACEHOLDER — team must confirm these rupee budget ranges before publishing.
    budget: {
      heading: "Rough budget?",
      hint: "Choose one.",
      options: [
        { id: "under-25k", label: "Under 25,000 rupees", phrase: "under 25,000 rupees" },
        { id: "25k-75k", label: "25,000 to 75,000", phrase: "25,000 to 75,000 rupees" },
        { id: "75k-plus", label: "75,000 and above", phrase: "75,000 rupees and above" },
        { id: "unsure", label: "Not sure yet", phrase: "not decided yet" },
      ],
    },
    reach: {
      heading: "How should we reach you?",
      nameLabel: "Your name",
      namePlaceholder: "e.g. Asha",
      contactLabel: "Phone number or email",
      contactPlaceholder: "e.g. 98765 43210 or asha@company.com",
    },
  },
  summary: {
    heading: "Here is what we will send.",
    subline: "Check it over, edit anything you like, then send it straight from your phone or inbox.",
    labels: {
      needs: "What you need",
      timeline: "Timeline",
      budget: "Rough budget",
      reach: "How to reach you",
    },
    emailSubjectPrefix: "New project enquiry from",
  },
  thanks: {
    heading: "Message ready to send.",
    body: "Thanks for reaching out. We read every message ourselves and reply within one working day.",
  },
} as const;

export const footerSection = {
  year: 2026,
  tagline: "Built by a team of five.",
  backToTop: "Back to top",
  whatsappLabel: "WhatsApp",
  emailLabel: "Email",
} as const;

export const social = [
  { label: "Instagram", href: "https://instagram.com/" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "GitHub", href: "https://github.com/" },
] as const;

// The real address once published (e.g. "https://nxt.agency"). Leave empty while staging; build uses a safe fallback URL.
export const siteUrl = "";
// Keep false until all placeholders are replaced and the real domain is live.
export const allowSearchEngines = false;
export const siteTitle = "NXT Agency: Websites, dashboards and automations for growing businesses";
export const siteDescription =
  "A five-person team building fast websites, clear dashboards and helpful automations for growing businesses.";
export const themeColor = colors.ink;
export const ogImageAlt =
  "NXT Agency — We build what's next for your business. Websites, Dashboards, Automations.";

/** Safe URL fallback when siteUrl is empty so metadataBase, robots, and sitemap never fail at build time. */
export const resolvedSiteUrl = (siteUrl.trim() || "https://nxt.agency").replace(/\/+$/, "");

export const meta = {
  title: siteTitle,
  description: siteDescription,
} as const;
