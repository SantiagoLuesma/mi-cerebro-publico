"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";

const components: Parameters<typeof ReactMarkdown>[0]["components"] = {
  a: ({ href, children, ...props }) => {
    if (href?.startsWith("/note/")) {
      return (
        <Link href={href} className="text-[var(--color-neon)] underline decoration-[var(--color-neon-deep)] underline-offset-2 hover:shadow-[var(--shadow-neon)]">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer" className="text-[var(--color-neon)] underline underline-offset-2" {...props}>
        {children}
      </a>
    );
  },
  code: ({ className, children, ...props }) => (
    <code
      className={`${className ?? ""} rounded bg-[var(--color-neon-deep)]/25 px-1 py-0.5 font-mono text-[0.85em] text-[var(--color-neon)]`}
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="overflow-auto rounded-lg border border-[var(--color-neon-deep)]/50 bg-[var(--color-bg-soft)] p-4 font-mono text-sm">
      {children}
    </pre>
  ),
  h1: ({ children }) => <h1 className="mt-2 mb-4 text-3xl font-bold text-[var(--color-ink)]">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-8 mb-3 text-xl font-bold text-[var(--color-neon)]">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 mb-2 text-lg font-semibold text-[var(--color-ink)]">{children}</h3>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-5 text-[var(--color-ink)]">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-5 text-[var(--color-ink)]">{children}</ol>,
  p: ({ children }) => <p className="my-3 leading-relaxed text-[var(--color-ink)]">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-2 border-[var(--color-neon)] pl-4 italic text-[var(--color-ink-dim)]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-[var(--color-neon-deep)] px-3 py-1.5 text-left text-[var(--color-neon)]">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-[var(--color-neon-deep)]/50 px-3 py-1.5">{children}</td>
  ),
};

export default function Markdown({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
