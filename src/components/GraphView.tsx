"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { useRouter } from "next/navigation";
import type { GraphLink, GraphNode } from "@/lib/vault/types";

interface Props {
  nodes: GraphNode[];
  links: GraphLink[];
  activeTag?: string | null;
  onHover?: (node: GraphNode | null, x: number, y: number) => void;
  registerApi?: (api: { zoomToFit: () => void }) => void;
}

const NEON = "#00ff9c";
const GHOST = "#2a3a3a";

export default function GraphView({
  nodes,
  links,
  activeTag,
  onHover,
  registerApi,
}: Props) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<any>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setSize({ w: Math.max(1, r.width), h: Math.max(1, r.height) });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    let raf = 0;
    const warm = () => {
      fg.d3ReheatSimulation?.();
      fg.zoomToFit?.(600, 60);
      setReady(true);
      registerApi?.({ zoomToFit: () => fg.zoomToFit?.(400, 60) });
    };
    raf = window.setTimeout(warm, 300);
    return () => window.clearTimeout(raf);
  }, [registerApi]);

  const visibleIds = useMemo(() => {
    if (!activeTag) return null;
    return new Set(
      nodes.filter((n) => n.tags.includes(activeTag)).map((n) => n.id),
    );
  }, [activeTag, nodes]);

  const paintNode = useMemo(() => {
    return (node: any, ctx: CanvasRenderingContext2D) => {
      const isGhost = node.ghost;
      const dim = visibleIds ? !visibleIds.has(node.id) : false;
      const r = Math.max(2.5, Math.min(11, Math.sqrt(node.val) * 2.2));
      const color = isGhost ? GHOST : NEON;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
      ctx.fillStyle = dim ? "rgba(0,255,156,0.12)" : color;
      ctx.shadowColor = isGhost ? "transparent" : NEON;
      ctx.shadowBlur = dim ? 0 : node === hoverRef.current ? 18 : 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (node === hoverRef.current && !isGhost) {
        ctx.font = "600 12px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#d7fff0";
        ctx.textAlign = "center";
        const label = String(node.label ?? node.id);
        ctx.fillText(label, node.x, node.y - r - 6);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleIds]);

  const hoverRef = useRef<any>(null);

  return (
    <div ref={wrapRef} className="absolute inset-0 h-full w-full">
      <ForceGraph2D
        ref={fgRef}
        width={size.w}
        height={size.h}
        graphData={{ nodes: nodes as any, links: links as any }}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={4}
        nodeCanvasObject={paintNode as any}
        linkColor={() => (visibleIds ? "rgba(0,255,156,0.05)" : "rgba(0,255,156,0.18)")}
        linkWidth={(l: any) =>
          visibleIds &&
          (visibleIds.has(l.source.id ?? l.source) ||
            visibleIds.has(l.target.id ?? l.target))
            ? 1.4
            : 0.6
        }
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.6}
        linkDirectionalParticleColor={() => NEON}
        cooldownTicks={120}
        onNodeHover={(node: any) => {
          hoverRef.current = node;
          onHover?.(node as GraphNode | null, 0, 0);
        }}
        onNodeClick={(node: any) => {
          if (node.ghost) return;
          router.push(`/note/${node.id}`);
        }}
        onNodeDragEnd={(node: any) => {
          node.fx = node.x;
          node.fy = node.y;
        }}
      />
      {!ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="animate-pulse-dot font-mono text-sm text-[var(--color-neon)]">
            inicializando grafo…
          </span>
        </div>
      )}
    </div>
  );
}
