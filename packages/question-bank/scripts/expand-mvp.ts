/**
 * Appends Grade 12 Math expansion items to the seed JSON, then patches Amharic
 * on a high-traffic sample set. Run: pnpm --filter @kasina/question-bank exec tsx scripts/expand-mvp.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type Opt = { id: string; label: string; text: string };
type Q = {
  id: string;
  grade: number;
  subject: "mathematics";
  stream: "both";
  year: number;
  unit: string;
  topic: string;
  stem: string;
  stemAm?: string;
  options: Opt[];
  correctOptionId: string;
  explanation: string;
  explanationAm?: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
};

function opts(
  a: string,
  b: string,
  c: string,
  d: string,
): Opt[] {
  return [
    { id: "a", label: "A", text: a },
    { id: "b", label: "B", text: b },
    { id: "c", label: "C", text: c },
    { id: "d", label: "D", text: d },
  ];
}

function q(
  id: string,
  unit: string,
  topic: string,
  stem: string,
  options: Opt[],
  correct: string,
  explanation: string,
  difficulty: Q["difficulty"],
  year = 2024,
  extra: Partial<Q> = {},
): Q {
  return {
    id,
    grade: 12,
    subject: "mathematics",
    stream: "both",
    year,
    unit,
    topic,
    stem,
    options,
    correctOptionId: correct,
    explanation,
    difficulty,
    tags: [
      unit.toLowerCase().replace(/\s+/g, "-"),
      topic.toLowerCase().replace(/\s+/g, "-"),
      "mvp-expand",
    ],
    ...extra,
  };
}

const expansion: Q[] = [
  // —— Sequences and Series (12) ——
  q(
    "math-gr12-exp-001",
    "Sequences and Series",
    "Arithmetic Sequences",
    "The 5th term of an arithmetic sequence with first term $3$ and common difference $4$ is",
    opts("$15$", "$19$", "$23$", "$7$"),
    "b",
    "$a_5=a_1+4d=3+16=19$.",
    "easy",
  ),
  q(
    "math-gr12-exp-002",
    "Sequences and Series",
    "Arithmetic Sequences",
    "Sum of the first $n$ terms of an arithmetic series is $S_n=\\frac{n}{2}(2a+(n-1)d)$. For $a=2$, $d=3$, $n=4$, $S_4=$",
    opts("$20$", "$14$", "$26$", "$8$"),
    "a",
    "$S_4=\\frac{4}{2}(4+9)=2\\times13=26$? Wait: $2a+(n-1)d=4+9=13$, $\\frac{4}{2}\\times13=26$. Correct is $26$.",
    "medium",
  ),
];

// Fix exp-002 - I made an error in explanation saying 20 then 26. Fix correct to c and options.
expansion[1] = q(
  "math-gr12-exp-002",
  "Sequences and Series",
  "Arithmetic Sequences",
  "Sum of the first $n$ terms of an arithmetic series is $S_n=\\frac{n}{2}(2a+(n-1)d)$. For $a=2$, $d=3$, $n=4$, $S_4=$",
  opts("$14$", "$20$", "$26$", "$32$"),
  "c",
  "$S_4=\\frac{4}{2}(4+9)=2\\times 13=26$.",
  "medium",
);

expansion.push(
  q(
    "math-gr12-exp-003",
    "Sequences and Series",
    "Arithmetic Sequences",
    "If $a_1=5$ and $a_4=14$ in an arithmetic sequence, the common difference is",
    opts("$3$", "$9$", "$2$", "$4$"),
    "a",
    "$a_4=a_1+3d\\Rightarrow 14=5+3d\\Rightarrow d=3$.",
    "easy",
  ),
  q(
    "math-gr12-exp-004",
    "Sequences and Series",
    "Geometric Sequences",
    "The 4th term of a geometric sequence with $a_1=2$ and $r=3$ is",
    opts("$18$", "$24$", "$54$", "$6$"),
    "c",
    "$a_4=a_1 r^{3}=2\\cdot 27=54$.",
    "easy",
  ),
  q(
    "math-gr12-exp-005",
    "Sequences and Series",
    "Geometric Sequences",
    "Sum of infinite geometric series with $|r|<1$ is $S=\\frac{a}{1-r}$. For $a=3$, $r=\\frac{1}{2}$, $S=$",
    opts("$6$", "$3$", "$1.5$", "$2$"),
    "a",
    "$S=\\frac{3}{1-1/2}=6$.",
    "medium",
  ),
  q(
    "math-gr12-exp-006",
    "Sequences and Series",
    "Geometric Sequences",
    "If $a_1=81$ and $r=\\frac{1}{3}$, then $a_3=$",
    opts("$27$", "$9$", "$3$", "$1$"),
    "b",
    "$a_3=81\\cdot(\\frac{1}{3})^2=9$.",
    "easy",
  ),
  q(
    "math-gr12-exp-007",
    "Sequences and Series",
    "Series Summation",
    "$\\sum_{k=1}^{5} k =$",
    opts("$10$", "$15$", "$20$", "$5$"),
    "b",
    "$1+2+3+4+5=15$.",
    "easy",
  ),
  q(
    "math-gr12-exp-008",
    "Sequences and Series",
    "Series Summation",
    "$\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}$. For $n=10$ this equals",
    opts("$45$", "$55$", "$50$", "$100$"),
    "b",
    "$\\frac{10\\cdot 11}{2}=55$.",
    "easy",
  ),
  q(
    "math-gr12-exp-009",
    "Sequences and Series",
    "Series Summation",
    "An arithmetic series has 1st term $1$ and last term $20$ with $10$ terms. Its sum is",
    opts("$105$", "$210$", "$100$", "$55$"),
    "a",
    "$S_n=\\frac{n}{2}(a_1+a_n)=\\frac{10}{2}(21)=105$.",
    "medium",
  ),
  q(
    "math-gr12-exp-010",
    "Sequences and Series",
    "Arithmetic Sequences",
    "Which sequence is arithmetic?",
    opts("$2,4,8,16$", "$3,6,9,12$", "$1,2,4,7$", "$5,5,10,20$"),
    "b",
    "Constant difference $3$.",
    "easy",
  ),
  q(
    "math-gr12-exp-011",
    "Sequences and Series",
    "Geometric Sequences",
    "Which sequence is geometric?",
    opts("$2,4,6,8$", "$3,6,12,24$", "$1,3,6,10$", "$10,7,4,2$"),
    "b",
    "Constant ratio $2$.",
    "easy",
  ),
  q(
    "math-gr12-exp-012",
    "Sequences and Series",
    "Geometric Sequences",
    "For $|r|\\ge 1$, the infinite geometric series $\\sum ar^{n}$",
    opts(
      "always converges",
      "converges only if $a=0$",
      "diverges (does not have a finite sum)",
      "sums to $a/(1+r)$",
    ),
    "c",
    "Requires $|r|<1$ for convergence.",
    "medium",
  ),

  // —— Applications of Derivatives (10) ——
  q(
    "math-gr12-exp-013",
    "Calculus",
    "Applications of Derivatives",
    "If $f'(c)=0$ and $f''(c)>0$, then at $x=c$ the function $f$ has a",
    opts("local maximum", "local minimum", "point of inflection only", "vertical asymptote"),
    "b",
    "Second-derivative test: $f''>0$ ⇒ local min.",
    "medium",
  ),
  q(
    "math-gr12-exp-014",
    "Calculus",
    "Applications of Derivatives",
    "A critical point of $f$ occurs where",
    opts(
      "$f(x)=0$ only",
      "$f'(x)=0$ or $f'$ undefined (in domain)",
      "$f''(x)=0$ only",
      "$f(x)=f'(x)$",
    ),
    "b",
    "Definition of critical points.",
    "easy",
  ),
  q(
    "math-gr12-exp-015",
    "Calculus",
    "Applications of Derivatives",
    "If $s(t)$ is position, then velocity is",
    opts("$s(t)$", "$s'(t)$", "$s''(t)$", "$\\int s(t)\\,dt$"),
    "b",
    "Velocity is the first derivative of position.",
    "easy",
  ),
  q(
    "math-gr12-exp-016",
    "Calculus",
    "Applications of Derivatives",
    "Acceleration is the derivative of",
    opts("position", "velocity", "jerk", "distance only"),
    "b",
    "$a(t)=v'(t)=s''(t)$.",
    "easy",
  ),
  q(
    "math-gr12-exp-017",
    "Calculus",
    "Applications of Derivatives",
    "For $f(x)=x^3-3x$, critical points solve $f'(x)=0$. Here $f'(x)=$",
    opts("$3x^2-3$", "$3x^2$", "$x^2-3$", "$3x-3$"),
    "a",
    "Power rule: $3x^2-3$.",
    "medium",
  ),
  q(
    "math-gr12-exp-018",
    "Calculus",
    "Applications of Derivatives",
    "On an interval where $f'(x)>0$, $f$ is",
    opts("decreasing", "increasing", "constant", "concave down only"),
    "b",
    "Positive derivative ⇒ increasing.",
    "easy",
  ),
  q(
    "math-gr12-exp-019",
    "Calculus",
    "Applications of Derivatives",
    "If $f''(x)<0$ on an interval, the graph of $f$ is",
    opts("concave up", "concave down", "linear", "discontinuous"),
    "b",
    "Negative second derivative ⇒ concave down.",
    "medium",
  ),
  q(
    "math-gr12-exp-020",
    "Calculus",
    "Applications of Derivatives",
    "Related rates: if a circle’s radius increases, area $A=\\pi r^2$ satisfies $\\frac{dA}{dt}=$",
    opts("$2\\pi r$", "$2\\pi r\\frac{dr}{dt}$", "$\\pi r\\frac{dr}{dt}$", "$\\pi r^2\\frac{dr}{dt}$"),
    "b",
    "Chain rule: $A'=2\\pi r\\,r'$.",
    "hard",
  ),
  q(
    "math-gr12-exp-021",
    "Calculus",
    "Applications of Derivatives",
    "Absolute extrema of a continuous $f$ on $[a,b]$ occur at",
    opts(
      "critical points in $(a,b)$ and/or endpoints $a,b$",
      "only where $f''=0$",
      "only asymptotes",
      "nowhere",
    ),
    "a",
    "Extreme Value Theorem candidates.",
    "medium",
  ),
  q(
    "math-gr12-exp-022",
    "Calculus",
    "Applications of Derivatives",
    "Linear approximation of $f$ near $a$ is",
    opts(
      "$f(x)\\approx f(a)+f'(a)(x-a)$",
      "$f(x)\\approx f'(a)$",
      "$f(x)\\approx f''(a)(x-a)$",
      "$f(x)\\approx f(a)/f'(a)$",
    ),
    "a",
    "Tangent-line approximation.",
    "medium",
  ),

  // —— Integrals (10) ——
  q(
    "math-gr12-exp-023",
    "Calculus",
    "Integrals",
    "$\\int x^n\\,dx$ for $n\\neq -1$ equals",
    opts(
      "$\\frac{x^{n+1}}{n+1}+C$",
      "$nx^{n-1}+C$",
      "$x^{n+1}+C$",
      "$\\ln|x|+C$",
    ),
    "a",
    "Power rule for antidifferentiation.",
    "easy",
  ),
  q(
    "math-gr12-exp-024",
    "Calculus",
    "Integrals",
    "$\\int \\frac{1}{x}\\,dx =$",
    opts("$x+C$", "$\\ln|x|+C$", "$1/x^2+C$", "$e^x+C$"),
    "b",
    "Standard integral of $1/x$.",
    "easy",
  ),
  q(
    "math-gr12-exp-025",
    "Calculus",
    "Integrals",
    "$\\int_0^1 2x\\,dx =$",
    opts("$0$", "$1$", "$2$", "$1/2$"),
    "b",
    "$[x^2]_0^1=1$.",
    "easy",
  ),
  q(
    "math-gr12-exp-026",
    "Calculus",
    "Integrals",
    "The definite integral $\\int_a^b f(x)\\,dx$ equals",
    opts(
      "$F(b)-F(a)$ for an antiderivative $F$",
      "$F(a)-F(b)$ always",
      "$f(b)-f(a)$",
      "$f'(b)-f'(a)$",
    ),
    "a",
    "Fundamental Theorem of Calculus.",
    "medium",
  ),
  q(
    "math-gr12-exp-027",
    "Calculus",
    "Integrals",
    "$\\int e^x\\,dx =$",
    opts("$e^x+C$", "$xe^x+C$", "$\\ln|e^x|+C$", "$1/e^x+C$"),
    "a",
    "Derivative of $e^x$ is $e^x$.",
    "easy",
  ),
  q(
    "math-gr12-exp-028",
    "Calculus",
    "Integrals",
    "$\\int \\cos x\\,dx =$",
    opts("$-\\sin x+C$", "$\\sin x+C$", "$\\cos x+C$", "$-\\cos x+C$"),
    "b",
    "Derivative of $\\sin x$ is $\\cos x$.",
    "easy",
  ),
  q(
    "math-gr12-exp-029",
    "Calculus",
    "Integrals",
    "$\\int_0^{\\pi/2} \\sin x\\,dx =$",
    opts("$0$", "$1$", "$-1$", "$\\pi/2$"),
    "b",
    "$[-\\cos x]_0^{\\pi/2}=0-(-1)=1$.",
    "medium",
  ),
  q(
    "math-gr12-exp-030",
    "Calculus",
    "Integrals",
    "If $F'=f$, then $\\frac{d}{dx}\\int_0^x f(t)\\,dt =$",
    opts("$F(x)$", "$f(x)$", "$f(0)$", "$0$"),
    "b",
    "FTC part 1.",
    "medium",
  ),
  q(
    "math-gr12-exp-031",
    "Calculus",
    "Integrals",
    "$\\int (3x^2+1)\\,dx =$",
    opts("$x^3+x+C$", "$6x+C$", "$x^3+C$", "$3x^3+x+C$"),
    "a",
    "Termwise antidifferentiation.",
    "easy",
  ),
  q(
    "math-gr12-exp-032",
    "Calculus",
    "Integrals",
    "Area under $y=f(x)\\ge 0$ from $a$ to $b$ is given by",
    opts(
      "$\\int_a^b f(x)\\,dx$",
      "$f'(b)-f'(a)$",
      "$f(a)+f(b)$",
      "$\\int f'(x)\\,dx$ only",
    ),
    "a",
    "Geometric meaning of definite integral.",
    "easy",
  ),

  // —— Deepen Limits (+3) ——
  q(
    "math-gr12-exp-033",
    "Calculus",
    "Limits",
    "$\\lim_{x\\to 0} \\frac{\\sin x}{x} =$",
    opts("$0$", "$1$", "$\\infty$", "does not exist"),
    "b",
    "Standard trigonometric limit.",
    "medium",
  ),
  q(
    "math-gr12-exp-034",
    "Calculus",
    "Limits",
    "$\\lim_{x\\to \\infty} \\frac{1}{x} =$",
    opts("$1$", "$0$", "$\\infty$", "$-1$"),
    "b",
    "Reciprocal tends to $0$.",
    "easy",
  ),
  q(
    "math-gr12-exp-035",
    "Calculus",
    "Limits",
    "If $\\lim_{x\\to a} f(x)=L$ and $\\lim_{x\\to a} g(x)=M$, then $\\lim (f+g)=$",
    opts("$LM$", "$L+M$", "$L/M$", "$L-M$ only"),
    "b",
    "Sum rule for limits.",
    "easy",
  ),

  // —— Geometry deepen (+3 each = 9) ——
  q(
    "math-gr12-exp-036",
    "Geometry",
    "Triangles",
    "Sum of interior angles in any triangle is",
    opts("$90^\\circ$", "$180^\\circ$", "$270^\\circ$", "$360^\\circ$"),
    "b",
    "Euclidean triangle angle sum.",
    "easy",
  ),
  q(
    "math-gr12-exp-037",
    "Geometry",
    "Triangles",
    "In a right triangle with legs $3$ and $4$, the hypotenuse is",
    opts("$5$", "$6$", "$7$", "$12$"),
    "a",
    "Pythagorean triple $3$-$4$-$5$.",
    "easy",
  ),
  q(
    "math-gr12-exp-038",
    "Geometry",
    "Triangles",
    "An equilateral triangle has",
    opts(
      "all sides equal and all angles $60^\\circ$",
      "only two sides equal",
      "a right angle",
      "no symmetry",
    ),
    "a",
    "Definition of equilateral.",
    "easy",
  ),
  q(
    "math-gr12-exp-039",
    "Geometry",
    "Circles",
    "Circumference of a circle of radius $r$ is",
    opts("$2\\pi r$", "$\\pi r^2$", "$\\pi r$", "$4\\pi r$"),
    "a",
    "$C=2\\pi r$.",
    "easy",
  ),
  q(
    "math-gr12-exp-040",
    "Geometry",
    "Circles",
    "Area of a circle of radius $r$ is",
    opts("$2\\pi r$", "$\\pi r^2$", "$\\pi d$", "$r^2$"),
    "b",
    "$A=\\pi r^2$.",
    "easy",
  ),
  q(
    "math-gr12-exp-041",
    "Geometry",
    "Circles",
    "A central angle of $90^\\circ$ in a circle intercepts an arc that is",
    opts(
      "one-quarter of the circumference",
      "half the circumference",
      "the full circumference",
      "one-eighth of the circumference",
    ),
    "a",
    "$90/360=1/4$.",
    "medium",
  ),
  q(
    "math-gr12-exp-042",
    "Geometry",
    "Coordinate Geometry",
    "Distance between $(0,0)$ and $(3,4)$ is",
    opts("$5$", "$7$", "$12$", "$1$"),
    "a",
    "$\\sqrt{9+16}=5$.",
    "easy",
  ),
  q(
    "math-gr12-exp-043",
    "Geometry",
    "Coordinate Geometry",
    "Midpoint of $(2,4)$ and $(6,8)$ is",
    opts("$(4,6)$", "$(8,12)$", "$(2,2)$", "$(3,5)$"),
    "a",
    "$(\\frac{2+6}{2},\\frac{4+8}{2})=(4,6)$.",
    "easy",
  ),
  q(
    "math-gr12-exp-044",
    "Geometry",
    "Coordinate Geometry",
    "Slope of the line through $(1,1)$ and $(3,5)$ is",
    opts("$1$", "$2$", "$3$", "$4$"),
    "b",
    "$m=\\frac{5-1}{3-1}=2$.",
    "easy",
  ),

  // —— Stats deepen (+3 each = 6) ——
  q(
    "math-gr12-exp-045",
    "Statistics",
    "Mean and Median",
    "Mean of $2,4,6,8$ is",
    opts("$4$", "$5$", "$6$", "$20$"),
    "b",
    "$(2+4+6+8)/4=5$.",
    "easy",
  ),
  q(
    "math-gr12-exp-046",
    "Statistics",
    "Mean and Median",
    "Median of $1,3,7$ is",
    opts("$1$", "$3$", "$7$", "$11/3$"),
    "b",
    "Middle value of ordered list.",
    "easy",
  ),
  q(
    "math-gr12-exp-047",
    "Statistics",
    "Mean and Median",
    "For an even count of ordered data, the median is",
    opts(
      "the average of the two middle values",
      "always the first value",
      "the mode",
      "undefined",
    ),
    "a",
    "Standard definition.",
    "medium",
  ),
  q(
    "math-gr12-exp-048",
    "Statistics",
    "Probability",
    "A fair coin $P(\\text{heads})=$",
    opts("$0$", "$1/2$", "$1$", "$2$"),
    "b",
    "Two equally likely outcomes.",
    "easy",
  ),
  q(
    "math-gr12-exp-049",
    "Statistics",
    "Probability",
    "If $A$ and $B$ are mutually exclusive, $P(A\\cup B)=$",
    opts("$P(A)P(B)$", "$P(A)+P(B)$", "$P(A)-P(B)$", "$1$"),
    "b",
    "Addition rule with $P(A\\cap B)=0$.",
    "medium",
  ),
  q(
    "math-gr12-exp-050",
    "Statistics",
    "Probability",
    "A fair six-sided die: $P(\\text{rolling a }6)=$",
    opts("$1/6$", "$1/2$", "$1$", "$6$"),
    "a",
    "One favorable over six outcomes.",
    "easy",
  ),

  // —— Product Rule (+2) ——
  q(
    "math-gr12-exp-051",
    "Calculus",
    "Product Rule",
    "$(fg)'=$",
    opts("$f'g'$", "$f'g+fg'$", "$f+g$", "$f'/g'$"),
    "b",
    "Product rule.",
    "easy",
  ),
  q(
    "math-gr12-exp-052",
    "Calculus",
    "Product Rule",
    "Differentiate $y=x\\ln x$ (for $x>0$)",
    opts(
      "$\\ln x+1$",
      "$1/x$",
      "$\\ln x$",
      "$x+\\ln x$",
    ),
    "a",
    "$(1)\\ln x+x\\cdot(1/x)=\\ln x+1$.",
    "medium",
  ),
);

const amharicPatches: Record<
  string,
  { stemAm: string; explanationAm: string }
> = {
  "math-gr12-m3-051": {
    stemAm: "የ $x^5$ ተዋጽኦ ምንድን ነው?",
    explanationAm: "የኃይል ደንብ፡ $nx^{n-1}$ ስለዚህ $5x^4$.",
  },
  "math-gr12-m3-052": {
    stemAm: "ከ $f(x)=3x^4-2x$ ከሆነ $f'(x)=$",
    explanationAm: "$12x^3-2$ በኃይል ደንብ።",
  },
  "math-gr12-m3-053": {
    stemAm: "የ $y=\\frac{1}{x^3}$ ተዋጽኦ አግኙ።",
    explanationAm: "$x^{-3}$ ተዋጽኦ $-3x^{-4}$ ነው።",
  },
  "math-gr12-m3-054": {
    stemAm: "የ $\\sqrt{x}$ ተዋጽኦ አግኙ።",
    explanationAm: "$x^{1/2}$ ተዋጽኦ $\\frac{1}{2}x^{-1/2}$ ነው።",
  },
  "math-gr12-m3-055": {
    stemAm: "ከ $g(x)=7$ ከሆነ $g'(x)=$",
    explanationAm: "የቋሚ ተግባር ተዋጽኦ ዜሮ ነው።",
  },
  "math-gr12-m3-056": {
    stemAm: "የ $f(x)=x^{10}+x$ ተዋጽኦ",
    explanationAm: "$10x^9+1$.",
  },
  "math-gr12-exp-001": {
    stemAm: "የሂሳባዊ ተከታታይ 5ኛ ቃል ከ $a_1=3$ እና $d=4$ ጋር ምንድን ነው?",
    explanationAm: "$a_5=3+4\\cdot4=19$.",
  },
  "math-gr12-exp-004": {
    stemAm: "የጂኦሜትሪያዊ ተከታታይ 4ኛ ቃል ከ $a_1=2$ እና $r=3$ ጋር",
    explanationAm: "$a_4=2\\cdot3^3=54$.",
  },
  "math-gr12-exp-007": {
    stemAm: "$\\sum_{k=1}^{5} k =$",
    explanationAm: "$1+2+3+4+5=15$.",
  },
  "math-gr12-exp-013": {
    stemAm: "ከ $f'(c)=0$ እና $f''(c)>0$ ከሆነ በ $x=c$ ላይ $f$ አለው",
    explanationAm: "አካባቢያዊ ዝቅተኛ (second derivative test)።",
  },
  "math-gr12-exp-023": {
    stemAm: "ለ $n\\neq -1$፣ $\\int x^n\\,dx$ እኩል ነው",
    explanationAm: "$\\frac{x^{n+1}}{n+1}+C$.",
  },
  "math-gr12-exp-025": {
    stemAm: "$\\int_0^1 2x\\,dx =$",
    explanationAm: "$[x^2]_0^1=1$.",
  },
  "math-gr12-exp-036": {
    stemAm: "የማንኛውም ሶስት ማዕዘን የውስጥ ማዕዘኖች ድምር",
    explanationAm: "$180^\\circ$ ነው።",
  },
  "math-gr12-exp-039": {
    stemAm: "የክብ ዙሪያ ከ ራዲየስ $r$ ጋር",
    explanationAm: "$2\\pi r$.",
  },
  "math-gr12-exp-042": {
    stemAm: "ከ $(0,0)$ እስከ $(3,4)$ ያለው ርቀት",
    explanationAm: "$\\sqrt{9+16}=5$.",
  },
  "math-gr12-exp-045": {
    stemAm: "የ $2,4,6,8$ አማካኝ",
    explanationAm: "$20/4=5$.",
  },
  "math-gr12-exp-048": {
    stemAm: "ፍትሃዊ ሳንቲም $P(\\text{ጭንቅላት})=$",
    explanationAm: "$1/2$.",
  },
  "math-gr12-exp-033": {
    stemAm: "$\\lim_{x\\to 0} \\frac{\\sin x}{x} =$",
    explanationAm: "መደበኛ ገደብ፡ $1$.",
  },
  "math-gr12-exp-015": {
    stemAm: "ከ $s(t)$ አቀማመጥ ከሆነ ፍጥነት ነው",
    explanationAm: "$s'(t)$.",
  },
  "math-gr12-exp-024": {
    stemAm: "$\\int \\frac{1}{x}\\,dx =$",
    explanationAm: "$\\ln|x|+C$.",
  },
  "math-gr12-exp-051": {
    stemAm: "$(fg)'=$",
    explanationAm: "$f'g+fg'$ የምርት ደንብ።",
  },
  "math-gr12-exp-010": {
    stemAm: "የትኛው ተከታታይ ሂሳባዊ ነው?",
    explanationAm: "$3,6,9,12$ ቋሚ ልዩነት $3$ አለው።",
  },
  "math-gr12-exp-011": {
    stemAm: "የትኛው ተከታታይ ጂኦሜትሪያዊ ነው?",
    explanationAm: "$3,6,12,24$ ቋሚ ሬሾ $2$ አለው።",
  },
  "math-gr12-exp-018": {
    stemAm: "በክፍተት ላይ $f'(x)>0$ ከሆነ $f$ ነው",
    explanationAm: "እየጨመረ።",
  },
  "math-gr12-exp-037": {
    stemAm: "ቀኝ ማዕዘን ሶስት ማዕዘን ጎኖች $3$ እና $4$ ከሆኑ ሃይፖቴኑስ",
    explanationAm: "$5$ ($3$-$4$-$5$).",
  },
};

const seedPath = resolve(import.meta.dirname, "../data/grade12-math-seed.json");
const existing = JSON.parse(readFileSync(seedPath, "utf8")) as Q[];
const ids = new Set(existing.map((x) => x.id));
const toAdd = expansion.filter((x) => !ids.has(x.id));

const merged = [...existing, ...toAdd].map((item) => {
  const patch = amharicPatches[item.id];
  if (!patch) return item;
  return { ...item, ...patch };
});

writeFileSync(seedPath, JSON.stringify(merged, null, 2) + "\n");
console.log(
  JSON.stringify({
    before: existing.length,
    added: toAdd.length,
    after: merged.length,
    withAmharic: merged.filter((x) => x.stemAm && x.explanationAm).length,
  }),
);
