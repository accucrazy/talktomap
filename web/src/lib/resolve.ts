import type { Mall } from "./types";

/** 在指定商場清單中以 id / 中英文名稱模糊比對（scenario-scoped） */
export function resolveMall(malls: Mall[], query: string): Mall | undefined {
  const q = query.trim().toLowerCase();
  if (!q) return undefined;
  return malls.find(
    (m) =>
      m.id === q ||
      m.name.toLowerCase().includes(q) ||
      m.nameEn.toLowerCase().includes(q) ||
      q.includes(m.name.toLowerCase()) ||
      q.includes(m.nameEn.toLowerCase())
  );
}

export function mallById(malls: Mall[], id: string): Mall | undefined {
  return malls.find((m) => m.id === id);
}
