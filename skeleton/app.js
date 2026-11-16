// Buku Bon skeleton — mounts a complete voice ledger from one config object.
import { parseUtterance, formatRupiah } from './parser.js';
import { createStore } from './store.js';
import { createVoice } from './voice.js';

export function mountBukuBon(root, config) {
  const store = createStore(config.id);
  document.title = config.title;
  document.documentElement.style.setProperty('--accent', config.accent || '#0f766e');
  
  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../sw.js').catch(() => {});
  }
  
  root.innerHTML = `
    <header><h1>${config.title}</h1><p>${config.tagline}</p></header>
    <section class="summary" id="summary"></section>
    <section class="capture">
      <button id="mic" class="mic" aria-label="Rekam">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="23"></line>
          <line x1="8" y1="23" x2="16" y2="23"></line>
        </svg>
      </button>
      <form id="typed"><input id="text" placeholder="${config.placeholder}" autocomplete="off"><button>Catat</button></form>
      <p id="hint" class="hint">${config.hint}</p>
      <div id="preview" class="preview" hidden></div>
    </section>
    <section><h2>${config.listTitle}</h2><ul id="list" class="list"></ul>
      <div class="tools"><button id="csv">Unduh CSV</button><button id="wipe" class="ghost">Hapus semua</button></div></section>
    <footer class="footer"><a href="../index.html">← Buku Bon</a></footer>`;
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
      p.innerHTML = `<p>Belum lengkap: "${pending.raw}". ${config.missingHelp(pending)}</p>`; pending = null; return;
    }
    
    // Handle meta: store metadata instead of entry
    if (pending.meta && pending.amount) {
      const metaKey = pending.meta;
      p.innerHTML = `<p>"${pending.raw}"</p><p><b>${pending.intent}</b> · ${formatRupiah(pending.amount)}</p>
        <button id="ok">Simpan</button><button id="no" class="ghost">Batal</button>`;
      $('#ok').onclick = () => { 
        store.setMeta(metaKey, pending.amount); 
        pending = null; 
        p.hidden = true; 
        render(); 
      };
      $('#no').onclick = () => { pending = null; p.hidden = true; };
      return;
    }
    
    // Handle settle: calculate amount from current balance
    if (pending.settle && pending.party) {
      const bal = store.balanceBy('party');
      const owed = bal[pending.party] || 0;
      if (owed <= 0) {
        p.innerHTML = `<p>"${pending.raw}"</p><p>${pending.party} tidak punya utang.</p><button id="no" class="ghost">OK</button>`;
        $('#no').onclick = () => { pending = null; p.hidden = true; };
        pending = null;
        return;
      }
      pending.amount = owed;
    }
    
    p.innerHTML = `<p>"${pending.raw}"</p><p><b>${config.describe(pending)}</b> · ${formatRupiah(pending.amount)}</p>
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
