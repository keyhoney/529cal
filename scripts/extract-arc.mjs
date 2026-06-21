import fs from 'fs';

const html = fs.readFileSync('tmp-arc.html', 'utf8');
const urls = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]))];
console.log('URLs:', urls.length);
for (const url of urls) console.log(url);

const patterns = ['16110', '14331', 'credit', 'totalCredit', 'grade5', 'percentile', '1.39', '2.45', '학점', 'credits'];
for (const p of patterns) {
  const i = html.indexOf(p);
  if (i >= 0) console.log('\n', p, html.slice(Math.max(0, i - 100), i + 150));
}
