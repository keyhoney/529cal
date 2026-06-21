export interface YearCut {
  y: number;
  c: number | null;
  q: number | null;
  r: number | null;
  s: number | null;
}

export interface AdmissionIndex {
  universities: string[];
  tree: Record<string, Record<string, Record<string, Record<string, YearCut[]>>>>;
}

let cache: AdmissionIndex | null = null;

export async function loadAdmissionIndex(): Promise<AdmissionIndex> {
  if (cache) return cache;
  const res = await fetch('/data/admission-index.json');
  if (!res.ok) throw new Error('입결 데이터를 불러오지 못했습니다.');
  cache = (await res.json()) as AdmissionIndex;
  return cache;
}

export function getTracks(data: AdmissionIndex, uni: string): string[] {
  const node = data.tree[uni];
  if (!node) return [];
  return Object.keys(node).sort((a, b) => a.localeCompare(b, 'ko'));
}

export function getTypeNames(data: AdmissionIndex, uni: string, track: string): string[] {
  const node = data.tree[uni]?.[track];
  if (!node) return [];
  return Object.keys(node).sort((a, b) => a.localeCompare(b, 'ko'));
}

export function getDepartments(
  data: AdmissionIndex,
  uni: string,
  track: string,
  typeName: string,
): string[] {
  const node = data.tree[uni]?.[track]?.[typeName];
  if (!node) return [];
  return Object.keys(node).sort((a, b) => a.localeCompare(b, 'ko'));
}

export function getYearCuts(
  data: AdmissionIndex,
  uni: string,
  track: string,
  typeName: string,
  dept: string,
): YearCut[] {
  return data.tree[uni]?.[track]?.[typeName]?.[dept] ?? [];
}
