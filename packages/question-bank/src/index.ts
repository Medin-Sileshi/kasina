import { questionBankSchema, type QuestionInput } from "./schema";
import seed from "../data/grade12-math-seed.json";

export { questionSchema, questionBankSchema, type QuestionInput } from "./schema";

export function getSeedQuestions(): QuestionInput[] {
  return questionBankSchema.parse(seed);
}

export function validateQuestions(data: unknown): QuestionInput[] {
  return questionBankSchema.parse(data);
}
