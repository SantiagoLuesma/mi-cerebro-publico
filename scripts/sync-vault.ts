import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const src = process.env.OBSIDIAN_VAULT_PATH;
const dest = path.join(root, "vault");

if (!src) {
  console.error("OBSIDIAN_VAULT_PATH not set — nothing to sync.");
  process.exit(1);
}

function cp(dir: string, rel = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === ".obsidian" || entry.name === ".git") continue;
    const from = path.join(dir, entry.name);
    const to = path.join(dest, rel, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(to, { recursive: true });
      cp(from, path.join(rel, entry.name));
    } else if (entry.name.endsWith(".md")) {
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.copyFileSync(from, to);
    }
  }
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
cp(src);
console.log(`Synced vault -> ${path.relative(root, dest)}`);
