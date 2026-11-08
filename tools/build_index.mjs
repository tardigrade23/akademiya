// Kurslardan təkrar kartları və axtarış indeksi yaradır:
//   node tools/build_index.mjs
// Nəticə: data/map.json (kurs xəritəsi), data/cards.json (hər dərsdən 3–5 kart, dərsin testindən) və data/search.json (dərslərin mətni).
// Kurs məzmunu dəyişəndə yenidən işə salın.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, 'courses/catalog.json'), 'utf8')).courses;
const MAX_PER_LESSON = 5;

const strip = html => html
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<svg[\s\S]*?<\/svg>/g, ' ')
  .replace(/<div class="quiz"[^>]*><\/div>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();

function quizObject(js, cid) {
  const m = js.match(/const QUIZ\s*=\s*\{/);
  if (!m) throw new Error(cid + ': QUIZ tapılmadı');
  let i = m.index + m[0].length - 1, depth = 0, inStr = null, esc = false;
  for (let j = i; j < js.length; j++) {
    const ch = js[j];
    if (inStr) { if (esc) esc = false; else if (ch === '\\') esc = true; else if (ch === inStr) inStr = null; continue; }
    if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) return vm.runInNewContext('(' + js.slice(i, j + 1) + ')'); }
  }
  throw new Error(cid + ': QUIZ bağlanmadı');
}

const cards = [], search = [];
for (const c of catalog) {
  const html = fs.readFileSync(path.join(ROOT, 'courses', c.id, 'lessons.html'), 'utf8');
  const js = fs.readFileSync(path.join(ROOT, 'courses', c.id, 'course.js'), 'utf8');
  const Q = quizObject(js, c.id);
  const sections = html.split(/<section class="lesson"/).slice(1);
  sections.forEach((sec, l) => {
    const title = (sec.match(/data-title="([^"]*)"/) || [])[1] || '';
    const body = sec.slice(sec.indexOf('>') + 1);
    search.push({ c: c.id, l, t: title, x: strip(body).replace(/^\d+\.\s*/, '') });
    const keys = [...body.matchAll(/data-quiz="([a-z0-9]+)"/g)].map(m => m[1]).filter(k => k !== 'final');
    keys.forEach(k => (Q[k] || []).slice(0, MAX_PER_LESSON).forEach((it, qi) => {
      cards.push({ id: `${c.id}:${k}:${qi}`, c: c.id, l, t: title, q: it.q, o: it.o, a: it.a, e: it.e });
    }));
  });
}
// Kurs xəritəsi: dərs A-da izah olunan lüğət termini sonrakı dərs B-də işlənirsə, A → B əlaqəsi yaranır.
const fold = s => s.toLocaleLowerCase('az').replace(/[əıöüşçğ]/g, ch => ({ 'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g' }[ch]));
const glossary = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/glossary.json'), 'utf8'));
const manual = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/links.json'), 'utf8'));
const map = {};
for (const c of catalog) {
  const lessons = search.filter(x => x.c === c.id), edges = {};
  const terms = glossary.filter(g => g.c === c.id).map(g => ({ t: g.t, l: g.l, keys: g.t.split(/\s*[(/]\s*/)[0].split(/\s*,\s*/).map(k => fold(k.replace(/[)“”"]/g, '').trim())).filter(k => k.length >= 3) }));
  for (const g of terms) lessons.forEach(x => {
    if (x.l <= g.l || /yekun/i.test(x.t)) return;
    const txt = fold(x.x);
    if (g.keys.some(k => txt.includes(k))) (edges[g.l + '>' + x.l] = edges[g.l + '>' + x.l] || []).push(g.t);
  });
  map[c.id] = {
    terms: Object.fromEntries(lessons.map(x => [x.l, terms.filter(g => g.l === x.l).map(g => g.t)]).filter(([, v]) => v.length)),
    edges: [],
  };
  const seen = new Set();
  for (const [a, b, why] of manual[c.id] || []) {
    const [x, y] = a < b ? [a, b] : [b, a];
    if (y >= lessons.length || seen.has(x + '>' + y)) throw new Error(`${c.id}: səhv əlaqə ${a}-${b}`);
    seen.add(x + '>' + y); map[c.id].edges.push([x, y, why]);
  }
  for (const [k, v] of Object.entries(edges)) {
    const [a, b] = k.split('>').map(Number);
    if (b - a > 1 && !seen.has(k)) { seen.add(k); map[c.id].edges.push([a, b, 'termin: ' + v.slice(0, 2).join(', ')]); }
  }
}
fs.mkdirSync(path.join(ROOT, 'data'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'data/map.json'), JSON.stringify(map));
fs.writeFileSync(path.join(ROOT, 'data/cards.json'), JSON.stringify(cards));
fs.writeFileSync(path.join(ROOT, 'data/search.json'), JSON.stringify(search));
console.log('xəritə əlaqələri:', Object.entries(map).map(([k, v]) => k + ' ' + v.edges.length).join(', '));
console.log(`kartlar: ${cards.length}, axtarış: ${search.length} dərs, ${(JSON.stringify(search).length / 1024).toFixed(0)} KB`);
