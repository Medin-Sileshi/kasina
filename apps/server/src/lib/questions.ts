export type QuestionRow = {
  id: string;
  grade: number;
  subject: string;
  stream: string | null;
  year: number | null;
  unit: string;
  topic: string;
  stem: string;
  stem_am: string | null;
  options_json: unknown;
  correct_option_id: string;
  explanation: string;
  explanation_am: string | null;
  difficulty: string | null;
  tags_json: unknown;
};

export function mapQuestion(row: QuestionRow) {
  return {
    id: row.id,
    grade: row.grade,
    subject: row.subject,
    stream: row.stream,
    year: row.year,
    unit: row.unit,
    topic: row.topic,
    stem: row.stem,
    stemAm: row.stem_am,
    options: row.options_json,
    correctOptionId: row.correct_option_id,
    explanation: row.explanation,
    explanationAm: row.explanation_am,
    difficulty: row.difficulty,
    tags: row.tags_json,
  };
}

export function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
