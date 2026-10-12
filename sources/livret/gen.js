/* =====================================================================
   MANUELS « MATHS ALLOPHONES · NIVEAU 3 » — un manuel par année
   (seconde, première, terminale pro), version élève + version professeur
   (réponses en rouge sur les mêmes pages + corrigé express).
   Source : l’appli construite (dist/index.html), chargée dans jsdom :
   mêmes cours, mêmes mots, mêmes dessins, mêmes générateurs de calculs.
   Usage : node gen.js 2de|1re|tle → build/<annee>-eleve.html, build/<annee>-prof.html
   ===================================================================== */
const fs = require('fs'), path = require('path');
const YEAR = process.argv[2] || '2de';
const ROOT = path.join(__dirname, '..');
const dom = require('./load3.js')(); const WIN = dom.window, T = WIN.__T;
const BASE = JSON.parse(fs.readFileSync(path.join(ROOT, 'content', 'base.json'), 'utf8'));
const QR = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'qr.json'), 'utf8'));
const CATS = {}; BASE.categories.forEach(c => CATS[c.id] = c);
const W = T.W;
const YN = { '2de': { nom: 'Seconde', pro: 'Seconde pro', cl: '2de pro', ico: '🌱' }, '1re': { nom: 'Première', pro: 'Première pro', cl: '1re pro', ico: '🌿' }, 'tle': { nom: 'Terminale', pro: 'Terminale pro', cl: 'Tle pro', ico: '🌳' } }[YEAR];
if (!YN) throw new Error('année inconnue : ' + YEAR);
const MODS = T.MODS.filter(m => m.annee === YEAR).map((m, i) => ({ ...m, n: i + 1, words: m.mots.map(id => W[id]).filter(Boolean) }));
const YW = MODS.flatMap(m => m.words);
const LOG = { errors: [], warnings: [], cross: [], calc: {} };
const err = m => LOG.errors.push(m), warn = m => LOG.warnings.push(m);

/* ---------- outils ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[’']/g, '-').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const TOK = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const tokens = s => [...s.matchAll(TOK)].map(m => ({ raw: m[0], text: m[1], id: m[2] || slug(m[1]), idx: m.index }));
const FRAC = /\{\{([^{}/]+?)\/([^{}]+?)\}\}/g;
/* texte riche → HTML : mots du lexique colorés, verbes d’action, fractions, vecteurs, P_A(B) */
function fmt(s, o = {}) {
  let src = s == null ? '' : String(s);
  if (o.exam) src = T.toInf(src);
  let h = esc(src);
  h = h.replace(TOK, (_, t, id) => { const w = W[id || slug(t)]; return (w && !o.noLex) ? `<b class="kc c-${w.cat}">${t}</b>` : t; });
  h = h.replace(/\*\*([^*]+)\*\*/g, o.noVerb ? '$1' : '<strong class="v">$1</strong>');
  h = h.replace(FRAC, '<span class="fr"><span class="fn">$1</span><span class="fd">$2</span></span>');
  h = h.replace(/~([A-Za-z0-9₀-₉]{1,3})~/g, '<span class="vecn">$1</span>');
  h = h.replace(/P_([A-ZĀ][̄₀-₉]*)\(/g, 'P<sub>$1</sub>(');
  return h;
}
const flat = s => String(s == null ? '' : s).replace(TOK, (_, t) => t).replace(/\*\*([^*]+)\*\*/g, '$1').replace(FRAC, '$1/$2').replace(/~([^~]+)~/g, '$1').replace(/P_([A-ZĀ][̄₀-₉]*)\(/g, 'P$1(');
const lines = arr => (Array.isArray(arr) ? arr : arr ? [arr] : []);
function rng(seed) { let a = 0; for (const c of seed) a = (a * 31 + c.charCodeAt(0)) >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function shuffle(arr, r) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function derange(arr, r) { if (arr.length < 2) return arr.slice(); for (let k = 0; k < 80; k++) { const s = shuffle(arr, r); if (s.every((x, i) => x !== arr[i])) return s; } return arr.slice(1).concat(arr[0]); }
const fullName = w => w.art ? (w.art === 'l’' ? 'l’' + w.mot : w.art + ' ' + w.mot) : w.mot;
const ART = w => w.art ? `<i>${esc(w.art)}</i>${w.art === 'l’' ? '' : ' '}` : '';
/* dessins de l’appli ; k > 1 grossit le texte des étiquettes (petits dessins imprimés) */
const ILL = (spec, cat, k = 1) => { try { let svg = T.renderIll(spec, cat); if (k !== 1) { const vw = +((svg.match(/viewBox="0 0 ([\d.]+)/) || [0, 200])[1]), lim = vw * 0.08;   // seules les très petites étiquettes grossissent
      svg = svg.replace(/font-size="([\d.]+)"/g, (m, v) => +v < lim ? `font-size="${(+v * k).toFixed(1)}"` : m).replace(/font-size:([\d.]+)px/g, (m, v) => +v < lim ? `font-size:${(+v * k).toFixed(1)}px` : m); } return svg; } catch (e) { err('dessin ' + spec + ' : ' + e.message); return ''; } };
const KS = 1.12;   // petits dessins
/* dessin trop chargé (tableau…) : illisible en petit */
/* le plus petit texte du dessin, en points, s’il est imprimé sur une largeur donnée (mm) */
const minPt = (w, mm) => { const svg = ILL(w.ill, w.cat, KS), vb = svg.match(/viewBox="0 0 ([\d.]+)/); const fs = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]); return vb && fs.length ? Math.min(...fs) / +vb[1] * mm * 2.835 : 99; };
const dense = (w, lim = 18) => (ILL(w.ill, w.cat).match(/<text/g) || []).length > lim;
const ill = (w, cls = '') => `<span class="il ${cls}">${ILL(w.ill, w.cat, KS)}</span>`;
const qr = k => { if (!QR[k]) { err('QR manquant ' + k); return ''; } return `<a class="qrl" href="${QR[k].url}">` + QR[k].svg.replace(/width="(\d+)" height="(\d+)"/, 'viewBox="0 0 $1 $2"') + '</a>'; };
const LET = 'ABCDEFGHIJ';
function seeded(seed, fn) { const old = WIN.Math.random; WIN.Math.random = rng(seed); try { return fn(); } finally { WIN.Math.random = old; } }
const GRP = m => m.grp ? `Groupement${m.grp.length > 1 ? 's' : ''} ${m.grp.join(' et ')} seulement` : m.spe === 'sans-pc' ? 'Spécialités sans physique-chimie' : '';

/* ---------- petits éléments, avec réponse pour la version professeur ---------- */
const H = {
  blank: (n, a = '') => `<span class="bl" style="min-width:${Math.max(2, n) * 0.62}em"${a !== '' ? ` data-a="${esc(a)}"` : ''}></span>`,
  lines: (n, a = '') => `<div class="lines">${Array.from({ length: n }, (_, i) => `<i${i === 0 && a ? ` data-a="${esc(a)}"` : ''}></i>`).join('')}</div>`,
  work: (a = '', h) => `<div class="work"${h ? ` style="height:${h}mm"` : ''}${a ? ` data-a="${esc(a)}"` : ''}></div>`,
  box: (t, ok) => `<span class="opt${ok ? ' ok' : ''}"><span class="box"></span> ${t}</span>`,
  frb: (a) => { const [n, d] = String(a).split('/'); return `<span class="frb"><i data-a="${esc(n)}"></i><hr><i data-a="${esc(d || '1')}"></i></span>`; },
  tab: (t, o) => `<table class="tbl">${t.map(row => `<tr>${row.map((c, i) => i === 0 ? `<th>${fmt(c, o)}</th>` : `<td>${fmt(c, o)}</td>`).join('')}</tr>`).join('')}</table>`
};

/* ---------- les compétences du bac pro ---------- */
const COMP = { app: ['🔎', 'S’approprier'], ana: ['🧠', 'Analyser · raisonner'], rea: ['🛠️', 'Réaliser'], val: ['✔️', 'Valider'], com: ['💬', 'Communiquer'], mots: ['🔤', 'Les mots'], ora: ['🗣️', 'À l’oral'], defi: ['🏁', 'Défi'], sais: ['✅', 'Mon bilan'] };
const VB = {
  app: ['Lis', 'Relève', 'Repère', 'Identifie', 'Indique', 'Cite', 'Reconnais', 'Observe', 'Lis graphiquement', 'Précise', 'Note', 'Donne', 'Souligne', 'Entoure', 'Coche', 'Range', 'Associe', 'Recopie', 'Nomme'],
  ana: ['Choisis', 'Détermine', 'Propose', 'Déduis', 'Exprime', 'Analyse', 'Modélise', 'Trouve', 'Écris', 'Prévois', 'Optimise'],
  rea: ['Calcule', 'Résous', 'Résous graphiquement', 'Construis', 'Trace', 'Développe', 'Factorise', 'Place', 'Représente', 'Complète', 'Convertis', 'Arrondis', 'Dérive', 'Dresse', 'Simplifie', 'Mesure', 'Estime', 'Utilise', 'Programme', 'Saisis', 'Simule', 'Affiche', 'Ajoute', 'Réduis', 'Encadre', 'Écris le programme', 'Modifie'],
  val: ['Vérifie', 'Valide', 'Compare', 'Montre', 'Teste', 'Contrôle'],
  com: ['Justifie', 'Explique', 'Rédige', 'Conclus', 'Argumente', 'Interprète', 'Décris', 'Résume', 'Dis']
};
const V2C = {}; Object.entries(VB).forEach(([c, vs]) => vs.forEach(v => { V2C[v] = c; V2C[v.toLowerCase()] = c; }));
T.INF_PAIRS.forEach(([tu, inf]) => { const c = V2C[tu]; if (c) { V2C[inf] = c; V2C[inf.toLowerCase()] = c; } });
Object.assign(V2C, { organiser: 'app', Organise: 'app', organise: 'app', lire: 'app', reconnaître: 'app', choisir: 'ana', modéliser: 'ana', interpréter: 'com', estimer: 'rea', utiliser: 'rea', résoudre: 'rea', simuler: 'rea', 'résoudre graphiquement': 'rea', exprimer: 'ana', dériver: 'rea' });
function compOf(text, type) {
  const vs = [...String(text).matchAll(/\*\*([^*]+)\*\*/g)].map(m => m[1].trim());
  const cs = [...new Set(vs.map(v => V2C[v] || V2C[v.split(/[\s-]/)[0]]).filter(Boolean))];
  if (!cs.length) return type === 'vf' ? 'val' : type === 'qcm' ? 'app' : 'rea';
  // « Calcule … puis justifie » : on garde la compétence la plus haute dans l’ordre du bac pro
  const ORD = ['com', 'val', 'ana', 'rea', 'app']; return ORD.find(c => cs.includes(c));
}
const chip = c => `<span class="cp cp-${c}">${COMP[c][0]} ${COMP[c][1]}</span>`;

/* ---------- exercices ---------- */
const KEY = [];   // corrigé express : { sec, eid, title, corr }
let EXN = 0, STAGE = 0;   // étape : 1 comprendre · 2 les mots · 3 calculer · 4 problèmes · 5 rédiger, parler, jouer · 6 bilan
function ex(sec, comp, title, body, corr, cls = '') {
  const eid = 'e' + (++EXN);
  if (corr != null) KEY.push({ sec, eid, title, corr });
  return `<div class="blk ex ${cls}" data-eid="${eid}"${STAGE ? ` data-stage="${STAGE}"` : ''}><div class="exh"><span class="num">·</span>${comp.split(' ').map(chip).join('')}<span class="ext">${title}</span></div><div class="exb">${body}</div></div>`;
}
const C = s => s.replace(/\*\*([^*]+)\*\*/g, '<strong class="v">$1</strong>');

/* Les mots et les images */
function sousImage(words, r, max = 10) {
  const fam = w => String(w.ill).split('|')[0];   // deux dessins de la même famille se ressemblent trop
  const ws = []; for (const w of shuffle(words, r)) { if (ws.length >= max) break; if (ws.some(x => fam(x) === fam(w))) continue; ws.push(w); }
  if (ws.length < 4) return null;
  const body = C(`<p class="cs">**Regarde** chaque image. **Écris** le bon mot dessous. Les mots sont dans le cadre.</p>`) + `<div class="bank">${shuffle(ws, r).map(w => `<span class="tag">${esc(w.mot)}</span>`).join('')}</div>
   <div class="sgrid">${ws.map(w => `<div class="sg">${ill(w, 'sg-ill')}${H.blank(10, w.mot)}</div>`).join('')}</div>`;
  return { body, corr: ws.map((w, i) => `${i + 1}. ${esc(w.mot)}`).join(' · ') };
}
/* Mot ↔ définition (facile ou « du manuel ») */
function defs(words, r, n = 5, key = 'def') {
  const cands = words.filter(w => w[key]).filter(w => { const d = norm(flat(w[key])); const k = norm(w.mot).split(/[\s’']+/).filter(x => x.length > 3); return !d.includes(norm(w.mot)) && !k.some(x => d.includes(x.slice(0, Math.max(5, x.length - 2)))); });
  let pick = shuffle(cands, r).slice(0, n);
  if (pick.length < 4) pick = shuffle(words.filter(w => w[key] && !norm(flat(w[key])).includes(norm(w.mot))), r).slice(0, n);
  if (pick.length < 3) return null;
  const right = derange(pick, r);
  const body = C(`<p class="cs">**Lis** les définitions${key === 'man' ? ' (comme dans le manuel)' : ''}. **Relie** chaque mot à sa définition.</p>`) + `<div class="rel rel-def">${pick.map((w, i) => `<div class="rl" data-a="→ ${right.indexOf(w) + 1}"><span class="rw c-${w.cat}"><span class="lab">${LET[i]}</span><span>${esc(fullName(w))}</span></span><span class="dot"></span></div><div></div><div class="rr"><span class="dot"></span><span class="rd"><span class="lab2">${i + 1}</span><span>${fmt(right[i][key], { noLex: true })}</span></span></div>`).join('')}</div>`;
  return { body, corr: pick.map((w, i) => `${LET[i]} → ${right.indexOf(w) + 1}`).join(' · ') };
}
/* Les mots à double sens : dans la vie ou en maths ? */
function doubleSens(words, r) {
  const ws = shuffle(words.filter(w => w.vie), r).slice(0, 4);
  if (ws.length < 2) return null;
  let k = 0; const items = [];
  const rows = ws.map(w => { const two = shuffle([['vie', w.vie], ['maths', w.def]], r); return `<div class="ds"><p class="ds-w"><b class="kc c-${w.cat}">${esc(fullName(w))}</b></p>${two.map(([t, d]) => { k++; items.push(`${k}. ${t === 'vie' ? '🏠 vie' : '📐 maths'}`); return `<div class="ds-r"><span class="ds-n">${k}</span><span class="ds-d">${fmt(d, { noLex: true })}</span><span class="opts">${H.box('🏠 dans la vie', t === 'vie')}${H.box('📐 en maths', t === 'maths')}</span></div>`; }).join('')}</div>`; }).join('');
  return { body: C(`<p class="cs">Le même mot n’a pas le même sens dans la vie de tous les jours et en maths. **Lis** chaque sens. **Coche** la bonne case.</p>`) + rows, corr: items.join(' · ') };
}
/* Je lis l’énoncé : QCM et vrai / faux */
const enonce = (txt, o) => `<div class="enonce">${lines(txt).map(t => `<p>${fmt(t, o)}</p>`).join('')}</div>`;
function lisEnonce(items) {
  if (!items.length) return null;
  const body = C(`<p class="cs">**Lis** l’énoncé. **Coche** la bonne réponse.</p>`) + items.map((c, k) => {
    const opts = c.t === 'vf' ? `<div class="opts vfs">${H.box('Vrai', c.a === true)}${H.box('Faux', c.a === false)}</div>` : `<div class="opts">${c.o.map((o, i) => H.box(fmt(o), i === c.a)).join('')}</div>`;
    return `<div class="citem">${enonce(c.txt)}<p class="q">${k + 1}. ${fmt(c.q)}</p>${opts}</div>`; }).join('');
  return { body, corr: items.map((c, k) => `${k + 1}. ${c.t === 'vf' ? (c.a ? 'Vrai' : 'Faux') : fmt(c.o[c.a])} — ${fmt(c.exp || '')}`).join(' · ') };
}
/* Je trouve la question et les données utiles */
const NUMRE = /−?\d+(?:[   ]\d{3})*(?:,\d+(?:[   ]\d{3})*)?(?:\/\d+)?/g;
const nkey = s => s.replace(/[   ]/g, '').replace(/−/g, '-');
function repere(items) {
  const q = items.find(c => c.t === 'question'), d = items.find(c => c.t === 'donnees');
  if (!q || !d) return null;
  const want = new Set(lines(d.a).map(nkey)); const found = new Set();
  const dtxt = esc(flat(d.txt)).replace(NUMRE, m => { const k = nkey(m); if (want.has(k) && !found.has(k)) { found.add(k); return `<span class="tg tg-c">${m}</span>`; } return m; });
  if (found.size !== want.size) err('données introuvables : ' + lines(d.a).join(',') + ' dans ' + flat(d.txt));
  const body = C(`<p class="cs">a. **Lis** l’énoncé. **Souligne** la phrase qui est la question.</p>`) +
    `<div class="enonce">${lines(q.txt).map((t, i) => `<span class="sent"><span class="tg${i === q.a ? ' tg-u' : ''}">${fmt(t)}</span></span>`).join(' ')}</div>` +
    C(`<p class="cs">b. **Lis** l’énoncé. **Entoure** les ${want.size === 2 ? 'deux ' : ''}données utiles : les nombres qui servent pour répondre.</p>`) + `<div class="enonce">${dtxt}</div>`;
  return { body, corr: `a. ${fmt(lines(q.txt)[q.a])} · b. ${lines(d.a).join(' et ')} — ${fmt(d.exp || '')}` };
}
/* Le mot manquant (phrases des mots) */
function gapCands(w) {
  const res = [];
  for (const ph of w.ph || []) { const t = tokens(ph).filter(t => t.id === w.id); if (t.length !== 1) continue; const p = flat(ph); if (p.split(t[0].text).length - 1 !== 1) continue; res.push({ ph, tok: t[0] }); }
  return res;
}
const hint = s => s.split(' ').map((w, k) => `<span class="hw1">${[...w].map((c, i) => (i === 0 && k === 0) ? c : (/[\-’']/.test(c) ? c : '_')).join('')}</span>`).join(' ');
function gaps(words, r, aide, bank) {
  const items = words.filter(w => gapCands(w).length).map(w => { const c = gapCands(w); return { w, g: c[Math.floor(r() * c.length)] }; });
  if (items.length < 2) return null;
  const line = x => `${fmt(x.g.ph.slice(0, x.g.tok.idx), { noLex: true })}${H.blank(Math.min(21, Math.max(6, Math.ceil(x.g.tok.text.length * 1.15) + 2)), x.g.tok.text)}${fmt(x.g.ph.slice(x.g.tok.idx + x.g.tok.raw.length), { noLex: true })}`;
  const body = C(`<p class="cs">**Regarde** l’image. **Écris** le mot qui manque.${aide ? ' L’aide donne la première lettre.' : ''}</p>`) + (bank ? `<div class="bank">${shuffle(items.map(x => x.g.tok.text), r).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : '') +
    `<div class="gaps">${items.map(x => `<div class="gp">${dense(x.w, 12) || minPt(x.w, 26) < 4.2 ? `<span class="il gp-ill gp-ic">${CATS[x.w.cat].icone}</span>` : ill(x.w, 'gp-ill')}<div><p class="gs">${line(x)}</p>${aide ? `<p class="hint"><span class="hl">aide :</span> ${hint(x.g.tok.text)}</p>` : ''}</div></div>`).join('')}</div>`;
  return { body, corr: items.map(x => esc(x.g.tok.text)).join(' · ') };
}
/* Remets les mots dans l’ordre */
function toTags(ph) {
  let s = ph; const groups = [];
  s = s.replace(TOK, (_, t) => { if (/\s/.test(t)) { groups.push(t); return `§${groups.length - 1}§`; } return t; });
  s = flat(s);
  return s.split(/ (?![?!:;»])/).map(t => t.replace(/§(\d+)§/g, (_, k) => groups[+k]));
}
function ordre(phrases, r) {
  const FORMULA = t => /^[=<>≤≥×÷−+]$|\d[a-zA-Z²³ⁿ]|[a-zA-Z][(′₀-₉]|[()=]/.test(t);
  const picks = []; for (const p of phrases) { const tg = toTags(p), n = tg.length; if (n >= 4 && n <= 10 && !picks.includes(p) && !tg.some(FORMULA)) picks.push(p); if (picks.length >= 3) break; }
  if (picks.length < 2) return null;
  const body = C(`<p class="cs">**Remets** les mots dans l’ordre. **Écris** la phrase.</p>`) + picks.map(p => { const tg = toTags(p); return `<div class="ord"><div class="bank">${derange(tg, r).map(t => `<span class="tag">${fmt(t, { noLex: true })}</span>`).join('')}</div>${H.lines(1, flat(p))}</div>`; }).join('');
  return { body, corr: picks.map((p, k) => `${k + 1}. ${fmt(p, { noLex: true })}`).join(' · ') + ' (un autre ordre correct est accepté)' };
}
/* Je calcule : tirages des générateurs de l’appli */
function answerZone(q) {
  const a = T.answerShow(q), corr = lines(q.corr).map(flat).join(' ; ');
  if (q.type === 'qcm') return `<div class="opts">${q.o.map((o, i) => H.box(fmt(o), i === q.a)).join('')}</div>`;
  if (q.type === 'vf') return `<div class="opts vfs">${H.box('Vrai', q.a === true)}${H.box('Faux', q.a === false)}</div>`;
  if (q.type === 'frac') return `${H.work(corr)}<div class="ans"><span>Réponse :</span> ${H.frb(q.a)}</div>`;
  if (q.type === 'expr') return `${H.work(corr)}<div class="ans"><span>Réponse :</span>${H.blank(16, flat(a))}</div>`;
  return `${H.work(corr)}<div class="ans"><span>Réponse :</span>${H.blank(9, flat(a).replace(q.unit ? new RegExp('\\s*' + q.unit.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&') + '$') : /$^/, ''))}${q.unit ? `<span class="u">${esc(q.unit)}</span>` : ''}</div>`;
}
function calcCard(it, k, cat) {
  const figs = [it.fig, ...it.qs.map(q => q.fig)].filter(Boolean).filter((f, i, a) => a.indexOf(f) === i).map(f => ILL(f, cat, KS));
  const tab = it.tab || it.qs.map(q => q.tab).find(Boolean);
  const vb = f => { const m = f.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/); return m ? [+m[1], +m[2]] : [100, 100]; };
  const scr = figs.some(f => { const [w, h] = vb(f); return w / h > 1.7 || w >= 250 || (f.match(/<text/g) || []).length > 18; });
  const txtLen = [...lines(it.ctx), ...it.qs.map(q => q.q)].map(flat).join(' ').length;
  const wide = scr || !!tab || txtLen > 150 || it.qs.length > 1 || (it.qs[0].o && it.qs[0].o.map(flat).join('').length > 60);
  const qs = it.qs.map((q, i) => `${it.qs.length > 1 ? `<p class="ct"><b>${'abc'[i]}.</b> ${fmt(q.q)}</p>` : `<p class="ct">${fmt(q.q)}</p>`}${answerZone(q)}`).join('');
  const main = `<div class="cm"><div class="ct">${lines(it.ctx).map(t => `<p>${fmt(t)}</p>`).join('')}</div>${tab ? H.tab(tab) : ''}${qs}</div>`;
  return `<div class="calc${wide ? ' wide' : ''}${figs.length ? (scr ? ' hasscr' : ' hasfig') : ''}"><span class="calc-n">${k + 1}</span>${main}${figs.length ? `<div class="fig">${figs[0]}</div>` : ''}</div>`;
}
function calcBlock(m, d, seed, n, off, per = 2) {
  // tirage tournant : sur les trois niveaux, chaque générateur du chapitre est tiré au moins une fois
  const ids = m.calc; const out = [];
  seeded(seed, () => { for (let i = 0; out.length < n && i < n * 3; i++) { const id = ids[(off + i) % ids.length]; const it = T.makeCalc(id, d); if (it) out.push(it); } });
  if (!out.length) return [];
  LOG.calc[seed] = out.map(it => it.gen);
  const res = [];
  for (let s = 0; s < out.length; s += per) { const part = out.slice(s, s + per);
    res.push({ body: C(`<p class="cs">**Lis** bien. **Écris** ton calcul dans le cadre. **Écris** la réponse.</p>`) + `<div class="calcs">${part.map((it, k) => calcCard(it, k, m.cat)).join('')}</div>`,
      corr: part.map((it, k) => `${k + 1}. ${it.qs.map(q => fmt(T.answerShow(q))).join(' ; ')}`).join(' · ') }); }
  return res;
}

/* ---------- le problème, en trois versions ---------- */
const VERS = { guidee: ['v1', '① Version guidée'], standard: ['v2', '② Version standard'], examen: ['v3', '③ Version examen'] };
/* phrase-réponse à compléter (version guidée) : les nombres deviennent des trous */
/* phrase-réponse à compléter (version guidée) : les trous portent sur ce que l’élève doit trouver,
   jamais sur un nombre déjà écrit dans l’énoncé ni sur un chiffre collé à une lettre (A2, Q₃, x²) */
const NUMF = /(?<![A-Za-zÀ-ÿ₀-₉²³])−?\d+(?:[\u202f\u00a0 ]\d{3})*(?:,\d+)?(?![A-Za-z₀-₉²³(])/g;
function frame(q, given) {
  const rep = flat(q.rep || ''); if (!rep) return null;
  let n = 0; let h = esc(rep).replace(NUMF, m => { if (given.includes(m) && m.replace(/\D/g, '').length > 1) return m; n++; return H.blank(Math.max(3, m.length + 1), m); });
  if (!n && q.type === 'qcm') { const o = flat(q.o[q.a]); const i = rep.toLowerCase().indexOf(o.toLowerCase()); if (i >= 0 && o.length > 1) { h = esc(rep.slice(0, i)) + H.blank(Math.min(24, o.length + 3), rep.slice(i, i + o.length)) + esc(rep.slice(i + o.length)); n = 1; } }
  if (!n) { const yn = rep.match(/^(Oui|Non)\b/); if (yn) { h = H.blank(5, yn[1]) + esc(rep.slice(yn[1].length)); n = 1; } }
  if (!n) { const v = rep.match(/\s(est|sont|vaut|valent|affiche|renvoie|coûte|coûtent|mesure|dure|contient|atteint|dépasse)\s/);
    if (v) { const cut = v.index + v[0].length, rest = rep.slice(cut).replace(/[.!]$/, ''); h = esc(rep.slice(0, cut)) + H.blank(Math.min(30, rest.length + 3), rest) + (/[.!]$/.test(rep) ? '.' : ''); n = 1; } }
  if (!n) { const w = rep.split(' '); if (w.length < 4) return null; h = esc(w.slice(0, Math.min(3, w.length - 2)).join(' ')) + ' ' + H.blank(22, w.slice(Math.min(3, w.length - 2)).join(' ')); }
  return h;
}
function lexInf(qs) {
  const found = new Map();
  qs.forEach(q => String(q.q).replace(/\*\*([^*]+)\*\*/g, (m, v) => { const k = v.trim(); const i = T.INF_PAIRS.find(([a]) => a === k || a.toLowerCase() === k); if (i) found.set(i[1], i[0].toLowerCase()); return m; }));
  if (!found.size) return '';
  return `<div class="lex">📖 <b>Les consignes à l’infinitif :</b> ${[...found].map(([inf, tu]) => `<b>${esc(inf)}</b> = ${esc(tu)}`).join(' · ')}</div>`;
}
function probleme(b, m, version, label) {
  const exam = version === 'examen', o = { exam };
  const fig = b.fig ? `<div class="figr">${ILL(b.fig, m.cat)}</div>` : '';
  const qs = b.qs.map((q, i) => {
    let z = '';
    const corrTxt = lines(q.corr).map(flat).join(' ; ');
    if (q.type === 'qcm') z = `<div class="opts" style="margin:1mm 0 0 8.4mm">${q.o.map((op, j) => H.box(fmt(op), j === q.a)).join('')}</div>`;
    else if (q.type === 'vf') z = `<div class="opts vfs" style="margin:1mm 0 0 8.4mm">${H.box('Vrai', q.a === true)}${H.box('Faux', q.a === false)}</div>`;
    else z = `<div class="pl"><span>Je calcule :</span>${H.lines(q.type === 'expr' ? 1 : 2, corrTxt)}</div>`;
    if (version === 'guidee') {
      const aides = (q.aide || []).map(a => `<p>💡 ${fmt(a)}</p>`).join('');
      const fr = frame(q, flat(q.q) + ' ' + lines(b.ctx).map(flat).join(' ') + ' ' + (b.tab ? b.tab.flat().map(flat).join(' ') : ''));
      return `<div class="pq"><div class="pq-h"><span class="pq-n">${i + 1}</span><span class="pq-q">${fmt(q.q)}</span>${chip(compOf(q.q, q.type))}</div>${aides ? `<div class="aides">${aides}</div>` : ''}${z}<div class="pl"><span>Je réponds :</span>${fr ? `<p class="frm">${fr}</p>` : H.lines(1, flat(q.rep))}</div></div>`;
    }
    z += `<div class="pl"><span>${exam ? 'Réponse :' : 'Je réponds :'}</span>${H.lines(1, flat(q.rep))}</div>`;
    return `<div class="pq"><div class="pq-h"><span class="pq-n">${i + 1}</span><span class="pq-q">${fmt(q.q, o)}</span>${chip(compOf(q.q, q.type))}</div>${z}</div>`; });
  const pouce = version === 'standard' ? b.qs.map((q, i) => (q.aide && q.aide.length) ? `<span><b>${i + 1}.</b> ${fmt(q.aide[0])}</span>` : '').join('') : '';
  const [vc, vn] = VERS[version];
  const n = b.qs.length, cut = n;   // le découpage éventuel est fait à la mise en page
  const head = `<p class="vline"><span class="${vc}">${vn}</span>${label ? `<span class="pb-src">${label}</span>` : ''}</p>${exam ? lexInf(b.qs) : ''}${fig}${enonce(b.ctx, o)}${b.tab ? H.tab(b.tab, o) : ''}`;
  const pc = pouce ? `<div class="pouce"><b>💡 Coup de pouce</b> (si je bloque) : ${pouce}</div>` : '';
  const body = `<div class="pbm pbv-${vc}">${head}${qs.slice(0, cut).join('')}${cut === n ? pc : ''}</div>`;
  const rest = cut < n ? `<div class="pbm pbv-${vc}">${qs.slice(cut).join('')}${pc}</div>` : null;
  return { body, rest, corr: b.qs.map((q, i) => `${i + 1}. ${lines(q.corr).map(c => fmt(c)).join(' ; ')} → ${fmt(q.rep)}`).join(' · ') };
}
const exCont = (title, body) => `<div class="blk ex keep cont"${STAGE ? ` data-stage="${STAGE}"` : ''}><div class="exh"><span class="ext">${title} <span class="suite">(suite)</span></span></div><div class="exb">${body}</div></div>`;
/* Je rédige la phrase-réponse */
const VERBE = /\b(est|sont|mesure|mesurent|coûte|coûtent|vaut|valent|parcourt|dure|a|ont|fait|font|contient|reste|restent|gagne|paie|vient|viennent|faut|doit|dépasse|atteint)\b|n’est/;
const REDIGE_OK = it => it && it.qs.length === 1 && it.qs[0].rep && VERBE.test(flat(it.qs[0].rep)) && flat(it.qs[0].rep).length > 14;
const solved = q => q.type === 'qcm' ? [`Réponse : ${q.o[q.a]}`] : q.type === 'vf' ? [(q.a ? 'Vrai. ' : 'Faux. ') + lines(q.corr).map(flat).join(' ; ')] : lines(q.corr);
function redige(m, seed) {
  const out = [];
  seeded(seed, () => { for (let i = 0; out.length < 2 && i < 90; i++) { const it = T.makeCalc(m.calc[i % m.calc.length], 1 + (i % 3)); if (REDIGE_OK(it) && !out.some(o => o.gen === it.gen)) out.push(it); } });
  const fromMeth = m.methodes.filter(me => me.exemple && me.exemple.reponse).map(me => ({ txt: me.exemple.enonce, calc: me.exemple.etapes.map(e => e.c), rep: me.exemple.reponse }));
  const items = out.map(it => ({ txt: lines(it.ctx).map(flat).join(' ') + ' ' + it.qs[0].q, calc: solved(it.qs[0]), rep: it.qs[0].rep })).concat(fromMeth.slice(out.length >= 2 ? -1 : -3)).slice(0, 3);
  if (items.length < 2) return null;
  const body = C(`<p class="cs">Le calcul est fait. **Écris** la phrase-réponse, avec l’unité si elle existe.</p>`) +
    items.map((it, k) => `<div class="rdg"><p class="ct"><b>${k + 1}.</b> ${fmt(it.txt)}</p><p class="calcd">${it.calc.map(c => fmt(c)).join(' &nbsp;;&nbsp; ')}</p>${H.lines(1, flat(it.rep))}</div>`).join('') +
    `<div class="frames"><span>Le résultat est …</span><span>D’après mes calculs, …</span><span>Donc …</span><span>… car …</span><span>Je conseille de …</span></div>`;
  return { body, corr: items.map((it, k) => `${k + 1}. ${fmt(it.rep)}`).join(' · ') };
}
/* Mots mêlés (quand la grille de mots croisés est impossible) */
const CW = s => norm(s).toUpperCase().replace(/[^A-Z]/g, '');
function motsMeles(words, r) {
  const ok = words.filter(w => CW(w.mot).length >= 4 && CW(w.mot).length <= 14);
  if (ok.length < 4) return null;
  const N = Math.min(14, Math.max(11, ...ok.map(w => CW(w.mot).length))), ws = shuffle(ok, r).slice(0, 8);
  for (let attempt = 0; attempt < 200; attempt++) {
    const g = Array.from({ length: N }, () => Array(N).fill(null)), put = [];
    let good = true;
    for (const w of ws.slice().sort((a, b) => CW(b.mot).length - CW(a.mot).length)) {
      const s = CW(w.mot); let done = false;
      for (let t = 0; t < 300 && !done; t++) {
        const d = r() < .5 ? 0 : 1, x = Math.floor(r() * (N - (d ? 0 : s.length - 1))), y = Math.floor(r() * (N - (d ? s.length - 1 : 0)));
        let fit = true; for (let i = 0; i < s.length; i++) { const c = g[y + (d ? i : 0)][x + (d ? 0 : i)]; if (c && c !== s[i]) { fit = false; break; } }
        if (!fit) continue;
        for (let i = 0; i < s.length; i++) g[y + (d ? i : 0)][x + (d ? 0 : i)] = s[i];
        put.push({ w, x, y, d, s }); done = true; }
      if (!done) { good = false; break; } }
    if (!good) continue;
    const L = 'ABCDEFGHIJKLMNOPRSTUVZ', hit = new Set(); put.forEach(p => { for (let i = 0; i < p.s.length; i++) hit.add((p.y + (p.d ? i : 0)) + ',' + (p.x + (p.d ? 0 : i))); });
    const cells = g.map((row, y) => row.map((c, x) => `<span class="mm${hit.has(y + ',' + x) ? ' ok' : ''}">${c || L[Math.floor(r() * L.length)]}</span>`).join('')).join('');
    const body = C(`<p class="cs">**Cherche** les mots dans la grille. Ils sont écrits → ou ↓, sans accents. **Entoure**-les. **Coche** chaque mot trouvé.</p>`) +
      `<div class="mmw"><div class="mmg" style="grid-template-columns:repeat(${N},6.4mm)">${cells}</div><ul class="mml">${put.map(p => `<li><span class="box"></span> ${esc(p.w.mot)}</li>`).join('')}</ul></div>`;
    LOG.cross.push('(mots mêlés) ' + put.map(p => p.s).join(' '));
    return { body, corr: put.map(p => `${p.s} ${p.d ? '↓' : '→'} ligne ${p.y + 1}, colonne ${p.x + 1}`).join(' · ') };
  }
  return null;
}
/* Mots croisés */
function crossword(words, r, max = 7) {
  const cands = words.filter(w => CW(w.mot).length >= 3 && CW(w.mot).length <= 13 && w.mot.split(/[\s\-’']+/).length <= 2)
    .filter(w => { const d = norm(flat(w.def)).replace(/[^a-z]/g, ''); const a = CW(w.mot).toLowerCase(); return !d.includes(a.slice(0, Math.min(5, a.length))); });
  if (cands.length < 4) return null;
  let best = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    const order = shuffle(cands, r).slice(0, 14).sort((a, b) => CW(b.mot).length - CW(a.mot).length + (r() - .5) * 3);
    const grid = new Map(); const placed = [];
    const key = (x, y) => x + ',' + y; const at = (x, y) => grid.get(key(x, y));
    const put = (w, x, y, d) => { const s = CW(w.mot); for (let i = 0; i < s.length; i++) { const cx = x + (d ? 0 : i), cy = y + (d ? i : 0); const c = at(cx, cy); grid.set(key(cx, cy), { ch: s[i], h: (c && c.h) || !d, v: (c && c.v) || d }); } placed.push({ w, x, y, d, s }); };
    const fits = (s, x, y, d) => { let cross = 0;
      const bx = x - (d ? 0 : 1), by = y - (d ? 1 : 0), ax = x + (d ? 0 : s.length), ay = y + (d ? s.length : 0);
      if (at(bx, by) || at(ax, ay)) return -1;
      for (let i = 0; i < s.length; i++) { const cx = x + (d ? 0 : i), cy = y + (d ? i : 0); const c = at(cx, cy);
        if (c) { if (c.ch !== s[i] || (d ? c.v : c.h)) return -1; cross++; }
        else { const n1 = d ? at(cx - 1, cy) : at(cx, cy - 1), n2 = d ? at(cx + 1, cy) : at(cx, cy + 1); if (n1 || n2) return -1; } }
      return cross; };
    put(order[0], 0, 0, 0);
    for (const w of order.slice(1)) { if (placed.length >= max) break; const s = CW(w.mot); let opt = null;
      for (const p of placed) for (let i = 0; i < p.s.length; i++) for (let j = 0; j < s.length; j++) { if (p.s[i] !== s[j]) continue;
        const d = p.d ? 0 : 1; const px = p.x + (p.d ? 0 : i), py = p.y + (p.d ? i : 0); const x = px - (d ? 0 : j), y = py - (d ? j : 0);
        const c = fits(s, x, y, d); if (c > 0) { const xs = [...grid.keys()].map(k => +k.split(',')[0]).concat([x, x + (d ? 0 : s.length - 1)]), ys = [...grid.keys()].map(k => +k.split(',')[1]).concat([y, y + (d ? s.length - 1 : 0)]);
          const wdt = Math.max(...xs) - Math.min(...xs) + 1, hgt = Math.max(...ys) - Math.min(...ys) + 1; if (wdt > 15 || hgt > 13) continue;
          const sc = c * 10 - wdt * hgt * 0.05 + r(); if (!opt || sc > opt.sc) opt = { x, y, d, sc }; } }
      if (opt) put(w, opt.x, opt.y, opt.d); }
    if (placed.length >= 4 && (!best || placed.length > best.placed.length)) best = { grid, placed };
    if (best && best.placed.length >= max) break;
  }
  if (!best) return null;
  const { grid, placed } = best; const xs = [...grid.keys()].map(k => +k.split(',')[0]), ys = [...grid.keys()].map(k => +k.split(',')[1]);
  const x0 = Math.min(...xs), y0 = Math.min(...ys), Wd = Math.max(...xs) - x0 + 1, Hd = Math.max(...ys) - y0 + 1;
  const starts = [...new Set(placed.map(p => (p.y - y0) * 100 + (p.x - x0)))].sort((a, b) => a - b); const num = {}; starts.forEach((s, i) => num[s] = i + 1);
  const cell = 6.6; let cells = '';
  for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) { const c = grid.get((x + x0) + ',' + (y + y0)); if (!c) continue; const n = num[y * 100 + x];
    cells += `<div class="cwc" style="left:${x * cell}mm;top:${y * cell}mm">${n ? `<span class="cwn">${n}</span>` : ''}<span class="cwl">${c.ch}</span></div>`; }
  const clue = p => `<li><b>${num[(p.y - y0) * 100 + (p.x - x0)]}.</b> ${fmt(p.w.def, { noLex: true })} <span class="cnt">(${p.s.length} lettres${/[\s\-’']/.test(p.w.mot) ? ', ' + p.w.mot.split(/[\s\-’']+/).length + ' mots' : ''})</span></li>`;
  const ord = arr => arr.sort((a, b) => num[(a.y - y0) * 100 + a.x - x0] - num[(b.y - y0) * 100 + b.x - x0]);
  const hz = ord(placed.filter(p => !p.d)), vt = ord(placed.filter(p => p.d));
  LOG.cross.push(placed.map(p => p.s).join(' '));
  const body = C(`<p class="cs">**Lis** les définitions. **Écris** les mots dans la grille, en majuscules et sans accents.</p>`) + `
  <div class="cw"><div class="cwg" style="width:${Wd * cell}mm;height:${Hd * cell}mm">${cells}</div>
  <div class="cwclues"><div><h4>→ Horizontalement</h4><ul>${hz.map(clue).join('')}</ul></div><div><h4>↓ Verticalement</h4><ul>${vt.map(clue).join('')}</ul></div></div></div>`;
  const nm = p => num[(p.y - y0) * 100 + p.x - x0];
  return { body, corr: '→ ' + hz.map(p => `${nm(p)}. ${p.s}`).join(', ') + ' · ↓ ' + vt.map(p => `${nm(p)}. ${p.s}`).join(', ') };
}
/* Je parle */
function keyPhrases(words) {
  const all = []; words.forEach(w => (w.ph || []).forEach(p => all.push({ w, p, n: tokens(p).filter(t => W[t.id]).length })));
  const pick = []; const used = new Set();
  all.sort((a, b) => b.n - a.n || flat(a.p).length - flat(b.p).length).forEach(x => { if (pick.length < 4 && !used.has(x.w.id) && flat(x.p).length <= 80) { pick.push(x); used.add(x.w.id); } });
  return pick.map(x => `<li>${fmt(x.p)}</li>`).join('');
}
const parle = m => `<div class="parle"><div>
    ${C(`<p class="cs">🎧 **Scanne** le QR code. **Écoute** les mots du chapitre. **Répète** à voix haute.</p>`)}
    ${C(`<p class="cs">**Lis** ces phrases à voix haute, puis **lis**-les à ton voisin.</p>`)}<ol class="keys">${keyPhrases(m.words)}</ol>
    ${C(`<p class="cs">**Explique** à ton voisin la méthode : <b>« ${esc(flat(m.methodes[0].titre))} »</b>. Ensuite, il t’**explique** une autre méthode du chapitre.</p>`)}
    <div class="amorces"><span>D’abord, je …</span><span>Ensuite, je …</span><span>Enfin, je …</span><span>Je sais que …</span><span>Donc …</span></div>
  </div><div class="qrbox">${qr(m.id + ':mots')}<span>🎧 Les mots<br>du chapitre</span></div></div>`;
const face = k => { const col = ['#1E7F45', '#E0A000', '#C2332A'][k]; const mouth = ['M14 25 Q20 31 26 25', 'M14 26 L26 26', 'M14 28 Q20 22 26 28'][k];
  return `<svg viewBox="0 0 40 40" class="face"><circle cx="20" cy="20" r="17" fill="#fff" stroke="${col}" stroke-width="3"/><circle cx="14" cy="16" r="2.4" fill="${col}"/><circle cx="26" cy="16" r="2.4" fill="${col}"/><path d="${mouth}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/></svg>`; };
const jesais = m => C(`<p class="cs">**Entoure** le visage qui te va.</p>`) + `<table class="sais">${[...m.objectifs.map(t => [compOf(t), t]), ['app', 'Je sais lire et dire les mots du chapitre.'], ['com', 'Je sais écrire une phrase-réponse avec l’unité.']].map(([c, t]) => `<tr><td class="sc">${chip(c)}</td><td>${fmt(t)}</td><td>${face(0)}${face(1)}${face(2)}</td></tr>`).join('')}</table>`;

/* ---------- la situation, le cours et les méthodes ---------- */
const situation = m => { const s = m.situation; return `<div class="blk sit"><div class="sit-h">${esc(s.metier)} · La situation</div><div class="sit-b1">${s.txt.map(t => `<p>${fmt(t)}</p>`).join('')}
  <p class="sit-q">❓ ${fmt(s.question)}</p><p class="small">À la fin du chapitre, je sais répondre : le premier problème « comme à l’examen » reprend cette situation.</p></div></div>`; };
function motsBlock(m) {
  const dbl = m.words.filter(w => w.vie);
  return `<div class="blk mots3"><h3>🔤 Les mots du chapitre</h3><div class="chips">${m.words.map(w => `<span class="chip c-${w.cat}">${ART(w)}${esc(w.mot)}${w.vie ? '<span class="dsx">⚠️</span>' : ''}</span>`).join('')}</div><p class="small">${dbl.length ? '⚠️ Mot à double sens : il a un autre sens dans la vie de tous les jours. ' : ''}Les fiches des mots sont dans le glossaire, page <b data-pageof="g-${m.id}">…</b>.</p></div>`;
}
function coursBlock(c, k, cat) {
  const dz = c.ill && (ILL(c.ill, cat).match(/<text/g) || []).length > 18;
  const il = c.ill && !dz ? `<div class="cill">${ILL(c.ill, cat, KS)}</div>` : '';
  const big = dz ? `<div class="cbig">${ILL(c.ill, cat)}</div>` : '';
  return `<div class="blk cb3 c-${cat}"><p class="cb-t"><span class="cb-n">${k + 1}</span>${fmt(c.titre)}</p><div class="duo${il ? ' withill' : ''}"><div class="fac"><span class="tg-f">En français facile</span>${c.txt.map(t => `<p>${fmt(t)}</p>`).join('')}</div><div class="man"><span class="tg-m">Comme dans le manuel</span>${c.man.map(t => `<p>${fmt(t)}</p>`).join('')}</div>${il}</div>
    ${big}${c.tab ? H.tab(c.tab) : ''}${c.ex && c.ex.length ? `<div class="exm"><b>Exemple</b>${c.ex.map(t => `<p>${fmt(t)}</p>`).join('')}</div>` : ''}${c.note ? `<div class="att">⚠️ ${fmt(c.note)}</div>` : ''}</div>`;
}
function methodeBlock(me, k, cat) {
  const e = me.exemple;
  return `<div class="blk me"><p class="me-t"><span>Méthode ${k + 1}</span>${fmt(me.titre)}${me.outil ? `<span class="outil">${esc(me.outil)}</span>` : ''}</p><ol class="steps">${me.etapes.map(s => `<li><span>${fmt(s)}</span></li>`).join('')}</ol>
   <div class="solved">${e.ill ? `<div class="ill">${ILL(e.ill, cat, 1.12)}</div>` : ''}<h4>✔ Exemple résolu</h4><p class="en">${fmt(e.enonce)}</p>
   <div class="sv">${e.etapes.map(s => `<span class="t">${fmt(s.t)}</span><span class="c">${fmt(s.c)}</span>`).join('')}</div>
   ${me.code ? `<pre class="code">${esc(me.code)}</pre>` : ''}<p class="rep">✅ <b>Réponse :</b> ${fmt(e.reponse)}</p></div></div>`;
}

/* ---------- un chapitre ---------- */
function chapter(m) {
  const r = rng('n3-' + m.id), sec = m.id, out = [], col = m.cat;
  const add = (comp, title, res, cls) => { if (res) out.push(ex(sec, comp, title, res.body, res.corr, cls)); else warn(`exercice absent : ${m.id} · ${title}`); };
  // 1. Je comprends l’énoncé
  STAGE = 1;
  const qv = m.comprendre.filter(c => c.t === 'qcm' || c.t === 'vf');
  add('app', 'Je lis l’énoncé', lisEnonce(qv.slice(0, 3)));
  if (qv.length > 3) add('app', 'Je lis l’énoncé (suite)', lisEnonce(qv.slice(3, 6)));
  add('app', 'La question et les données', repere(m.comprendre));
  // 2. Les mots
  STAGE = 2;
  { const si = sousImage(m.words, r); if (si) add('mots', 'Les mots et les images', si); else add('mots', 'Les mots et les images (avec les chapitres d’avant)', sousImage(m.words.concat(MODS.filter(x => x.n !== m.n).sort((p, q) => Math.abs(p.n - m.n) - Math.abs(q.n - m.n) || p.n - q.n).slice(0, 3).flatMap(x => x.words)), r, 8)); }
  add('mots', 'Le mot et sa définition', defs(m.words, r));
  { const ds = doubleSens(m.words, r); if (ds) add('mots', 'Dans la vie ou en maths ?', ds); else add('mots', 'La définition du manuel', defs(m.words, r, 5, 'man')); }
  { const ws = shuffle(m.words, r).filter(w => gapCands(w).length); add('mots', 'Le mot qui manque', gaps(ws.slice(0, 4), r, true)); if (ws.length > 6) add('mots', 'Le mot qui manque (encore)', gaps(ws.slice(4, 8), r, false, true)); }
  const ordPh = m.comprendre.filter(c => c.t === 'ordre').map(c => c.phrase).concat(shuffle(m.words.flatMap(w => (w.ph || []).filter(p => !/[«»;:]/.test(flat(p)))), r));
  add('com', 'Remets les mots dans l’ordre', ordre(ordPh, r));
  // 3. Je calcule
  STAGE = 3;
  [[1, 4, 0], [2, 4, 4], [3, 2, 8]].forEach(([d, n, off]) => { const parts = calcBlock(m, d, `c${d}-` + m.id, n, off); if (!parts.length) warn(`calculs absents : ${m.id} niveau ${d}`); parts.forEach(pt => add('rea', `Je calcule · niveau ${d}`, pt)); });
  STAGE = 4;
  // 4. Comme à l’examen : problème 1 en version guidée, problème 2 en version standard ; le problème 3 va dans les sujets d’entraînement
  [['guidee', 0], ['standard', 1]].forEach(([v, i]) => { const b = m.brevet[i]; if (!b) return; const p = probleme(b, m, v); add('ana val com', esc(flat(b.titre)), p, 'pb'); if (p.rest) out.push(exCont(esc(flat(b.titre)), p.rest)); });
  STAGE = 5;
  add('com', 'La phrase-réponse', redige(m, 'rd-' + m.id));
  out.push(ex(sec, 'ora', 'Je parle avec mon voisin', parle(m), null));
  { const prev = (m.n > 1 ? MODS.filter(x => x.n < m.n).slice(-2) : MODS.filter(x => x.n > m.n).slice(0, 2)).flatMap(x => x.words), pool = m.words.concat(prev.filter(w => !m.words.includes(w)));
    let cw = crossword(m.words, r), t = 'Mots croisés';
    if (!cw && prev.length) { cw = crossword(pool, r); t = 'Mots croisés (avec les chapitres d’avant)'; }
    if (!cw) { cw = motsMeles(m.words, r); t = 'Mots mêlés'; }
    if (!cw && prev.length) { cw = motsMeles(pool, r); t = 'Mots mêlés (avec les chapitres d’avant)'; }
    add('defi', t, cw, 'defi'); }
  STAGE = 6;
  out.push(ex(sec, 'sais', 'Je m’évalue', jesais(m), null, 'sais'));
  STAGE = 0;
  const g = GRP(m);
  const head = `<div class="blk chead kwn c-${col}"><div class="ch-txt"><div class="ch-k">Chapitre ${m.n} · ${esc(m.domaine)}</div><h2 class="fit">${m.icone} ${esc(m.titre)}</h2>${g ? `<p class="grp">📌 ${esc(g)}</p>` : ''}<p>${fmt(m.intro)}</p>
    <ul class="obj">${m.objectifs.map(o => `<li>${fmt(o)}</li>`).join('')}</ul></div><div class="qrbox">${qr(m.id)}<span>📱 Le chapitre<br>dans l’appli</span></div></div>`;
  const cours = `<div class="blk sec-h kwn" data-sec="${m.id}-cours"><span class="ic">📘</span>Le cours</div>` + m.cours.map((c, k) => coursBlock(c, k, col)).join('');
  const meth = `<div class="blk sec-h kwn" data-sec="${m.id}-meth"><span class="ic">🧭</span>Les méthodes</div>` + m.methodes.map((me, k) => methodeBlock(me, k, col)).join('');
  const exh = `<div class="blk sec-h kwn" data-sec="${m.id}-ex"><span class="ic">✏️</span>Les exercices<span class="sec-qr">corrigés en ligne : 📱 QR code du chapitre</span></div>`;
  return `<section class="sec" data-key="${m.id}" data-recto="1" data-fill="1" data-run="${YN.pro} · Chapitre ${m.n} · ${esc(m.titre)}" data-col="${col}">${head}${situation(m)}${motsBlock(m)}${cours}${meth}${exh}${out.join('')}</section>`;
}

/* ---------- sujets d’entraînement (le 3ᵉ problème de chaque chapitre, en version examen) ---------- */
const half = Math.ceil(MODS.length / 2);
const SUJETS = [MODS.slice(0, half), MODS.slice(half)].filter(a => a.length);
function sujet(mods, k) {
  const sec = 'sujet' + (k + 1), out = [];
  mods.forEach(m => { const b = m.brevet[2]; if (!b) return; const g = GRP(m);
    const p = probleme(b, m, 'examen', `${m.icone} Chapitre ${m.n} · ${esc(m.titre)}${g ? ' · 📌 ' + esc(g) : ''}`);
    out.push(ex(sec, 'app ana rea val com', `Problème · ${esc(flat(b.titre))}`, p.body, p.corr, 'pb')); if (p.rest) out.push(exCont(esc(flat(b.titre)), p.rest)); });
  const head = `<div class="blk chead kwn c-brand"><div class="ch-txt"><div class="ch-k">Comme le jour de l’examen</div><h2>🎓 Sujet d’entraînement ${k + 1}</h2><p>Les problèmes des chapitres ${mods[0].n} à ${mods[mods.length - 1].n}, en version examen : les consignes sont à l’infinitif et il n’y a pas d’aide. Je lis tout l’énoncé avant de commencer. Je fais les problèmes de mon programme (voir le 📌).</p>
    <div class="vers3"><span class="v3">③ Version examen</span> Calculatrice autorisée · Je rédige mes réponses avec des phrases.</div></div><div class="qrbox">${qr('examen')}<span>📱 Mon sujet<br>dans l’appli</span></div></div>`;
  return `<section class="sec" data-key="${sec}" data-recto="1" data-fill="1" data-run="${YN.pro} · Sujet d’entraînement ${k + 1}" data-col="brand">${head}${out.join('')}</section>`;
}

/* ---------- l’essentiel de l’année (les phrases « comme dans le manuel ») ---------- */
const essSec = `<section class="sec" data-key="ess" data-recto="1" data-cols="2" data-run="${YN.pro} · L’essentiel de l’année" data-col="brand"><div class="blk chead kwn c-brand span"><div class="ch-txt"><div class="ch-k">À relire avant un contrôle</div><h2>📌 L’essentiel de l’année</h2><p>Pour chaque chapitre, les règles et les formules, comme dans le manuel.</p></div></div>
  ${MODS.map(m => m.cours.map((c, k) => `<div class="blk ess3w c-${m.cat}">${k ? '' : `<div class="ess3h"><span>${m.icone}</span><b>${m.n}. ${esc(m.titre)}</b></div>`}<div class="ess3"><p class="et">${fmt(c.titre, { noLex: true })}</p>${c.man.map(t => `<p>${fmt(t, { noLex: true })}</p>`).join('')}</div></div>`).join('')).join('')}</section>`;

/* ---------- pages fixes ---------- */
const FAM = BASE.categories;
function cover() {
  const pool = shuffle(YW.filter(w => /^l3:/.test(w.ill)), rng('cover' + YEAR)); const deco = pool.slice(0, 4).map((w, i) => `<span class="dc d${i}">${ILL(w.ill, w.cat)}</span>`).join('');
  return `<div class="page cover"><div class="inner"><div class="author">// Tom Rougeaud</div><div class="prof-only stamp">VERSION PROFESSEUR · avec les réponses</div>
  <div class="cv-panel">${deco}<div class="cv-k">Élèves allophones · lycée pro</div><div class="cv-title">MATHS</div><div class="cv-n2">Niveau 3 · ${YN.pro}</div><div class="cv-sub">Les maths du bac pro<br>en français facile</div><div class="cv-tome">Cours, méthodes, exercices et glossaire</div>
    <div class="cv-fam">${FAM.map(c => `<span class="fam c-${c.id}">${c.icone}</span>`).join('')}</div></div>
  <div class="cv-id"><div class="cv-classe">Classe : <b>${YN.cl}</b></div>
    <div class="cv-fields"><div><span>Prénom</span><i></i></div><div><span>Nom</span><i></i></div><div><span>Ma langue</span><i></i></div><div><span>Ma spécialité</span><i></i></div>${YEAR === '2de' ? '' : '<div><span>Mon groupement</span><i></i></div>'}</div>
    <div class="qrbox big">${qr('home')}<span>📱 L’appli<br>Maths Allophones 3</span></div></div></div></div>`;
}
const CONS = [['Calcule', 'Calculer'], ['Détermine (= trouve)', 'Déterminer'], ['Justifie (= explique pourquoi)', 'Justifier'], ['Construis (= dessine avec précision)', 'Construire, Représenter'], ['Compare', 'Comparer'], ['Vérifie', 'Vérifier, Valider'], ['Rédige (= écris des phrases)', 'Rédiger'], ['Déduis-en (= utilise le résultat d’avant)', 'En déduire']];
function guidePage() {
  return `<div class="page"><div class="inner" data-sec="guide"><h1 class="pg-t">Mon manuel : comment ça marche ?</h1>
  <h2 class="pg-s">1. Le cours sur deux colonnes</h2>
  <div class="duo demo"><div class="fac"><span class="tg-f">En français facile</span><p>Je comprends l’idée avec des phrases courtes.</p></div><div class="man"><span class="tg-m">Comme dans le manuel</span><p>Je lis la phrase officielle, celle des livres et des sujets d’examen.</p></div></div>
  <p class="pg-p">Je lis d’abord la colonne de gauche. Ensuite, je lis la colonne de droite : petit à petit, je comprends le français des manuels.</p>
  <h2 class="pg-s">2. Les cinq compétences du bac pro</h2>
  <div class="howto">${[['app', 'Je lis, je trouve les informations utiles, je comprends la question.'], ['ana', 'Je choisis une méthode, je fais des liens, je fais un plan.'], ['rea', 'Je calcule, je fais un tableau, un graphique, j’utilise la calculatrice.'], ['val', 'Je vérifie si le résultat est possible. Je trouve une erreur.'], ['com', 'J’explique à l’écrit et à l’oral, avec des phrases et le bon vocabulaire.']].map(([k, t]) => `<div class="hw"><span class="hi">${COMP[k][0]}</span><b>${COMP[k][1]}</b><span>${t}</span></div>`).join('')}</div>
  <h2 class="pg-s">3. Le problème en trois versions</h2>
  <div class="vers3"><span class="v1">① Guidée</span> l’aide est écrite, je complète la phrase-réponse <span class="v2">② Standard</span> comme en classe, avec un coup de pouce <span class="v3">③ Examen</span> comme un vrai sujet, dans les sujets d’entraînement</div>
  <h2 class="pg-s">4. Les consignes</h2>
  <p class="pg-p">${fmt('Dans ce manuel, la consigne est souvent avec « tu » : **Calcule**, **Justifie**. Dans les sujets d’examen, elle est à l’infinitif : **Calculer**, **Justifier**. C’est la même chose !')}</p>
  <table class="tbl cons">${CONS.map(r => `<tr><td>${fmt('**' + r[0].split(' (')[0] + '**' + (r[0].includes('(') ? ' (' + r[0].split(' (')[1] : ''))}</td><td>→</td><td>${fmt('**' + r[1].split(',')[0] + '**' + (r[1].includes(',') ? ',' + r[1].split(',')[1] : ''))}</td></tr>`).join('')}</table>
  </div></div>`;
}
function guidePage2() {
  const P = [['🏬', 'La situation', 'Un problème de métier. Je saurai le résoudre à la fin du chapitre.'], ['🔤', 'Les mots', 'Les mots nouveaux, et les mots à double sens.'], ['📘', 'Le cours', 'Deux colonnes : en français facile, comme dans le manuel.'], ['🧭', 'Les méthodes', 'Je suis les étapes. Je regarde l’exemple résolu.'], ['🔎', 'Je comprends l’énoncé', 'Je trouve la question et les données utiles.'], ['🛠️', 'Je calcule', 'J’écris mon calcul, puis la réponse avec l’unité.'], ['🎓', 'Comme à l’examen', 'Un problème en plusieurs questions, guidé ou standard.'], ['💬', 'Je rédige, je parle', 'J’écris la phrase-réponse. J’explique à mon voisin.']];
  return `<div class="page"><div class="inner"><h1 class="pg-t">Dans chaque chapitre</h1>
  <div class="howto two">${P.map(p => `<div class="hw"><span class="hi">${p[0]}</span><b>${p[1]}</b><span>${p[2]}</span></div>`).join('')}</div>
  <h2 class="pg-s">À la fin du manuel</h2>
  <div class="howto two">${[['📌', 'L’essentiel de l’année', 'Les règles et les formules, à relire.'], ['🎓', 'Les sujets d’entraînement', 'Les problèmes en version examen.'], ['📖', 'Le glossaire', 'Les fiches des mots, par chapitre, puis de A à Z.']].map(p => `<div class="hw"><span class="hi">${p[0]}</span><b>${p[1]}</b><span>${p[2]}</span></div>`).join('')}</div>
  <h2 class="pg-s">Les couleurs des mots</h2><div class="legend">${FAM.map(c => `<span class="chip c-${c.id}">${c.icone} ${esc(c.nom)}</span>`).join('')}</div>
  <p class="pg-p">${C('Le verbe de la consigne est **en gras et souligné**. Il dit ce que je dois faire.')}</p>
  <h2 class="pg-s">Le QR code 📱</h2>
  <div class="qrhow"><div class="qrbox">${qr('home')}<span>Essaie !</span></div><ol>
    ${C(`<li>**Ouvre** l’appareil photo du téléphone, puis **vise** le QR code.</li><li>**Touche** le lien : l’appli s’ouvre sur le bon chapitre.</li><li>**Touche** 🔊 pour écouter le cours, les mots et les phrases.</li><li>Dans l’appli, les exercices sont corrigés tout de suite.</li>`)}</ol></div>
  </div></div>`;
}
const PHR = [
  ['🔁', 'Faire répéter', 'Tu peux répéter, s’il te plaît ?', 'Vous pouvez répéter, s’il vous plaît ?'],
  ['❓', 'Je ne comprends pas', 'Je ne comprends pas la question. Tu peux m’expliquer ?', 'Je ne comprends pas la consigne. Vous pouvez m’expliquer ?'],
  ['📖', 'Le sens d’un mot', 'Ça veut dire quoi, « … » ?', 'Que veut dire le mot « … », s’il vous plaît ?'],
  ['🧭', 'Demander la méthode', 'Tu as fait comment ?', 'Par quoi je commence, s’il vous plaît ?'],
  ['🧮', 'La calculatrice', 'Tu tapes quoi sur la calculatrice ?', 'Sur quelle touche j’appuie, s’il vous plaît ?'],
  ['✅', 'Vérifier', 'Tu trouves combien ?', 'Est-ce que mon résultat est réaliste ?'],
  ['🙋', 'Proposer', 'Je pense que la réponse est …', 'Je propose de calculer …'],
  ['🤔', 'Ne pas être d’accord', 'Je ne suis pas d’accord, parce que …', 'Je ne suis pas sûr. Je pense que …']];
const JUST = [['D’après le document …', 'D’après le document 2, le prix HT est 80 €.'], ['Je sais que …', 'Je sais que le triangle est rectangle en A.'], ['J’utilise …', 'J’utilise la formule du cours.'], ['Je calcule …', 'Je calcule 80 × 1,2 = 96.'], ['Donc …', 'Donc le prix TTC est 96 €.'], ['… car …', 'L’affirmation est fausse, car 96 > 90.'], ['Je compare …', 'Je compare les deux offres : la B coûte moins cher.'], ['En conclusion, …', 'En conclusion, je conseille l’offre B.']];
function phrasesPage() {
  return `<div class="page"><div class="inner" data-sec="phrases"><h1 class="pg-t">💬 Mes phrases pour la classe</h1>
  <p class="pg-p">${C('**Lis** ces phrases à voix haute. **Utilise**-les en classe et en atelier. Avec un camarade, je dis <b>tu</b>. Avec le professeur, je dis <b>vous</b>.')}</p>
  <table class="phr2"><tr><th></th><th>👫 À un camarade <span>(tu)</span></th><th>🧑‍🏫 Au professeur <span>(vous)</span></th></tr>
  ${PHR.map(p => `<tr><td class="pk"><span>${p[0]}</span>${esc(p[1])}</td><td>${esc(p[2])}</td><td>${esc(p[3])}</td></tr>`).join('')}</table>
  <h2 class="pg-s">✍️ Pour justifier et rédiger</h2><p class="pg-p">${C('À l’examen, je dois **expliquer** ma réponse. J’utilise ces débuts de phrase.')}</p>
  <div class="jst">${JUST.map(j => `<div><b>${esc(j[0])}</b>${esc(j[1])}</div>`).join('')}</div></div></div>`;
}
function sommaire() {
  const row = (n, ic, t, key, cls, tag) => `<a class="tc ${cls}" href="#k-${key}"><span class="tn">${n}</span><span class="ti">${ic}</span><span class="tt">${esc(t)}${tag ? ` <small class="tgrp">📌 ${esc(tag)}</small>` : ''}</span><span class="tdots"></span><span class="tp" data-pageof="${key}">…</span></a>`;
  let rows = '';
  MODS.forEach(m => { rows += row(m.n, m.icone, m.titre, m.id, 'c-' + m.cat, GRP(m)); });
  rows += row('E', '📌', 'L’essentiel de l’année', 'ess', 'c-brand');
  SUJETS.forEach((s, k) => { rows += row('S' + (k + 1), '🎓', `Sujet d’entraînement ${k + 1} · chapitres ${s[0].n} à ${s[s.length - 1].n}`, 'sujet' + (k + 1), 'c-brand'); });
  rows += row('G', '📖', 'Glossaire par chapitre', 'glo-intro', 'c-brand') + row('Z', '🔤', 'Glossaire de A à Z', 'az', 'c-brand') + (RAP.length ? row('R', '🔙', 'Les mots déjà vus (rappel)', 'rap', 'c-brand') : '') + row('+', '📝', 'Mes nouveaux mots', 'fin', 'c-brand');
  return `<div class="page"><div class="inner" data-sec="sommaire"><h1 class="pg-t">Sommaire · ${YN.pro}</h1><div class="toc">${rows}</div>
   <p class="pg-p small" style="margin-top:4mm">📌 Certains chapitres ne sont au programme que de certains groupements ou de certaines spécialités. Je demande à mon professeur.</p></div></div>`;
}
const endPage = () => `<div class="page"><div class="inner" data-sec="fin"><h1 class="pg-t">📝 Mes nouveaux mots</h1><p class="pg-p">${C('**Écris** les mots nouveaux que tu apprends : en français, et dans ta langue.')}</p>
  <table class="nw"><tr><th>Le mot en français</th><th>Dans ma langue</th><th>Un dessin ou un exemple</th></tr>${Array.from({ length: 14 }, () => '<tr><td></td><td></td><td></td></tr>').join('')}</table></div></div>`;
const TPL = `<template id="notesTpl"><div class="blk notes"><h3>📝 Mes notes</h3><div class="lines"></div></div></template>`;

/* ---------- glossaire ---------- */
const INFW = w => { const p = T.INF_PAIRS.find(([a, b]) => b.toLowerCase() === w.mot.toLowerCase()); return p ? p[1] : w.mot[0].toUpperCase() + w.mot.slice(1); };
function card(w, m) {
  const forms = w.cat === 'verbe' && w.f ? `<div class="forms"><span><b>Dans un sujet</b> ${esc(INFW(w))}</span>${w.f.c ? `<span><b>Consigne</b> ${esc(w.f.c)}</span>` : ''}${w.f.je ? `<span><b>${w.f.je.startsWith('il') ? 'Avec il' : 'Avec je'}</b> ${esc(w.f.je)}</span>` : ''}</div>` : '';
  const kp = (w.ph || []).map(p => { let out = '', last = 0; for (const t of tokens(p)) { out += fmt(p.slice(last, t.idx), { noLex: true }); out += t.id === w.id ? `<b class="kc c-${w.cat}">${esc(t.text)}</b>` : esc(t.text); last = t.idx + t.raw.length; } return `<li>${out + fmt(p.slice(last), { noLex: true })}</li>`; }).join('');
  const cat = CATS[w.cat];
  return `<div class="blk gcard c-${w.cat}${dense(w, 12) ? ' gwide' : ''}" data-word="${w.id}"${m ? ` data-lesson="Glossaire · Chapitre ${m.n} · ${esc(m.titre)}" data-lcol="${m.cat}"` : ''}><div class="gc-ill">${ILL(w.ill, w.cat, KS)}</div><div class="gc-b">
    <div class="gc-h"><span class="gc-w">${ART(w)}${esc(w.mot)}${w.sym ? ` <span class="sym">${fmt(w.sym, { noLex: true })}</span>` : ''}</span><span class="gc-cat">${cat.icone} ${esc(cat.nom)}</span></div>
    <p class="gc-def">${fmt(w.def, { noLex: true })}</p>${w.man ? `<p class="gc-man"><b>📘 Dans le manuel :</b> ${fmt(w.man, { noLex: true })}</p>` : ''}${forms}<ul class="gc-ph">${kp}</ul>${w.vie ? `<p class="note">🏠 Dans la vie : ${fmt(w.vie, { noLex: true })}</p>` : ''}${w.dire && w.dire.length ? `<p class="dire">🗣️ On dit aussi : ${w.dire.map(d => fmt(d, { noLex: true })).join(' · ')}</p>` : ''}
    <div class="ml"><span>Dans ma langue :</span><i></i></div></div></div>`;
}
function guideG() {
  const s = YW.find(w => w.vie && w.man) || YW[0];
  return `<div class="page" data-recto="1"><div class="inner" data-sec="glo-intro"><h1 class="pg-t">📖 Mon glossaire · ${YN.pro}</h1>
  <p class="pg-p">Le glossaire a trois parties : <b>1.</b> les fiches des mots, rangées <b>par chapitre</b> ; <b>2.</b> tous les mots de l’année, <b>de A à Z</b> ; <b>3.</b> les mots déjà vus avant, que j’utilise encore cette année.</p>
  <h2 class="pg-s">Une fiche, c’est quoi ?</h2><div class="sample">${card(s).replace('class="blk gcard', 'class="gcard').replace(/ data-word="[^"]*"/, '')}</div>
  <ul class="annot"><li>🖼️ <b>L’image</b> aide à comprendre le mot.</li><li>🔤 <b>Le mot</b> avec son petit mot : le, la, l’.</li><li>📖 <b>La définition</b> en français facile.</li><li>📘 <b>Dans le manuel</b> : la définition officielle.</li><li>💬 <b>Les phrases clés</b> : je les lis à voix haute.</li><li>🏠 <b>Dans la vie</b> : quand le mot a un autre sens.</li><li>🌍 <b>Dans ma langue</b> : j’écris le mot dans ma langue.</li></ul>
  </div></div>`;
}
const gsecs = `<section class="sec glo" data-key="glo" data-cols="2" data-run="Glossaire · ${YN.pro}" data-col="brand">` + MODS.map(m => `<div class="blk gh2 kwn c-${m.cat}" data-sec="g-${m.id}"><span class="gh2-i">${m.icone}</span><span class="gh2-t"><small>Chapitre ${m.n} · ${m.words.length} mots · chapitre p. <b data-pageof="${m.id}">…</b></small>${esc(m.titre)}</span></div>${m.words.map(w => card(w, m)).join('')}`).join('') + `</section>`;
const sortWords = ws => ws.slice().sort((a, b) => norm(a.mot).replace(/[’'\-]/g, ' ').localeCompare(norm(b.mot).replace(/[’'\-]/g, ' '), 'fr') || a.mot.localeCompare(b.mot, 'fr'));
const byLetter = ws => { const L = []; sortWords(ws).forEach(w => { const k = norm(w.mot).replace(/[^a-z]/g, '')[0].toUpperCase(); let g = L.find(x => x.L === k); if (!g) L.push(g = { L: k, ws: [] }); g.ws.push(w); }); return L; };
const azRow = w => { const m = MODS.find(x => x.mots.includes(w.id)); return `<div class="az c-${w.cat}"><div class="az-h"><b class="az-w">${esc(w.mot)}</b>${w.art ? ` <i>(${esc(w.art)})</i>` : ''}</div><div class="az-d">${fmt(w.def, { noLex: true })}</div><div class="az-r">${m.icone} Chapitre ${m.n} · fiche p. <span data-wordpage="${w.id}">…</span></div></div>`; };
const azSec = `<section class="sec az-sec" data-key="az" data-cols="2" data-run="Glossaire de A à Z · ${YN.pro}" data-col="brand"><div class="blk ghead kwn c-brand span"><div class="ch-txt"><div class="ch-k">Les ${YW.length} mots de l’année, dans l’ordre de l’alphabet</div><h2>🔤 Glossaire de A à Z</h2></div></div>
  ${byLetter(YW).map(g => `<div class="blk az-l kwn"><span>${g.L}</span></div>` + g.ws.map(w => `<div class="blk azb">${azRow(w)}</div>`).join('')).join('')}</section>`;
/* les mots des niveaux 1 et 2 utilisés dans les textes de l’année */
const used = new Set();
const scan = o => { if (typeof o === 'string') { for (const t of tokens(o)) used.add(t.id); } else if (Array.isArray(o)) o.forEach(scan); else if (o && typeof o === 'object') Object.values(o).forEach(scan); };
MODS.forEach(m => scan([m.intro, m.objectifs, m.situation, m.cours, m.methodes, m.comprendre, m.brevet, m.words.map(w => [w.def, w.ph])]));
/* + les mots des années d’avant (niveau 3) écrits tels quels dans les textes de l’année */
const YEARS = ['2de', '1re', 'tle'], before = YEARS.slice(0, YEARS.indexOf(YEAR));
const TXT = ' ' + norm(JSON.stringify(MODS.map(m => [m.intro, m.objectifs, m.situation, m.cours, m.methodes, m.comprendre, m.brevet]).flat(9)).replace(TOK, (_, t) => t).replace(/\*\*/g, '')).replace(/[^a-z0-9’']+/g, ' ') + ' ';
T.MODS.filter(x => before.includes(x.annee)).forEach(x => x.mots.forEach(id => { const w = W[id]; if (w && w.mot.length >= 5 && TXT.includes(' ' + norm(w.mot).replace(/[^a-z0-9’']+/g, ' ').trim() + ' ')) used.add(id); }));
const RAP = [...used].map(id => W[id]).filter(w => w && !YW.includes(w));
const srcOf = w => { if (w.rap) return 'niv. ' + w.rap; const m = T.MODS.find(x => x.mots.includes(w.id)); return m ? { '2de': 'seconde', '1re': 'première', 'tle': 'terminale' }[m.annee] : ''; };
const rapRow = w => `<div class="az c-${w.cat}"><div class="az-h"><b class="az-w">${esc(w.mot)}</b>${w.art ? ` <i>(${esc(w.art)})</i>` : ''}${srcOf(w) ? ` <span class="rapn">${srcOf(w)}</span>` : ''}</div><div class="az-d">${fmt(w.def, { noLex: true })}</div></div>`;
const rapSec = RAP.length ? `<section class="sec az-sec" data-key="rap" data-cols="2" data-run="Les mots déjà vus · ${YN.pro}" data-col="brand"><div class="blk ghead kwn c-brand span"><div class="ch-txt"><div class="ch-k">${RAP.length} mots déjà vus ${YEAR === '2de' ? 'aux niveaux 1 et 2' : 'avant cette année'}, utilisés dans ce manuel</div><h2>🔙 Les mots déjà vus</h2></div><div class="qrbox sm">${qr('glossaire')}<span>📖 Tout le glossaire</span></div></div>
  ${byLetter(RAP).map(g => `<div class="blk az-l kwn"><span>${g.L}</span></div>` + g.ws.map(w => `<div class="blk azb">${rapRow(w)}</div>`).join('')).join('')}</section>` : '';

/* ---------- assemblage ---------- */
let bodyMain = cover() + guidePage() + guidePage2() + phrasesPage() + sommaire();
MODS.forEach(m => { bodyMain += chapter(m); });
bodyMain += essSec + SUJETS.map(sujet).join('');
bodyMain += guideG() + gsecs + azSec + rapSec + endPage();

const secTitle = s => { const m = MODS.find(x => x.id === s); if (m) return `${m.icone} Chapitre ${m.n} · ${esc(m.titre)}`; return `🎓 Sujet d’entraînement ${s.slice(5)}`; };
const secCol = s => { const m = MODS.find(x => x.id === s); return m ? m.cat : 'brand'; };
const secs = [...new Set(KEY.map(k => k.sec))];
const keyBody = `<section class="sec corr" data-key="corr" data-run="Corrigé express · ${YN.pro}" data-col="brand"><div class="blk chead kwn c-brand"><div class="ch-txt"><div class="ch-k">Version professeur</div><h2>✔️ Corrigé express</h2><p>Toutes les réponses, en bref. Les pages élèves de cette version portent déjà les réponses en rouge. Les calculs « Je calcule » sont des tirages des générateurs de l’appli : les mêmes exercices existent en ligne avec d’autres nombres.</p></div></div>
  ${secs.map(s => `<div class="blk cc c-${secCol(s)}"><h3>${secTitle(s)} <small>(page <span data-pageof="${s}">…</span>)</small></h3>${KEY.filter(k => k.sec === s).map(k => `<p><b class="cn" data-numof="${k.eid}">·</b> <b>${k.title}</b> — ${k.corr}</p>`).join('')}</div>`).join('')}</section>`;

/* ---------- styles et document ---------- */
const typo = h => h.replace(/🖩/g, '🧮').split(/(<pre[\s\S]*?<\/pre>|<style[\s\S]*?<\/style>)/).map((part, i) => i % 2 ? part : part.replace(/>([^<]+)</g, (m, t) => '>' + t.replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ') + '<')).join('');
const STYLE = fs.readFileSync(path.join(ROOT, 'src', 'style.css'), 'utf8');
const rootVars = STYLE.match(/:root\{[^}]*\}/)[0];
const catVars = (STYLE.match(/\.c-[a-z]+\{--cc:[^}]*\}/g) || []).join('\n');
const vecCss = (STYLE.match(/\.vecn[^{]*\{[^}]*\}/g) || []).join('\n');
const FONTS = fs.readFileSync(path.join(ROOT, 'src', 'fonts.css'), 'utf8');
/* polices : Andika (texte) et Inter (titres) ; les symboles mathématiques absents d’Andika viennent tous d’Inter,
   puis (∩, ∪, ℝ, ∈, ↦…) de DejaVu Sans et (𝒞, 𝒜) de DejaVu Math : plus de polices de secours au hasard */
const SYM = `@font-face{font-family:'InterSym';font-weight:400;src:local('Inter Regular'),local('Inter-Regular'),local('Inter')}
@font-face{font-family:'InterSym';font-weight:700;src:local('Inter Bold'),local('Inter-Bold')}
@font-face{font-family:'InterSym';font-weight:800;src:local('Inter ExtraBold'),local('Inter-ExtraBold')}\n`;
const FALL = `'Noto Color Emoji','DejaVu Sans','DejaVu Math TeX Gyre',sans-serif`;
const CSS = SYM + (fs.readFileSync(path.join(__dirname, 'print.css'), 'utf8') + fs.readFileSync(path.join(__dirname, 'n3.css'), 'utf8'))
  .replace(/font-family:'Andika','Noto Color Emoji',sans-serif/g, `font-family:'Andika',${FALL}`)
  .replace(/font-family:'Inter','Noto Color Emoji',sans-serif/g, `font-family:'Inter',${FALL}`)
  .replace(/font-family:'Inter','Andika',sans-serif/g, `font-family:'Inter',${FALL}`)
  .replace(/font-family:'Inter'(?=[;}])/g, `font-family:'Inter',${FALL}`)
  .replace(/'Inter'(?=\s*[;}])/g, `'Inter',${FALL}`);
const PAG = fs.readFileSync(path.join(__dirname, 'paginate.js'), 'utf8');
const FOOT = `Maths Allophones · Niveau 3 · ${YN.pro} // T. Rougeaud`;
/* ancres pour le sommaire cliquable : le premier bloc de chaque section, et chaque repère data-sec */
const anchors = h => h.replace(/(<section [^>]*data-key="([^"]+)"[^>]*>)<div class="blk/g, '$1<div id="k-$2" class="blk').replace(/ data-sec="([^"]+)"/g, ' id="k-$1" data-sec="$1"');
const doc = (title, body, cls) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>${FONTS}\n${rootVars}\n${catVars}\n${vecCss}\n${CSS}</style></head>
<body class="${cls}" data-foot="${esc(FOOT)}"><div id="flow">${anchors(typo(body))}</div><div id="out"></div>${TPL}<script>${PAG}</script></body></html>`;
fs.writeFileSync(path.join(__dirname, 'build', `${YEAR}-eleve.html`), doc(`Maths Allophones · Niveau 3 · ${YN.pro} — manuel`, bodyMain, 'eleve'));
fs.writeFileSync(path.join(__dirname, 'build', `${YEAR}-prof.html`), doc(`Maths Allophones · Niveau 3 · ${YN.pro} — version professeur`, bodyMain + keyBody, 'prof'));
fs.writeFileSync(path.join(__dirname, 'build', `${YEAR}-log.json`), JSON.stringify({ ...LOG, rappels: RAP.length, chapitres: MODS.map(m => ({ id: m.id, n: m.n, titre: m.titre, icone: m.icone })), sujets: SUJETS.map(x => [x[0].n, x[x.length - 1].n]) }, null, 1));
console.log(`${YEAR} · chapitres : ${MODS.length} · exercices : ${EXN} · mots : ${YW.length} · rappels : ${RAP.length} · erreurs : ${LOG.errors.length}`, LOG.errors.slice(0, 10), '· avertissements :', LOG.warnings);
