export interface NoteMeta {
  slug: string;
  noteName: string;
  title: string;
  tags: string[];
  folder: string;
  folderPath: string;
  path: string;
  degree: number;
  links: string[];
  ghostLinks: string[];
  backlinks: string[];
  excerpt: string;
  content?: string;
}

export interface GraphNode {
  id: string;
  label: string;
  val: number;
  tags: string[];
  folder: string;
  ghost: boolean;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface TagInfo {
  name: string;
  count: number;
}

export interface VaultData {
  notes: NoteMeta[];
  graph: { nodes: GraphNode[]; links: GraphLink[] };
  tags: TagInfo[];
  folders: TagInfo[];
  generatedAt: string;
}
