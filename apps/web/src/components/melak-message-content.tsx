"use client";

import type { ReactNode } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import katex from "katex";
import "katex/dist/katex.min.css";

type Props = {
  text: string;
  className?: string;
};

const MATH_TOKEN = /⟦MATH(\d+)⟧/g;

/**
 * Melak chat body: markdown (bold, lists, paragraphs) + $...$ / $$...$$ KaTeX.
 * Shows the full model reply without stripping content.
 */
export function MelakMessageContent({ text, className = "" }: Props) {
  const { markdown, math } = protectMath(text);

  return (
    <div
      className={`melak-md text-[14px] leading-relaxed break-words [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_em]:italic [&_ul]:my-2 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_li]:leading-relaxed [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px] ${className}`}
    >
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p>{restoreMath(children, math)}</p>,
          li: ({ children }) => <li>{restoreMath(children, math)}</li>,
          strong: ({ children }) => (
            <strong>{restoreMath(children, math)}</strong>
          ),
          em: ({ children }) => <em>{restoreMath(children, math)}</em>,
          h1: ({ children }) => (
            <p className="font-semibold">{restoreMath(children, math)}</p>
          ),
          h2: ({ children }) => (
            <p className="font-semibold">{restoreMath(children, math)}</p>
          ),
          h3: ({ children }) => (
            <p className="font-semibold">{restoreMath(children, math)}</p>
          ),
          a: ({ children }) => <span>{restoreMath(children, math)}</span>,
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}

function protectMath(src: string): { markdown: string; math: string[] } {
  const math: string[] = [];
  const markdown = src.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (full, block, inline) => {
    const i = math.length;
    math.push(block != null ? `$$${block}$$` : `$${inline}$`);
    return `⟦MATH${i}⟧`;
  });
  return { markdown, math };
}

function restoreMath(children: ReactNode, math: string[]): ReactNode {
  if (children == null || children === false) return children;
  if (typeof children === "string") {
    return expandMathTokens(children, math);
  }
  if (typeof children === "number") return children;
  if (Array.isArray(children)) {
    return children.map((child, i) => (
      <span key={i}>{restoreMath(child, math)}</span>
    ));
  }
  return children;
}

function expandMathTokens(text: string, math: string[]): ReactNode {
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  const re = new RegExp(MATH_TOKEN.source, "g");
  while ((match = re.exec(text))) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const idx = Number(match[1]);
    const raw = math[idx];
    if (raw) {
      nodes.push(<KatexPiece key={`m-${idx}-${match.index}`} raw={raw} />);
    } else {
      nodes.push(match[0]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  if (nodes.length === 0) return text;
  if (nodes.length === 1) return nodes[0];
  return nodes;
}

function KatexPiece({ raw }: { raw: string }) {
  const display = raw.startsWith("$$");
  const latex = display
    ? raw.slice(2, -2).trim()
    : raw.slice(1, -1).trim();
  try {
    const html = katex.renderToString(latex, {
      throwOnError: false,
      displayMode: display,
    });
    return (
      <span
        className={display ? "my-3 block overflow-x-auto text-center" : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch {
    return <code>{raw}</code>;
  }
}
