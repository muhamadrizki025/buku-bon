// App B: Dompet Ojol — a driver's daily earnings vs. costs, hands-free.
const today = e => e.at.slice(0, 10) === new Date().toISOString().slice(0, 10);
export default {
  id: 'dompet-ojol', title: 'Dompet Ojol', accent: '#15803d',
  tagline: 'Hitung bersih harian tanpa lepas setang.',
  placeholder: 'mis. dapat orderan dua puluh tiga ribu',
  hint: 'Ketuk mikrofon: “dapat tip goceng”, “isi bensin dua puluh ribu”, “makan siang lima belas ribu”.',
  listTitle: 'Catatan hari ini', needsParty: false,
  intents: [
    { id: 'masuk', label: 'Pemasukan', sign: 1, keywords: ['dapat','dapet','orderan','order','tip','bonus','insentif','terima','masuk'] },
    { id: 'keluar', label: 'Pengeluaran', sign: -1, keywords: ['isi','beli','bayar','makan','ngopi','parkir','servis','ganti','keluar','potongan'] },
  ],
  tags: [
    { id: 'bensin', keywords: ['bensin','pertalite','pertamax','bbm'] },
    { id: 'makan', keywords: ['makan','ngopi','minum','kopi'] },
    { id: 'motor', keywords: ['servis','oli','ban','ganti'] },
    { id: 'parkir', keywords: ['parkir'] },
    { id: 'tip', keywords: ['tip','bonus','insentif'] },
  ],
  describe: e => `${e.intent === 'masuk' ? 'Masuk' : 'Keluar'}${e.tag ? ' · ' + e.tag : ''}`,
  missingHelp: p => !p.amount ? 'Sebut jumlahnya, mis. “dua puluh ribu” atau “goceng”.' : 'Sebut “dapat” atau “isi/beli/bayar”.',
  summary(store, rp) {
    const inc = store.sumWhere(e => today(e) && e.sign > 0);
    const out = -store.sumWhere(e => today(e) && e.sign < 0);
    const fuel = -store.sumWhere(e => today(e) && e.tag === 'bensin');
    return `<div class="card"><small>Bersih hari ini</small><b>${rp(inc - out)}</b></div>
      <div class="card"><small>Pemasukan</small><b>${rp(inc)}</b></div>
      <div class="card"><small>Pengeluaran</small><b>${rp(out)}</b></div>
      <div class="card"><small>Bensin</small><b>${rp(fuel)}</b></div>`;
  },
};
