// Buku Bon skeleton — mounts a complete voice ledger from one config object.
import { parseUtterance, formatRupiah } from './parser.js';
import { createStore } from './store.js';
import { createVoice } from './voice.js';

export function mountBukuBon(root, config) {
  const store = createStore(config.id);
  document.title = config.title;
  document.documentElement.style.setProperty('--accent', config.accent || '#0f766e');
  root.innerHTML = `
    <header><h1>${config.title}</h1><p>${config.tagline}</p></header>
    <section class="summary" id="summary"></section>
    <section class="capture">
      <button id="mic" class="mic" aria-label="Rekam">🎙️</button>
      <form id="typed"><input id="text" placeholder="${config.placeholder}" autocomplete="off"><button>Catat</button></form>
      <p id="hint" class="hint">${config.hint}</p>
      <div id="preview" class="preview" hidden></div>
    </section>
    <section><h2>${config.listTitle}</h2><ul id="list" class="list"></ul>
      <div class="tools"><button id="csv">Unduh CSV</button><button id="wipe" class="ghost">Hapus semua</button></div></section>`;
  const $ = s => root.querySelector(s);
  let pending = null;

  function render() {
    $('#summary').innerHTML = config.summary(store, formatRupiah);
    $('#list').innerHTML = store.all().map(e => `<li><span class="sign ${e.sign < 0 ? 'neg' : 'pos'}">${e.sign < 0 ? '−' : '+'}</span>
      <span class="what">${config.describe(e)}</span><b>${formatRupiah(e.amount)}</b><button data-del="${e.id}" class="ghost">✕</button></li>`).join('') || `<li class="empty">Belum ada catatan.</li>`;
  }

  function propose(candidates) {
    const parsed = candidates.map(c => parseUtterance(c, config));
    pending = parsed.find(p => p.ok) || parsed[0];
    const p = $('#preview'); p.hidden = false;
    if (!pending.ok) {
      p.innerHTML = `<p>Belum lengkap: “${pending.raw}”. ${config.missingHelp(pending)}</p>`; pending = null; return;
    }
    p.innerHTML = `<p>“${pending.raw}”</p><p><b>${config.describe(pending)}</b> · ${formatRupiah(pending.amount)}</p>
      <button id="ok">Simpan</button><button id="no" class="ghost">Batal</button>`;
    $('#ok').onclick = () => { store.add(pending); pending = null; p.hidden = true; render(); };
    $('#no').onclick = () => { pending = null; p.hidden = true; };
  }

  const voice = createVoice({ onResult: propose, onState: s => { $('#mic').dataset.state = s; } });
  if (!voice.supported) { $('#mic').disabled = true; $('#hint').textContent = 'Browser ini belum mendukung suara. Ketik saja kalimatnya.'; }
  $('#mic').onclick = () => voice.start();
  $('#typed').onsubmit = e => { e.preventDefault(); const v = $('#text').value.trim(); if (v) { propose([v]); $('#text').value = ''; } };
  $('#list').onclick = e => { const id = e.target.dataset.del; if (id) { store.remove(id); render(); } };
  $('#csv').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([store.toCSV()], { type: 'text/csv' })); a.download = config.id + '.csv'; a.click(); };
  $('#wipe').onclick = () => { if (confirm('Hapus semua catatan?')) { store.clear(); render(); } };
  render();
  return { store };
}
