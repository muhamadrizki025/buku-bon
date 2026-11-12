// App A: Kasbon Warung — who owes the shop, by voice.
export default {
  id: 'kasbon-warung', title: 'Kasbon Warung', accent: '#b45309',
  tagline: 'Catat utang pelanggan cukup dengan bicara.',
  placeholder: 'mis. Bu Sri ngutang lima belas ribu',
  hint: 'Ketuk mikrofon: “Pak Budi ngutang dua puluh ribu” atau “Bu Sri bayar sepuluh ribu”.',
  listTitle: 'Riwayat kasbon', needsParty: true,
  intents: [
    { id: 'utang', label: 'Utang', sign: 1, keywords: ['ngutang','utang','hutang','kasbon','ngebon','bon','pinjam'] },
    { id: 'bayar', label: 'Bayar', sign: -1, keywords: ['bayar','nyicil','cicil','lunas','lunasin','setor'] },
  ],
  describe: e => `${e.party} · ${e.intent === 'utang' ? 'ngutang' : 'bayar'}`,
  missingHelp: p => !p.party ? 'Sebut nama pakai sapaan, mis. “Bu Sri”.' : !p.amount ? 'Sebut jumlahnya, mis. “lima belas ribu”.' : 'Sebut “ngutang” atau “bayar”.',
  summary(store, rp) {
    const bal = store.balanceBy('party');
    const owing = Object.entries(bal).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    const total = owing.reduce((s, [, v]) => s + v, 0);
    return `<div class="card"><small>Total piutang</small><b>${rp(total)}</b></div>
      <div class="card"><small>Pelanggan berutang</small><b>${owing.length}</b></div>
      ${owing.slice(0, 4).map(([n, v]) => `<div class="card"><small>${n}</small><b>${rp(v)}</b></div>`).join('')}`;
  },
};
