import data from "@/generated/vault-data.json";
import type { VaultData } from "./vault/types";

export const vaultData = data as VaultData;

export function getNote(slug: string) {
  return vaultData.notes.find((n) => n.slug === slug);
}

export function slugToNote(slug: string) {
  return getNote(slug);
}
