// Buku Bon skeleton — Indonesian spoken-amount + intent parser.
// Pure functions, no DOM. Shared by every app built on the skeleton.

const UNITS = { nol:0, kosong:0, satu:1, se:1, dua:2, tiga:3, empat:4, lima:5, enam:6, tujuh:7, delapan:8, sembilan:9 };
const SLANG = { cepek:100, gopek:500, seceng:1000, noceng:2000, goceng:5000, ceban:10000, goban:50000, gocap:50000, cepekceng:100000 };
const SCALES = { ribu:1e3, rb:1e3, k:1e3, juta:1e6, jt:1e6 };

function normalize(text) {
  return String(text).toLowerCase()
    .replace(/(\d)[.](\d{3})/g, '$1$2')       // 15.000 -> 15000
    .replace(/(\d),(\d)/g, '$1.$2')            // 1,5 -> 1.5
    .replace(/(\d+(?:\.\d+)?)\s*(rb|ribu|k|jt|juta)\b/g, '$1 $2')
    .replace(/\bse(ratus|ribu|juta|puluh|belas)\b/g, 'satu $1')
    .replace(/[^a-z0-9.\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

// Parse a run of number tokens. Returns { value, used } or null.
function parseNumberTokens(tokens, start) {
  // total: completed scale groups; chunk: value below the next scale; d: pending digit word
  let total = 0, chunk = 0, d = 0, i = start, seen = false;
  for (; i < tokens.length; i++) {
    const t = tokens[i];
    if (/^\d+(\.\d+)?$/.test(t)) { d += parseFloat(t); seen = true; continue; }
    if (t in SLANG) { d += SLANG[t]; seen = true; continue; }
    if (t in UNITS) { d += UNITS[t]; seen = true; continue; }
    if (t === 'sepuluh') { chunk += 10; seen = true; continue; }
    if (t === 'sebelas') { chunk += 11; seen = true; continue; }
    if (t === 'setengah') { d += 0.5; seen = true; continue; }
    if (t === 'belas' && seen) { chunk += 10 + d; d = 0; continue; }
    if (t === 'puluh' && seen) { chunk += d * 10; d = 0; continue; }
    if (t === 'ratus' && seen) { chunk += d * 100; d = 0; continue; }
    if (t in SCALES && seen) { total += ((chunk + d) || 1) * SCALES[t]; chunk = 0; d = 0; continue; }
    break;
  }
  if (!seen) return null;
  return { value: Math.round(total + chunk + d), used: i - start };
}

export function parseAmount(text) {
  const tokens = normalize(text).split(' ');
  for (let i = 0; i < tokens.length; i++) {
    const r = parseNumberTokens(tokens, i);
    if (r && r.value > 0) return { amount: r.value, index: i, length: r.used, tokens };
  }
  return null;
}

const HONORIFICS = ['bu','ibu','pak','bapak','mas','mbak','kak','bang','dek','om','tante','mpok','teh','aa'];

export function parseParty(text) {
  const tokens = normalize(text).split(' ');
  for (let i = 0; i < tokens.length - 1; i++) {
    if (HONORIFICS.includes(tokens[i])) {
      const name = tokens[i + 1];
      if (!(name in UNITS) && !/^\d/.test(name)) return cap(tokens[i]) + ' ' + cap(name);
    }
  }
  return null;
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// intents: [{ id, label, sign, keywords: [...] }] supplied by the app config.
export function parseIntent(text, intents) {
  const t = ' ' + normalize(text) + ' ';
  let best = null;
  for (const it of intents) {
    for (const k of it.keywords) {
      if (t.includes(' ' + k + ' ') && (!best || k.length > best.k.length)) best = { it, k };
    }
  }
  return best ? best.it : intents.find(i => i.default) || null;
}

export function parseUtterance(text, config) {
  const a = parseAmount(text);
  const intent = parseIntent(text, config.intents);
  const party = config.needsParty ? parseParty(text) : null;
  const tag = (config.tags || []).find(tg => tg.keywords.some(k => (' ' + normalize(text) + ' ').includes(' ' + k + ' ')));
  return {
    raw: text,
    amount: a ? a.amount : null,
    intent: intent ? intent.id : null,
    sign: intent ? intent.sign : 0,
    party,
    tag: tag ? tag.id : null,
    ok: Boolean(a && intent && (!config.needsParty || party)),
  };
}

export const formatRupiah = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
