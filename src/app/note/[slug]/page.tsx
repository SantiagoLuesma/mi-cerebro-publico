import Link from "next/link";
import { notFound } from "next/navigation";
import { vaultData, getNote } from "@/lib/vault-data";
import Markdown from "@/components/Markdown";
import type { NoteMeta } from "@/lib/vault/types";

function resolveTitles(slugs: string[]): NoteMeta[] {
  return slugs
    .map((s) => getNote(s))
    .filter((n): n is NoteMeta => Boolean(n));
}

export function generateStaticParams() {
  return vaultData.notes.map((n) => ({ slug: n.slug }));
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  const outgoing = resolveTitles(note.links);
  const backlinks = resolveTitles(note.backlinks);
  const internals = new Map(vaultData.notes.map((n) => [n.noteName.toLowerCase(), n]));

  const body = (note.content ?? "")
    .replace(/\[\[([^\]]+)\]\]/g, (_m, inner: string) => {
      const [name, alias] = inner.split("|");
      const target = internals.get(name.split("#")[0].trim().toLowerCase());
      const label = (alias ?? name).trim();
      return target
        ? `[${label}](/note/${target.slug})`
        : label;
    });

  return (
    <main className="scanlines min-h-[100dvh] w-full px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="glow-border inline-flex items-center gap-2 rounded-full bg-[var(--color-bg-soft)] px-4 py-2 font-mono text-xs text-[var(--color-neon)] transition hover:bg-[var(--color-neon-deep)]/40"
        >
          ← grafo
        </Link>

        <h1 className="glow mt-6 font-mono text-2xl font-bold text-[var(--color-neon)] sm:text-3xl">
          {note.title}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--color-ink-dim)]">
            {note.folderPath || "root"}
          </span>
          {note.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--color-neon-deep)] px-2 py-0.5 font-mono text-[10px] text-[var(--color-ink-dim)]"
            >
              #{t}
            </span>
          ))}
        </div>

        <article className="mt-8">
          <Markdown content={body} />
        </article>

        {(outgoing.length > 0 || backlinks.length > 0) && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {outgoing.length > 0 && (
              <section className="panel rounded-xl p-4">
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
                  conexiones →
                </h2>
                <ul className="space-y-1.5">
                  {outgoing.map((n) => (
                    <li key={n.slug}>
                      <Link
                        href={`/note/${n.slug}`}
                        className="font-mono text-sm text-[var(--color-ink)] transition hover:text-[var(--color-neon)] hover:underline"
                      >
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {backlinks.length > 0 && (
              <section className="panel rounded-xl p-4">
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-neon)]">
                  ← referenciado por
                </h2>
                <ul className="space-y-1.5">
                  {backlinks.map((n) => (
                    <li key={n.slug}>
                      <Link
                        href={`/note/${n.slug}`}
                        className="font-mono text-sm text-[var(--color-ink)] transition hover:text-[var(--color-neon)] hover:underline"
                      >
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
