/* Şəxsi Akademiya: kurs kataloqu, dərs naviqasiyası, testlər, qeydlər və irəliləyiş.
   İrəliləyiş həmişə brauzerdə saxlanılır; claude.ai daxilində açılanda isə
   istifadəçinin şəxsi db bölməsinə (data/users/<id>/<kurs>) sinxronlaşdırılır. */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = n => String(n).padStart(2, '0');
  const dayKey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayKey(new Date());
  const lsGet = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // ---------- state ----------
  let catalog = [];
  const byId = {};
  const prog = {};
  const registry = {};
  let db = null, uid = null;
  const refs = {}, writing = {}, dirty = {}, timers = {};

  const blank = () => ({ done: {}, last: 0, notes: {}, extra: {}, days: [], updated: 0 });
  function loadLocal(cid) { prog[cid] = Object.assign(blank(), lsGet('akademiya:' + cid) || {}); }
  function saveLocal(cid) { lsSet('akademiya:' + cid, prog[cid]); }

  function canon(v) {
    if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
    return JSON.stringify(v);
  }
  const isObj = v => v && typeof v === 'object' && !Array.isArray(v);

  function merge(a, b) {
    const newer = (a.updated || 0) >= (b.updated || 0) ? a : b, older = newer === a ? b : a;
    const m = blank();
    m.done = Object.assign({}, b.done || {}, a.done || {});
    const ex = Object.assign({}, older.extra || {});
    for (const [k, v] of Object.entries(newer.extra || {})) ex[k] = isObj(v) && isObj(ex[k]) ? Object.assign({}, ex[k], v) : v;
    m.extra = ex;
    const notes = Object.assign({}, b.notes || {});
    for (const [k, v] of Object.entries(a.notes || {})) if (!notes[k] || (v.ts || 0) >= (notes[k].ts || 0)) notes[k] = v;
    for (const k of Object.keys(notes)) if (!notes[k] || !notes[k].t) delete notes[k];
    m.notes = notes;
    m.days = [...new Set([...(a.days || []), ...(b.days || [])])].sort().slice(-370);
    m.last = newer.last || 0;
    m.updated = Math.max(a.updated || 0, b.updated || 0);
    return m;
  }

  function touch(cid) {
    const p = prog[cid];
    p.updated = Date.now();
    const t = today();
    if (!p.days.includes(t)) p.days.push(t);
    saveLocal(cid);
    scheduleRemote(cid);
  }

  // ---------- şəxsi öyrənmə vəziyyəti: kartlar, səhvlər, aktivlik, nişanlar, əlfəcinlər ----------
  const me = Object.assign({ cards: {}, miss: {}, log: {}, acc: {}, badges: {}, marks: [], reviews: 0, perfect: {} }, lsGet('akademiya:me') || {});
  const saveMe = () => lsSet('akademiya:me', me);
  const addDays = n => { const d = new Date(); d.setDate(d.getDate() + n); return dayKey(d); };
  const INT = [0, 1, 3, 7, 16, 35]; // aralıqlı təkrar: səviyyəyə görə günlər
  let CARDS = [], CARD = {};
  function logAct(n = 1) { const t = today(); me.log[t] = (me.log[t] || 0) + n; }
  function schedule(id, ok) {
    const c = me.cards[id] || (me.cards[id] = { b: 0, due: today() });
    if (ok) { c.b = Math.min(c.b + 1, 5); c.due = addDays(INT[c.b]); }
    else { c.b = 0; c.due = addDays(1); }
  }
  function recordAnswer(cid, id, ok, snap) {
    const a = me.acc[cid] || (me.acc[cid] = [0, 0]); a[1]++; if (ok) a[0]++;
    if (CARD[id]) schedule(id, ok);
    if (!ok) me.miss[id] = Object.assign({ ts: Date.now(), fixed: false }, CARD[id] ? {} : { d: snap });
    else if (me.miss[id]) me.miss[id].fixed = true;
    logAct(); saveMe(); checkBadges();
  }
  function activateLesson(cid, l) {
    let n = 0;
    CARDS.forEach(c => { if (c.c === cid && c.l === l && !me.cards[c.id]) { me.cards[c.id] = { b: 0, due: today() }; n++; } });
    if (n) saveMe();
  }
  const dueIds = () => Object.keys(me.cards).filter(id => CARD[id] && me.cards[id].due <= today())
    .sort((x, y) => me.cards[x].b - me.cards[y].b || (me.cards[x].due < me.cards[y].due ? -1 : 1));
  const openMiss = () => Object.keys(me.miss).filter(id => !me.miss[id].fixed && (CARD[id] || me.miss[id].d));
  const cardData = id => CARD[id] || (me.miss[id] && me.miss[id].d);

  const COURSE_BADGES = { mentiq: ['🧩', 'Məntiqçi'], claudecode: ['❯', 'Claude ustası'], felsefe: ['🏛️', 'Filosof'], reqemsal: ['⚡', 'Transformator'], kvant: ['⚛️', 'Kvant düşüncəli'], si: ['🤖', 'Sİ bələdçisi'], agent: ['⚙️', 'Agent memarı'], caio: ['♛', 'Sİ lideri'], kripto: ['🔑', 'Kriptoqraf'], kiber: ['🛡️', 'Kiber qoruyucu'] };
  function badgeList() {
    const L = [
      ['ilk', '🌱', 'İlk addım', 'İlk dərsi tamamla', s => s.lessons >= 1],
      ['on', '📚', 'Kitabsevər', '10 dərs tamamla', s => s.lessons >= 10],
      ['elli', '🏛️', 'Alim', '50 dərs tamamla', s => s.lessons >= 50],
      ['yuz', '🌟', 'Akademik', '100 dərs tamamla', s => s.lessons >= 100],
      ['kurs1', '🎓', 'Məzun', 'İlk kursu bitir', s => s.courses >= 1],
      ['kurs3', '🏅', 'Çoxyönlü', '3 kurs bitir', s => s.courses >= 3],
      ['kursall', '👑', 'Hər şeyi bilən', 'Bütün kursları bitir', s => s.courses >= s.totalCourses],
      ['s3', '🔥', 'Alov', '3 gün ardıcıl öyrən', s => s.streak >= 3],
      ['s7', '🔥', 'Həftəlik alov', '7 gün ardıcıl öyrən', s => s.streak >= 7],
      ['s30', '☄️', 'Dəmir iradə', '30 gün ardıcıl öyrən', s => s.streak >= 30],
      ['r50', '🧠', 'Yaddaş ustası', '50 kart təkrar et', s => s.reviews >= 50],
      ['r300', '🏋️', 'Yaddaş çempionu', '300 kart təkrar et', s => s.reviews >= 300],
      ['m20', '💎', 'Möhkəm bilik', '20 kartı 3-cü səviyyəyə çatdır', s => s.mastered >= 20],
      ['perfect', '💯', 'Mükəmməl', 'Yekun imtahanı səhvsiz keç', s => s.perfect >= 1],
      ['fix10', '🩹', 'Səhvlərdən öyrənən', '10 səhvi düzəlt', s => s.fixed >= 10],
      ['mark', '📌', 'Kolleksiyaçı', 'İlk əlfəcini əlavə et', s => s.marks >= 1],
      ['kk', '🧩', 'Tapmaca ustası', 'Bütün cəngavər-yalançı tapmacalarını həll et', s => s.kk >= 5],
    ];
    catalog.forEach(c => { const [ic, n] = COURSE_BADGES[c.id] || ['🎖️', c.title]; L.push(['c-' + c.id, ic, n, `“${c.title}” kursunu bitir`, s => s.done[c.id]]); });
    return L;
  }
  function badgeStats() {
    const done = {}; catalog.forEach(c => { done[c.id] = doneCount(c.id) >= c.lessons; });
    return {
      lessons: catalog.reduce((s, c) => s + doneCount(c.id), 0), courses: Object.values(done).filter(Boolean).length, totalCourses: catalog.length,
      streak: streak(), reviews: me.reviews || 0, mastered: Object.values(me.cards).filter(c => c.b >= 3).length, perfect: Object.keys(me.perfect).length,
      fixed: Object.values(me.miss).filter(m => m.fixed).length, marks: me.marks.length, kk: Object.keys(((prog.mentiq || {}).extra || {}).kk || {}).length, done,
    };
  }
  function checkBadges() {
    if (!catalog.length) return;
    const s = badgeStats(), fresh = [];
    badgeList().forEach(([id, ic, n, , test]) => { if (!me.badges[id] && test(s)) { me.badges[id] = Date.now(); fresh.push(ic + ' ' + n); } });
    if (fresh.length) { saveMe(); setTimeout(() => { toast('🏅 Yeni nişan: ' + fresh.join(', ')); celebrate(false); }, 900); }
  }

  // ---------- cloud sync ----------
  const SYNC = {
    local: ['Yalnız bu cihazda', ''], connecting: ['Qoşulur…', ''], cloud: ['Buludda saxlanılır', 'cloud'],
    slow: ['Bulud cavab vermir', 'error'], error: ['Sinxron xətası', 'error'],
  };
  function setSync(s) { const el = $('#sync'); el.textContent = SYNC[s][0]; el.className = 'sync ' + SYNC[s][1]; }

  function scheduleRemote(cid) {
    if (!refs[cid]) return;
    clearTimeout(timers[cid]);
    timers[cid] = setTimeout(() => flush(cid), 1200);
  }
  async function flush(cid, retried) {
    if (!refs[cid]) return;
    if (writing[cid]) { dirty[cid] = true; return; }
    writing[cid] = true;
    try {
      await refs[cid].set(JSON.parse(JSON.stringify(prog[cid])));
    } catch (e) {
      if (e && e.code === 'unavailable' && !retried) { writing[cid] = false; setTimeout(() => flush(cid, true), 1000 + Math.random() * 1500); return; }
      setSync('error');
    }
    writing[cid] = false;
    if (dirty[cid]) { dirty[cid] = false; flush(cid); }
  }

  async function connect() {
    const c = window.claude;
    if (!c || typeof c.use !== 'function') return setSync('local');
    setSync('connecting');
    const [d, u] = await Promise.all([c.use('db'), c.use('user')]);
    const id = u ? await u.id() : null;
    if (!d || !id) return setSync('local');
    db = d; uid = id;
    catalog.forEach(course => subscribe(course.id));
  }

  function subscribe(cid) {
    const ref = db.collection('data/users/' + uid).doc(cid);
    refs[cid] = ref;
    const slow = setTimeout(() => setSync('slow'), 10000);
    ref.onSnapshot(snap => {
      if (!snap.metadata.fromCache) { clearTimeout(slow); setSync('cloud'); }
      if (snap.metadata.hasPendingWrites) return;
      const remote = snap.exists ? snap.data() : null;
      const merged = remote ? merge(prog[cid], remote) : prog[cid];
      const localChanged = canon(merged) !== canon(prog[cid]);
      prog[cid] = merged;
      saveLocal(cid);
      if (!snap.metadata.fromCache && (!remote || canon(merged) !== canon(remote))) scheduleRemote(cid);
      if (localChanged) refreshChrome();
    }, err => {
      clearTimeout(slow);
      refs[cid] = null;
      setSync(err && err.code === 'revoked' ? 'local' : 'error');
    });
  }

  // ---------- helpers ----------
  const doneCount = cid => Object.keys(prog[cid].done).length;
  const pctOf = cid => Math.round(100 * doneCount(cid) / (byId[cid].lessons || 1));
  function streak() {
    const all = new Set();
    catalog.forEach(c => (prog[c.id].days || []).forEach(d => all.add(d)));
    Object.keys(me.log).forEach(d => all.add(d));
    const d = new Date();
    if (!all.has(dayKey(d))) d.setDate(d.getDate() - 1);
    let n = 0;
    while (all.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  let toastT;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2600);
  }

  // ---------- visuals ----------
  const art = (name, cls) => `<svg class="art ${cls || ''}" viewBox="0 0 120 120" aria-hidden="true">${(window.ILL && (ILL[name] || ILL.books)) || ''}</svg>`;
  const cvars = c => `--c:${c.color || '#0e6b62'};--c2:${c.color2 || '#2d55b3'}`;
  function celebrate(big) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = document.createElement('div'); box.className = 'confetti';
    const cols = ['#f0b44c', '#4fc3b2', '#ff8a7a', '#6ea8ff', '#a68bff', '#5bd08f'];
    for (let i = 0; i < (big ? 90 : 40); i++) {
      const e = document.createElement('i');
      e.style.left = Math.random() * 100 + 'vw';
      e.style.background = cols[i % cols.length];
      e.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
      e.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
      e.style.animationDelay = Math.random() * 0.4 + 's';
      e.style.animationDuration = 1.3 + Math.random() * 1.1 + 's';
      box.appendChild(e);
    }
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3200);
  }

  // ---------- home ----------
  function renderHome() {
    const h = new Date().getHours();
    $('#greetH').textContent = h < 5 ? 'Gecəniz xeyrə qalsın' : h < 12 ? 'Sabahınız xeyir' : h < 18 ? 'Günortanız xeyir' : 'Axşamınız xeyir';
    $('#crumb').innerHTML = '';

    const active = catalog.filter(c => prog[c.id].updated).sort((a, b) => prog[b.id].updated - prog[a.id].updated);
    const cont = active[0] || catalog[0];
    const box = $('#continueBox');
    if (cont) {
      const p = prog[cont.id], started = !!p.updated;
      box.innerHTML = `<div class="continue" style="${cvars(cont)}"><div class="mark">${art(cont.ill)}</div>
        <div><div class="label">${started ? 'Davam et' : 'Başla'}</div>
        <div class="what">${esc(cont.title)}</div>
        <div class="sub">${started ? `Dərs ${p.last + 1} · ${doneCount(cont.id)} / ${cont.lessons} tamamlanıb` : `${cont.lessons} dərs · ilk dərsdən başla`}</div></div>
        <a class="btn" href="#${cont.id}-${p.last + 1}">${started ? 'Davam et →' : 'Başla →'}</a></div>`;
    } else box.innerHTML = '';

    const total = catalog.reduce((s, c) => s + doneCount(c.id), 0);
    const all = catalog.reduce((s, c) => s + (c.lessons || 0), 0);
    const st = streak();
    $('#stats').innerHTML = [
      [total + ' / ' + all, 'tamamlanmış dərs', '📘', 'blue'],
      [st, 'gün ardıcıl', '🔥', 'amber'],
      [catalog.filter(c => doneCount(c.id) >= c.lessons).length + ' / ' + catalog.length, 'bitirilmiş kurs', '🎓', 'green'],
    ].map(([n, l, ic, col]) => `<div class="stat ${col}"><div class="ic">${ic}</div><div><div class="n">${n}</div><div class="l">${l}</div></div></div>`).join('');
    $('#greetArt').innerHTML = art('books');

    $('#shelfCount').textContent = catalog.length + ' kurs';
    $('#shelf').innerHTML = catalog.map(c => {
      const pc = pctOf(c.id);
      return `<a class="course-card" href="#${c.id}-${prog[c.id].last + 1}" style="${cvars(c)}">
        <div class="cover">${art(c.ill)}<span class="badge">${c.lessons} dərs</span></div>
        <div class="body"><h3>${esc(c.title)}</h3>
        <p>${esc(c.description || '')}</p>
        <div class="meter"><i style="width:${pc}%"></i></div>
        <div class="foot"><span>${doneCount(c.id)} / ${c.lessons} dərs</span><span>${pc === 100 ? '🎓 bitib' : pc + '%'}</span></div></div></a>`;
    }).join('') + `<div class="course-card add"><div class="cover">${art('star')}</div><div class="body"><h3>Yeni kurs</h3>
        <p>Claude ilə yeni sessiyada yaz: “Akademiyama … kursu əlavə et”. Kurs bu rəfdə görünəcək və irəliləyişin ayrıca saxlanılacaq.</p></div></div>`;
    renderToday(); renderPaths();
    renderAppBox();
  }

  function renderToday() {
    const due = dueIds().length, miss = openMiss().length, active = Object.keys(me.cards).length;
    $('#todayBox').innerHTML = `<div class="today">
      <div class="today-ic">🧠</div>
      <div><div class="label">Bugünkü təkrar</div>
      ${!CARDS.length ? '<div class="what">Kartlar yüklənir…</div>' : due ? `<div class="what">${due} kart təkrar gözləyir</div><div class="sub">təxminən ${Math.max(1, Math.round(Math.min(due, 15) * 0.4))} dəqiqə · aralıqlı təkrar unutmağa başladığınız anda xatırladır</div>`
        : active ? `<div class="what">Bu gün üçün təkrar yoxdur 🎉</div><div class="sub">${active} kart yaddaşınızdadır. Növbəti təkrar: ${nextDue()}</div>`
        : '<div class="what">Hələ kart yoxdur</div><div class="sub">Dərsləri tamamladıqca və testləri cavablandırdıqca hər dərsdən 3–5 təkrar kartı yaranacaq.</div>'}</div>
      ${due ? '<a class="btn" href="#tekrar">Təkrara başla →</a>' : miss ? '<a class="btn ghost" href="#sehvler">Səhvləri təkrarla</a>' : ''}</div>`;
    const tiles = [['sehvler', '🩹', 'Səhvlərim', miss], ['elfecinler', '📌', 'Əlfəcinlər', me.marks.length], ['luget', '📖', 'Lüğət', ''], ['statistika', '📊', 'Statistika', Object.keys(me.badges).length ? Object.keys(me.badges).length + ' nişan' : ''], ['axtar', '🔍', 'Axtarış', '']];
    $('#quickBox').innerHTML = tiles.map(([h, ic, n, c]) => `<a class="qt" href="#${h}"><span class="qi">${ic}</span><span>${n}</span>${c !== '' && c != null ? `<b>${c}</b>` : ''}</a>`).join('');
  }
  function nextDue() {
    const ds = Object.values(me.cards).map(c => c.due).filter(d => d > today()).sort();
    if (!ds.length) return '—';
    const d = new Date(ds[0] + 'T00:00:00'), diff = Math.round((d - new Date(today() + 'T00:00:00')) / 864e5);
    return diff === 1 ? 'sabah' : diff + ' gün sonra';
  }
  function renderPaths() {
    const paths = window.__paths || [];
    $('#pathsBox').innerHTML = paths.map(p => {
      const cs = p.courses.filter(id => byId[id]);
      const tot = cs.reduce((s, id) => s + byId[id].lessons, 0), dn = cs.reduce((s, id) => s + doneCount(id), 0);
      const next = cs.find(id => doneCount(id) < byId[id].lessons);
      const pc = tot ? Math.round(dn / tot * 100) : 0;
      return `<div class="path"><div class="path-h"><span class="path-ic">${esc(p.icon)}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div></div>
        <div class="steps">${cs.map((id, k) => { const c = byId[id], d = pctOf(id); return `${k ? '<span class="arr">→</span>' : ''}<a class="step ${d === 100 ? 'done' : ''}" href="#${id}-${prog[id].last + 1}" style="${cvars(c)}"><span class="dot">${d === 100 ? '✓' : k + 1}</span>${esc(c.title)}<small>${d}%</small></a>`; }).join('')}</div>
        <div class="meter"><i style="width:${pc}%"></i></div>
        <div class="path-f"><span>${dn} / ${tot} dərs · ${pc}%</span>${next ? `<a class="btn ghost" href="#${next}-${prog[next].last + 1}">${dn ? 'Davam et' : 'Başla'}: ${esc(byId[next].title)} →</a>` : '<b>🎓 Yol tamamlandı</b>'}</div></div>`;
    }).join('');
  }

  // ---------- səhifələr: təkrar, səhvlər, əlfəcinlər, lüğət, statistika, axtarış ----------
  const PAGES = { tekrar: 'Bugünkü təkrar', sehvler: 'Səhvlərim', elfecinler: 'Əlfəcinlər', luget: 'Lüğət', statistika: 'Statistika', axtar: 'Axtarış' };
  const loaded = {};
  const getJSON = f => loaded[f] || (loaded[f] = fetch(f).then(r => r.ok ? r.json() : []).catch(() => []));
  const chip = cid => byId[cid] ? `<span class="cchip" style="${cvars(byId[cid])}">${esc(byId[cid].title)}</span>` : '';
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const fold = s => String(s).toLocaleLowerCase('az').replace(/[əıöüşçğ]/g, c => ({ 'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g' }[c]));
  let reviewMode = 'due', rv = null, pendingMark = null;

  function renderPage(page) {
    const v = $('#pageView');
    $('#crumb').innerHTML = `<b>${PAGES[page]}</b>`;
    ({ tekrar: pageReview, sehvler: pageMistakes, elfecinler: pageMarks, luget: pageGlossary, statistika: pageStats, axtar: pageSearch })[page](v);
    window.scrollTo({ top: 0 });
  }
  function startReview(mode) { reviewMode = mode; rv = null; if (location.hash === '#tekrar') renderPage('tekrar'); else location.hash = 'tekrar'; }

  function pageReview(v) {
    if (!rv) {
      let ids;
      if (reviewMode === 'miss') ids = shuffle(openMiss()).slice(0, 15);
      else if (reviewMode === 'ahead') ids = Object.keys(me.cards).filter(id => CARD[id]).sort((x, y) => me.cards[x].due < me.cards[y].due ? -1 : 1).slice(0, 10);
      else ids = dueIds().slice(0, 15);
      rv = { ids, i: 0, ok: 0, answered: false };
    }
    if (!rv.ids.length) {
      const miss = openMiss().length, act = Object.keys(me.cards).length;
      v.innerHTML = `<div class="card"><h2>🧠 Bugünkü təkrar</h2><p class="lead">${act ? 'Bu gün üçün bütün təkrarlar tamamlanıb. Əla!' : 'Hələ təkrar kartınız yoxdur.'}</p>
        <p>${act ? `Yaddaşınızda ${act} kart var. Növbəti təkrar: <b>${nextDue()}</b>.` : 'Dərsləri tamamladıqca və testləri cavablandırdıqca hər dərsdən 3–5 kart yaranır. Onlar 1, 3, 7, 16 və 35 gündən sonra təkrar üçün qayıdacaq.'}</p>
        <div class="row">${miss ? `<button class="btn" id="rvMiss">Səhvlərimi təkrarla (${miss})</button>` : ''}${act ? '<button class="btn ghost" id="rvAhead">Qabaqcadan təkrar et</button>' : ''}<a class="btn ghost" href="#">Ana səhifə</a></div></div>`;
      const m = $('#rvMiss'); if (m) m.onclick = () => startReview('miss');
      const a = $('#rvAhead'); if (a) a.onclick = () => startReview('ahead');
      return;
    }
    if (rv.i >= rv.ids.length) {
      const all = rv.ok === rv.ids.length;
      v.innerHTML = `<div class="card rv-done"><div class="big">${all ? '🏆' : '✅'}</div><h2>Təkrar bitdi!</h2><p class="lead">${rv.ids.length} kartdan <b>${rv.ok}</b>-i düzgün.</p>
        <p>${all ? 'Mükəmməl! Bu kartlar daha uzun fasilədən sonra qayıdacaq.' : 'Səhv cavab verdiyiniz kartlar sabah yenidən qarşınıza çıxacaq. Səhvlər yaddaşı möhkəmləndirməyin bir hissəsidir.'}</p>
        <div class="row"><a class="btn" href="#">Ana səhifə</a>${openMiss().length ? '<button class="btn ghost" id="rvMiss2">Səhvlərimi təkrarla</button>' : ''}</div></div>`;
      if (all) celebrate(false);
      const m = $('#rvMiss2'); if (m) m.onclick = () => startReview('miss');
      checkBadges(); rv.finished = true;
      return;
    }
    const id = rv.ids[rv.i], c = cardData(id);
    if (!c) { rv.i++; return pageReview(v); }
    const order = shuffle(c.o.map((t, k) => k));
    const lvl = me.cards[id] ? me.cards[id].b : 0;
    v.innerHTML = `<div class="rv-top"><span>${rv.i + 1} / ${rv.ids.length}</span><div class="meter"><i style="width:${rv.i / rv.ids.length * 100}%"></i></div><span>✓ ${rv.ok}</span></div>
      <div class="card rv" style="${byId[c.c] ? cvars(byId[c.c]) : ''}">
        <div class="rv-meta">${chip(c.c)}<span class="fb">${esc(c.t || '')}${reviewMode === 'miss' ? ' · səhv' : ` · səviyyə ${lvl}/5`}</span></div>
        <div class="rv-q">${esc(c.q)}</div>
        <div class="opts rv-opts">${order.map(k => `<button data-k="${k}">${esc(c.o[k])}</button>`).join('')}</div>
        <div class="fb" id="rvFb"></div>
        <div class="row" id="rvNext" hidden><button class="btn" id="rvGo">Növbəti →</button><a class="btn ghost" href="#${c.c}-${c.l + 1}">Dərsə keç</a></div>
      </div>`;
    v.querySelectorAll('.rv-opts button').forEach(b => b.onclick = () => {
      if (rv.answered) return; rv.answered = true;
      const ok = +b.dataset.k === c.a; if (ok) rv.ok++;
      b.classList.add(ok ? 'right' : 'wrong'); v.querySelector(`.rv-opts button[data-k="${c.a}"]`).classList.add('right');
      me.reviews = (me.reviews || 0) + 1;
      recordAnswer(c.c, id, ok, c);
      const nb = me.cards[id];
      $('#rvFb').innerHTML = (ok ? '✅ Düzgün! ' : '❌ Səhv. ') + esc(c.e || '') + (nb ? `<br><small>Növbəti dəfə: ${nb.due === addDays(1) ? 'sabah' : Math.round((new Date(nb.due + 'T00:00:00') - new Date(today() + 'T00:00:00')) / 864e5) + ' gün sonra'}</small>` : '');
      $('#rvNext').hidden = false; $('#rvGo').focus();
    });
    $('#rvGo').onclick = () => { rv.i++; rv.answered = false; pageReview(v); window.scrollTo({ top: 0 }); };
  }

  function pageMistakes(v, showFixed) {
    const ids = Object.keys(me.miss).filter(id => cardData(id) && (showFixed || !me.miss[id].fixed)).sort((a, b) => me.miss[b].ts - me.miss[a].ts);
    const open = openMiss().length;
    v.innerHTML = `<div class="card"><h2>🩹 Səhvlərim</h2><p class="lead">Testlərdə və təkrarlarda səhv cavab verdiyiniz suallar. Düzgün cavab verəndə sual “düzəldilmiş” olur.</p>
      <div class="row">${open ? `<button class="btn" id="msRev">Bunları təkrarla (${open})</button>` : ''}<label class="fb" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="msFixed" ${showFixed ? 'checked' : ''}> Düzəldilmişləri də göstər</label></div></div>
      ${ids.length ? ids.map(id => { const c = cardData(id), m = me.miss[id]; return `<div class="card mis ${m.fixed ? 'fixed' : ''}"><div class="rv-meta">${chip(c.c)}<span class="fb">${esc(c.t || '')} · ${new Date(m.ts).toLocaleDateString('az')}${m.fixed ? ' · ✓ düzəldilib' : ''}</span></div>
        <div class="rv-q">${esc(c.q)}</div><div class="ans">✓ ${esc(c.o[c.a])}</div><div class="fb">${esc(c.e || '')}</div><a class="fb" href="#${c.c}-${c.l + 1}">Dərsə keç →</a></div>`; }).join('')
        : '<div class="card"><p>Səhv yoxdur. 🎉 Testləri cavablandırdıqca səhv etdiyiniz suallar burada toplanacaq.</p></div>'}`;
    const r = $('#msRev'); if (r) r.onclick = () => startReview('miss');
    $('#msFixed').onchange = e => pageMistakes(v, e.target.checked);
  }

  function pageMarks(v) {
    const groups = {};
    me.marks.slice().sort((a, b) => b.ts - a.ts).forEach(m => (groups[m.c] = groups[m.c] || []).push(m));
    v.innerHTML = `<div class="card"><h2>📌 Əlfəcinlər</h2><p class="lead">Dərslərdəki istənilən nümunə və ya qeyd blokunda ☆ işarəsinə basaraq onu burada saxlayın.</p></div>` +
      (me.marks.length ? Object.entries(groups).map(([cid, list]) => `<div class="card"><h3>${chip(cid)}</h3>${list.map(m => `<div class="mk"><div><b>${esc(m.tag)}</b> <span class="fb">· ${esc(m.t)}</span><p>${esc(m.s)}</p></div>
        <div class="row"><button class="btn ghost mk-open" data-id="${esc(m.id)}">Aç</button><button class="iconbtn mk-del" data-id="${esc(m.id)}" title="Sil">✕</button></div></div>`).join('')}</div>`).join('')
        : '<div class="card"><p>Hələ əlfəcin yoxdur.</p></div>');
    v.querySelectorAll('.mk-open').forEach(b => b.onclick = () => { const m = me.marks.find(x => x.id === b.dataset.id); pendingMark = m.id; location.hash = `${m.c}-${m.l + 1}`; });
    v.querySelectorAll('.mk-del').forEach(b => b.onclick = () => { me.marks = me.marks.filter(x => x.id !== b.dataset.id); saveMe(); pageMarks(v); });
  }
  function toggleMark(id, cid, l, block, btn) {
    const k = me.marks.findIndex(m => m.id === id);
    if (k >= 0) { me.marks.splice(k, 1); btn.classList.remove('on'); btn.textContent = '☆'; toast('Əlfəcin silindi'); }
    else {
      const tag = ((block.querySelector('.tag') || {}).textContent || (block.classList.contains('note') ? 'Qeyd' : 'Nümunə')).replace(/^[^\wƏəÇçŞşĞğÖöÜüİı“"]+/u, '').trim();
      const txt = block.textContent.replace(block.querySelector('.tag') ? block.querySelector('.tag').textContent : '', '').replace(/[☆★]/g, '').replace(/\s+/g, ' ').trim();
      me.marks.push({ id, c: cid, l, t: (lessonEls[l] || {}).dataset ? lessonEls[l].dataset.title : '', tag: tag.slice(0, 80), s: txt.slice(0, 220) + (txt.length > 220 ? '…' : ''), ts: Date.now() });
      btn.classList.add('on'); btn.textContent = '★'; toast('📌 Əlfəcinlərə əlavə olundu');
    }
    saveMe(); checkBadges();
  }

  async function pageGlossary(v) {
    v.innerHTML = '<div class="card">Lüğət yüklənir…</div>';
    const G = (await getJSON('data/glossary.json')).slice().sort((a, b) => a.t.localeCompare(b.t, 'az'));
    const letter = t => t.charAt(0).toLocaleUpperCase('az');
    const letters = [...new Set(G.map(g => letter(g.t)))];
    v.innerHTML = `<div class="card"><h2>📖 Lüğət</h2><p class="lead">${G.length} termin, hər biri öz dərsinə bağlıdır.</p>
      <input type="text" id="glQ" placeholder="Termin axtar…" style="font-family:var(--sans)"><div class="letters">${letters.map(l => `<a href="#luget" data-l="${esc(l)}">${esc(l)}</a>`).join('')}</div></div><div id="glList"></div>`;
    const draw = q => {
      const f = fold(q || ''), list = G.filter(g => !f || fold(g.t + ' ' + g.d).includes(f));
      let cur = '', h = '';
      list.forEach(g => { const L = letter(g.t); if (L !== cur) { if (cur) h += '</div>'; cur = L; h += `<div class="card gl-sec" id="gl-${esc(L)}"><h3 class="gl-l">${esc(L)}</h3>`; }
        h += `<div class="gl"><b>${esc(g.t)}</b><span>${esc(g.d)}</span><a href="#${g.c}-${g.l + 1}">${chip(g.c)}</a></div>`; });
      $('#glList').innerHTML = (h ? h + '</div>' : '<div class="card"><p>Heç nə tapılmadı.</p></div>');
    };
    $('#glQ').oninput = e => draw(e.target.value);
    v.querySelectorAll('[data-l]').forEach(a => a.onclick = e => { e.preventDefault(); $('#glQ').value = ''; draw(''); const s = document.getElementById('gl-' + a.dataset.l); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    draw('');
  }

  async function pageSearch(v) {
    v.innerHTML = `<div class="card"><h2>🔍 Axtarış</h2><input type="text" id="srQ" placeholder="Məsələn: Bayes, fişinq, kubit…" style="font-family:var(--sans);font-size:1.05rem" autocomplete="off"><p class="fb">Bütün ${catalog.reduce((s, c) => s + c.lessons, 0)} dərsdə və lüğətdə axtarır. “ş, ə, ı” hərfləri olmadan da yaza bilərsiniz.</p></div><div id="srOut"></div>`;
    const inp = $('#srQ'); inp.focus();
    const [S, G] = await Promise.all([getJSON('data/search.json'), getJSON('data/glossary.json')]);
    const FS = S.map(x => ({ x, ft: fold(x.t), fx: fold(x.x) }));
    let t;
    const run = () => {
      const q = inp.value.trim(), f = fold(q);
      if (f.length < 2) { $('#srOut').innerHTML = ''; return; }
      const g = G.filter(x => fold(x.t).includes(f)).slice(0, 6);
      const res = FS.map(r => { let n = 0, i = -1; while ((i = r.fx.indexOf(f, i + 1)) >= 0 && n < 50) n++; return [r, n + (r.ft.includes(f) ? 20 : 0)]; }).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 30);
      const snip = r => { const i = r.fx.indexOf(f); if (i < 0) return esc(r.x.x.slice(0, 160)) + '…'; const a = Math.max(0, i - 70), b = Math.min(r.x.x.length, i + f.length + 90);
        return (a ? '…' : '') + esc(r.x.x.slice(a, i)) + '<mark>' + esc(r.x.x.slice(i, i + f.length)) + '</mark>' + esc(r.x.x.slice(i + f.length, b)) + (b < r.x.x.length ? '…' : ''); };
      $('#srOut').innerHTML = (g.length ? `<div class="card"><h3>📖 Lüğətdə</h3>${g.map(x => `<div class="gl"><b>${esc(x.t)}</b><span>${esc(x.d)}</span><a href="#${x.c}-${x.l + 1}">${chip(x.c)}</a></div>`).join('')}</div>` : '') +
        (res.length ? `<div class="card"><h3>📚 Dərslərdə (${res.length})</h3>${res.map(([r]) => `<a class="sr" href="#${r.x.c}-${r.x.l + 1}"><div>${chip(r.x.c)} <b>${r.x.l + 1}. ${esc(r.x.t)}</b></div><p>${snip(r)}</p></a>`).join('')}</div>` : (g.length ? '' : '<div class="card"><p>Heç nə tapılmadı. Başqa söz sınayın.</p></div>'));
    };
    inp.oninput = () => { clearTimeout(t); t = setTimeout(run, 150); };
    if (inp.value) run();
  }

  function pageStats(v) {
    const s = badgeStats(), days = [];
    for (let k = 83; k >= 0; k--) { const d = new Date(); d.setDate(d.getDate() - k); const key = dayKey(d); let n = me.log[key] || 0; if (!n && catalog.some(c => (prog[c.id].days || []).includes(key))) n = 1; days.push([key, n, d]); }
    const last7 = days.slice(-7), mx = Math.max(1, ...last7.map(d => d[1])), mxAll = Math.max(1, ...days.map(d => d[1]));
    const DN = ['B.', 'B.e.', 'Ç.a.', 'Ç.', 'C.a.', 'C.', 'Ş.'];
    const accs = catalog.map(c => { const a = me.acc[c.id] || [0, 0]; return [c, a[1] ? a[0] / a[1] : null, a[1]]; }).filter(x => x[2] >= 5).sort((a, b) => b[1] - a[1]);
    const earned = badgeList().filter(b => me.badges[b[0]]).length;
    v.innerHTML = `<div class="card"><h2>📊 Statistika</h2>
      <div class="kp">${[[s.lessons, 'tamamlanmış dərs'], [s.courses + ' / ' + s.totalCourses, 'bitirilmiş kurs'], [s.streak, 'gün ardıcıl'], [s.reviews, 'kart təkrarı'], [s.mastered, 'möhkəm kart (səviyyə 3+)'], [earned, 'nişan']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div></div>
      <div class="card"><h3>Son 7 gün</h3><div class="b7">${last7.map(([k, n, d]) => `<div><span class="n">${n || ''}</span><i style="height:${n / mx * 100}%"></i><small>${DN[d.getDay()]}</small></div>`).join('')}</div>
      <h3 style="margin-top:16px">Son 12 həftə</h3><div class="heat">${days.map(([k, n]) => `<i title="${k}: ${n}" style="opacity:${n ? 0.25 + 0.75 * n / mxAll : 1};${n ? '' : 'background:var(--line)'}"></i>`).join('')}</div>
      <p class="fb">Hər xana bir gündür. Rəng tündləşdikcə həmin gün daha çox dərs, test və təkrar edilib.</p></div>
      <div class="card"><h3>Kurslar üzrə dəqiqlik</h3>${accs.length ? `${accs.map(([c, a, n]) => `<div class="acc"><span>${esc(c.title)}</span><div class="t"><i style="width:${a * 100}%;${cvars(c)}"></i></div><b>${Math.round(a * 100)}%</b><small>${n} cavab</small></div>`).join('')}
        ${accs.length > 1 ? `<p>💪 Ən güclü: <b>${esc(accs[0][0].title)}</b> · 🎯 Diqqət tələb edir: <b>${esc(accs[accs.length - 1][0].title)}</b></p>` : ''}` : '<p class="fb">Dəqiqlik ən azı 5 cavabdan sonra görünəcək.</p>'}</div>
      <div class="card"><h3>Kurslar üzrə irəliləyiş</h3>${catalog.map(c => `<div class="acc"><span>${esc(c.title)}</span><div class="t"><i style="width:${pctOf(c.id)}%;${cvars(c)}"></i></div><b>${pctOf(c.id)}%</b><small>${doneCount(c.id)} / ${c.lessons}</small></div>`).join('')}</div>
      <div class="card"><h3>🏅 Nişanlar (${earned} / ${badgeList().length})</h3><div class="bdg">${badgeList().map(([id, ic, n, d]) => `<div class="${me.badges[id] ? 'on' : ''}"><span>${ic}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join('')}</div></div>`;
  }

  // ---------- şrift ölçüsü və səsli oxu ----------
  const FS = [16, 17.5, 19, 15];
  const applyFs = px => { document.documentElement.style.fontSize = px + 'px'; };
  applyFs(lsGet('akademiya:fs') || 16);
  $('#fontBtn').onclick = () => { const cur = lsGet('akademiya:fs') || 16, nx = FS[(FS.indexOf(cur) + 1) % FS.length]; lsSet('akademiya:fs', nx); applyFs(nx); toast('Şrift ölçüsü: ' + Math.round(nx / 16 * 100) + '%'); };
  $('#searchBtn').onclick = () => { location.hash = 'axtar'; };

  const lessonText = s => {
    const c = s.cloneNode(true);
    c.querySelectorAll('.quiz, .quiz-card, button, svg, style, script, .bm, .tts, table, input, select, textarea, .credit, .kicker').forEach(e => e.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
  };
  let speaking = null;
  function stopSpeak() { if (window.speechSynthesis) speechSynthesis.cancel(); if (speaking) { speaking.btn.textContent = '🔊 Dinlə'; speaking = null; } }
  function speak(s, btn) {
    if (speaking) { const same = speaking.btn === btn; stopSpeak(); if (same) return; }
    const voices = speechSynthesis.getVoices();
    const v = voices.find(x => /^az/i.test(x.lang)) || voices.find(x => /^tr/i.test(x.lang));
    if (!v) toast('Cihazınızda Azərbaycan səsi tapılmadı: standart səslə oxunur');
    else if (!/^az/i.test(v.lang)) toast('Azərbaycan səsi tapılmadı: türk səsi ilə oxunur');
    const parts = lessonText(s).match(/[^.!?…]+[.!?…]*\s*/g) || [];
    const chunks = []; let buf = '';
    parts.forEach(p => { if ((buf + p).length > 220 && buf) { chunks.push(buf); buf = ''; } buf += p; }); if (buf) chunks.push(buf);
    speaking = { btn }; btn.textContent = '⏹ Dayandır';
    chunks.forEach((t, k) => {
      const u = new SpeechSynthesisUtterance(t); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'az-AZ';
      if (k === chunks.length - 1) u.onend = () => { if (speaking && speaking.btn === btn) { btn.textContent = '🔊 Dinlə'; speaking = null; } };
      speechSynthesis.speak(u);
    });
  }

  // ---------- Claude-dan soruş (yalnız claude.ai versiyasında) ----------
  let sampleFn = null, askCtl = null;
  function setupAsk(i) {
    const card = $('#askCard'); card.hidden = !sampleFn; if (!sampleFn) return;
    $('#askOut').textContent = ''; $('#askQ').value = '';
    $('#askBtn').onclick = async () => {
      const q = $('#askQ').value.trim(); if (!q) { $('#askQ').focus(); return; }
      const s = lessonEls[i], txt = lessonText(s).slice(0, 6000), c = byId[curCid];
      const prompt = `Sən “Şəxsi Akademiya” öyrənmə tətbiqində Azərbaycan dilində dərs deyən köməkçisən. Tələbə “${c.title}” kursunun “${s.dataset.title}” dərsini oxuyur.\n\nDƏRSİN MƏTNİ:\n${txt}\n\nTƏLƏBƏNİN SUALI:\n${q}\n\nYalnız Azərbaycan dilində, sadə və aydın cavab ver. Mümkünsə gündəlik həyatdan qısa nümunə gətir. Cavab 200 sözdən çox olmasın. Dərsdə olmayan məlumat əlavə edirsənsə, bunu qeyd et. Markdown başlıqları işlətmə.`;
      askCtl = new AbortController();
      $('#askOut').textContent = 'Claude düşünür…'; $('#askBtn').disabled = true; $('#askStop').hidden = false;
      try {
        const r = await sampleFn(prompt, { signal: askCtl.signal, onText: ({ text }) => { $('#askOut').textContent = text; } });
        $('#askOut').textContent = r.text; logAct(); saveMe();
      } catch (e) {
        const code = e && e.code;
        $('#askOut').textContent = code === 'not_granted' ? 'Claude-a sual vermək icazəsi verilmədi.' : code === 'rate_limited' ? 'Çox sayda sorğu göndərildi. Bir az sonra yenidən cəhd edin.' : (e && (e.name === 'AbortError' || code === 'aborted')) ? ((e.text ? e.text + '\n\n' : '') + '⏹ Dayandırıldı.') : 'Cavab alınmadı. Yenidən cəhd edin.';
        if (code === 'not_granted') { sampleFn = null; }
      }
      $('#askBtn').disabled = false; $('#askStop').hidden = true;
    };
    $('#askStop').onclick = () => { if (askCtl) askCtl.abort(); };
  }

  // ---------- install as app + backup ----------
  const PWA_URL = 'https://tardigrade23.github.io/akademiya/';
  const inClaude = !!(window.claude && typeof window.claude.use === 'function');
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let installEvt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; if (!curCid) renderAppBox(); });
  window.addEventListener('appinstalled', () => { installEvt = null; toast('Akademiya quraşdırıldı'); if (!curCid) renderAppBox(); });
  if (!inClaude && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  function renderAppBox() {
    const box = $('#appBox'); if (!box) return;
    let install = '';
    if (inClaude) {
      install = `<div class="tool"><h3>📱 Telefona tətbiq kimi quraşdır</h3>
        <p>Quraşdırıla bilən versiya bu ünvandadır. Telefonda brauzerlə aç və “Ana ekrana əlavə et” seç:</p>
        <p><a href="${PWA_URL}" target="_blank" rel="noopener">${PWA_URL.replace('https://', '')}</a></p></div>`;
    } else if (!standalone()) {
      const how = isIOS
        ? 'Safari-də aşağıdakı <b>Paylaş</b> düyməsinə (kvadrat və ox) bas, sonra <b>“Ana ekrana əlavə et”</b> (Add to Home Screen) seç.'
        : 'Brauzer menyusunu (⋮) aç və <b>“Tətbiqi quraşdır”</b> və ya <b>“Ana ekrana əlavə et”</b> seç.';
      install = `<div class="tool"><h3>📱 Telefona tətbiq kimi quraşdır</h3>
        ${installEvt ? '<p>Bir kliklə ana ekrana əlavə et. Akademiya ayrıca tətbiq kimi, internetsiz də açılacaq.</p><button class="btn" id="installBtn">Quraşdır</button>' : `<p>${how} Akademiya ayrıca tətbiq kimi açılacaq, dərslər internetsiz də işləyəcək.</p>`}</div>`;
    }
    const backup = `<div class="tool"><h3>💾 Yedək nüsxə</h3>
      <p>İrəliləyiş və qeydlər ${inClaude ? 'hesabında' : 'bu cihazda'} saxlanılır. Başqa cihaza keçirmək və ya qorumaq üçün faylda saxla.</p>
      <div class="row">${inClaude ? '' : '<button class="btn ghost" id="exportBtn">Faylda saxla</button>'}
      <label class="btn ghost" for="importFile">Fayldan bərpa et</label><input type="file" id="importFile" accept="application/json,.json" hidden></div></div>`;
    box.innerHTML = install + backup;
    const ib = $('#installBtn');
    if (ib) ib.onclick = async () => { const e = installEvt; installEvt = null; e.prompt(); await e.userChoice.catch(() => {}); renderAppBox(); };
    const eb = $('#exportBtn');
    if (eb) eb.onclick = () => {
      const data = { app: 'akademiya', version: 2, exported: new Date().toISOString(), progress: prog, me };
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const a = document.createElement('a'); a.href = url; a.download = `akademiya-yedek-${today()}.json`;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Yedək fayl hazırlandı');
    };
    $('#importFile').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (data.app !== 'akademiya' || !data.progress) throw new Error('format');
        let n = 0;
        for (const [cid, rec] of Object.entries(data.progress)) {
          if (!byId[cid] || !rec) continue;
          prog[cid] = merge(prog[cid], Object.assign(blank(), rec));
          saveLocal(cid); scheduleRemote(cid); n++;
        }
        if (isObj(data.me)) { mergeMe(data.me); n++; }
        toast(n ? 'İrəliləyiş bərpa olundu' : 'Faylda bu kurslar üçün məlumat yoxdur');
        renderHome();
      } catch (err) { toast('Bu fayl Akademiya yedəyi deyil'); }
      e.target.value = '';
    };
  }

  function mergeMe(o) {
    for (const [id, c] of Object.entries(o.cards || {})) if (!me.cards[id] || c.b > me.cards[id].b) me.cards[id] = c;
    for (const [id, m] of Object.entries(o.miss || {})) if (!me.miss[id] || m.ts > me.miss[id].ts) me.miss[id] = m;
    for (const [d, n] of Object.entries(o.log || {})) me.log[d] = Math.max(me.log[d] || 0, n);
    for (const [cid, a] of Object.entries(o.acc || {})) { const b = me.acc[cid] || [0, 0]; if (a[1] > b[1]) me.acc[cid] = a; }
    Object.assign(me.badges, o.badges || {}); Object.assign(me.perfect, o.perfect || {});
    (o.marks || []).forEach(m => { if (!me.marks.some(x => x.id === m.id)) me.marks.push(m); });
    me.reviews = Math.max(me.reviews || 0, o.reviews || 0);
    saveMe();
  }

  // ---------- course mounting ----------
  let mounted = null, mounting = null, unmountFns = [], lessonEls = [], current = 0;
  function loadScript(cid) {
    if (registry[cid]) return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = `courses/${cid}/course.js`;
      s.onload = () => res(); s.onerror = () => rej(new Error('script'));
      document.body.appendChild(s);
    });
  }
  function unmount() {
    unmountFns.forEach(fn => { try { fn(); } catch (e) {} });
    unmountFns = []; lessonEls = []; mounted = null;
    $('#lessonHost').innerHTML = '';
  }
  function mount(cid) {
    if (mounted === cid) return Promise.resolve();
    if (mounting && mounting.cid === cid) return mounting.p;
    unmount();
    const host = $('#lessonHost');
    host.innerHTML = '<div class="card">Dərslər yüklənir…</div>';
    const p = (async () => {
      const r = await fetch(`courses/${cid}/lessons.html`);
      if (!r.ok) throw new Error('lessons');
      host.innerHTML = await r.text();
      lessonEls = [...host.querySelectorAll('section.lesson')];
      lessonEls.forEach((s, i) => { s.dataset.idx = i; });
      decorate(cid);
      mounted = cid;
      await loadScript(cid);
      registry[cid](makeApi(cid));
    })();
    mounting = { cid, p };
    return p.catch(e => {
      console.error(e);
      host.innerHTML = '<div class="card"><h3>Kurs açılmadı</h3><p>Kursun faylları yüklənmədi. Səhifəni yeniləyib yenidən cəhd et.</p></div>';
    }).finally(() => { mounting = null; });
  }

  // Lesson headers become coloured, illustrated heroes; example blocks get a colour by kind;
  // pictures get their licence credits and a graceful fallback when the file is missing.
  function decorate(cid) {
    const c = byId[cid], parts = c.parts || {}, host = $('#lessonHost');
    let part = '';
    lessonEls.forEach((s, i) => {
      if (parts[i]) part = parts[i];
      const card = s.querySelector('.card'), h2 = card && card.querySelector('h2');
      if (!h2) return;
      const hero = document.createElement('div'); hero.className = 'hero';
      hero.innerHTML = `<div class="hero-txt"><div class="kicker"><span>Dərs ${i + 1} / ${lessonEls.length}</span>${part ? `<span>${esc(part)}</span>` : ''}</div>
        <h2>${esc(h2.textContent.replace(/^\s*\d+\.\s*/, ''))}</h2></div>${art(s.dataset.ill || c.ill)}`;
      h2.remove();
      s.insertBefore(hero, s.firstChild);
    });
    host.querySelectorAll('.ex').forEach(ex => {
      const t = ((ex.querySelector('.tag') || {}).textContent || '').toLowerCase();
      if (ex.classList.contains('warn') || /⚠/.test(t)) ex.classList.add('warn');
      else if (/addım|həll/.test(t)) ex.classList.add('step');
      else if (/tətbiq|həyatda|praktik|məşq|siz bunu|gündəlik/.test(t)) ex.classList.add('life');
      else if (/düşüncə təcrübəsi|tarix|rəvayət|hekayə/.test(t)) ex.classList.add('hist');
    });
    lessonEls.forEach((s, i) => {
      s.querySelectorAll('.ex, .note').forEach((blk, k) => {
        const id = `${cid}:${i}:${k}`, on = me.marks.some(m => m.id === id);
        const b = document.createElement('button'); b.className = 'bm' + (on ? ' on' : ''); b.type = 'button';
        b.dataset.bm = id; b.title = 'Əlfəcinlərə əlavə et'; b.setAttribute('aria-label', 'Əlfəcin'); b.textContent = on ? '★' : '☆';
        b.onclick = () => toggleMark(id, cid, i, blk, b);
        blk.appendChild(b);
      });
      const ht = s.querySelector('.hero-txt');
      if (ht && 'speechSynthesis' in window) {
        const t = document.createElement('button'); t.className = 'tts'; t.type = 'button'; t.textContent = '🔊 Dinlə';
        t.onclick = () => speak(s, t); ht.appendChild(t);
      }
    });
    host.querySelectorAll('.quiz').forEach(q => { const card = q.closest('.card'); if (card) card.classList.add('quiz-card'); });
    const imgs = [...host.querySelectorAll('figure.pic img')];
    imgs.forEach(img => {
      const fail = () => img.closest('figure').classList.add('noimg');
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail(); else img.addEventListener('error', fail, { once: true });
    });
    const need = {};
    host.querySelectorAll('img[data-credit]').forEach(img => {
      const [course, key] = img.dataset.credit.includes('/') ? img.dataset.credit.split('/') : [cid, img.dataset.credit];
      (need[course] = need[course] || []).push([img, key]);
    });
    Object.entries(need).forEach(([course, list]) => {
      fetch(`courses/${course}/img/credits.json`).then(r => r.ok ? r.json() : {}).then(cr => {
        list.forEach(([img, key]) => {
          const k = cr[key], cap = img.closest('figure').querySelector('figcaption');
          if (!k || !cap) return;
          const a = document.createElement('a'); a.className = 'credit'; a.href = k.source; a.target = '_blank'; a.rel = 'noopener';
          a.textContent = `Şəkil: ${k.artist || 'naməlum müəllif'} · ${k.license} · Wikimedia Commons`;
          cap.appendChild(a);
        });
      }).catch(() => {});
    });
  }

  function makeApi(cid) {
    return {
      done(i) {
        if (prog[cid].done[i]) return;
        prog[cid].done[i] = true; touch(cid); renderSide();
        activateLesson(cid, i); logAct(); saveMe();
        const t = lessonEls[i] && lessonEls[i].dataset.title;
        const all = doneCount(cid) >= byId[cid].lessons;
        toast(all ? '🎓 Kurs bitdi: ' + byId[cid].title : 'Tamamlandı: ' + (t || 'Dərs ' + (i + 1)));
        celebrate(all);
        checkBadges();
      },
      cid,
      get: k => prog[cid].extra[k],
      set(k, v) { prog[cid].extra[k] = v; touch(cid); },
      quizzes(Q) { $('#lessonHost').querySelectorAll('.quiz').forEach(el => buildQuiz(el, Q, this)); },
      onUnmount(fn) { unmountFns.push(fn); },
      // Bir-bir göstərilən maddələri qruplara ayırma məşqi.
      // cfg: {items: [[mətn, qrupİndeksi, izah?]], bins: ['Qrup A', ...], done: dərsİndeksi, end: 'yekun mətn'}
      sorter(id, cfg) {
        const root = document.getElementById(id); if (!root) return;
        let i = 0, right = 0;
        root.innerHTML = `<div class="srt-item"></div><div class="srt-bins" style="grid-template-columns:repeat(${Math.min(cfg.bins.length, 3)},minmax(0,1fr))">${cfg.bins.map((b, k) => `<div class="srt-bin c${k % 5}"><h4>${esc(b)}</h4><div></div></div>`).join('')}</div><div class="srt-msg"></div>`;
        const item = root.querySelector('.srt-item'), msg = root.querySelector('.srt-msg'), bins = root.querySelectorAll('.srt-bin>div');
        const next = () => {
          if (i >= cfg.items.length) {
            item.innerHTML = '';
            msg.innerHTML = `<div class="msg ok">${right} / ${cfg.items.length} düzgün. ${cfg.end || ''}</div>`;
            if (cfg.done != null) this.done(cfg.done);
            return;
          }
          const [t] = cfg.items[i];
          item.innerHTML = `<div class="msg info" style="font-size:1.04rem"><b>${esc(t)}</b></div><div class="row" style="margin-top:8px">${cfg.bins.map((b, k) => `<button class="btn${k ? ' ghost' : ''}" data-k="${k}">${esc(b)}</button>`).join('')}</div>`;
          item.querySelectorAll('button').forEach(b => b.onclick = () => {
            const [t2, ok, why] = cfg.items[i], good = +b.dataset.k === ok; if (good) right++;
            const c = document.createElement('span'); c.className = 'srt-chip'; c.textContent = (good ? '' : '✗ ') + t2; bins[ok].appendChild(c);
            msg.innerHTML = good ? (why ? `<div class="fb">✓ ${esc(why)}</div>` : '') : `<div class="msg bad">“${esc(t2)}”: ${esc(cfg.bins[ok])}.${why ? ' ' + esc(why) : ''}</div>`;
            i++; next();
          });
        };
        next();
      },
      // Addımları düzgün sıraya düzmə məşqi. cfg: {steps: [...düzgün sıra...], done, ok, hint}
      order(id, cfg) {
        const root = document.getElementById(id); if (!root) return;
        let shown, picked;
        root.innerHTML = '<div class="ord-list"></div><div class="row" style="margin-top:8px"><button class="btn ord-check">Yoxla</button><button class="btn ghost ord-reset">Sıfırla</button></div><div class="ord-msg"></div>';
        const list = root.querySelector('.ord-list'), msg = root.querySelector('.ord-msg');
        const draw = () => {
          list.innerHTML = shown.map(k => { const p = picked.indexOf(k); return `<button data-k="${k}" class="${p >= 0 ? 'picked' : ''}"><span class="n">${p >= 0 ? p + 1 : ''}</span>${esc(cfg.steps[k])}</button>`; }).join('');
          list.querySelectorAll('button').forEach(b => b.onclick = () => { const k = +b.dataset.k, p = picked.indexOf(k); if (p >= 0) picked.splice(p, 1); else picked.push(k); draw(); });
        };
        const reset = () => { shown = cfg.steps.map((_, k) => k); do { shown.sort(() => Math.random() - .5); } while (shown.length > 1 && shown.every((v, k) => v === k)); picked = []; msg.innerHTML = ''; draw(); };
        root.querySelector('.ord-reset').onclick = reset;
        root.querySelector('.ord-check').onclick = () => {
          if (picked.length < cfg.steps.length) { msg.innerHTML = '<div class="msg info">Bütün addımlara nömrə verin.</div>'; return; }
          const wrong = picked.filter((v, k) => v !== k).length;
          msg.innerHTML = wrong ? `<div class="msg bad">${wrong} addım yerində deyil. ${esc(cfg.hint || '')}</div>` : `<div class="msg ok">✅ Düzgündür! ${esc(cfg.ok || '')}</div>`;
          if (!wrong && cfg.done != null) this.done(cfg.done);
        };
        reset();
      },
    };
  }

  // ---------- quizzes (shared) ----------
  function buildQuiz(el, QUIZ, api) {
    const key = el.dataset.quiz, qs = QUIZ[key], section = +el.closest('section').dataset.idx;
    if (!qs) return;
    el.innerHTML = '';
    let answered = 0, right = 0;
    qs.forEach((it, qi) => {
      const d = document.createElement('div'); d.className = 'q';
      d.innerHTML = `<div><b>${qi + 1}.</b> ${esc(it.q)}</div><div class="opts"></div><div class="fb"></div>`;
      const opts = d.querySelector('.opts'), fb = d.querySelector('.fb');
      it.o.forEach((o, oi) => {
        const b = document.createElement('button'); b.textContent = o;
        b.onclick = () => {
          if (d.dataset.done) return; d.dataset.done = 1; answered++;
          const ok = oi === it.a; if (ok) right++;
          const lt = (el.closest('section') || {}).dataset ? el.closest('section').dataset.title : '';
          recordAnswer(api.cid, `${api.cid}:${key}:${qi}`, ok, { q: it.q, o: it.o, a: it.a, e: it.e, c: api.cid, l: section, t: lt });
          b.classList.add(ok ? 'right' : 'wrong'); opts.children[it.a].classList.add('right');
          fb.innerHTML = (ok ? '✅ Düzgün! ' : '❌ Səhv. ') + esc(it.e);
          if (answered === qs.length) finish();
        };
        opts.appendChild(b);
      });
      el.appendChild(d);
    });
    const res = document.createElement('div'); el.appendChild(res);
    function finish() {
      const isFinal = key === 'final';
      const pass = right >= Math.ceil(qs.length * (isFinal ? 0.8 : 0.6));
      res.className = 'msg ' + (pass ? 'ok' : 'bad');
      res.innerHTML = `Nəticə: ${right} / ${qs.length}. ` + (pass ? (isFinal ? '🎓 Təbriklər! Kursu tamamladın.' : 'Dərs tamamlandı ✓') : 'Mövzunu yenidən oxu və təkrar cəhd et.') +
        ' <button class="btn ghost" style="margin-left:8px;padding:4px 10px">Yenidən</button>';
      res.querySelector('button').onclick = () => buildQuiz(el, QUIZ, api);
      if (isFinal && right === qs.length) { me.perfect[api.cid] = 1; saveMe(); }
      if (pass) api.done(section); else checkBadges();
    }
  }

  // ---------- course view ----------
  let curCid = null, notesMode = false;
  function renderSide() {
    if (!curCid || !lessonEls.length) return;
    const c = byId[curCid], p = prog[curCid], parts = c.parts || {};
    const nNotes = Object.keys(p.notes).length;
    let nav = '';
    lessonEls.forEach((s, i) => {
      if (parts[i]) nav += `<div class="part">${esc(parts[i])}</div>`;
      const cls = (!notesMode && i === current ? 'active ' : '') + (p.done[i] ? 'done' : '');
      nav += `<button class="${cls}" data-go="${i + 1}"><span class="num">${p.done[i] ? '✓' : i + 1}</span>${esc(s.dataset.title)}</button>`;
    });
    $('#side').innerHTML = `<div class="ctitle">${esc(c.title)}</div>
      <div class="meter"><i style="width:${pctOf(curCid)}%"></i></div>
      <div class="pct">${doneCount(curCid)} / ${c.lessons} dərs · ${pctOf(curCid)}%</div>
      <nav>${nav}</nav>
      <a class="notes-link" href="#${curCid}-qeydler">📝 Qeydlərim (${nNotes})</a>`;
    $('#side').querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { location.hash = curCid + '-' + b.dataset.go; }; });
    const act = $('#side nav button.active');
    if (act && window.matchMedia('(max-width:860px)').matches) act.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function showLesson(i) {
    notesMode = false;
    i = Math.max(0, Math.min(lessonEls.length - 1, i));
    current = i;
    lessonEls.forEach((s, j) => s.classList.toggle('show', j === i));
    $('#lessonHost').hidden = false; $('#notesView').hidden = true; $('#notesCard').hidden = false;
    const p = prog[curCid];
    if (p.last !== i) { p.last = i; touch(curCid); }
    $('#noteText').value = (p.notes[i] && p.notes[i].t) || '';
    $('#noteState').textContent = 'Qeydlər avtomatik saxlanılır.';
    $('#pager').innerHTML = (i > 0 ? `<a class="btn ghost" href="#${curCid}-${i}">← Əvvəlki</a>` : '<span></span>') +
      (i < lessonEls.length - 1 ? `<a class="btn" href="#${curCid}-${i + 2}">Növbəti →</a>` : `<a class="btn" href="#">Kurslara qayıt</a>`);
    $('#crumb').innerHTML = `<b>${esc(byId[curCid].title)}</b> · ${i + 1}. ${esc(lessonEls[i].dataset.title)}`;
    renderSide();
    window.scrollTo({ top: 0 });
  }

  function showNotes() {
    notesMode = true;
    const p = prog[curCid];
    $('#lessonHost').hidden = true; $('#notesCard').hidden = true; $('#pager').innerHTML = '';
    const items = lessonEls.map((s, i) => p.notes[i] ? `<div class="note-item"><a href="#${curCid}-${i + 1}"><b>${i + 1}. ${esc(s.dataset.title)}</b></a>
        <span class="fb">· ${new Date(p.notes[i].ts).toLocaleDateString('az')}</span><pre>${esc(p.notes[i].t)}</pre></div>` : '').join('');
    const v = $('#notesView'); v.hidden = false;
    v.innerHTML = `<div class="card"><h2>Qeydlərim</h2><p class="lead">${esc(byId[curCid].title)} kursu üzrə bütün qeydlərin. Qeydi dəyişmək üçün dərsə keç.</p>
      ${items || '<p>Hələ qeyd yoxdur. Hər dərsin altında “Qeydlərim” bölməsi var. Dərsi öz sözlərinlə 2–3 cümlədə yazmaq onu yadda saxlamağın ən yaxşı yoludur.</p>'}</div>`;
    $('#crumb').innerHTML = `<b>${esc(byId[curCid].title)}</b> · Qeydlər`;
    renderSide();
    window.scrollTo({ top: 0 });
  }

  let noteT;
  $('#noteText').addEventListener('input', () => {
    $('#noteState').textContent = 'Yazılır…';
    clearTimeout(noteT);
    const cid = curCid, i = current;
    noteT = setTimeout(() => {
      const t = $('#noteText').value.trim();
      if (t) prog[cid].notes[i] = { t, ts: Date.now() }; else delete prog[cid].notes[i];
      touch(cid);
      $('#noteState').textContent = 'Saxlanıldı ✓';
      renderSide();
    }, 700);
  });

  // ---------- routing ----------
  function parseHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (PAGES[h]) return { view: 'page', page: h };
    const m = h.match(/^([a-z0-9]+)(?:-(\d+|qeydler))?$/);
    if (!m || !byId[m[1]]) return { view: 'home' };
    if (m[2] === 'qeydler') return { view: 'notes', cid: m[1] };
    return { view: 'course', cid: m[1], lesson: m[2] ? +m[2] - 1 : null };
  }
  async function route() {
    const r = parseHash();
    stopSpeak();
    if (askCtl) askCtl.abort();
    if (r.view !== 'page' || r.page !== 'tekrar' || (rv && rv.finished)) rv = null;
    if (r.view === 'page') {
      curCid = null;
      $('#courseView').hidden = true; $('#home').hidden = true; $('#pageView').hidden = false;
      renderPage(r.page);
      return;
    }
    $('#pageView').hidden = true;
    if (r.view === 'home') {
      curCid = null;
      $('#courseView').hidden = true; $('#home').hidden = false;
      renderHome();
      return;
    }
    $('#home').hidden = true; $('#courseView').hidden = false;
    curCid = r.cid;
    $('#courseView').setAttribute('style', cvars(byId[r.cid]));
    await mount(r.cid);
    if (mounted !== r.cid || curCid !== r.cid) return;
    if (r.view === 'notes') { showNotes(); $('#askCard').hidden = true; return; }
    showLesson(r.lesson == null ? prog[r.cid].last : r.lesson);
    setupAsk(current);
    if (pendingMark) {
      const el = document.querySelector(`[data-bm="${pendingMark}"]`);
      pendingMark = null;
      if (el) { const blk = el.parentElement; setTimeout(() => { blk.scrollIntoView({ behavior: 'smooth', block: 'center' }); blk.classList.add('flash'); setTimeout(() => blk.classList.remove('flash'), 2200); }, 60); }
    }
  }
  function refreshChrome() {
    if (!$('#pageView').hidden) return;
    if (!curCid) renderHome(); else renderSide();
  }
  window.addEventListener('hashchange', route);

  // ---------- theme ----------
  const savedTheme = lsGet('akademiya:theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $('#themeBtn').onclick = () => {
    const r = document.documentElement, dark = matchMedia('(prefers-color-scheme: dark)').matches;
    const cur = r.dataset.theme || (dark ? 'dark' : 'light');
    r.dataset.theme = cur === 'dark' ? 'light' : 'dark';
    lsSet('akademiya:theme', r.dataset.theme);
  };

  // ---------- public API for course modules ----------
  window.LMS = { registerCourse(id, init) { registry[id] = init; } };

  // ---------- boot ----------
  (async () => {
    try {
      const r = await fetch('courses/catalog.json');
      const data = await r.json();
      catalog = data.courses || [];
      window.__paths = data.paths || [];
    } catch (e) {
      $('#shelf').innerHTML = '<div class="card">Kurs kataloqu yüklənmədi. Səhifəni yenilə.</div>';
      return;
    }
    catalog.forEach(c => { byId[c.id] = c; loadLocal(c.id); });
    route();
    connect();
    CARDS = await getJSON('data/cards.json');
    CARD = {}; CARDS.forEach(c => { CARD[c.id] = c; });
    catalog.forEach(c => Object.keys(prog[c.id].done).forEach(l => activateLesson(c.id, +l)));
    checkBadges();
    if (!$('#home').hidden) renderHome();
    else if (!$('#pageView').hidden && /^(tekrar|sehvler)$/.test(location.hash.slice(1)) && !(rv && rv.ids.length)) { rv = null; route(); }
    if (inClaude) {
      try { sampleFn = await window.claude.use('sample'); } catch (e) { sampleFn = null; }
      if (sampleFn && curCid && !notesMode) setupAsk(current);
    }
  })();
})();
