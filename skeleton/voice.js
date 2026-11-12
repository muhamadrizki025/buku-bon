// Buku Bon skeleton — thin wrapper over the Web Speech API (id-ID), with typed fallback.
export function createVoice({ lang = 'id-ID', onResult, onState }) {
  const SR = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition;
  if (!SR) return { supported: false, start() {}, stop() {} };
  const rec = new SR();
  rec.lang = lang; rec.interimResults = false; rec.maxAlternatives = 3;
  rec.onstart = () => onState && onState('listening');
  rec.onend = () => onState && onState('idle');
  rec.onerror = e => onState && onState('error:' + e.error);
  rec.onresult = e => onResult(Array.from(e.results[0]).map(a => a.transcript));
  return { supported: true, start: () => rec.start(), stop: () => rec.stop() };
}
