import { brand, contactSection } from "@/site.config";

export type ContactAnswers = {
  needs: readonly (typeof contactSection.questions.needs.options)[number]["id"][];
  timeline: (typeof contactSection.questions.timeline.options)[number]["id"] | null;
  budget: (typeof contactSection.questions.budget.options)[number]["id"] | null;
  name: string;
  reach: string;
};

function joinNatural(items: string[]): string {
  if (items.length === 0) return "a project";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function getNeedLabels(needs: ContactAnswers["needs"]): string[] {
  return needs
    .map((id) => contactSection.questions.needs.options.find((o) => o.id === id)?.label)
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
}

export function getTimelineLabel(timeline: ContactAnswers["timeline"]): string {
  return (
    contactSection.questions.timeline.options.find((o) => o.id === timeline)?.label ?? ""
  );
}

export function getBudgetLabel(budget: ContactAnswers["budget"]): string {
  return (
    contactSection.questions.budget.options.find((o) => o.id === budget)?.label ?? ""
  );
}

/**
 * Builds a plain, human-sounding enquiry message from the visitor's 4 answers.
 * Example:
 * "Hi NXT Agency, I am Asha. I need a website. I need it in 1 to 2 months and my rough budget is 25,000 to 75,000 rupees. You can reach me on 9876543210."
 */
export function buildContactMessage(answers: ContactAnswers): string {
  const cleanName = answers.name.trim() || "a visitor";
  const cleanReach = answers.reach.trim();

  const needPhrases: string[] = answers.needs
    .map((id) => contactSection.questions.needs.options.find((o) => o.id === id)?.phrase)
    .filter((v): v is NonNullable<typeof v> => Boolean(v));
  const needsSentence = `I need ${joinNatural(needPhrases)}.`;

  const timelineOpt = contactSection.questions.timeline.options.find(
    (o) => o.id === answers.timeline,
  );
  const budgetOpt = contactSection.questions.budget.options.find(
    (o) => o.id === answers.budget,
  );

  let timingAndBudget = "";
  if (timelineOpt && budgetOpt) {
    const timingPart =
      timelineOpt.id === "exploring"
        ? "I am just exploring for now"
        : `I need it ${timelineOpt.phrase}`;
    const budgetPart =
      budgetOpt.id === "unsure"
        ? "my rough budget is not decided yet"
        : `my rough budget is ${budgetOpt.phrase}`;
    timingAndBudget = `${timingPart} and ${budgetPart}.`;
  } else if (timelineOpt) {
    timingAndBudget =
      timelineOpt.id === "exploring"
        ? "I am just exploring for now."
        : `I need it ${timelineOpt.phrase}.`;
  } else if (budgetOpt) {
    timingAndBudget =
      budgetOpt.id === "unsure"
        ? "My rough budget is not decided yet."
        : `My rough budget is ${budgetOpt.phrase}.`;
  }

  const reachPrep = cleanReach.includes("@") ? "at" : "on";
  const reachSentence = cleanReach ? `You can reach me ${reachPrep} ${cleanReach}.` : "";

  return [
    `Hi ${brand.name}, I am ${cleanName}.`,
    needsSentence,
    timingAndBudget,
    reachSentence,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Returns a valid `https://wa.me/...` link, or `null` when whatsappNumber is empty. */
export function buildWhatsAppUrl(whatsappNumber: string, message: string): string | null {
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Returns a valid `mailto:...` link, or `null` when contactEmail is empty. */
export function buildMailtoUrl(
  contactEmail: string,
  name: string,
  message: string,
): string | null {
  const email = contactEmail.trim();
  if (!email) return null;
  const cleanName = name.trim() || "a visitor";
  const subject = `${contactSection.summary.emailSubjectPrefix} ${cleanName}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}
