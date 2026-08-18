export type UserRole = "student" | "teacher" | "admin";

export type Difficulty = "easy" | "medium" | "hard";

export type SubjectId =
  | "mathematics"
  | "physics"
  | "chemistry"
  | "biology"
  | "english"
  | "history"
  | "geography"
  | "economics"
  | "civics";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Class {
  id: string;
  teacherId: string;
  name: string;
  grade: number;
  subject: SubjectId;
  inviteCode: string;
  createdAt: string;
}

export interface ClassMember {
  classId: string;
  studentId: string;
  joinedAt: string;
}

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface TextbookRef {
  grade: number;
  subject: SubjectId;
  chapter: number;
  section?: string;
  pageStart?: number;
  pageEnd?: number;
}

export interface Question {
  id: string;
  grade: number;
  subject: SubjectId;
  stream?: "natural" | "social" | "both";
  year?: number;
  unit: string;
  topic: string;
  stem: string;
  stemAm?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation: string;
  explanationAm?: string;
  difficulty?: Difficulty;
  tags?: string[];
  textbookRef?: TextbookRef;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  /** Topic/unit filter mode */
  unit?: string;
  topic?: string;
  /** Resolved question ids when assignment is created */
  questionIds: string[];
  questionCount: number;
  dueAt?: string;
  createdAt: string;
}

export type SessionMode = "random" | "topic" | "assignment" | "weak_topics" | "year" | "cbt";

export interface Session {
  id: string;
  userId: string;
  assignmentId?: string;
  subject: SubjectId;
  grade: number;
  mode: SessionMode;
  unit?: string;
  topic?: string;
  year?: number;
  questionIds: string[];
  startedAt: string;
  completedAt?: string;
  score?: number;
  total?: number;
}

export interface Answer {
  id: string;
  sessionId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timeTakenSeconds?: number;
  answeredAt: string;
}
