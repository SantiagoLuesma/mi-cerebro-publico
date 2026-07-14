import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slugify } from "../slug";
import type {
  GraphLink,
  GraphNode,
  NoteMeta,
  TagInfo,
  VaultData,
} from "./types";

const WIKILINK_RE = /\[\[([^\]]+)\]\]/g;
const INLINE_TAG_RE = /(^|\s)#([\p{L}\p{N}_/-]+)/gu;

function stripMdExt(basename: string): string {
  return basename.endsWith(".md") ? basename.slice(0, -3) : basename;
}

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".obsidian") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

function firstLineExcerpt(content: string, max = 200): string {
  const text = content
    .replace(WIKILINK_RE, "$1")
    .replace(/[#>*_`~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

export function resolveVaultPath(): string {
  if (process.env.OBSIDIAN_VAULT_PATH) return process.env.OBSIDIAN_VAULT_PATH;
  const fallback = path.resolve(process.cwd(), "vault");
  if (fs.existsSync(fallback)) return fallback;
  throw new Error(
    "No vault found. Set OBSIDIAN_VAULT_PATH or commit a ./vault folder.",
  );
}

export function parseVault(vaultPath: string): VaultData {
  if (!fs.existsSync(vaultPath)) {
    throw new Error(`Vault path does not exist: ${vaultPath}`);
  }

  const files = walk(vaultPath);
  const notes: NoteMeta[] = [];
  const slugCounts = new Map<string, number>();
  const nameToSlug = new Map<string, string>();

  for (const file of files) {
    const rel = path.relative(vaultPath, file);
    const raw = fs.readFileSync(file, "utf8");
    const { data, content } = matter(raw);
    const noteName = stripMdExt(path.basename(file));
    const title =
      (typeof data.title === "string" && data.title.trim()) ||
      noteName;

    const folderPath = path.dirname(rel);
    const folder =
      folderPath === "." ? "root" : folderPath.split(path.sep)[0];

    const tags = new Set<string>();
    if (Array.isArray(data.tags)) {
      for (const t of data.tags) if (typeof t === "string") tags.add(t);
    }

    const bodyText = `${content}\n${Object.values(data).join(" ")}`;
    for (const m of bodyText.matchAll(INLINE_TAG_RE)) {
      tags.add(m[2].toLowerCase());
    }
    for (const t of tags) {
      if (t === "publish-true") tags.delete(t);
    }

    const links: string[] = [];
    for (const m of content.matchAll(WIKILINK_RE)) {
      const inner = m[1].split("|")[0].split("#")[0].trim();
      if (inner) links.push(inner);
    }

    let slug = slugify(noteName);
    const seen = slugCounts.get(slug) ?? 0;
    if (seen > 0) {
      const folderSlug = slugify(folderPath === "." ? "root" : folderPath);
      slug = `${folderSlug}-${slug}`;
    }
    slugCounts.set(slugify(noteName), seen + 1);

    nameToSlug.set(noteName.toLowerCase(), slug);

    notes.push({
      slug,
      noteName,
      title,
      tags: [...tags],
      folder,
      folderPath: folderPath === "." ? "" : folderPath,
      path: rel,
      degree: 0,
      links: [...links],
      ghostLinks: [],
      backlinks: [],
      excerpt: content.trim() ? firstLineExcerpt(content) : "",
      content,
    });
  }

  const nameIndex = new Map<string, NoteMeta>();
  for (const n of notes) nameIndex.set(n.noteName.toLowerCase(), n);

  const linkSet = new Set<string>();
  const links: GraphLink[] = [];
  const ghostNodes = new Map<string, GraphNode>();

  for (const note of notes) {
    const resolved = new Set<string>();
    const ghosts = new Set<string>();
    for (const ref of note.links) {
      const key = ref.toLowerCase();
      const target = nameIndex.get(key);
      if (target) resolved.add(target.slug);
      else {
        ghosts.add(ref);
        ghostNodes.set(key, {
          id: ref,
          label: ref,
          val: 1,
          tags: [],
          folder: "ghost",
          ghost: true,
        });
      }
    }
    note.links = [...resolved];
    note.ghostLinks = [...ghosts];
  }

  for (const note of notes) {
    for (const targetSlug of note.links) {
      const edge = `${note.slug}->${targetSlug}`;
      if (linkSet.has(edge)) continue;
      linkSet.add(edge);
      links.push({ source: note.slug, target: targetSlug });
    }
    for (const ref of note.ghostLinks) {
      const edge = `${note.slug}->ghost:${ref.toLowerCase()}`;
      if (linkSet.has(edge)) continue;
      linkSet.add(edge);
      links.push({ source: note.slug, target: ref });
    }
  }

  const slugIndex = new Map<string, NoteMeta>();
  for (const n of notes) slugIndex.set(n.slug, n);

  for (const l of links) {
    if (l.target.startsWith("ghost:")) continue;
    const src = slugIndex.get(l.source);
    const tgt = slugIndex.get(l.target);
    if (src) src.degree++;
    if (tgt && src) tgt.backlinks.push(src.slug);
  }

  const nodes: GraphNode[] = notes.map((n) => ({
    id: n.slug,
    label: n.title,
    val: 1 + n.degree,
    tags: n.tags,
    folder: n.folder,
    ghost: false,
  }));
  for (const g of ghostNodes.values()) nodes.push(g);

  const tagCounts = new Map<string, number>();
  const folderCounts = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.tags) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    folderCounts.set(n.folder, (folderCounts.get(n.folder) ?? 0) + 1);
  }
  const tags: TagInfo[] = [...tagCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const folders: TagInfo[] = [...folderCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    notes,
    graph: { nodes, links },
    tags,
    folders,
    generatedAt: new Date().toISOString(),
  };
}
