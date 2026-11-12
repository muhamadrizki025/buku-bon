import assert from 'node:assert/strict';
import { parseAmount, parseParty, parseUtterance } from './parser.js';
import warung from '../app-warung/config.js';
import ojol from '../app-ojol/config.js';

const amt = s => parseAmount(s)?.amount;
const cases = [
  ['lima belas ribu', 15000], ['dua puluh tiga ribu', 23000], ['seratus ribu', 100000],
  ['seribu lima ratus', 1500], ['satu setengah juta', 1500000], ['15 ribu', 15000], ['15rb', 15000],
  ['Rp 15.000', 15000], ['1,5 juta', 1500000], ['goceng', 5000], ['ceban', 10000], ['sebelas ribu', 11000],
  ['dua ratus lima puluh ribu', 250000], ['tiga belas', 13], ['sejuta dua ratus ribu', 1200000],
];
for (const [s, v] of cases) assert.equal(amt(s), v, s);

assert.equal(parseParty('Bu Sri ngutang lima belas ribu'), 'Bu Sri');
let u = parseUtterance('Pak Budi bayar sepuluh ribu', warung);
assert.deepEqual([u.ok, u.intent, u.sign, u.party, u.amount], [true, 'bayar', -1, 'Pak Budi', 10000]);
u = parseUtterance('isi bensin dua puluh ribu', ojol);
assert.deepEqual([u.ok, u.intent, u.tag, u.amount], [true, 'keluar', 'bensin', 20000]);
u = parseUtterance('dapat tip goceng', ojol);
assert.deepEqual([u.ok, u.intent, u.tag, u.amount], [true, 'masuk', 'tip', 5000]);

// property-style check: every n in 1..999,999 spoken in words parses back to n
const W = ['', 'satu','dua','tiga','empat','lima','enam','tujuh','delapan','sembilan'];
function say(n) {
  const p = [];
  const three = x => { const r = [];
    const h = Math.floor(x / 100), t = Math.floor((x % 100) / 10), o = x % 10;
    if (h) r.push(h === 1 ? 'seratus' : W[h] + ' ratus');
    if (t === 1) r.push(o === 0 ? 'sepuluh' : o === 1 ? 'sebelas' : W[o] + ' belas');
    else { if (t) r.push(W[t] + ' puluh'); if (o) r.push(W[o]); }
    return r.join(' '); };
  const th = Math.floor(n / 1000), rest = n % 1000;
  if (th) p.push(th === 1 ? 'seribu' : three(th) + ' ribu');
  if (rest) p.push(three(rest));
  return p.join(' ');
}
let seed = 7; const rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
for (let i = 0; i < 5000; i++) { const n = 1 + Math.floor(rnd() * 999999); assert.equal(amt(say(n)), n, say(n)); }
console.log('all parser tests passed');
