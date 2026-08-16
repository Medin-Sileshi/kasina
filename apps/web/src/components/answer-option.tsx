"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { MathText } from "./math-text";

export type AnswerOptionState =
  | "default"
  | "selected"
  | "correct"
  | "wrong"
  | "correctUnselected";

type Props = {
  letter: string;
  text: string;
  state?: AnswerOptionState;
  disabled?: boolean;
  onClick?: () => void;
};

export function AnswerOption({
  letter,
  text,
  state = "default",
  disabled,
  onClick,
}: Props) {
  const base =
    "flex w-full min-h-11 items-center gap-3.5 overflow-hidden rounded-xl border-[1.5px] px-4 py-3.5 text-left transition duration-150 sm:min-h-14 sm:px-5 sm:py-4 mb-2.5";

  const styles: Record<AnswerOptionState, string> = {
    default:
      "border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50 hover:-translate-y-px cursor-pointer",
    selected: "border-2 border-primary-600 bg-primary-50 cursor-pointer",
    correct: "border-2 border-success bg-success-bg cursor-default",
    wrong: "border-2 border-error bg-error-bg cursor-default animate-[shake_300ms_ease-in-out]",
    correctUnselected:
      "border-2 border-success bg-success-bg opacity-75 cursor-default",
  };

  const letterStyles: Record<AnswerOptionState, string> = {
    default:
      "border-[1.5px] border-gray-200 bg-white text-gray-500 group-hover:border-primary-400 group-hover:text-primary-700",
    selected: "border-primary-600 bg-primary-600 text-white",
    correct: "border-success bg-success text-white",
    wrong: "border-error bg-error text-white",
    correctUnselected: "border-success bg-success text-white",
  };

  const textStyles: Record<AnswerOptionState, string> = {
    default: "text-gray-800",
    selected: "text-gray-950 font-medium",
    correct: "text-success-text font-medium",
    wrong: "text-error-text font-medium",
    correctUnselected: "text-success-text",
  };

  return (
    <button
      type="button"
      disabled={disabled || state === "correct" || state === "wrong" || state === "correctUnselected"}
      onClick={onClick}
      className={`group ${base} ${styles[state]}`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${letterStyles[state]}`}
      >
        {letter}
      </span>
      <span className={`min-w-0 flex-1 break-words text-base leading-normal ${textStyles[state]}`}>
        <MathText text={text} />
      </span>
      {state === "correct" || state === "correctUnselected" ? (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
      ) : null}
      {state === "wrong" ? (
        <XCircle className="h-5 w-5 shrink-0 text-error" />
      ) : null}
    </button>
  );
}
