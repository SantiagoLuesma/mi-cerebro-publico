import { config } from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseVault, resolveVaultPath } from "../src/lib/vault/parse";

config({ path: ".env.local" });

const vaultPath = resolveVaultPath();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../src/generated");
const outFile = path.join(outDir, "vault-data.json");

fs.mkdirSync(outDir, { recursive: true });

const data = parseVault(vaultPath);
fs.writeFileSync(outFile, JSON.stringify(data), "utf8");

console.log(
  `Generated ${data.notes.length} notes, ${data.graph.nodes.length} nodes, ${data.graph.links.length} links -> ${path.relative(process.cwd(), outFile)}`,
);
