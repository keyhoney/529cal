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
let loadPromise: Promise<AdmissionIndex> | null = null;

export async function loadAdmissionIndex(): Promise<AdmissionIndex> {
  if (cache) return cache;
  if (loadPromise) return loadPromise;

  loadPromise = fetch('/data/admission-index.json')
    .then((res) => {
      if (!res.ok) throw new Error('입결 데이터를 불러오지 못했습니다.');
      return res.json() as Promise<AdmissionIndex>;
    })
    .then((data) => {
      cache = data;
      return data;
    })
    .catch((err) => {
      loadPromise = null;
      throw err;
    });

  return loadPromise;
}

export function prefetchAdmissionIndex(): void {
  if (cache || loadPromise) return;

  const run = () => {
    void loadAdmissionIndex();
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(run, { timeout: 5000 });
  } else {
    setTimeout(run, 3000);
  }
}

export interface AdmissionRoute {
  track: string;
  typeName: string;
  cuts: YearCut[];
}

export function getDepartmentsForUniversity(data: AdmissionIndex, uni: string): string[] {
  const uniNode = data.tree[uni];
  if (!uniNode) return [];

  const departments = new Set<string>();
  for (const track of Object.keys(uniNode)) {
    for (const typeName of Object.keys(uniNode[track])) {
      for (const dept of Object.keys(uniNode[track][typeName])) {
        departments.add(dept);
      }
    }
  }

  return [...departments].sort((a, b) => a.localeCompare(b, 'ko'));
}

export function getRoutesForDepartment(
  data: AdmissionIndex,
  uni: string,
  dept: string,
): AdmissionRoute[] {
  const uniNode = data.tree[uni];
  if (!uniNode) return [];

  const routes: AdmissionRoute[] = [];
  for (const track of Object.keys(uniNode)) {
    for (const typeName of Object.keys(uniNode[track])) {
      const cuts = uniNode[track][typeName][dept];
      if (cuts?.length) {
        routes.push({ track, typeName, cuts });
      }
    }
  }

  return routes.sort((a, b) => {
    const byTrack = a.track.localeCompare(b.track, 'ko');
    return byTrack !== 0 ? byTrack : a.typeName.localeCompare(b.typeName, 'ko');
  });
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
