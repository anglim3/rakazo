import type { ReactNode } from "react";

export function SymbolView({ fallback }: { fallback?: ReactNode }) {
  return fallback ?? null;
}
