"use client";

import { Dialog } from "radix-ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { NoteMeta } from "@/lib/vault/types";

export default function SearchDialog({
  notes,
  open,
  onOpenChange,
}: {
  notes: NoteMeta[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return notes.slice(0, 12);
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(t) ||
          n.tags.some((tag) => tag.toLowerCase().includes(t)) ||
          n.noteName.toLowerCase().includes(t),
      )
      .slice(0, 20);
  }, [q, notes]);

  function go(slug: string) {
    onOpenChange(false);
    setQ("");
    router.push(`/note/${slug}`);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-[12vh] z-50 w-[92vw] max-w-xl -translate-x-1/2 panel glow-border rounded-xl p-3 data-[state=open]:animate-fade-in">
          <Dialog.Title className="sr-only">Buscar notas</Dialog.Title>
          <Dialog.Description className="sr-only">
            Filtra tus notas por título o etiqueta
          </Dialog.Description>
          <div className="flex items-center gap-2 border-b border-[var(--color-neon-deep)] pb-2">
            <span className="font-mono text-[var(--color-neon)]">{">"}</span>
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="buscar en el cerebro…"
              className="w-full bg-transparent font-mono text-sm text-[var(--color-ink)] outline-none placeholder:text-[var(--color-ink-dim)]"
            />
          </div>
          <ul className="mt-2 max-h-[50vh] overflow-auto">
            {results.map((n) => (
              <li key={n.slug}>
                <button
                  onClick={() => go(n.slug)}
                  className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left transition hover:bg-[var(--color-neon-deep)]/40"
                >
                  <span className="font-mono text-sm text-[var(--color-ink)]">
                    {n.title}
                  </span>
                  <span className="ml-3 shrink-0 font-mono text-[10px] text-[var(--color-ink-dim)]">
                    {n.folder}
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 && (
              <li className="px-3 py-6 text-center font-mono text-xs text-[var(--color-ink-dim)]">
                sin resultados
              </li>
            )}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
