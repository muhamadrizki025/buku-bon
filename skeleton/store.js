// Buku Bon skeleton — local-first ledger store (localStorage, per app namespace).
export function createStore(ns, storage = globalThis.localStorage) {
  const key = 'bukubon:' + ns;
  const load = () => { try { return JSON.parse(storage.getItem(key)) || []; } catch { return []; } };
  let entries = load();
  const save = () => storage.setItem(key, JSON.stringify(entries));
  return {
    all: () => entries.slice(),
    add(e) { const entry = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), at: new Date().toISOString(), ...e }; entries.unshift(entry); save(); return entry; },
    remove(id) { entries = entries.filter(e => e.id !== id); save(); },
    clear() { entries = []; save(); },
    balanceBy(field) {
      const m = {};
      for (const e of entries) { const k = e[field] || '—'; m[k] = (m[k] || 0) + e.sign * e.amount; }
      return m;
    },
    sumWhere(pred) { return entries.filter(pred).reduce((s, e) => s + e.sign * e.amount, 0); },
    toCSV() {
      const rows = [['waktu','jenis','pihak','tag','jumlah','ucapan']];
      for (const e of entries) rows.push([e.at, e.intent, e.party || '', e.tag || '', e.sign * e.amount, '"' + (e.raw || '').replace(/"/g, '""') + '"']);
      return rows.map(r => r.join(',')).join('\n');
    },
  };
}
