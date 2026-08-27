export type MarketingLang = "en" | "am";

export const CONTACT_EMAIL = "medin.sileshi.diro@gmail.com";
export const CONTACT_PHONE = "+251 927 777 739";
export const CONTACT_PHONE_TEL = "+251927777739";

type NavItem = { href: string; label: string };

const navEn: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/students", label: "For Students" },
  { href: "/teachers", label: "For Teachers" },
  { href: "/melak", label: "Melak" },
  { href: "/pilot", label: "Pilot Program" },
  { href: "/impact", label: "Impact" },
  { href: "/partners", label: "Partners" },
  { href: "/get-involved", label: "Get Involved" },
  { href: "/contact", label: "Contact" },
];

const navAm: NavItem[] = [
  { href: "/", label: "መነሻ" },
  { href: "/about", label: "ስለ እኛ" },
  { href: "/students", label: "ለተማሪዎች" },
  { href: "/teachers", label: "ለመምህራን" },
  { href: "/melak", label: "መላክ" },
  { href: "/pilot", label: "ሙከራ ፕሮግራም" },
  { href: "/impact", label: "ተጽዕኖ" },
  { href: "/partners", label: "አጋሮች" },
  { href: "/get-involved", label: "ተሳተፉ" },
  { href: "/contact", label: "አግኙን" },
];

export const marketingShell = {
  en: {
    brandAm: "ካሲና",
    langLabel: "EN",
    langSwitch: "አማ",
    cta: "Partner With Us",
    nav: navEn,
    footerTag: "A not-for-profit initiative supporting students and teachers in Ethiopia",
    footerPrivacy: "Privacy Policy",
    footerTerms: "Terms of Use",
    footerFaq: "FAQ",
    footerOrg: "Kasina EdTech Solutions",
    partnerStrip: "Pilot partners to be listed as confirmed",
  },
  am: {
    brandAm: "ካሲና",
    langLabel: "አማ",
    langSwitch: "EN",
    cta: "ከእኛ ጋር ይተባበሩ",
    nav: navAm,
    footerTag: "በኢትዮጵያ ተማሪዎችንና መምህራንን የሚደግፍ ለትርፍ ያልተቋቋመ ተነሳሽነት",
    footerPrivacy: "የግላዊነት ፖሊሲ",
    footerTerms: "የአጠቃቀም ሁኔታዎች",
    footerFaq: "ተደጋጋሚ ጥያቄዎች",
    footerOrg: "ካሲና EdTech Solutions",
    partnerStrip: "የሙከራ አጋሮች ሲረጋገጡ ይዘረዘራሉ",
  },
} as const;

export const homeCopy = {
  en: {
    eyebrow: "Piloting in Ethiopian secondary classrooms",
    headline: "Better learning and teaching — even without the internet",
    subhead:
      "Kasina strengthens day-to-day learning for students and support for teachers with offline-first tools and Melak, an AI-assisted tutor.",
    primaryCta: "See How It Works",
    secondaryCta: "Join the Pilot",
    joinHint: "Already have a class invite? Join free.",
    teacherLink: "For schools & teachers",
    problemTitle: "Access gaps hurt both students and teachers",
    problemBody:
      "When connectivity is unreliable, students lose learning time and teachers lose ways to support them. Kasina is built for that reality.",
    problems: [
      {
        title: "Students need consistent support",
        body: "Clear explanations and practice should not depend on strong wifi at home.",
      },
      {
        title: "Teachers need visibility",
        body: "Knowing who is stuck — and on what — helps class time go further.",
      },
      {
        title: "Schools need tools that fit",
        body: "Aligned to what classrooms already teach, without adding busywork.",
      },
    ],
    pillarsTitle: "Three pillars",
    pillars: [
      {
        title: "Offline Access",
        body: "Core tutoring and study support designed to keep working after setup, when the network drops.",
      },
      {
        title: "Melak AI Tutor",
        body: "Help understanding concepts — in Amharic or English — not only marking answers right or wrong.",
      },
      {
        title: "Classroom & Practice Tools",
        body: "Assignments, progress insight, and practice formats that support teaching and learning day to day.",
      },
    ],
    pilotTitle: "Classroom pilot",
    pilotBody:
      "Launching with Grade 11–12 government schools in Sebeta, Burayu, and Addis Ababa (Kolfe Keranio, Nifas Silk-Lafto, Lemi Kura).",
    pilotCta: "Learn about the pilot",
    impactTitle: "Impact we will measure",
    impactBody:
      "Learning outcomes, teacher feedback and adoption — with exam performance as supporting evidence, not the headline story. Results will appear here as the pilot reports.",
    impactCta: "Impact page",
    partnersTitle: "Partners & funders",
    partnersBody:
      "We work with schools, woreda and sub-city education offices, and funders who share this mission. Acknowledgments will be listed as confirmed.",
    partnersCta: "Partners",
    closeTitle: "Get involved",
    closeBody:
      "Schools, teachers, funders, and volunteers can help strengthen teaching and learning in Ethiopian classrooms.",
    closeCta: "Get Involved",
    productTitle: "Already in a class?",
    productJoin: "Join with invite code",
    productTeacher: "Teacher signup",
  },
  am: {
    eyebrow: "በኢትዮጵያ ሁለተኛ ደረጃ ክፍሎች በሙከራ",
    headline: "የተሻለ ትምህርትና ማስተማር — በይነመረብ ሳይኖርም",
    subhead:
      "ካሲና ለተማሪዎች የዕለት ተዕለት ትምህርትን፣ ለመምህራንም ድጋፍን በከመስመር ውጭ መሣሪያዎችና በመላክ — የሰው ሰራሽ አስተማሪ — ያጠናክራል።",
    primaryCta: "እንዴት እንደሚሰራ ይመልከቱ",
    secondaryCta: "ሙከራውን ይቀላቀሉ",
    joinHint: "የክፍል ግብዣ ኮድ አለዎት? ነጻ ይቀላቀሉ።",
    teacherLink: "ለትምህርት ቤቶችና መምህራን",
    problemTitle: "የመዳረሻ ክፍተቶች ተማሪዎችንና መምህራንን ይጎዳሉ",
    problemBody:
      "ግንኙነት አስተማማኝ ሳይሆን ተማሪዎች የትምህርት ጊዜ ያጣሉ፣ መምህራንም የመደገፍ መንገዶችን ያጣሉ። ካሲና ለዚህ እውነታ የተሰራ ነው።",
    problems: [
      {
        title: "ተማሪዎች ቋሚ ድጋፍ ይፈልጋሉ",
        body: "ግልጽ ማብራሪያና ልምምድ በቤት ጠንካራ wifi ላይ ብቻ መደገፍ የለባቸውም።",
      },
      {
        title: "መምህራን ግልጽነት ይፈልጋሉ",
        body: "ማን በምን እንደሚቸገር ማወቅ የክፍል ጊዜን የበለጠ ውጤታማ ያደርገዋል።",
      },
      {
        title: "ትምህርት ቤቶች የሚስማማ መሣሪያ ይፈልጋሉ",
        body: "ከሚያስተምሩት ጋር የተጣጣመ፣ ተጨማሪ ጫና ሳያስከትል።",
      },
    ],
    pillarsTitle: "ሦስት ምሰሶዎች",
    pillars: [
      {
        title: "ከመስመር ውጭ መዳረሻ",
        body: "ከተዘጋጀ በኋላ ኔትወርክ ሲቋረጥም ዋና ትምህርት ድጋፍ እንዲቀጥል የተዘጋጀ።",
      },
      {
        title: "መላክ የሰው ሰራሽ አስተማሪ",
        body: "ፅንሰ-ሐሳቦችን ለመረዳት እገዛ — በአማርኛ ወይም በእንግሊዘኛ — ትክክል/ስህተት ብቻ አይደለም።",
      },
      {
        title: "የክፍልና ልምምድ መሣሪያዎች",
        body: "ምደባዎች፣ የእድገት ግንዛቤ፣ እና የዕለት ተዕለት ትምህርትን የሚደግፉ የልምምድ ቅርጸቶች።",
      },
    ],
    pilotTitle: "የክፍል ሙከራ",
    pilotBody:
      "በሰበታ፣ ቡራዩ እና አዲስ አበባ (ኮልፌ ቀራኒዮ፣ ንፋስ ስልክ-ላፍቶ፣ ለሚ ኩራ) የመንግስት ትምህርት ቤቶች 11ኛ–12ኛ ክፍል።",
    pilotCta: "ስለ ሙከራው ይወቁ",
    impactTitle: "የምንለካው ተጽዕኖ",
    impactBody:
      "የትምህርት ውጤቶች፣ የመምህራን ግብረመልስና ተቀባይነት — የፈተና አፈጻጸም እንደ ድጋፍ ማስረጃ፣ እንደ ዋና ታሪክ አይደለም። ሙከራው ሪፖርት ሲያደርግ እዚህ ይታያል።",
    impactCta: "ተጽዕኖ ገጽ",
    partnersTitle: "አጋሮችና ደጋፊዎች",
    partnersBody:
      "ከትምህርት ቤቶች፣ ከወረዳ/ክፍለ ከተማ ትምህርት ጽ/ቤቶችና ከዚህ ተልዕኮ ጋር ከሚጋሩ ደጋፊዎች ጋር እንሰራለን። ሲረጋገጡ እዚህ ይዘረዘራሉ።",
    partnersCta: "አጋሮች",
    closeTitle: "ተሳተፉ",
    closeBody:
      "ትምህርት ቤቶች፣ መምህራን፣ ደጋፊዎችና በጎ ፈቃደኞች በኢትዮጵያ ክፍሎች ትምህርትን ማጠናከር ይችላሉ።",
    closeCta: "ተሳተፉ",
    productTitle: "በክፍል ውስጥ ነዎት?",
    productJoin: "በግብዣ ኮድ ይቀላቀሉ",
    productTeacher: "የመምህር ምዝገባ",
  },
} as const;

export const aboutCopy = {
  en: {
    title: "About Kasina",
    missionTitle: "Mission",
    mission:
      "Improve education for students and teachers in under-resourced Ethiopian schools through offline-first learning tools and classroom support.",
    originTitle: "Why we exist",
    origin:
      "Too many learners lose study time when internet is unreliable, and teachers lack simple ways to see who needs help. Kasina addresses access gaps and teacher-support gaps — not an “exam prep gap” as the organizing purpose.",
    teamTitle: "Team",
    founder: "Medin Sileshi — Founder",
    founderBody:
      "Building Kasina as a not-for-profit edtech initiative focused on Ethiopian secondary classrooms.",
    orgTitle: "Organization",
    org: "Kasina EdTech Solutions is a not-for-profit initiative. Registration details will be published here when publicly available.",
  },
  am: {
    title: "ስለ ካሲና",
    missionTitle: "ተልዕኮ",
    mission:
      "በሀብት እጥረት ባላቸው የኢትዮጵያ ትምህርት ቤቶች ለተማሪዎችና መምህራን ትምህርትን በከመስመር ውጭ መሣሪያዎችና በክፍል ድጋፍ ማሻሻል።",
    originTitle: "ለምን እንኖራለን",
    origin:
      "በይነመረብ አስተማማኝ ሳይሆን ብዙ ተማሪዎች የመማሪያ ጊዜ ያጣሉ፣ መምህራንም ማን እገዛ እንደሚያስፈልገው ለማየት ቀላል መንገድ አያገኙም። ካሲና የመዳረሻና የመምህር ድጋፍ ክፍተቶችን ያስተናግዳል — «የፈተና ዝግጅት ክፍተት» እንደ ዋና ዓላማ አይደለም።",
    teamTitle: "ቡድን",
    founder: "መድን ስለሺ — መስራች",
    founderBody:
      "ካሲናን በኢትዮጵያ ሁለተኛ ደረጃ ክፍሎች ላይ ያተኮረ ለትርፍ ያልተቋቋመ የትምህርት ቴክኖሎጂ ተነሳሽነት እያሰራ ነው።",
    orgTitle: "ድርጅት",
    org: "ካሲና EdTech Solutions ለትርፍ ያልተቋቋመ ተነሳሽነት ነው። የምዝገባ ዝርዝሮች ይፋ ሲሆኑ እዚህ ይታተማሉ።",
  },
} as const;

export const audienceCopy = {
  en: {
    students: {
      title: "For Students",
      headline: "Learning support for every study day",
      intro:
        "Kasina helps you understand lessons, ask Melak for clear explanations, and practice with purpose — including when internet is weak.",
      points: [
        {
          title: "Concept help with Melak",
          body: "Ask why something works, in Amharic or English. Melak is built to explain, not only to quiz.",
        },
        {
          title: "Offline-friendly study",
          body: "After setup, core Melak tutoring is designed to keep helping without wifi.",
        },
        {
          title: "Practice tools",
          body: "Classroom practice and exam-format practice are available as one tool among several — see Practice & Assessment Tools.",
        },
      ],
      ctaMelak: "Meet Melak",
      ctaPractice: "Practice tools",
      ctaJoin: "Join your class",
    },
    teachers: {
      title: "For Teachers",
      headline: "Tools that support how you already teach",
      intro:
        "Kasina gives teachers curriculum-aligned practice, visibility into where students struggle, and less prep friction — including offline-friendly student support.",
      points: [
        {
          title: "Aligned classroom content",
          body: "Practice and materials start with Grade 12 Mathematics and grow with the pilot.",
        },
        {
          title: "See who needs help",
          body: "Assignments and progress views surface weak topics so class time goes where it matters.",
        },
        {
          title: "Pilot onboarding",
          body: "Teachers in the pilot receive training and feedback channels as part of rollout support.",
        },
      ],
      ctaMelak: "How Melak helps your class",
      ctaPractice: "Practice tools",
      ctaJoin: "Create teacher account",
    },
  },
  am: {
    students: {
      title: "ለተማሪዎች",
      headline: "ለእያንዳንዱ የመማሪያ ቀን ድጋፍ",
      intro:
        "ካሲና ትምህርትን ለመረዳት፣ መላክን ለማብራራት መጠየቅ፣ እና በዓላማ ልምምድ — በይነመረብ ደካማ ሲሆንም — ይረዳዎታል።",
      points: [
        {
          title: "በመላክ የፅንሰ-ሐሳብ እገዛ",
          body: "ለምን እንደሚሰራ ይጠይቁ — በአማርኛ ወይም በእንግሊዘኛ። መላክ ለማብራራት የተሰራ ነው፣ ለፈተና ብቻ አይደለም።",
        },
        {
          title: "ከመስመር ውጭ ተስማሚ ትምህርት",
          body: "ከተዘጋጀ በኋላ የመላክ ዋና ትምህርት ያለ wifi እንዲቀጥል የተዘጋጀ ነው።",
        },
        {
          title: "የልምምድ መሣሪያዎች",
          body: "የክፍል ልምምድና የፈተና ቅርጸት ልምምድ ከበርካታ መሣሪያዎች አንዱ ናቸው — የልምምድና ግምገማ መሣሪያዎችን ይመልከቱ።",
        },
      ],
      ctaMelak: "መላክን ይወቁ",
      ctaPractice: "የልምምድ መሣሪያዎች",
      ctaJoin: "ክፍልዎን ይቀላቀሉ",
    },
    teachers: {
      title: "ለመምህራን",
      headline: "እንደሚያስተምሩ የሚደግፉ መሣሪያዎች",
      intro:
        "ካሲና ለመምህራን ከስርዓተ ትምህርት ጋር የተጣጣመ ልምምድ፣ ተማሪዎች የት እንደሚቸገሩ ግንዛቤ፣ እና ያነሰ የዝግጅት ጫና — ከመስመር ውጭ ተስማሚ የተማሪ ድጋፍ ጋር — ይሰጣል።",
      points: [
        {
          title: "የተጣጣመ የክፍል ይዘት",
          body: "ልምምድና ቁሳቁስ በ12ኛ ክፍል ሂሳብ ይጀምራል እና ከሙከራው ጋር ያድጋል።",
        },
        {
          title: "ማን እገዛ እንደሚያስፈልገው ማየት",
          body: "ምደባዎችና የእድገት እይታዎች ደካማ ርዕሶችን ያሳያሉ ስለዚህ የክፍል ጊዜ በሚያስፈልገው ቦታ ይሄዳል።",
        },
        {
          title: "የሙከራ ስልጠና",
          body: "በሙከራው ውስጥ ያሉ መምህራን እንደ የማሰማራት ድጋፍ ስልጠናና የግብረመልስ ቻናሎች ያገኛሉ።",
        },
      ],
      ctaMelak: "መላክ ክፍልዎን እንዴት እንደሚረዳ",
      ctaPractice: "የልምምድ መሣሪያዎች",
      ctaJoin: "የመምህር ሂሳብ ይፍጠሩ",
    },
  },
} as const;

export const melakMarketingCopy = {
  en: {
    title: "Melak — AI-assisted tutor",
    headline: "Understanding first. Always.",
    intro:
      "Melak (መልአክ) helps students grasp concepts in Amharic or English. It is built for learning support — not only drilling — and designed to stay useful when connectivity is limited.",
    points: [
      {
        title: "Curriculum-grounded help",
        body: "Pilot coverage starts with Grade 12 Mathematics, with explanations tied to classroom practice.",
      },
      {
        title: "Offline-aware",
        body: "A lightweight offline tutor runs without wifi after setup; optional cloud tutoring needs a connection.",
      },
      {
        title: "Helps teachers indirectly",
        body: "When students struggle on the same ideas, teachers gain clearer signals about where to reteach.",
      },
    ],
    ctaProduct: "Open Melak in your class",
    ctaJoin: "Join a class to try Melak",
    ctaStudents: "For students",
    ctaTeachers: "For teachers",
  },
  am: {
    title: "መላክ — የሰው ሰራሽ አስተማሪ",
    headline: "መጀመሪያ መረዳት። ሁልጊዜ።",
    intro:
      "መላክ ተማሪዎች ፅንሰ-ሐሳቦችን በአማርኛ ወይም በእንግሊዘኛ እንዲረዱ ይረዳል። ለትምህርት ድጋፍ የተሰራ ነው — ለልምምድ ብቻ አይደለም — እና ግንኙነት ውስን ሲሆንም ጠቃሚ ሆኖ እንዲቀጥል የተዘጋጀ ነው።",
    points: [
      {
        title: "ከስርዓተ ትምህርት ጋር የተገናኘ እገዛ",
        body: "የሙከራ ሽፋን በ12ኛ ክፍል ሂሳብ ይጀምራል፣ ማብራሪያዎች ከክፍል ልምምድ ጋር የተገናኙ ናቸው።",
      },
      {
        title: "ከመስመር ውጭ የሚያውቅ",
        body: "ቀላል ከመስመር ውጭ አስተማሪ ከተዘጋጀ በኋላ ያለ wifi ይሰራል፤ አማራጭ የክላውድ ትምህርት ግንኙነት ይፈልጋል።",
      },
      {
        title: "መምህራንን በተዘዋዋሪ ይደግፋል",
        body: "ተማሪዎች በተመሳሳይ ሐሳቦች ሲቸገሩ መምህራን የት እንደሚያስተምሩ ግልጽ ምልክት ያገኛሉ።",
      },
    ],
    ctaProduct: "መላክን በክፍልዎ ይክፈቱ",
    ctaJoin: "መላክን ለመሞከር ክፍል ይቀላቀሉ",
    ctaStudents: "ለተማሪዎች",
    ctaTeachers: "ለመምህራን",
  },
} as const;

export const practiceToolsCopy = {
  en: {
    title: "Practice & Assessment Tools",
    headline: "Practice that supports learning — and classroom visibility",
    intro:
      "National-exam-format practice is one available tool. Kasina frames scores and feedback as learning-progress signals for students and visibility for teachers — not as the platform’s identity.",
    points: [
      {
        title: "Classroom practice",
        body: "Topic and assignment practice that reinforces what was taught.",
      },
      {
        title: "Exam-format sessions",
        body: "Optional CBT-style practice when schools want that format — alongside Melak and textbooks.",
      },
      {
        title: "Feedback loop",
        body: "Results and weak topics help students review and help teachers plan reteaching.",
      },
    ],
    ctaTry: "Try practice in the app",
    ctaJoin: "Join a class",
    ctaMelak: "Meet Melak",
  },
  am: {
    title: "የልምምድና ግምገማ መሣሪያዎች",
    headline: "ትምህርትን የሚደግፍ ልምምድ — እና የክፍል ግንዛቤ",
    intro:
      "የብሔራዊ ፈተና ቅርጸት ልምምድ አንድ የሚገኝ መሣሪያ ነው። ካሲና ውጤቶችንና ግብረመልስን ለተማሪዎች የእድገት ምልክት፣ ለመምህራንም ግንዛቤ — እንደ የመድረኩ ማንነት አይደለም።",
    points: [
      {
        title: "የክፍል ልምምድ",
        body: "የተማረውን የሚያጠናክር የርዕስና ምደባ ልምምድ።",
      },
      {
        title: "የፈተና ቅርጸት ክፍለ ጊዜዎች",
        body: "ትምህርት ቤቶች ሲፈልጉ አማራጭ የCBT ቅርጸት ልምምድ — ከመላክና ከመጽሐፍት ጎን ለጎን።",
      },
      {
        title: "የግብረመልስ ዑደት",
        body: "ውጤቶችና ደካማ ርዕሶች ተማሪዎች እንዲገመግሙ፣ መምህራንም እንደገና ማስተማር እንዲያቅዱ ይረዳሉ።",
      },
    ],
    ctaTry: "በመተግበሪያው ልምምድ ይሞክሩ",
    ctaJoin: "ክፍል ይቀላቀሉ",
    ctaMelak: "መላክን ይወቁ",
  },
} as const;

export const pilotCopy = {
  en: {
    title: "Pilot Program",
    headline: "Classroom pilot for Grades 11–12",
    intro:
      "Kasina is piloting in government secondary schools to strengthen daily learning and teacher support — with learning improvement as the lead outcome.",
    scopeTitle: "Current scope",
    scope:
      "Grade 11–12 in Sebeta, Burayu, and Addis Ababa sub-cities (Kolfe Keranio, Nifas Silk-Lafto, Lemi Kura).",
    timelineTitle: "Timeline",
    timeline: "Approximately 12–18 months for the initial pilot window.",
    outcomesTitle: "Objectives",
    outcomes:
      "Improve access to learning support, help teachers see where students struggle, and gather feedback for expansion. Exam performance may be one supporting metric among others.",
    fundingTitle: "Funding partners",
    funding:
      "Australian Embassy DAP acknowledgment will appear here once confirmed.",
    expandTitle: "What’s next",
    expand: "Expansion toward Grades 9–10 after the initial secondary pilot.",
    cta: "Get involved",
  },
  am: {
    title: "ሙከራ ፕሮግራም",
    headline: "ለ11ኛ–12ኛ ክፍል የክፍል ሙከራ",
    intro:
      "ካሲና የዕለት ተዕለት ትምህርትንና የመምህር ድጋፍን ለማጠናከር በመንግስት ሁለተኛ ደረጃ ትምህርት ቤቶች ሙከራ እያደረገ ነው — የትምህርት መሻሻል እንደ ዋና ውጤት።",
    scopeTitle: "አሁን ያለው ወሰን",
    scope:
      "በሰበታ፣ ቡራዩ እና አዲስ አበባ ክፍለ ከተሞች (ኮልፌ ቀራኒዮ፣ ንፋስ ስልክ-ላፍቶ፣ ለሚ ኩራ) 11ኛ–12ኛ ክፍል።",
    timelineTitle: "ጊዜ ሰሌዳ",
    timeline: "ለመጀመሪያው የሙከራ መስኮት በግምት 12–18 ወራት።",
    outcomesTitle: "ዓላማዎች",
    outcomes:
      "የትምህርት ድጋፍ መዳረሻን ማሻሻል፣ መምህራን ተማሪዎች የት እንደሚቸገሩ እንዲያዩ መርዳት፣ እና ለማስፋፋት ግብረመልስ መሰብሰብ። የፈተና አፈጻጸም ከሌሎች መካከል አንድ ድጋፍ መለኪያ ሊሆን ይችላል።",
    fundingTitle: "የገንዘብ አጋሮች",
    funding:
      "የአውስትራሊያ ኤምባሲ DAP እውቅና ሲረጋገጥ እዚህ ይታያል።",
    expandTitle: "ቀጥሎ ምን",
    expand: "ከመጀመሪያው ሁለተኛ ደረጃ ሙከራ በኋላ ወደ 9ኛ–10ኛ ክፍል ማስፋፋት።",
    cta: "ተሳተፉ",
  },
} as const;

export const getInvolvedCopy = {
  en: {
    title: "Get Involved",
    headline: "Help strengthen teaching and learning",
    intro: "Choose how you want to partner with Kasina.",
    segments: [
      {
        title: "For Schools",
        body: "Request a partnership conversation for your secondary school or cluster.",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20school%20partnership`,
        cta: "Email us",
      },
      {
        title: "For Teachers",
        body: "Join the pilot for training, classroom tools, and co-design feedback.",
        href: "/teacher/signup",
        cta: "Teacher signup",
      },
      {
        title: "For Funders & Donors",
        body: "Support offline-first learning tools for Ethiopian classrooms.",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20funding`,
        cta: "Contact about funding",
      },
      {
        title: "For Volunteers & Educators",
        body: "Contribute content review, translation, or training support.",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20volunteer`,
        cta: "Volunteer email",
      },
    ],
  },
  am: {
    title: "ተሳተፉ",
    headline: "ማስተማርንና መማርን ለማጠናከር ይርዱ",
    intro: "ከካሲና ጋር እንዴት መተባበር እንደሚፈልጉ ይምረጡ።",
    segments: [
      {
        title: "ለትምህርት ቤቶች",
        body: "ለሁለተኛ ደረጃ ትምህርት ቤትዎ ወይም ክላስተር የአጋርነት ውይይት ይጠይቁ።",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20school%20partnership`,
        cta: "ኢሜይል ይላኩ",
      },
      {
        title: "ለመምህራን",
        body: "ለስልጠና፣ የክፍል መሣሪያዎችና የጋራ ንድፍ ግብረመልስ ሙከራውን ይቀላቀሉ።",
        href: "/teacher/signup",
        cta: "የመምህር ምዝገባ",
      },
      {
        title: "ለደጋፊዎች",
        body: "ለኢትዮጵያ ክፍሎች ከመስመር ውጭ ትምህርት መሣሪያዎችን ይደግፉ።",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20funding`,
        cta: "ስለ ድጋፍ ያግኙን",
      },
      {
        title: "ለበጎ ፈቃደኞችና አስተማሪዎች",
        body: "የይዘት ግምገማ፣ ትርጉም ወይም የስልጠና ድጋፍ ያበርክቱ።",
        href: `mailto:${CONTACT_EMAIL}?subject=Kasina%20volunteer`,
        cta: "የበጎ ፈቃድ ኢሜይል",
      },
    ],
  },
} as const;

export const contactCopy = {
  en: {
    title: "Contact",
    headline: "We would like to hear from you",
    intro: "Reach the Kasina team directly, or use the form below.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    formName: "Your name",
    formEmail: "Your email",
    formMessage: "Message",
    formSubmit: "Send via email",
    note: "Submitting opens your email app with a draft to our team.",
  },
  am: {
    title: "አግኙን",
    headline: "ከእርስዎ መስማት እንፈልጋለን",
    intro: "የካሲና ቡድንን በቀጥታ ያግኙ፣ ወይም ከታች ያለውን ቅጽ ይጠቀሙ።",
    emailLabel: "ኢሜይል",
    phoneLabel: "ስልክ",
    formName: "ስምዎ",
    formEmail: "ኢሜይልዎ",
    formMessage: "መልእክት",
    formSubmit: "በኢሜይል ይላኩ",
    note: "ማስገባት ወደ ቡድናችን ረቂቅ ኢሜይል ይከፍታል።",
  },
} as const;

export const faqCopy = {
  en: {
    title: "FAQ",
    headline: "Common questions",
    items: [
      {
        q: "Does it really work without internet?",
        a: "Melak’s lightweight tutor runs on your device without wifi — grounded to practice questions when you open it from review. Optional cloud tutoring needs a connection. CBT and class sync still need internet today.",
      },
      {
        q: "What devices does it support?",
        a: "Right now: modern phones and laptops in a browser (Chrome or Firefox). A dedicated Android app for offline Melak is on the roadmap after this pilot.",
      },
      {
        q: "Is student data safe?",
        a: "We only collect what is needed for learning and class management. We do not sell student data. See our Privacy Policy for plain-language details.",
      },
      {
        q: "Is this aligned with the national curriculum?",
        a: "Practice content follows Ethiopian secondary classroom subjects, starting with Grade 12 Mathematics in this pilot. We do not claim official MoE endorsement unless a partnership is signed and listed on Partners.",
      },
      {
        q: "Is Kasina only for exam prep?",
        a: "No. National-exam-format practice is one tool. The platform exists to strengthen day-to-day teaching and learning for students and teachers.",
      },
    ],
  },
  am: {
    title: "ተደጋጋሚ ጥያቄዎች",
    headline: "የተለመዱ ጥያቄዎች",
    items: [
      {
        q: "በእውነት ያለ በይነመረብ ይሰራል?",
        a: "የመላክ ቀላል አስተማሪ ያለ wifi በመሣሪያዎ ላይ ይሰራል — ከግምገማ ሲከፍቱ ከልምምድ ጥያቄዎች ጋር ይገናኛል። አማራጭ የክላውድ ትምህርት ግንኙነት ይፈልጋል። CBT እና የክፍል ማመሳሰል ዛሬ በይነመረብ ይፈልጋሉ።",
      },
      {
        q: "የትኞቹ መሣሪያዎች ይደገፋሉ?",
        a: "አሁን፡ ዘመናዊ ስልኮችና ላፕቶፖች በአሳሽ (Chrome ወይም Firefox)። ለከመስመር ውጭ መላክ የተለየ Android መተግበሪያ ከዚህ ሙከራ በኋላ በሮድማፕ ላይ ነው።",
      },
      {
        q: "የተማሪ ውሂብ ደህንነቱ የተጠበቀ ነው?",
        a: "ለትምህርትና የክፍል አስተዳደር የሚያስፈልገውን ብቻ እንሰበስባለን። የተማሪ ውሂብ አንሸጥም። ዝርዝር በግላዊነት ፖሊሲ ላይ።",
      },
      {
        q: "ከብሔራዊ ስርዓተ ትምህርት ጋር የተጣጣመ ነው?",
        a: "የልምምድ ይዘት የኢትዮጵያ ሁለተኛ ደረጃ ትምህርቶችን ይከተላል፣ በዚህ ሙከራ በ12ኛ ክፍል ሂሳብ ይጀምራል። ኦፊሴላዊ የሞኢ ድጋፍ ካልተፈረመና በአጋሮች ላይ ካልተዘረዘረ አንጠይቅም።",
      },
      {
        q: "ካሲና ለፈተና ዝግጅት ብቻ ነው?",
        a: "አይደለም። የብሔራዊ ፈተና ቅርጸት ልምምድ አንድ መሣሪያ ነው። መድረኩ ለተማሪዎችና መምህራን የዕለት ተዕለት ትምህርትን ለማጠናከር ነው።",
      },
    ],
  },
} as const;

export const legalCopy = {
  en: {
    privacy: {
      title: "Privacy Policy",
      body: [
        "Kasina collects only what is needed for learning and class management (for example account details, class membership, practice progress, and Melak chat needed for tutoring).",
        "We do not sell student data. Access to classroom data is limited to the student, their teachers for that class, and operators maintaining the service.",
        "Questions: email " + CONTACT_EMAIL + ". This plain-language policy will grow as the product does.",
      ],
    },
    terms: {
      title: "Terms of Use",
      body: [
        "Kasina is provided for educational use in participating schools and pilots. Do not misuse the service, attempt unauthorized access, or share credentials.",
        "Content and tutoring responses are learning aids — always verify with your teacher and curriculum materials.",
        "We may update these terms as the pilot expands. Contact " +
          CONTACT_EMAIL +
          " with questions.",
      ],
    },
  },
  am: {
    privacy: {
      title: "የግላዊነት ፖሊሲ",
      body: [
        "ካሲና ለትምህርትና የክፍል አስተዳደር የሚያስፈልገውን ብቻ ይሰበስባል (ለምሳሌ የመለያ ዝርዝር፣ የክፍል አባልነት፣ የልምምድ እድገት፣ እና ለትምህርት የሚያስፈልግ የመላክ ውይይት)።",
        "የተማሪ ውሂብ አንሸጥም። የክፍል ውሂብ መዳረሻ ለተማሪው፣ ለዚያ ክፍል መምህራን፣ እና አገልግሎቱን ለሚያስተዳድሩ ብቻ ነው።",
        "ጥያቄዎች፡ " + CONTACT_EMAIL + "። ይህ ቀላል ፖሊሲ ከምርቱ ጋር ያድጋል።",
      ],
    },
    terms: {
      title: "የአጠቃቀም ሁኔታዎች",
      body: [
        "ካሲና በተሳታፊ ትምህርት ቤቶችና ሙከራዎች ለትምህርታዊ አጠቃቀም ይቀርባል። አገልግሎቱን አላግባብ አይጠቀሙ፣ ያልተፈቀደ መዳረሻ አይሞክሩ፣ የመግቢያ መረጃ አያጋሩ።",
        "ይዘትና የትምህርት ምላሾች የመማሪያ እገዛዎች ናቸው — ሁልጊዜ ከመምህርዎና ከስርዓተ ትምህርት ቁሳቁስ ያረጋግጡ።",
        "ሙከራው ሲሰፋ እነዚህን ሁኔታዎች ማዘመን እንችላለን። ጥያቄዎች፡ " +
          CONTACT_EMAIL +
          "።",
      ],
    },
  },
} as const;

export const placeholderCopy = {
  en: {
    impact: {
      title: "Impact",
      headline: "Results coming as the pilot reports",
      body: "We will publish student learning outcomes, teacher feedback and adoption, and supporting exam data here — with learning and teaching as the lead story.",
      cta: "About the pilot",
    },
    partners: {
      title: "Partners",
      headline: "Partners will be listed as confirmed",
      body: "Government and woreda partners, funders (including DAP once confirmed), NGOs, and named school partners will appear on this page.",
      cta: "Get involved",
    },
  },
  am: {
    impact: {
      title: "ተጽዕኖ",
      headline: "ሙከራው ሪፖርት ሲያደርግ ውጤቶች ይመጣሉ",
      body: "የተማሪ የትምህርት ውጤቶች፣ የመምህራን ግብረመልስና ተቀባይነት፣ እና ድጋፍ የፈተና ውሂብ እዚህ እናትማለን — ትምህርትና ማስተማር እንደ ዋና ታሪክ።",
      cta: "ስለ ሙከራው",
    },
    partners: {
      title: "አጋሮች",
      headline: "አጋሮች ሲረጋገጡ ይዘረዘራሉ",
      body: "የመንግስትና ወረዳ አጋሮች፣ ደጋፊዎች (DAP ሲረጋገጥ ጨምሮ)፣ መንግስታዊ ያልሆኑ ድርጅቶችና የተሰየሙ የትምህርት ቤት አጋሮች በዚህ ገጽ ይታያሉ።",
      cta: "ተሳተፉ",
    },
  },
} as const;
