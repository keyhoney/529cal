import fs from 'fs';
import path from 'path';

const CSV_PATH = path.resolve('21-25.csv');
const OUT_PATH = path.resolve('public/data/admission-index.json');

const raw = fs.readFileSync(CSV_PATH, 'utf8');
const lines = raw.split(/\r?\n/).filter((l) => l.trim());

/** @type {Record<string, Record<string, Record<string, Record<string, Array<{y:number,c:number|null,q:number|null,r:number|null,s:number|null}>>>>>} */
const tree = {};

const universities = new Set();

for (let i = 1; i < lines.length; i++) {
  const cols = parseCsvLine(lines[i]);
  if (cols.length < 9) continue;

  const year = Number(cols[0]);
  const uni = cols[1];
  const track = cols[2];
  const typeName = cols[3];
  const dept = cols[4];
  const quota = cols[5] === '' ? null : Number(cols[5]);
  const competition = cols[6] === '' ? null : Number(cols[6]);
  const supplement = cols[7] === '' ? null : Number(cols[7]);
  const cutRaw = cols[8]?.trim();
  const cut = cutRaw === '' || cutRaw === undefined ? null : Number(cutRaw);

  if (!uni || !track || !typeName || !dept || !Number.isFinite(year)) continue;

  universities.add(uni);
  tree[uni] ??= {};
  tree[uni][track] ??= {};
  tree[uni][track][typeName] ??= {};
  tree[uni][track][typeName][dept] ??= [];
  tree[uni][track][typeName][dept].push({
    y: year,
    c: Number.isFinite(cut) ? cut : null,
    q: Number.isFinite(quota) ? quota : null,
    r: Number.isFinite(competition) ? competition : null,
    s: Number.isFinite(supplement) ? supplement : null,
  });
}

for (const uni of Object.keys(tree)) {
  for (const track of Object.keys(tree[uni])) {
    for (const typeName of Object.keys(tree[uni][track])) {
      for (const dept of Object.keys(tree[uni][track][typeName])) {
        tree[uni][track][typeName][dept].sort((a, b) => b.y - a.y);
      }
    }
  }
}

const output = {
  universities: [...universities].sort((a, b) => a.localeCompare(b, 'ko')),
  tree,
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(output));

const sizeMb = (fs.statSync(OUT_PATH).size / 1024 / 1024).toFixed(2);
console.log(`Wrote ${OUT_PATH} (${sizeMb} MB, ${universities.size} universities)`);

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(stripBom(current.trim()));
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(stripBom(current.trim()));
  return result;
}

function stripBom(s) {
  return s.replace(/^\uFEFF/, '');
}
