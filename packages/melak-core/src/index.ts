/** Lightweight offline Melak tutor — no network, no ML model. */

export type MelakQuestionContext = {
  id: string;
  stem: string;
  stemAm?: string | null;
  unit: string;
  topic: string;
  explanation: string;
  explanationAm?: string | null;
};

export type MelakReply = {
  reply: string;
  mode: "offline";
};

const TOPIC_HINTS: Array<{
  keys: string[];
  en: string;
  am: string;
}> = [
  {
    keys: ["derivative", "differentiate", "power rule", "ተዋጽኦ", "ገላጭ"],
    en: "For derivatives: recall the power rule $\\frac{d}{dx}x^n = nx^{n-1}$, product rule $(fg)' = f'g + fg'$, and chain rule for composed functions. Substitute the given function step by step.",
    am: "ለተዋጽኦ፡ የኃይል ህግ $\\frac{d}{dx}x^n = nx^{n-1}$፣ የምርት ደንብ $(fg)' = f'g + fg'$ እና የשרשרት ደንብ ይረዳሉ። ተሰጥቶውን ተግባር ደረጃ በደረጃ ይተኩሱ።",
  },
  {
    keys: ["integral", "integrate", "integration", "ኢንቲግራል", "የማይ"],
    en: "For integrals: reverse the power rule $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}+C$ ($n \\neq -1$). For definite integrals, evaluate the antiderivative at the bounds.",
    am: "ለኢንቲግራሎች፡ $\\int x^n\\,dx = \\frac{x^{n+1}}{n+1}+C$ ($n \\neq -1$)። definite integral ከሆነ antiderivativeን በ upper bound − lower bound ይሰሉ።",
  },
  {
    keys: ["limit", "lim", "ገደብ"],
    en: "For limits: try direct substitution first. If you get $\\frac{0}{0}$, factor, rationalize, or use known limits like $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$.",
    am: "ለገደቦች፡ መጀመሪያ ቀጥታ ምትክ ይሞክሩ። $\\frac{0}{0}$ ከሆነ factorize ወይም $\\lim_{x\\to 0}\\frac{\\sin x}{x}=1$ ይጠቀሙ።",
  },
  {
    keys: ["sequence", "arithmetic", "series", "summation", "ተከታታይ"],
    en: "Arithmetic sequence: $a_n = a_1 + (n-1)d$. Geometric: $a_n = a_1 r^{n-1}$. For sums, use $\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$ or the geometric series formula when $|r|<1$.",
    am: "ሂሳባዊ ተከታታይ፡ $a_n = a_1 + (n-1)d$። ጂኦሜትሪያዊ፡ $a_n = a_1 r^{n-1}$። ለድምር $\\sum_{k=1}^n k = \\frac{n(n+1)}{2}$ ይጠቀሙ።",
  },
  {
    keys: ["probability", "mean", "median", "statistics", "ዕድል", "አማካኝ", "ስታት"],
    en: "Statistics: mean = sum ÷ count; median is the middle value when ordered. Probability of equally likely outcomes = favourable ÷ total.",
    am: "ስታትስቲክስ፡ አማካኝ = ድምር ÷ ብዛት፤ አማካኝ = ተደራጅቶ በوسط ያለው። ዕድል = ጥሩ ÷ ጠቅላላ።",
  },
  {
    keys: ["triangle", "circle", "geometry", "coordinate", "geometry", "ሶስት", "ክብ"],
    en: "Geometry checklist: label knowns, draw a diagram, apply the relevant formula (e.g. $A=\\pi r^2$, Pythagoras $a^2+b^2=c^2$, distance $\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$).",
    am: "ጂኦሜትሪ፡ የሚታወቁትን ጻፉ፣ ስዕል ይሳሉ፣ ተገቢውን ቀመር ይጠቀሙ (ለምሳሌ $A=\\pi r^2$፣ ፒታጎራስ)።",
  },
  {
    keys: ["equation", "inequality", "polynomial", "algebra", "እኩልታ", "ሚስጥ"],
    en: "Algebra: isolate the unknown by doing the same operation on both sides. For quadratics, try factorising, completing the square, or the quadratic formula.",
    am: "አልጀብራ፡ ያልተሞላውን ባህሪ በሁለቱም ጎኖች ተመሳሳይ ክወና ይለዩ። ለካዋድራቲክ፡ factoring ወይም quadratic formula ይሞክሩ።",
  },
];

export function prefersAmharic(text: string): boolean {
  return /[\u1200-\u137F]/.test(text);
}

function pickTopicHint(message: string): { en: string; am: string } | null {
  const lower = message.toLowerCase();
  for (const hint of TOPIC_HINTS) {
    if (hint.keys.some((k) => lower.includes(k.toLowerCase()) || message.includes(k))) {
      return hint;
    }
  }
  return null;
}

function groundedReply(
  message: string,
  question: MelakQuestionContext,
): string {
  const am = prefersAmharic(message);
  const intro = am
    ? `በ **${question.topic}** (${question.unit}) ላይ እርዳዎ እሞክራለሁ።`
    : `Let me help with **${question.topic}** (${question.unit}).`;

  const stemBlock = am && question.stemAm
    ? `**ጥያቄ:** ${question.stemAm}`
    : `**Question:** ${question.stem}`;

  const expl = am && question.explanationAm
    ? question.explanationAm
    : question.explanation;

  const steps = am
    ? "**እንዴት እንረዳ:**\n1. ምን እንደሚጠየቅ ይመልከቱ\n2. ቀመር ወይም ህግ ይምረጡ\n3. ደረጃ በደረጃ ይሰሉ\n\n**መሠረታዊ ማብራሪያ:**"
    : "**How to think about it:**\n1. Identify what is being asked\n2. Pick the right rule or formula\n3. Work step by step\n\n**Core explanation:**";

  const footer = am
    ? "\n\n_ይህ ከመረጃ ጎታ የተገኘ ቀላል መረጃ ነው። ከመምህርዎ ወይም ከመጽሐፍ ያረጋግጡ።_"
    : "\n\n_This is lightweight offline help from Kasina's question bank. Check with your teacher or textbook._";

  return `${intro}\n\n${stemBlock}\n\n${steps}\n${expl}${footer}`;
}

function genericReply(message: string): string {
  const am = prefersAmharic(message);
  const hint = pickTopicHint(message);

  if (hint) {
    const body = am ? hint.am : hint.en;
    const intro = am
      ? "**Grade 12 Mathematics (offline Melak):**\n\n"
      : "**Grade 12 Mathematics (offline Melak):**\n\n";
    const footer = am
      ? "\n\n_ከተለመደ ጥያቄ ይጀምሩ ወይም ከዝግተኛ ጥያቄ ላይ «Ask Melak» ይጫኑ።_"
      : "\n\n_Open Melak from a practice question for a more specific explanation._";
    return intro + body + footer;
  }

  if (am) {
    return (
      "እኔ **Melak (offline)** ነኝ — Grade 12 Mathematics tutor።\n\n" +
      "derivative፣ limit፣ sequence፣ integral ወይም probability ይባሉ። " +
      "ከተለመደ ጥያቄ ላይ «Ask Melak» ከጫኑ የተሻለ መልስ እሰጣለሁ።\n\n" +
      "_Internet አያስፈልግም — ሁሉ በመሣሪያዎ ላይ ይሰራል።_"
    );
  }

  return (
    "I'm **Melak (offline)** — your lightweight Grade 12 Math tutor.\n\n" +
    "Try asking about derivatives, limits, sequences, integrals, or probability. " +
    "For the best answer, open **Ask Melak** from a question you got wrong.\n\n" +
    "_No internet needed — everything runs on your device._"
  );
}

/** Generate a tutoring reply without any network or ML model. */
export function generateMelakReply(input: {
  message: string;
  question?: MelakQuestionContext | null;
}): MelakReply {
  const trimmed = input.message.trim();
  if (input.question) {
    return { reply: groundedReply(trimmed, input.question), mode: "offline" };
  }
  return { reply: genericReply(trimmed), mode: "offline" };
}
