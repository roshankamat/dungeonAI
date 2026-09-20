import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Tiny, dependency-free Markdown renderer for the subset the council produces:
 * headings, paragraphs, bullet and numbered lists, blockquotes, bold, italic, inline code.
 * It renders partial (streaming) text gracefully.
 */

function renderInline(text: string, key: string | number): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  // Order matters: code, bold, italic.
  const re = /(`[^`]+`)|(\*\*[^*]+\*\*)|(__[^_]+__)|(\*[^*\n]+\*)|(_[^_\n]+_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith("`")) nodes.push(<code key={`${key}-c${i}`}>{tok.slice(1, -1)}</code>);
    else if (tok.startsWith("**") || tok.startsWith("__"))
      nodes.push(<strong key={`${key}-b${i}`}>{tok.slice(2, -2)}</strong>);
    else nodes.push(<em key={`${key}-i${i}`}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
    i++;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { kind: "h"; level: number; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "hr" };

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: "p", text: para.join(" ") });
      para = [];
    }
  };
  for (let idx = 0; idx < lines.length; idx++) {
    const line = lines[idx];
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      continue;
    }
    if (/^---+$/.test(trimmed)) {
      flushPara();
      blocks.push({ kind: "hr" });
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (h) {
      flushPara();
      blocks.push({ kind: "h", level: h[1].length, text: h[2] });
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushPara();
      const last = blocks[blocks.length - 1];
      const text = trimmed.replace(/^>\s?/, "");
      if (last?.kind === "quote") last.text += " " + text;
      else blocks.push({ kind: "quote", text });
      continue;
    }
    const ul = /^[-*+]\s+(.*)$/.exec(trimmed);
    if (ul) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ul") last.items.push(ul[1]);
      else blocks.push({ kind: "ul", items: [ul[1]] });
      continue;
    }
    const ol = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (ol) {
      flushPara();
      const last = blocks[blocks.length - 1];
      if (last?.kind === "ol") last.items.push(ol[1]);
      else blocks.push({ kind: "ol", items: [ol[1]] });
      continue;
    }
    // Continuation of a list item (indented text).
    const last = blocks[blocks.length - 1];
    if (/^\s{2,}/.test(line) && (last?.kind === "ul" || last?.kind === "ol") && para.length === 0) {
      last.items[last.items.length - 1] += " " + trimmed;
      continue;
    }
    para.push(trimmed);
  }
  flushPara();
  return blocks;
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = React.useMemo(() => parseBlocks(text), [text]);
  return (
    <div className={cn("council-prose text-[15px] leading-relaxed text-stone-300", className)}>
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "h": {
            const Tag = (`h${Math.min(4, b.level)}` as unknown) as React.ElementType;
            return <Tag key={i}>{renderInline(b.text, i)}</Tag>;
          }
          case "p":
            return <p key={i}>{renderInline(b.text, i)}</p>;
          case "ul":
            return (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it, `${i}-${j}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it, `${i}-${j}`)}</li>
                ))}
              </ol>
            );
          case "quote":
            return <blockquote key={i}>{renderInline(b.text, i)}</blockquote>;
          case "hr":
            return <hr key={i} className="border-stone-800" />;
        }
      })}
    </div>
  );
}
