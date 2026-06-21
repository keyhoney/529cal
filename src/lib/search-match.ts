export function normalizeSearchText(text: string): string {
  return text.replace(/\s+/g, '').toLowerCase();
}

/** 높을수록 일치도가 높음. -1이면 불일치 */
export function scoreMatch(query: string, text: string): number {
  const q = normalizeSearchText(query);
  const t = normalizeSearchText(text);
  if (!q) return 0;
  if (t === q) return 1000;
  if (t.startsWith(q)) return 800 - (t.length - q.length) * 0.5;
  const idx = t.indexOf(q);
  if (idx >= 0) return 500 - idx * 2;

  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 200 - (t.length - q.length);

  return -1;
}

export function rankSearchResults(query: string, items: string[]): string[] {
  const q = query.trim();
  if (!q) return [...items].sort((a, b) => a.localeCompare(b, 'ko'));

  return items
    .map((item) => ({ item, score: scoreMatch(q, item) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score || a.item.localeCompare(b.item, 'ko'))
    .map((row) => row.item);
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function highlightMatch(text: string, query: string): string {
  const safe = escapeHtml(text);
  const q = query.trim();
  if (!q) return safe;

  const lowerText = text.toLowerCase();
  const lowerQ = q.toLowerCase();
  const idx = lowerText.indexOf(lowerQ);
  if (idx < 0) return safe;

  const before = escapeHtml(text.slice(0, idx));
  const match = escapeHtml(text.slice(idx, idx + q.length));
  const after = escapeHtml(text.slice(idx + q.length));
  return `${before}<mark class="search-mark">${match}</mark>${after}`;
}
