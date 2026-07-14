"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import type { GraphNode, VaultData } from "@/lib/vault/types";
import SearchDialog from "./SearchDialog";
import TagFilter from "./TagFilter";

const GraphView = dynamic(() => import("./GraphView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="animate-pulse-dot font-mono text-sm text-[var(--color-neon)]">
        cargando grafo…
      </span>
    </div>
  ),
});

export default function BrainApp({ data }: { data: VaultData }) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [hover, setHover] = useState<{ node: GraphNode | null; x: number; y: number }>({
    node: null,
    x: 0,
    y: 0,
  });

  const apiRef = useMemo(() => ({ current: null as null | { zoomToFit: () => void } }), []);
  const registerApi = useCallback((api: { zoomToFit: () => void }) => {
    apiRef.current = api;
  }, [apiRef]);

  const title = "Mi Cerebro Público";

  return (
    <main className="scanlines relative h-[100dvh] w-screen overflow-hidden">
      <GraphView
        nodes={data.graph.nodes}
        links={data.graph.links}
        activeTag={activeTag}
        onHover={(node, x, y) => setHover({ node, x, y })}
        registerApi={registerApi}
      />

      {/* Top-left brand */}
      <div className="pointer-events-none absolute left-0 top-0 z-20 p-4 sm:p-6">
        <Link href="/" className="pointer-events-auto inline-block">
          <h1 className="glow font-mono text-lg font-bold tracking-tight text-[var(--color-neon)] sm:text-2xl">
            {title}
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-ink-dim)]">
            knowledge graph · {data.notes.length} nodos
          </p>
        </Link>
      </div>

      {/* Search button (mobile-first, top-right) */}
      <div className="absolute right-0 top-0 z-20 flex items-center gap-2 p-4 sm:p-6">
        <button
          onClick={() => setSearchOpen(true)}
          className="glow-border flex items-center gap-2 rounded-full bg-[var(--color-bg-soft)] px-4 py-2 font-mono text-xs text-[var(--color-neon)] transition hover:bg-[var(--color-neon-deep)]/40"
        >
          <span>⌕</span>
          <span className="hidden sm:inline">buscar</span>
        </button>
      </div>

      {/* Tag filter — bottom bar on mobile, top strip on desktop */}
      <div className="absolute inset-x-0 bottom-0 z-20 p-3 sm:bottom-auto sm:top-20 sm:p-6">
        <div className="panel mx-auto max-w-3xl rounded-xl px-3 py-2">
          <TagFilter tags={data.tags} active={activeTag} onSelect={setActiveTag} />
        </div>
      </div>

      {/* Hover tooltip for graph nodes */}
      {hover.node && !hover.node.ghost && (
        <div
          className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-[140%] rounded-md bg-[var(--color-panel)] px-3 py-1.5 panel"
          style={{ left: hover.x || "50%", top: hover.y || "50%" }}
        >
          <p className="font-mono text-xs text-[var(--color-neon)]">
            {hover.node.label}
          </p>
          <p className="font-mono text-[10px] text-[var(--color-ink-dim)]">
            {hover.node.tags.slice(0, 3).map((t) => `#${t}`).join(" ")}
          </p>
        </div>
      )}

      {/* Hint */}
      <div className="pointer-events-none absolute bottom-16 left-1/2 z-10 -translate-x-1/2 sm:bottom-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--color-ink-dim)]">
          toca un nodo para abrir la nota
        </p>
      </div>

      <SearchDialog notes={data.notes} open={searchOpen} onOpenChange={setSearchOpen} />
    </main>
  );
}
