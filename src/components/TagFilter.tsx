"use client";

import { ToggleGroup } from "radix-ui";
import type { TagInfo } from "@/lib/vault/types";

export default function TagFilter({
  tags,
  active,
  onSelect,
}: {
  tags: TagInfo[];
  active: string | null;
  onSelect: (tag: string | null) => void;
}) {
  return (
    <ToggleGroup.Root
      type="single"
      value={active ?? ""}
      onValueChange={(v) => onSelect(v || null)}
      className="flex flex-wrap gap-1.5"
    >
      <ToggleGroup.Item
        value=""
        onClick={() => onSelect(null)}
        className="rounded-full border border-[var(--color-neon-deep)] px-3 py-1 font-mono text-[11px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)] data-[state=on]:border-[var(--color-neon)] data-[state=on]:text-[var(--color-neon)] data-[state=on]:shadow-[var(--shadow-neon)]"
      >
        todos
      </ToggleGroup.Item>
      {tags.map((t) => (
        <ToggleGroup.Item
          key={t.name}
          value={t.name}
          className="rounded-full border border-[var(--color-neon-deep)] px-3 py-1 font-mono text-[11px] text-[var(--color-ink-dim)] transition hover:text-[var(--color-ink)] data-[state=on]:border-[var(--color-neon)] data-[state=on]:text-[var(--color-neon)] data-[state=on]:shadow-[var(--shadow-neon)]"
        >
          #{t.name}
          <span className="ml-1 opacity-50">{t.count}</span>
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  );
}
