import fs from 'fs';
const data = fs.readFileSync('tmp-converter.js', 'utf8');

// Parse the two tables from the minified source
const nMatch = data.match(/let n=\[(\{five:[^\]]+\})/);
const uMatch = data.match(/u=\[(\{five:[^\]]+\})/);

// Evaluate constants
const n = [
  {five:1, nine:1.591889144544799, pct:1.8935935299975961},
  {five:1.167, nine:1.84, pct:3.58},
  {five:1.333, nine:2.14, pct:6.4},
  {five:1.5, nine:2.48, pct:9.5},
  {five:2, nine:3.44, pct:22},
  {five:2.5, nine:4.22, pct:36},
];
const u = [
  {five:1, nine:(1.39*16110+20779.95)/30441, pct:1.2470779540750963},
  {five:1.083, nine:1.53, pct:1.95},
  {five:1.167, nine:1.73, pct:3.09},
  {five:1.333, nine:1.95, pct:5.15},
  {five:1.417, nine:2.18, pct:6.38},
  {five:1.5, nine:2.45, pct:7.3},
  {five:1.583, nine:2.45, pct:9.06},
  {five:1.667, nine:2.7, pct:12.01},
  {five:2, nine:3.3976298413324133, pct:(299484.9+17.42*14331)/30441},
  {five:2.5, nine:(67984.2+4.2*14331)/30441, pct:31.64402582043954},
];

function interpolate(table, grade5) {
  const sorted = table;
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  if (grade5 <= first.five) return { nine: first.nine, pct: first.pct };
  if (grade5 >= last.five) {
    const prev = sorted[sorted.length - 2];
    const t = (grade5 - prev.five) / (last.five - prev.five);
    return { nine: prev.nine + t * (last.nine - prev.nine), pct: prev.pct + t * (last.pct - prev.pct) };
  }
  for (let i = 0; i < sorted.length - 1; i++) {
    const lo = sorted[i];
    const hi = sorted[i + 1];
    if (grade5 >= lo.five && grade5 <= hi.five) {
      const t = (grade5 - lo.five) / (hi.five - lo.five);
      return { nine: lo.nine + t * (hi.nine - lo.nine), pct: lo.pct + t * (hi.pct - lo.pct) };
    }
  }
  return { nine: last.nine, pct: last.pct };
}

function clampNine(v) { return Math.min(9, Math.max(1, v)); }
function clampPct(v) { return Math.min(100, Math.max(0, v)); }

function fiveToNine(grade5, credits = 46) {
  if (!Number.isFinite(grade5) || grade5 < 1 || grade5 > 5 || !Number.isFinite(credits) || credits <= 0) return null;
  const o = interpolate(n, grade5);
  const r = interpolate(u, grade5);
  const extrapolated = grade5 > 2.5;

  if (credits <= 23) {
    return { five: grade5, nine: clampNine(o.nine), percentile: clampPct(o.pct), extrapolated };
  }
  if (credits <= 46) {
    const t = (credits - 23) / 23;
    return {
      five: grade5,
      nine: clampNine(o.nine + t * (r.nine - o.nine)),
      percentile: clampPct(o.pct + t * (r.pct - o.pct)),
      extrapolated,
    };
  }

  let nine = r.nine;
  const m = o.nine - 1;
  const d = r.nine - 1;
  if (m > 1e-6 && d > 1e-6 && d < m) {
    let exp = Math.log(d / m) / Math.log(0.5);
    exp = Math.max(0.05, Math.min(3, 1.5 * exp));
    nine = 1 + d * Math.pow(46 / credits, exp);
  }

  let pct = r.pct;
  if (o.pct > 1e-6 && r.pct > 1e-6 && r.pct < o.pct) {
    let exp = Math.log(r.pct / o.pct) / Math.log(0.5);
    exp = Math.max(0.05, Math.min(3, 1.85 * exp));
    pct = r.pct * Math.pow(46 / credits, exp);
  }

  return { five: grade5, nine: clampNine(nine), percentile: clampPct(pct), extrapolated: true };
}

function nineToFive(grade9, credits = 46) {
  if (!Number.isFinite(grade9) || grade9 < 1 || grade9 > 9 || !Number.isFinite(credits) || credits <= 0) return null;
  let prevFive = 1;
  let prevNine = fiveToNine(1, credits)?.nine ?? 1;
  if (grade9 <= prevNine) {
    const r = fiveToNine(1, credits);
    return r ? { ...r, five: 1 } : null;
  }
  for (let i = 1.01; i <= 5 + 1e-9; i += 0.01) {
    const five = Math.round(100 * i) / 100;
    const cur = fiveToNine(five, credits);
    if (cur) {
      if (grade9 <= cur.nine) {
        const blendedFive = prevFive + ((grade9 - prevNine) / (cur.nine - prevNine || 1)) * (five - prevFive);
        const result = fiveToNine(blendedFive, credits);
        return result ? { ...result, five: blendedFive, nine: grade9 } : null;
      }
      prevFive = five;
      prevNine = cur.nine;
    }
  }
  const r = fiveToNine(5, credits);
  return r ? { ...r, five: 5, nine: grade9 } : null;
}

// Test cases
for (const credits of [12, 23, 46]) {
  console.log(`\n=== credits=${credits} ===`);
  for (const g of [1.333, 1.583, 2.0]) {
    const r = fiveToNine(g, credits);
    console.log(`5=${g} -> 9=${r.nine.toFixed(2)}, pct=${r.percentile.toFixed(2)}%`);
  }
}
