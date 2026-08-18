import { describe, expect, it } from "vitest";
import { getSeedQuestions, validateQuestions } from "./index";

describe("question bank", () => {
  it("validates bundled seed JSON", () => {
    const questions = getSeedQuestions();
    expect(questions.length).toBeGreaterThan(50);
    expect(questions[0]?.id).toBeTruthy();
    expect(questions[0]?.options.length).toBeGreaterThan(0);
  });

  it("rejects malformed input", () => {
    expect(() => validateQuestions([{ id: "bad" }])).toThrow();
  });
});
