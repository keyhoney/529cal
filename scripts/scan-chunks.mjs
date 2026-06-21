import fs from 'fs';
import https from 'https';

const html = fs.readFileSync('tmp-arc.html', 'utf8');
const urls = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]))];
const dpl = 'dpl_4Ws6pzSb4BKng3j92Ex7ZmdJBCw9';

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(`https://arc-high.com${url}?dpl=${dpl}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const patterns = ['16110', '14331', 'credit', 'totalCredit', 'grade5', 'grade9', 'percentile', '1.39', '2.45', '9.06', '학점', 'credits', 'GYEONGGI', 'BUSAN', 'convertGrade', 'interpolation'];

for (const url of urls) {
  const data = await fetch(url);
  const hits = patterns.filter((p) => data.includes(p));
  if (hits.length) {
    console.log('\n===', url, '===');
    console.log('hits:', hits.join(', '));
    for (const p of hits) {
      const i = data.indexOf(p);
      console.log('---', p, '---');
      console.log(data.slice(Math.max(0, i - 120), i + 200));
    }
  }
}
