// App B: Dompet Ojol — a driver's daily earnings vs. costs, hands-free.
const today = e => e.at.slice(0, 10) === new Date().toISOString().slice(0, 10);
const dayKey = d => d.toISOString().slice(0, 10);
export default {
  id: 'dompet-ojol', title: 'Dompet Ojol', accent: '#15803d',
  tagline: 'Hitung bersih harian tanpa lepas setang.',
  placeholder: 'mis. dapat orderan dua puluh tiga ribu',
  hint: 'Ketuk mikrofon: "dapat tip goceng", "isi bensin dua puluh ribu", "target hari ini 200 ribu".',
  listTitle: 'Catatan hari ini', needsParty: false,
  intents: [
    { id: 'masuk', label: 'Pemasukan', sign: 1, keywords: ['dapat','dapet','orderan','order','tip','bonus','insentif','terima','masuk'] },
    { id: 'keluar', label: 'Pengeluaran', sign: -1, keywords: ['isi','beli','bayar','makan','ngopi','parkir','servis','ganti','keluar','potongan'] },
    { id: 'target', label: 'Target', sign: 0, meta: 'dailyTarget', keywords: ['target'] },
  ],
  tags: [
    { id: 'bensin', keywords: ['bensin','pertalite','pertamax','bbm'] },
    { id: 'makan', keywords: ['makan','ngopi','minum','kopi'] },
    { id: 'motor', keywords: ['servis','oli','ban','ganti'] },
    { id: 'parkir', keywords: ['parkir'] },
    { id: 'tip', keywords: ['tip','bonus','insentif'] },
  ],
  describe: e => `${e.intent === 'masuk' ? 'Masuk' : e.intent === 'keluar' ? 'Keluar' : 'Target'}${e.tag ? ' · ' + e.tag : ''}`,
  missingHelp: p => !p.amount ? 'Sebut jumlahnya, mis. "dua puluh ribu" atau "goceng".' : 'Sebut "dapat" atau "isi/beli/bayar".',
  summary(store, rp) {
    const inc = store.sumWhere(e => today(e) && e.sign > 0);
    const out = -store.sumWhere(e => today(e) && e.sign < 0);
    const net = inc - out;
    const fuel = -store.sumWhere(e => today(e) && e.tag === 'bensin');
    const target = store.getMeta('dailyTarget') || 0;
    
    // Weekly view: last 7 days
    const now = new Date();
    const weekly = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dk = dayKey(d);
      const dayInc = store.sumWhere(e => e.at.slice(0, 10) === dk && e.sign > 0);
      const dayOut = -store.sumWhere(e => e.at.slice(0, 10) === dk && e.sign < 0);
      weekly.push({ date: dk, net: dayInc - dayOut });
    }
    
    const maxAbsNet = Math.max(...weekly.map(w => Math.abs(w.net)), 1);
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const shortAmount = n => {
      if (n === 0) return '0';
      const abs = Math.abs(n);
      if (abs >= 1000000) return (n < 0 ? '-' : '') + (abs / 1000000).toFixed(abs % 1000000 === 0 ? 0 : 1) + 'jt';
      if (abs >= 1000) return (n < 0 ? '-' : '') + Math.round(abs / 1000) + 'rb';
      return n.toString();
    };
    const weeklyBars = weekly.map(w => {
      const d = new Date(w.date);
      const pct = Math.max(5, Math.min(100, (Math.abs(w.net) / maxAbsNet) * 100));
      const cls = w.net < 0 ? 'neg' : 'pos';
      const amt = w.net !== 0 ? `<span class="amt">${shortAmount(w.net)}</span>` : '';
      const bar = w.net !== 0 ? `<div class="bar ${cls}" style="height:${pct}%"></div>` : '';
      return `<div class="day-bar">${amt}${bar}<small>${dayNames[d.getDay()]}</small></div>`;
    }).join('');
    
    let targetHtml = '';
    if (target > 0) {
      const progress = Math.min(100, (net / target) * 100);
      targetHtml = `<div class="card full"><small>Target hari ini: ${rp(target)}</small>
        <div class="progress"><div class="bar" style="width:${progress}%"></div></div>
        <b>${progress.toFixed(0)}%</b></div>`;
    }
    
    return `<div class="card"><small>Bersih hari ini</small><b>${rp(net)}</b></div>
      <div class="card"><small>Pemasukan</small><b>${rp(inc)}</b></div>
      <div class="card"><small>Pengeluaran</small><b>${rp(out)}</b></div>
      <div class="card"><small>Bensin</small><b>${rp(fuel)}</b></div>
      ${targetHtml}
      <div class="card full"><small>Minggu ini (7 hari terakhir)</small><div class="weekly">${weeklyBars}</div></div>`;
  },
};
