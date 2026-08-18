import { describe, expect, it } from "vitest";
import {
  generateMelakReply,
  prefersAmharic,
  type MelakQuestionContext,
} from "./index";

const sampleQuestion: MelakQuestionContext = {
  id: "q1",
  stem: "Find the derivative of x^2",
  unit: "Calculus",
  topic: "Derivatives",
  explanation: "Use the power rule: d/dx x^2 = 2x.",
};

describe("prefersAmharic", () => {
  it("detects Ethiopic script", () => {
    expect(prefersAmharic("derivative")).toBe(false);
    expect(prefersAmharic("ተዋጽኦ")).toBe(true);
  });
});

describe("generateMelakReply", () => {
  it("returns grounded offline reply when question context is provided", () => {
    const { reply, mode } = generateMelakReply({
      message: "How do I start?",
      question: sampleQuestion,
    });
    expect(mode).toBe("offline");
    expect(reply).toContain("Derivatives");
    expect(reply).toContain("power rule");
  });

  it("returns topic hint for generic derivative question", () => {
    const { reply } = generateMelakReply({ message: "help with derivative" });
    expect(reply).toContain("power rule");
  });

  it("responds in Amharic when message uses Ethiopic script", () => {
    const { reply } = generateMelakReply({
      message: "ተዋጽኦ",
      question: { ...sampleQuestion, stemAm: "x^2 ተዋጽኦ" },
    });
    expect(reply).toMatch(/[\u1200-\u137F]/);
  });
});
