import fs from 'fs';

const data = fs.readFileSync('tmp-converter.js', 'utf8');

// Extract module with fiveToNine
const idx = data.indexOf('16110');
console.log('Context around conversion module:');
console.log(data.slice(idx - 500, idx + 3500));

// Find exported function names
for (const name of ['fiveToNine', 'nineToFive', 'NINE_MIN', 'FIVE_MIN', 'calcSubject']) {
  let i = 0;
  while ((i = data.indexOf(name, i)) !== -1) {
    console.log('\n---', name, 'at', i, '---');
    console.log(data.slice(i, i + 400));
    i += name.length;
  }
}
