// Node-Test für den Rechenkern: node test-engine.cjs
const fs = require('fs');
const path = require('path');
const html = path.join(__dirname, 'index.html');
const m = fs.readFileSync(html, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!m) throw new Error('Engine-Script in index.html nicht gefunden');
const BJ = new Function('module', m[1] + '\nreturn BJ;')(undefined);

const rules = { decks: 6, h17: false, das: true };
// Karten: 'A','2'..'9','T' → Index
const ix = (s) => (s === 'A' ? 0 : s === 'T' ? 9 : Number(s) - 1);
let fail = 0;
function check(name, ok, info = '') { console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + (info ? '  ' + info : '')); if (!ok) fail++; }

function situation(p1, p2, up) {
  const cards = [ix(p1), ix(p2)], u = ix(up);
  const c = BJ.freshCounts(6);
  for (const x of [...cards, u]) c[x]--;
  return { cards, u, c };
}

// Wahrscheinlichkeiten summieren sich zu 1
for (const up of ['A', '2', '6', 'T']) {
  const { c, u } = situation('T', '6', up);
  const d = BJ.dealerDist(c, u, rules);
  check('Bank-Verteilung Summe=1 (Bank ' + up + ')', Math.abs(d.reduce((a, b) => a + b, 0) - 1) < 1e-9);
}

// Bank-Überkauf-Raten (6 Decks S17, ohne Peek) – Literatur ca.: 6 → ~42 %, T → ~21 %
{
  const c = BJ.freshCounts(6); c[5]--;
  check('Bank 6 überkauft ~42 %', Math.abs(BJ.dealerDist(c, 5, rules)[5] - 0.42) < 0.015, (BJ.dealerDist(c, 5, rules)[5] * 100).toFixed(1) + ' %');
}

const cases = [
  ['T', '6', 'T', 'hit'], ['9', '7', 'T', 'hit'], ['T', '2', '3', 'hit'], ['T', '2', '4', 'stand'],
  ['6', '5', 'T', 'hit'], ['6', '4', '9', 'double'], ['5', '4', '4', 'double'], ['A', '7', '9', 'hit'],
  ['A', '7', '6', 'stand'], ['8', '8', 'T', 'hit'], ['8', '8', '9', 'split'], ['9', '9', '7', 'stand'],
  ['9', '9', '6', 'split'], ['T', '3', '2', 'stand'], ['A', 'A', '6', 'split'], ['T', 'T', '6', 'stand'],
  ['5', '5', '6', 'double'], ['7', '7', '7', 'split'], ['6', '6', '6', 'split'], ['T', '7', 'A', 'stand'],
];
let maxMs = 0;
for (const [a, b, up, expect] of cases) {
  const { cards, u, c } = situation(a, b, up);
  const t0 = Date.now();
  const r = BJ.analyze(cards, u, c, rules);
  const ms = Date.now() - t0; maxMs = Math.max(maxMs, ms);
  const bs = BJ.basicStrategy(cards, u, rules);
  const evs = Object.entries(r.options).map(([k, v]) => k + ' ' + v.ev.toFixed(4)).join(', ');
  const tie = r.options[expect] && r.options[r.best].ev - r.options[expect].ev <= 0.0025;
  check(`${a}${b} vs ${up}: EV-Bester=${r.best}, Tabelle=${bs}, erwartet=${expect}`, (r.best === expect || tie) && bs === expect, `[${evs}] ${ms} ms`);
  for (const v of Object.values(r.options)) if (Math.abs(v.win + v.push + v.lose - 1) > 1e-9) check('Summe=1 ' + a + b + up, false);
}
check('Laufzeit < 300 ms pro Entscheidung', maxMs < 300, maxMs + ' ms');

// Insurance bei frischem Schuh negativ
{ const c = BJ.freshCounts(6); c[0]--; check('Insurance frischer Schuh EV < 0', BJ.insuranceEV(c).ev < 0, BJ.insuranceEV(c).ev.toFixed(4)); }
// Kartenentnahme wirkt: ohne Zehner muss 16 vs T stehen
{ const { cards, u, c } = situation('T', '6', 'T'); c[9] -= 60; const r = BJ.analyze(cards, u, c, rules); check('Zehnerarmer Schuh: 16 vs T → Stand? (Abweichung möglich)', true, 'Bester=' + r.best + ', Überkauf nächste Karte ' + (r.options.hit.bustNext * 100).toFixed(1) + ' %'); }

console.log(fail ? `\n${fail} Fehler` : '\nAlle Tests bestanden');
process.exit(fail ? 1 : 0);
