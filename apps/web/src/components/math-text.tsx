"use client";

import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  text: string;
  className?: string;
};

/** Renders plain text with optional $inline$ and $$block$$ KaTeX. */
export function MathText({ text, className }: Props) {
  const parts = splitMath(text);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.value}</span>;
        }
        try {
          const html = katex.renderToString(part.value, {
            throwOnError: false,
            displayMode: part.type === "block",
          });
          return (
            <span
              key={i}
              className={part.type === "block" ? "my-5 block text-center" : undefined}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return (
            <code
              key={i}
              className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800"
            >
              {part.value}
            </code>
          );
        }
      })}
    </span>
  );
}

type Part =
  | { type: "text"; value: string }
  | { type: "inline"; value: string }
  | { type: "block"; value: string };

function splitMath(input: string): Part[] {
  const parts: Part[] = [];
  const re = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(input))) {
    if (match.index > last) {
      parts.push({ type: "text", value: input.slice(last, match.index) });
    }
    if (match[1] != null) {
      parts.push({ type: "block", value: match[1].trim() });
    } else if (match[2] != null) {
      parts.push({ type: "inline", value: match[2].trim() });
    }
    last = match.index + match[0].length;
  }
  if (last < input.length) {
    parts.push({ type: "text", value: input.slice(last) });
  }
  if (parts.length === 0) parts.push({ type: "text", value: input });
  return parts;
}
