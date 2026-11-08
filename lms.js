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
    const R = Math.max(a.reset || 0, b.reset || 0), RN = Math.max(a.resetNotes || 0, b.resetNotes || 0);
    const stale = x => (x.updated || 0) < R ? Object.assign({}, x, { done: {}, extra: {}, last: 0 }) : x;
    const cleanNotes = x => { if (!RN) return x; const n = {}; for (const [k, v] of Object.entries(x.notes || {})) if (v && (v.ts || 0) >= RN) n[k] = v; return Object.assign({}, x, { notes: n }); };
    a = cleanNotes(stale(a)); b = cleanNotes(stale(b));
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
    if (R) m.reset = R;
    if (RN) m.resetNotes = RN;
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
  const me = Object.assign({ cards: {}, miss: {}, log: {}, acc: {}, badges: {}, marks: [], reviews: 0, perfect: {}, hl: {}, own: {}, proj: {} }, lsGet('akademiya:me') || {});
  const saveMe = () => lsSet('akademiya:me', me);
  let CARDS = [], CARD = {}; // testlərin sual bankı: yalnız “Səhvlərim” üçün (köhnə səhvlərin mətni)
  function logAct(n = 1) { const t = today(); me.log[t] = (me.log[t] || 0) + n; }
  function recordAnswer(cid, id, ok, snap) {
    const a = me.acc[cid] || (me.acc[cid] = [0, 0]); a[1]++; if (ok) a[0]++;
    if (!ok) me.miss[id] = { ts: Date.now(), fixed: false, d: snap };
    else if (me.miss[id]) me.miss[id].fixed = true;
    logAct(); saveMe(); checkBadges();
  }
  const openMiss = () => Object.keys(me.miss).filter(id => !me.miss[id].fixed && (CARD[id] || me.miss[id].d));
  const cardData = id => CARD[id] || (me.miss[id] && me.miss[id].d);

  const COURSE_BADGES = { mentiq: ['🧩', 'Məntiqçi'], claudecode: ['❯', 'Claude ustası'], felsefe: ['🏛️', 'Filosof'], reqemsal: ['⚡', 'Transformator'], kvant: ['⚛️', 'Kvant düşüncəli'], si: ['🤖', 'Sİ bələdçisi'], agent: ['⚙️', 'Agent memarı'], caio: ['♛', 'Sİ lideri'], kripto: ['🔑', 'Kriptoqraf'], kiber: ['🛡️', 'Kiber qoruyucu'], hikmet: ['❝', 'Müdrik'], dinler: ['🕊️', 'Dinşünas'] };
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
      ['perfect', '💯', 'Mükəmməl', 'Yekun imtahanı səhvsiz keç', s => s.perfect >= 1],
      ['fix10', '🩹', 'Səhvlərdən öyrənən', '10 səhvi düzəlt', s => s.fixed >= 10],
      ['mark', '🖍️', 'Kolleksiyaçı', 'İlk cümləni vurğula', s => s.hl >= 1],
      ['proj', '🛠️', 'Praktik', 'İlk praktiki layihəni tamamla', s => s.proj >= 1],
      ['hl10', '🖍️', 'Diqqətli oxucu', '10 cümləni vurğula', s => s.hl >= 10],
      ['kk', '🧩', 'Tapmaca ustası', 'Bütün cəngavər-yalançı tapmacalarını həll et', s => s.kk >= 5],
    ];
    catalog.forEach(c => { const [ic, n] = COURSE_BADGES[c.id] || ['🎖️', c.title]; L.push(['c-' + c.id, ic, n, `“${c.title}” kursunu bitir`, s => s.done[c.id]]); });
    return L;
  }
  function badgeStats() {
    const done = {}; catalog.forEach(c => { done[c.id] = doneCount(c.id) >= c.lessons; });
    return {
      lessons: catalog.reduce((s, c) => s + doneCount(c.id), 0), courses: Object.values(done).filter(Boolean).length, totalCourses: catalog.length,
      streak: streak(), perfect: Object.keys(me.perfect).length,
      fixed: Object.values(me.miss).filter(m => m.fixed).length, marks: me.marks.length, proj: Object.values(me.proj).filter(x => x.done).length, own: Object.keys(me.own).length,
      hl: Object.values(me.hl).reduce((n, a) => n + a.length, 0), kk: Object.keys(((prog.mentiq || {}).extra || {}).kk || {}).length, done,
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
    }).join('');
    renderQuick(); renderPaths();
    $('#home').classList.add('ready');
    renderAppBox();
  }

  function renderQuick() {
    const tiles = [['qeydlerim', '🖍️', 'Qeydlərim', Object.values(me.hl).reduce((n, a) => n + a.length, 0)], ['luget', '📖', 'Lüğət', ''], ['statistika', '📊', 'Statistika', Object.keys(me.badges).length ? Object.keys(me.badges).length + ' nişan' : '']];
    $('#quickBox').innerHTML = tiles.map(([h, ic, n, c]) => `<a class="qt" href="#${h}"><span class="qi">${ic}</span><span>${n}</span>${c ? `<b>${c}</b>` : ''}</a>`).join('');
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

  // ---------- səhifələr: səhvlər, qeydlər, lüğət, statistika, axtarış ----------
  const PAGES = { sehvler: 'Səhvlərim', qeydlerim: 'Qeydlərim', luget: 'Lüğət', statistika: 'Statistika', axtar: 'Axtarış' };
  const loaded = {};
  const getJSON = f => loaded[f] || (loaded[f] = fetch(f).then(r => r.ok ? r.json() : []).catch(() => []));
  const chip = cid => byId[cid] ? `<span class="cchip" style="${cvars(byId[cid])}">${esc(byId[cid].title)}</span>` : '';
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const fold = s => String(s).toLocaleLowerCase('az').replace(/[əıöüşçğ]/g, c => ({ 'ə': 'e', 'ı': 'i', 'ö': 'o', 'ü': 'u', 'ş': 's', 'ç': 'c', 'ğ': 'g' }[c]));
  let pendingMark = null;

  function renderPage(page) {
    const v = $('#pageView');
    $('#crumb').innerHTML = `<b>${PAGES[page]}</b>`;
    ({ sehvler: pageMistakes, qeydlerim: pageHls, luget: pageGlossary, statistika: pageStats, axtar: pageSearch })[page](v);
    window.scrollTo({ top: 0 });
  }
  function pageMistakes(v, showFixed) {
    const ids = Object.keys(me.miss).filter(id => cardData(id) && (showFixed || !me.miss[id].fixed)).sort((a, b) => me.miss[b].ts - me.miss[a].ts);
    v.innerHTML = `<div class="card"><h2>🩹 Səhvlərim</h2><p class="lead">Testlərdə səhv cavab verdiyiniz suallar. Düzgün cavab verəndə sual “düzəldilmiş” olur.</p>
      <div class="row"><label class="fb" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="msFixed" ${showFixed ? 'checked' : ''}> Düzəldilmişləri də göstər</label></div></div>
      ${ids.length ? ids.map(id => { const c = cardData(id), m = me.miss[id]; return `<div class="card mis ${m.fixed ? 'fixed' : ''}"><div class="rv-meta">${chip(c.c)}<span class="fb">${esc(c.t || '')} · ${new Date(m.ts).toLocaleDateString('az')}${m.fixed ? ' · ✓ düzəldilib' : ''}</span></div>
        <div class="rv-q">${esc(c.q)}</div><div class="ans">✓ ${esc(c.o[c.a])}</div><div class="fb">${esc(c.e || '')}</div><a class="fb" href="#${c.c}-${c.l + 1}">Dərsə keç →</a></div>`; }).join('')
        : '<div class="card"><p>Səhv yoxdur. 🎉 Testləri cavablandırdıqca səhv etdiyiniz suallar burada toplanacaq.</p></div>'}`;
    $('#msFixed').onchange = e => pageMistakes(v, e.target.checked);
  }

  // Qeydlərim: bütün kurslarda vurğuladığınız cümlələr (əvvəlki əlfəcinlər də bura köçürülüb)
  function pageHls(v) {
    const all = Object.entries(me.hl).flatMap(([k, a]) => a.map(h => [k.split(':')[0], +k.split(':')[1], h])).filter(([c]) => byId[c]).sort((a, b) => b[2].ts - a[2].ts);
    const groups = {}; all.forEach(x => (groups[x[0]] = groups[x[0]] || []).push(x));
    v.innerHTML = `<div class="card"><h2>🖍️ Qeydlərim</h2><p class="lead">Dərsdə vacib bildiyiniz cümləni seçib rənglə vurğulayın: hamısı burada toplanır. Kurs üzrə tam konspekt üçün kursun yan panelindəki “📄 Konspekt”ə keçin.</p></div>` +
      (all.length ? Object.entries(groups).map(([cid, list]) => `<div class="card"><h3>${chip(cid)} <span class="fb">${list.length}</span></h3>${list.map(([c, l, h]) => `<div class="hlk"><div class="hlk-h"><span class="fb">${l + 1}. ${esc(h.lt || (lessonTitle(c, l)))}</span>
        <span class="row"><button class="btn ghost hl-open" data-c="${c}" data-l="${l}" data-id="${esc(h.id)}">Aç</button><button class="iconbtn hl-del" data-k="${c}:${l}" data-id="${esc(h.id)}" title="Sil" aria-label="Qeydi sil">✕</button></span></div>
        <blockquote class="ks-hl hl-${h.c}${h.t.length > 140 ? ' jl' : ''}">${esc(h.t)}</blockquote></div>`).join('')}</div>`).join('')
        : '<div class="card"><p>Hələ qeyd yoxdur. Dərsdə bir cümləni barmaqla (və ya siçanla) seçin, aşağıda rəng paneli çıxacaq.</p></div>');
    v.querySelectorAll('.hl-open').forEach(b => b.onclick = () => { pendingMark = b.dataset.id; location.hash = `${b.dataset.c}-${+b.dataset.l + 1}`; });
    v.querySelectorAll('.hl-del').forEach(b => b.onclick = () => {
      const k = b.dataset.k; me.hl[k] = (me.hl[k] || []).filter(x => x.id !== b.dataset.id); if (!me.hl[k].length) delete me.hl[k];
      unwrapHl(b.dataset.id); saveMe(); pageHls(v);
    });
  }
  const lessonTitle = (c, l) => (curCid === c && lessonEls[l] ? lessonEls[l].dataset.title : '');
  // köhnə əlfəcinləri vurğuya çevirmək (bir dəfəlik)
  function migrateMarks() {
    if (!me.marks || !me.marks.length) return;
    me.marks.forEach(m => {
      const k = m.c + ':' + m.l, a = me.hl[k] || (me.hl[k] = []);
      if (!a.some(x => x.id === 'bm-' + m.id)) a.push({ id: 'bm-' + m.id, t: String(m.s || '').replace(/…$/, ''), p: '', c: 'y', ts: m.ts || Date.now(), lt: m.t || '' });
    });
    me.marks = []; saveMe();
  }
  migrateMarks();
  if (Object.keys(me.cards || {}).length) { me.cards = {}; delete me.reviews; saveMe(); } // aralıqlı təkrar ləğv olunub
  // öz kartlar ləğv olunub: təkrar cədvəlindən çıxarılır (bir dəfəlik)
  if (Object.keys(me.own || {}).length || Object.keys(me.cards).some(id => id.startsWith('own:'))) {
    Object.keys(me.cards).forEach(id => { if (id.startsWith('own:')) delete me.cards[id]; });
    Object.keys(me.miss).forEach(id => { if (id.startsWith('own:')) delete me.miss[id]; });
    me.own = {}; saveMe();
  }

  const glRow = g => `<div class="gl"><b>${esc(g.t)}${g.en ? ` <span class="en">(${esc(g.en)})</span>` : ''}</b><span>${esc(g.d)}</span>${g.n ? `<em class="gl-ex"><b>Nümunə:</b> ${esc(g.n)}</em>` : ''}<a href="#${g.c}-${g.l + 1}">${chip(g.c)}</a></div>`;
  async function pageGlossary(v) {
    v.innerHTML = '<div class="card">Lüğət yüklənir…</div>';
    const G = (await getJSON('data/glossary.json')).slice().sort((a, b) => a.t.localeCompare(b.t, 'az'));
    const letter = t => t.charAt(0).toLocaleUpperCase('az');
    const letters = [...new Set(G.map(g => letter(g.t)))];
    v.innerHTML = `<div class="card"><h2>📖 Lüğət</h2><p class="lead">${G.length} termin, hər biri öz dərsinə bağlıdır.</p>
      <input type="text" id="glQ" placeholder="Termin axtar…" style="font-family:var(--sans)"><div class="letters">${letters.map(l => `<a href="#luget" data-l="${esc(l)}">${esc(l)}</a>`).join('')}</div></div><div id="glList"></div>`;
    const draw = q => {
      const f = fold(q || ''), list = G.filter(g => !f || fold(g.t + ' ' + g.d + ' ' + (g.n || '')).includes(f));
      let cur = '', h = '';
      list.forEach(g => { const L = letter(g.t); if (L !== cur) { if (cur) h += '</div>'; cur = L; h += `<div class="card gl-sec" id="gl-${esc(L)}"><h3 class="gl-l">${esc(L)}</h3>`; }
        h += glRow(g); });
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
      $('#srOut').innerHTML = (g.length ? `<div class="card"><h3>📖 Lüğətdə</h3>${g.map(glRow).join('')}</div>` : '') +
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
    const answers = Object.values(me.acc).reduce((n, a) => n + a[1], 0), right = Object.values(me.acc).reduce((n, a) => n + a[0], 0), miss = openMiss().length;
    v.innerHTML = `<div class="card"><h2>📊 Statistika</h2>
      <div class="kp">${[[s.lessons, 'tamamlanmış dərs'], [s.courses + ' / ' + s.totalCourses, 'bitirilmiş kurs'], [s.streak, 'gün ardıcıl'], [answers, 'test cavabı'], [answers ? Math.round(right / answers * 100) + '%' : '—', 'düzgün cavab'], [earned, 'nişan']].map(([n, l]) => `<div><b>${n}</b><span>${l}</span></div>`).join('')}</div></div>
      <div class="card"><h3>Son 7 gün</h3><div class="b7">${last7.map(([k, n, d]) => `<div><span class="n">${n || ''}</span><i style="height:${n / mx * 100}%"></i><small>${DN[d.getDay()]}</small></div>`).join('')}</div>
      <h3 style="margin-top:16px">Son 12 həftə</h3><div class="heat">${days.map(([k, n]) => `<i title="${k}: ${n}" style="opacity:${n ? 0.25 + 0.75 * n / mxAll : 1};${n ? '' : 'background:var(--line)'}"></i>`).join('')}</div>
      <p class="fb">Hər xana bir gündür. Rəng tündləşdikcə həmin gün daha çox dərs və test edilib.</p></div>
      <a class="card sr-link" href="#sehvler"><span>🩹 <b>Səhvlərim</b> <span class="fb">testlərdə səhv cavab verdiyiniz suallar</span></span><b>${miss || ''} →</b></a>
      <div class="card"><h3>Kurslar üzrə dəqiqlik</h3>${accs.length ? `${accs.map(([c, a, n]) => `<div class="acc"><span>${esc(c.title)}</span><div class="t"><i style="width:${a * 100}%;${cvars(c)}"></i></div><b>${Math.round(a * 100)}%</b><small>${n} cavab</small></div>`).join('')}
        ${accs.length > 1 ? `<p>💪 Ən güclü: <b>${esc(accs[0][0].title)}</b> · 🎯 Diqqət tələb edir: <b>${esc(accs[accs.length - 1][0].title)}</b></p>` : ''}` : '<p class="fb">Dəqiqlik ən azı 5 cavabdan sonra görünəcək.</p>'}</div>
      <div class="card"><h3>Kurslar üzrə irəliləyiş</h3>${catalog.map(c => `<div class="acc"><span>${esc(c.title)}</span><div class="t"><i style="width:${pctOf(c.id)}%;${cvars(c)}"></i></div><b>${pctOf(c.id)}%</b><small>${doneCount(c.id)} / ${c.lessons}</small></div>`).join('')}</div>
      <div class="card"><h3>🏅 Nişanlar (${earned} / ${badgeList().length})</h3><div class="bdg">${badgeList().map(([id, ic, n, d]) => `<div class="${me.badges[id] ? 'on' : ''}"><span>${ic}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join('')}</div></div>`;
  }


  // ---------- mətndə vurğulama ----------
  const HL_SKIP = '.en, .xl-card, .quiz, button, input, textarea, select, label, svg, script, style, .bm, .tts, .kicker, .credit, .out, .res, .msg, .fb, .score, [id]';
  const HL_COLORS = { y: 'Sarı', g: 'Yaşıl', p: 'Çəhrayı' };
  function textNodes(sec) {
    const out = [], w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, {
      acceptNode: n => { const p = n.parentElement; if (!p || !n.nodeValue) return NodeFilter.FILTER_REJECT; const sk = p.closest(HL_SKIP); return sk && sk !== sec && sec.contains(sk) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    let n, off = 0; while ((n = w.nextNode())) { out.push({ n, off }); off += n.nodeValue.length; }
    return { nodes: out, text: out.map(x => x.n.nodeValue).join('') };
  }
  function wrapHl(sec, start, end, h) {
    const { nodes } = textNodes(sec);
    nodes.forEach(({ n, off }) => {
      const len = n.nodeValue.length, s = Math.max(start, off), e = Math.min(end, off + len);
      if (s >= e) return;
      let t = n; if (s > off) t = t.splitText(s - off); if (e < off + len) t.splitText(e - s);
      if (!t.nodeValue.trim()) return;
      const m = document.createElement('mark'); m.className = 'hl hl-' + h.c; m.dataset.hl = h.id;
      t.parentNode.insertBefore(m, t); m.appendChild(t);
    });
  }
  function applyHl(sec, h) {
    const { text } = textNodes(sec);
    let i = h.p ? text.indexOf(h.p + h.t) : -1;
    i = i >= 0 ? i + h.p.length : text.indexOf(h.t);
    if (i >= 0) return wrapHl(sec, i, i + h.t.length, h);
    // boşluqlara həssas olmayan axtarış: mətn sıxılır, tapılan yer orijinal mövqeyə qaytarılır
    let n = '', map = [];
    for (let k = 0; k < text.length; k++) { const ws = /\s/.test(text[k]); if (ws && n.endsWith(' ')) continue; n += ws ? ' ' : text[k]; map.push(k); }
    const t = h.t.replace(/\s+/g, ' ').trim(), j = t ? n.indexOf(t) : -1;
    if (j >= 0) wrapHl(sec, map[j], map[j + t.length - 1] + 1, h);
  }
  function restoreHl(cid) { lessonEls.forEach((s, l) => (me.hl[cid + ':' + l] || []).forEach(h => applyHl(s, h))); }
  function unwrapHl(id) { document.querySelectorAll(`mark.hl[data-hl="${id}"]`).forEach(m => { const p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); m.remove(); p.normalize(); }); }
  let hlState = null;
  const hlBar = document.createElement('div'); hlBar.className = 'hlbar'; hlBar.hidden = true;
  hlBar.innerHTML = '<span class="hl-lbl" id="hlLbl">📝 Qeyd et:</span>' + Object.entries(HL_COLORS).map(([k, n]) => `<button class="sw hl-${k}" data-c="${k}" title="${n}" aria-label="${n} vurğula"></button>`).join('') +
    '<button class="hb" data-act="del" hidden>🗑 Sil</button><button class="hb" data-act="x" aria-label="Bağla">✕</button>';
  document.body.appendChild(hlBar);
  hlBar.addEventListener('mousedown', e => e.preventDefault());
  function showBar(st) { hlState = st; hlBar.hidden = false; document.body.classList.add('hl-open'); clearTimeout(hideT); $('#hlLbl').textContent = st.mode === 'edit' ? 'Rəngi dəyiş:' : '📝 Qeyd et:'; hlBar.querySelector('[data-act="del"]').hidden = st.mode !== 'edit'; hlBar.querySelectorAll('.sw').forEach(b => b.classList.toggle('on', st.mode === 'edit' && st.h.c === b.dataset.c)); }
  let hideT;
  function hideBar() { hlBar.hidden = true; hlState = null; clearTimeout(hideT); document.body.classList.remove('hl-open'); }
  function selInfo() {
    const sel = window.getSelection(); if (!sel || sel.isCollapsed || !sel.rangeCount || !curCid || notesMode) return null;
    const r = sel.getRangeAt(0), sec = lessonEls[current];
    if (!sec || !sec.classList.contains('show') || !sec.contains(r.commonAncestorContainer)) return null;
    const { nodes, text } = textNodes(sec);
    let start = -1, end = -1;
    nodes.forEach(({ n, off }) => {
      if (!r.intersectsNode(n)) return;
      const s = off + (n === r.startContainer ? r.startOffset : 0), e = off + (n === r.endContainer ? r.endOffset : n.nodeValue.length);
      if (e <= s) return; if (start < 0) start = s; end = e;
    });
    if (start < 0) return null;
    while (start < end && /\s/.test(text[start])) start++;
    while (end > start && /\s/.test(text[end - 1])) end--;
    const t = text.slice(start, end); if (t.length < 2 || t.length > 1500) return null;
    return { mode: 'new', sec, l: current, start, end, t, p: text.slice(Math.max(0, start - 24), start) };
  }
  let selT;
  document.addEventListener('selectionchange', () => { clearTimeout(selT); selT = setTimeout(() => {
    const s = selInfo();
    if (s) showBar(s);
    else if (hlState && hlState.mode === 'new') { const st = hlState; clearTimeout(hideT); hideT = setTimeout(() => { if (hlState === st) hideBar(); }, 6000); }
  }, 220); });
  document.addEventListener('click', e => {
    const m = e.target.closest && e.target.closest('mark.hl');
    if (m && curCid) { const key = curCid + ':' + current, h = (me.hl[key] || []).find(x => x.id === m.dataset.hl); if (h) { showBar({ mode: 'edit', h, key }); return; } }
    if (hlState && !e.target.closest('.hlbar') && (hlState.mode === 'edit' || window.getSelection().isCollapsed)) hideBar();
  });
  hlBar.onclick = e => {
    const b = e.target.closest('button'); if (!b || !hlState) return;
    const st = hlState;
    if (b.dataset.c) {
      if (st.mode === 'new') {
        const key = curCid + ':' + st.l, h = { id: 'h' + Date.now().toString(36), t: st.t, p: st.p, c: b.dataset.c, ts: Date.now(), lt: st.sec.dataset.title || '' };
        (me.hl[key] = me.hl[key] || []).push(h); wrapHl(st.sec, st.start, st.end, h);
        window.getSelection().removeAllRanges(); logAct(); toast('📝 Qeydlərimə əlavə olundu');
      } else { st.h.c = b.dataset.c; document.querySelectorAll(`mark.hl[data-hl="${st.h.id}"]`).forEach(m => { m.className = 'hl hl-' + st.h.c; }); }
      saveMe(); checkBadges(); hideBar();
    } else if (b.dataset.act === 'del' && st.mode === 'edit') {
      me.hl[st.key] = me.hl[st.key].filter(x => x.id !== st.h.id); if (!me.hl[st.key].length) delete me.hl[st.key];
      unwrapHl(st.h.id); saveMe(); hideBar(); toast('Vurğu silindi');
    } else { window.getSelection().removeAllRanges(); hideBar(); }
  };

  // ---------- telefonda sürüşdürmə ----------
  (() => {
    const host = $('#lessonHost'); let sx = 0, sy = 0, st = 0, ok = false;
    host.addEventListener('animationend', () => host.classList.remove('sw-l', 'sw-r'));
    const scrollable = el => { for (let e = el; e && e !== host; e = e.parentElement) if (e.scrollWidth > e.clientWidth + 2 && /(auto|scroll)/.test(getComputedStyle(e).overflowX)) return true; return false; };
    host.addEventListener('touchstart', e => {
      const t = e.touches[0]; ok = e.touches.length === 1 && !e.target.closest('input, textarea, select, svg, canvas, .sorter, .ord, .puzzles, [draggable], .quiz') && !scrollable(e.target);
      sx = t.clientX; sy = t.clientY; st = Date.now();
    }, { passive: true });
    host.addEventListener('touchend', e => {
      if (!ok || !curCid || notesMode) return; ok = false;
      const t = e.changedTouches[0], dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.5 || Date.now() - st > 700) return;
      const s = window.getSelection(); if (s && !s.isCollapsed) return;
      const to = current + (dx < 0 ? 1 : -1);
      if (to < 0 || to >= lessonEls.length) { toast(to < 0 ? 'Bu, ilk dərsdir' : 'Bu, son dərsdir'); return; }
      host.classList.remove('sw-l', 'sw-r'); void host.offsetWidth; host.classList.add(dx < 0 ? 'sw-l' : 'sw-r');
      location.hash = `${curCid}-${to + 1}`;
    }, { passive: true });
  })();

  // ---------- kursun əlavə səhifələri: xəritə, konspekt, layihə ----------
  const AUX = { qeydler: 'Konspekt', xerite: 'Kurs xəritəsi', konspekt: 'Konspekt', elave: 'Layihə və əlavə oxu' };
  async function showAux(kind) {
    notesMode = true; hideBar();
    const cid = curCid, c = byId[cid];
    $('#lessonHost').hidden = true; $('#askCard').hidden = true; $('#pager').innerHTML = '';
    const v = $('#notesView'); v.hidden = false; v.innerHTML = '<div class="card">Yüklənir…</div>';
    $('#crumb').innerHTML = `<b>${esc(c.title)}</b> · ${AUX[kind]}`;
    renderSide(); window.scrollTo({ top: 0 });
    if (kind === 'xerite') await viewMap(v, cid);
    else if (kind === 'konspekt' || kind === 'qeydler') await viewSummary(v, cid);
    else await viewExtra(v, cid);
  }

  let mapRO = null;
  async function viewMap(v, cid) {
    const M = (await getJSON('data/map.json'))[cid] || { terms: {}, edges: [] };
    if (curCid !== cid) return;
    const c = byId[cid], p = prog[cid], parts = c.parts || {};
    const links = {}; M.edges.forEach(([a, b, w]) => { (links[a] = links[a] || []).push([b, w]); (links[b] = links[b] || []).push([a, w]); });
    let rows = '';
    lessonEls.forEach((s, i) => {
      if (parts[i]) rows += `<div class="mp-part">${esc(parts[i])}</div>`;
      const terms = (M.terms[i] || []).slice(0, 4), ln = links[i] || [];
      rows += `<div class="mp-row ${p.done[i] ? 'done' : ''} ${i === p.last ? 'cur' : ''}" data-i="${i}">
        <button class="mp-dot" data-i="${i}" aria-label="${i + 1}-ci dərsin əlaqələri">${p.done[i] ? '✓' : i + 1}</button>
        <div class="mp-body"><a href="#${cid}-${i + 1}">${esc(s.dataset.title)}</a>
        ${terms.length ? `<div class="mp-terms">${terms.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}
        ${ln.length ? `<button class="mp-ln" data-i="${i}">🔗 ${ln.length} əlaqə</button><div class="mp-list" hidden>${ln.sort((x, y) => x[0] - y[0]).map(([j, w]) => `<a href="#${cid}-${j + 1}"><b>${j + 1}. ${esc(lessonEls[j].dataset.title)}</b> <span>${esc(w)}</span></a>`).join('')}</div>` : ''}</div></div>`;
    });
    v.innerHTML = `<div class="card"><h2>🗺️ Kurs xəritəsi</h2><p class="lead">Dərslər yuxarıdan aşağı sıralanıb. Soldakı qövslər bir-birinə bağlı mövzuları birləşdirir: bir dərsdə öyrəndiyiniz anlayış sonrakında yenidən işlənir.</p>
      <p class="fb">Dairəyə və ya “🔗 əlaqə” düyməsinə basın: həmin dərsin əlaqələri işıqlanacaq. Dərsin adına basanda dərs açılır. ✓ tamamlanmış dərslərdir.</p></div>
      <div class="card mp" style="${cvars(c)}"><svg class="mp-arcs" aria-hidden="true"></svg>${rows}</div>`;
    const box = v.querySelector('.mp'), svg = box.querySelector('.mp-arcs');
    const draw = () => {
      if (!box.isConnected) return;
      const br = box.getBoundingClientRect(), pos = {};
      box.querySelectorAll('.mp-dot').forEach(d => { const r = d.getBoundingClientRect(); pos[d.dataset.i] = [r.left - br.left, r.top - br.top + r.height / 2]; });
      const x0 = pos[0] ? pos[0][0] : 40, maxW = Math.max(20, x0 - 6), span = lessonEls.length;
      svg.setAttribute('width', br.width); svg.setAttribute('height', br.height); svg.setAttribute('viewBox', `0 0 ${br.width} ${br.height}`);
      svg.innerHTML = `<line x1="${x0 + 14}" y1="${pos[0] ? pos[0][1] : 0}" x2="${x0 + 14}" y2="${pos[span - 1] ? pos[span - 1][1] : 0}" class="spine"/>` +
        M.edges.map(([a, b, w]) => { if (!pos[a] || !pos[b]) return ''; const ya = pos[a][1], yb = pos[b][1], wd = Math.min(maxW, 10 + (b - a) / span * maxW * 1.6);
          return `<path data-a="${a}" data-b="${b}" d="M${x0 + 2},${ya} C${x0 - wd},${ya} ${x0 - wd},${yb} ${x0 + 2},${yb}"><title>${esc(w)}</title></path>`; }).join('');
    };
    const focus = i => {
      const on = box.dataset.f === String(i) ? null : String(i);
      if (on == null) delete box.dataset.f; else box.dataset.f = on;
      box.classList.toggle('focus', on != null);
      svg.querySelectorAll('path').forEach(pth => pth.classList.toggle('on', on != null && (pth.dataset.a === on || pth.dataset.b === on)));
      box.querySelectorAll('.mp-row').forEach(r => { const rel = on != null && (r.dataset.i === on || (links[on] || []).some(([j]) => String(j) === r.dataset.i)); r.classList.toggle('rel', rel); const l = r.querySelector('.mp-list'); if (l) l.hidden = r.dataset.i !== on; });
      draw(); svg.querySelectorAll('path').forEach(pth => pth.classList.toggle('on', on != null && (pth.dataset.a === on || pth.dataset.b === on)));
    };
    box.querySelectorAll('.mp-dot, .mp-ln').forEach(b => b.onclick = () => focus(b.dataset.i));
    draw();
    if (mapRO) mapRO.disconnect();
    if (window.ResizeObserver) { mapRO = new ResizeObserver(() => { draw(); if (box.dataset.f) svg.querySelectorAll('path').forEach(pth => pth.classList.toggle('on', pth.dataset.a === box.dataset.f || pth.dataset.b === box.dataset.f)); }); mapRO.observe(box); }
  }

  async function viewSummary(v, cid) {
    const G = (await getJSON('data/glossary.json')).filter(g => g.c === cid), KEYS = (await getJSON('data/keys.json'))[cid] || [];
    if (curCid !== cid) return;
    const withKeys = lsGet('akademiya:ksKeys') !== false;
    const c = byId[cid], p = prog[cid], HLN = { y: 'sarı', g: 'yaşıl', p: 'çəhrayı' };
    let html = '', md = `# ${c.title}: konspekt\n\n_${new Date().toLocaleDateString('az')}_\n`, any = false;
    lessonEls.forEach((s, i) => {
      const note = p.notes[i], hl = (me.hl[cid + ':' + i] || []).slice().sort((a, b) => a.ts - b.ts), mk = [];
      const ky = withKeys ? KEYS[i] || [] : [];
      if (!note && !hl.length && !mk.length && !ky.length) return;
      if (note || hl.length || mk.length) any = true;
      html += `<section class="ks"><h3><a href="#${cid}-${i + 1}">${i + 1}. ${esc(s.dataset.title)}</a></h3>
        ${ky.length ? `<ul class="ks-keys">${ky.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}
        ${note ? `<div class="ks-note"><b>📝 Köhnə qeydim</b><pre>${esc(note.t)}</pre></div>` : ''}
        ${hl.map(h => `<blockquote class="ks-hl hl-${h.c}${h.t.length > 140 ? ' jl' : ''}">${esc(h.t)}</blockquote>`).join('')}
        ${mk.map(m => `<div class="ks-mk">📌 <b>${esc(m.tag)}</b>: ${esc(m.s)}</div>`).join('')}</section>`;
      md += `\n## ${i + 1}. ${s.dataset.title}\n`;
      if (ky.length) md += '\n**Əsas fikirlər:**\n\n' + ky.map(t => `- ${t}`).join('\n') + '\n';
      if (note) md += `\n**Qeydim:**\n\n${note.t}\n`;
      hl.forEach(h => { md += `\n> ${h.t.replace(/\n/g, ' ')} _(${HLN[h.c]})_\n`; });
      mk.forEach(m => { md += `\n- 📌 **${m.tag}**: ${m.s}\n`; });
    });
    if (G.length) { html += `<section class="ks"><h3>📖 Kursun lüğəti</h3><dl class="ks-gl">${G.map(g => `<dt>${esc(g.t)}${g.en ? ` <span class="en">(${esc(g.en)})</span>` : ''}</dt><dd>${esc(g.d)}${g.n ? `<br><i>Nümunə: ${esc(g.n)}</i>` : ''}</dd>`).join('')}</dl></section>`; md += '\n## Lüğət\n'; G.forEach(g => { md += `\n- **${g.t}**: ${g.d}${g.n ? ` _Nümunə: ${g.n}_` : ''}\n`; }); }
    v.innerHTML = `<div class="card no-print"><h2>📄 Konspekt</h2><p class="lead">Bu kursda vurğuladığınız cümlələr (qeydləriniz), hər dərsin əsas fikirləri və kursun lüğəti bir səhifədə.</p>
      <label class="fb ks-tg"><input type="checkbox" id="ksKeys" ${withKeys ? 'checked' : ''}> Hər dərsin “Əsas fikirlər”ini də daxil et</label>
      <div class="row"><button class="btn" id="ksPrint">🖨️ Çap et / PDF</button><button class="btn ghost" id="ksCopy">📋 Kopyala (Markdown)</button>${inClaude ? '' : '<button class="btn ghost" id="ksDl">⬇️ .md faylı</button>'}</div>
      <p class="fb">Kopyaladığınız mətni Word, Google Docs, Notion və ya Obsidian-a yapışdıra bilərsiniz. PDF üçün çap pəncərəsində “PDF kimi saxla” seçin.</p>
      ${any ? '' : '<p class="fb">Hələ bu kursda qeyd, vurğu və ya əlfəcin yoxdur. Dərsləri oxuyarkən cümlələri seçib vurğulayın, ☆ ilə blokları saxlayın, aşağıda qeyd yazın: hamısı burada toplanacaq.</p>'}</div>
      <div class="card konspekt"><h1 class="print-only">${esc(c.title)}: konspekt</h1>${html}</div>`;
    $('#ksKeys').onchange = e => { lsSet('akademiya:ksKeys', e.target.checked); viewSummary(v, cid); };
    $('#ksPrint').onclick = () => { try { window.print(); } catch (e) { toast('Çap bu görünüşdə əlçatan deyil. Mətni kopyalayın.'); } };
    $('#ksCopy').onclick = async () => {
      try { await navigator.clipboard.writeText(md); toast('📋 Konspekt kopyalandı'); }
      catch (e) { const t = document.createElement('textarea'); t.value = md; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (er) {} t.remove(); toast(ok ? '📋 Konspekt kopyalandı' : 'Kopyalamaq alınmadı'); }
    };
    const dl = $('#ksDl'); if (dl) dl.onclick = () => {
      const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })), a = document.createElement('a');
      a.href = url; a.download = `konspekt-${cid}-${today()}.md`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000);
    };
  }

  async function viewExtra(v, cid) {
    const X = (await getJSON('data/extras.json'))[cid];
    if (curCid !== cid) return;
    if (!X) { v.innerHTML = '<div class="card"><p>Bu kurs üçün əlavə material hələ hazırlanmayıb.</p></div>'; return; }
    const P = X.project, st = me.proj[cid] || (me.proj[cid] = { k: {}, n: '', done: 0 });
    const KI = { kitab: ['📕', 'Kitablar'], onlayn: ['🌐', 'Onlayn kurslar və resurslar'], məqalə: ['📰', 'Məqalələr'], video: ['🎬', 'Videolar'] };
    const groups = {}; X.reading.forEach(r => (groups[r.k] = groups[r.k] || []).push(r));
    const nDone = () => P.c.filter((_, i) => st.k[i]).length;
    v.innerHTML = `<div class="card proj" style="${cvars(byId[cid])}"><div class="proj-h"><span class="proj-ic">🛠️</span><div><div class="label">Praktiki layihə</div><h2>${esc(P.t)}</h2></div></div>
      <p class="lead">${esc(P.g)}</p>
      <h3>Addımlar</h3><ol class="proj-steps">${P.s.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="note"><b>Nəticə:</b> ${esc(P.d)}</div>
      <h3>Yoxlama siyahısı <span class="fb" id="pjN"></span></h3>
      <div class="proj-chk">${P.c.map((t, i) => `<label><input type="checkbox" data-i="${i}" ${st.k[i] ? 'checked' : ''}> ${esc(t)}</label>`).join('')}</div>
      <h3>Layihə qeydlərim</h3><textarea id="pjNote" placeholder="Gedişat, tapıntılar, linklər…">${esc(st.n || '')}</textarea>
      <div class="row" style="margin-top:10px"><button class="btn" id="pjDone"></button><span class="fb" id="pjSt"></span></div></div>
      <div class="card"><h2>📚 Əlavə oxu</h2><p class="lead">Kursu bitirdikdən sonra mövzunu dərinləşdirmək üçün seçilmiş mənbələr. Əksəriyyəti ingilis dilindədir.</p>
      ${Object.entries(KI).filter(([k]) => groups[k]).map(([k, [ic, n]]) => `<h3>${ic} ${n}</h3>${groups[k].map(r => `<div class="rd">${r.u ? `<a href="${esc(r.u)}" target="_blank" rel="noopener"><b>${esc(r.t)}</b> ↗</a>` : `<b>${esc(r.t)}</b>`}<span class="fb">${esc(r.a)}</span><p>${esc(r.n)}</p></div>`).join('')}`).join('')}</div>`;
    const upd = () => {
      const n = nDone(), all = n === P.c.length;
      $('#pjN').textContent = `${n} / ${P.c.length}`;
      const b = $('#pjDone');
      b.textContent = st.done ? '✅ Layihə tamamlanıb' : 'Layihəni tamamladım';
      b.disabled = !!st.done || !all;
      $('#pjSt').textContent = st.done ? new Date(st.done).toLocaleDateString('az') + ' tarixində tamamlandı' : all ? '' : 'Bütün bəndləri işarələyəndə aktiv olur';
    };
    v.querySelectorAll('.proj-chk input').forEach(i => i.onchange = () => { if (i.checked) st.k[i.dataset.i] = 1; else delete st.k[i.dataset.i]; logAct(); saveMe(); upd(); });
    let nt; $('#pjNote').oninput = e => { clearTimeout(nt); nt = setTimeout(() => { st.n = e.target.value; saveMe(); }, 600); };
    $('#pjDone').onclick = () => { st.done = Date.now(); logAct(3); saveMe(); upd(); celebrate(true); toast('🛠️ Təbriklər! Layihə tamamlandı'); checkBadges(); };
    upd();
  }

  // ---------- şrift ölçüsü və səsli oxu ----------
  const FS = [16, 17.5, 19, 15];
  const applyFs = px => { document.documentElement.style.fontSize = px + 'px'; };
  applyFs(lsGet('akademiya:fs') || 16);
  $('#fontBtn').onclick = () => { const cur = lsGet('akademiya:fs') || 16, nx = FS[(FS.indexOf(cur) + 1) % FS.length]; lsSet('akademiya:fs', nx); applyFs(nx); toast('Şrift ölçüsü: ' + Math.round(nx / 16 * 100) + '%'); };
  $('#searchBtn').onclick = () => { location.hash = 'axtar'; };

  const lessonText = s => {
    const c = s.cloneNode(true);
    c.querySelectorAll('.xl-card, .quiz, .quiz-card, button, svg, style, script, .bm, .tts, table, input, select, textarea, .credit, .kicker').forEach(e => e.remove());
    return c.textContent.replace(/\s+/g, ' ').trim();
  };
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
          prog[cid] = merge(prog[cid], Object.assign(blank(), rec, { updated: Date.now() })); // fayldan bərpa sıfırlamadan sonra da işləsin
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
    for (const [id, m] of Object.entries(o.miss || {})) if (!me.miss[id] || m.ts > me.miss[id].ts) me.miss[id] = m;
    for (const [d, n] of Object.entries(o.log || {})) me.log[d] = Math.max(me.log[d] || 0, n);
    for (const [cid, a] of Object.entries(o.acc || {})) { const b = me.acc[cid] || [0, 0]; if (a[1] > b[1]) me.acc[cid] = a; }
    Object.assign(me.badges, o.badges || {}); Object.assign(me.perfect, o.perfect || {});
    (o.marks || []).forEach(m => { if (!me.marks.some(x => x.id === m.id)) me.marks.push(m); });
    for (const [k, a] of Object.entries(o.hl || {})) { const cur = me.hl[k] || (me.hl[k] = []); a.forEach(h => { if (!cur.some(x => x.id === h.id)) cur.push(h); }); }
    for (const [cid, x] of Object.entries(o.proj || {})) { const cur = me.proj[cid] || (me.proj[cid] = { k: {}, n: '', done: 0 }); Object.assign(cur.k, x.k || {}); if ((x.n || '').length > (cur.n || '').length) cur.n = x.n; if (x.done && (!cur.done || x.done < cur.done)) cur.done = x.done; }
    saveMe(); migrateMarks();
  }

  // ---------- kursu sıfırlamaq ----------
  function courseFootprint(cid) {
    const pre = cid + ':';
    return {
      miss: Object.keys(me.miss).filter(id => id.startsWith(pre)).length,
      notes: Object.keys(prog[cid].notes).length,
      hl: Object.entries(me.hl).filter(([k]) => k.startsWith(pre)).reduce((n, [, a]) => n + a.length, 0),
      marks: me.marks.filter(m => m.c === cid).length,
      proj: me.proj[cid] ? Object.keys(me.proj[cid].k || {}).length + (me.proj[cid].n ? 1 : 0) + (me.proj[cid].done ? 1 : 0) : 0,
    };
  }
  function resetDialog(cid) {
    const old = $('#cardDlg'); if (old) old.remove();
    const c = byId[cid], f = courseFootprint(cid), dn = doneCount(cid);
    const opt = (id, label, n, on) => `<label class="rs-o"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} ${n ? '' : 'disabled'}> <span>${label} <span class="fb">(${n})</span></span></label>`;
    const d = document.createElement('div'); d.id = 'cardDlg'; d.className = 'ak-dlg';
    d.innerHTML = `<div class="ak-dlg-box card" role="dialog" aria-modal="true" aria-labelledby="rsT"><h3 id="rsT">↺ “${esc(c.title)}” kursunu sıfırla</h3>
      <p class="fb">Kurs ilk dəfə açılmış kimi olacaq. Nə silinsin?</p>
      <label class="rs-o"><input type="checkbox" checked disabled> <span>İrəliləyiş: tamamlanmış dərslər, test və laboratoriya nəticələri <span class="fb">(${dn} dərs)</span></span></label>
      ${opt('rsCards', 'Səhvlər və dəqiqlik statistikası', f.miss, true)}
      ${opt('rsHl', 'Qeydlərim (vurğular)', f.hl, false)}
      ${opt('rsProj', 'Praktiki layihə (yoxlama siyahısı və qeydlər)', f.proj, false)}
      <p class="fb">Qazanılmış nişanlar və aktivlik tarixçəsi (ardıcıl günlər) silinmir. Bu əməliyyatı geri qaytarmaq olmur; əvvəlcə ana səhifədən yedək fayl saxlaya bilərsiniz.</p>
      <div class="row"><button class="btn danger" id="rsGo">Sıfırla</button><button class="btn ghost" id="rsX">Ləğv et</button></div></div>`;
    document.body.appendChild(d);
    const close = () => d.remove();
    d.onclick = e => { if (e.target === d) close(); };
    d.onkeydown = e => { if (e.key === 'Escape') close(); };
    $('#rsX').onclick = close;
    let armed = false;
    $('#rsGo').onclick = () => {
      if (!armed) { armed = true; $('#rsGo').textContent = 'Əminəm, sıfırla'; return; }
      resetCourse(cid, { cards: $('#rsCards').checked, notes: false, hl: $('#rsHl').checked, proj: $('#rsProj').checked });
      close();
    };
    setTimeout(() => $('#rsX').focus(), 30);
  }
  function resetCourse(cid, o) {
    const now = Date.now(), old = prog[cid], pre = cid + ':';
    prog[cid] = Object.assign(blank(), { days: old.days || [], notes: o.notes ? {} : old.notes, reset: now, resetNotes: o.notes ? now : old.resetNotes || 0 });
    if (!prog[cid].resetNotes) delete prog[cid].resetNotes;
    touch(cid);
    if (o.cards) {
      Object.keys(me.miss).forEach(id => { if (id.startsWith(pre)) delete me.miss[id]; });
      delete me.acc[cid];
    }
    delete me.perfect[cid];
    if (o.hl) { Object.keys(me.hl).forEach(k => { if (k.startsWith(pre)) delete me.hl[k]; }); me.marks = me.marks.filter(m => m.c !== cid); }
    if (o.proj) delete me.proj[cid];
    saveMe();
    toast('↺ Kurs sıfırlandı');
    if (mounted === cid) unmount();
    if (location.hash === `#${cid}-1`) route(); else location.hash = `${cid}-1`;
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
      const [K, X, G, T] = await Promise.all([getJSON('data/keys.json'), getJSON('data/xmap.json'), getJSON('data/glossary.json'), getJSON('data/terms.json')]);
      decorate(cid, K[cid] || [], X[cid] || {});
      annotateTerms(cid, G, T);
      mounted = cid;
      await loadScript(cid);
      registry[cid](makeApi(cid));
      restoreHl(cid);
    })();
    mounting = { cid, p };
    return p.catch(e => {
      console.error(e);
      $('#courseView').classList.add('ready');
      host.innerHTML = '<div class="card"><h3>Kurs açılmadı</h3><p>Kursun faylları yüklənmədi. Səhifəni yeniləyib yenidən cəhd et.</p></div>';
    }).finally(() => { mounting = null; });
  }

  // Lesson headers become coloured, illustrated heroes; example blocks get a colour by kind;
  // pictures get a graceful fallback when the file is missing.
  function decorate(cid, keys, xl) {
    const c = byId[cid], parts = c.parts || {}, host = $('#lessonHost');
    let part = '';
    lessonEls.forEach((s, i) => {
      const links = (xl && xl[i]) || [];
      if (links.length) {
        const x = document.createElement('div'); x.className = 'card xl-card';
        x.innerHTML = `<h3>🔗 Digər kurslarla əlaqə</h3>${links.map(([c, l, t, why]) => `<a class="xl" href="#${c}-${l + 1}" style="${byId[c] ? cvars(byId[c]) : ''}"><span class="xl-h">${chip(c)} <b>${l + 1}. ${esc(t)}</b></span><span class="xl-w">${esc(why)}</span></a>`).join('')}`;
        s.appendChild(x);
      }
      if (keys && keys[i] && keys[i].length) {
        const k = document.createElement('div'); k.className = 'card keys-card';
        k.innerHTML = `<h3>💡 Əsas fikirlər</h3><ul>${keys[i].map(t => `<li>${esc(t)}</li>`).join('')}</ul>`;
        s.appendChild(k);
      }
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
    // Laboratoriya sahələrinə ekran oxuyucu üçün ad: əlaqəli <label> yoxdursa, yanındakı yazıdan götürülür.
    host.querySelectorAll('input:not([type=hidden]), select, textarea').forEach(el => {
      if (el.getAttribute('aria-label') || el.closest('label') || (el.id && host.querySelector(`label[for="${el.id}"]`))) return;
      let prev = el.previousElementSibling;
      while (prev && !prev.textContent.trim()) prev = prev.previousElementSibling;
      if (prev && prev.tagName === 'LABEL' && el.id && !prev.htmlFor) { prev.htmlFor = el.id; return; }
      const txt = (prev && prev.textContent.trim()) || (el.closest('.card') && (el.closest('.card').querySelector('h3') || {}).textContent) || '';
      const name = (txt || el.placeholder || el.type).replace(/\s+/g, ' ').trim().slice(0, 80);
      if (name) el.setAttribute('aria-label', name);
    });
    host.querySelectorAll('.scroll td, .scroll th').forEach(td => { if (td.textContent.trim().length > 24) td.classList.add('wide'); });
    host.querySelectorAll('.quiz').forEach(q => { const card = q.closest('.card'); if (card) card.classList.add('quiz-card'); });
    const imgs = [...host.querySelectorAll('figure.pic img')];
    imgs.forEach(img => {
      const fail = () => img.closest('figure').classList.add('noimg');
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail(); else img.addEventListener('error', fail, { once: true });
    });
  }

  // Terminlərin yanında ingilis qarşılığı: hər termin bir dərsdə yalnız ilk dəfə, öz kursunda.
  const EN_SKIP = '.en, .quiz, button, input, textarea, select, label, svg, script, style, .kicker, .hero, h2, h3, h4, table, pre, code, .sym, figure, .tag, .xl-card, .keys-card, a, [id]';
  const foldAz = t => { let o = ''; for (const ch of t) { const l = ch === 'İ' ? 'i' : ch === 'I' ? 'ı' : ch.toLowerCase(); o += l.length === 1 ? l : ch; } return o; };
  const reEsc = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  function termStem(t) {
    const w = foldAz(t).split(/\s+/); let last = w.pop();
    if (last.length > 5) last = last.replace(/[aıoueəiöü]+$/, '');
    if (last.length > 4) last = last.replace(/[qk]$/, '');
    return w.concat(last).map(reEsc).join('\\s+');
  }
  function annotateTerms(cid, G, T) {
    const seen = new Set(), list = [];
    [...(G || []).filter(g => g.c === cid && g.en).map(g => ({ t: g.t === 'Neyron (süni)' ? 'süni neyron' : g.t.replace(/\s*\([^)]*\)/g, '').trim(), en: g.en })), ...(T || []).filter(x => x.c === cid)]
      .forEach(x => { const k = foldAz(x.t); if (!seen.has(k)) { seen.add(k); list.push(x); } });
    list.sort((a, b) => b.t.length - a.t.length);
    const rx = list.map(x => ({ en: x.en, t: foldAz(x.t), re: new RegExp('(?<![\\p{L}\\p{N}])' + termStem(x.t) + '\\p{L}*', 'gu') }));
    lessonEls.forEach(sec => {
      const nodes = []; let text = '';
      const w = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT, { acceptNode: n => { const k = n.parentElement && n.parentElement.closest(EN_SKIP); return n.parentElement && !(k && sec.contains(k)) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
      let n; while ((n = w.nextNode())) { nodes.push([n, text.length]); text += n.nodeValue; }
      const f = foldAz(text), used = [], ins = [];
      rx.forEach(({ en, t, re }) => {
        re.lastIndex = 0; let m;
        while ((m = re.exec(f))) {
          const a = m.index, b = a + m[0].length;
          if (used.some(([x, y]) => a < y && b > x)) continue;
          if (/s[ıiuü]z/.test(m[0].slice(t.length - 2)) && !/s[ıiuü]z/.test(t)) continue; // -siz/-sız: mənanı tərsinə çevirir
          const before = text.slice(Math.max(0, a - 80), a);
          if (before.lastIndexOf('(') > before.lastIndexOf(')')) continue; // termin artıq mötərizə içindədir
          used.push([a, b]);
          if (!/^\s*\(/.test(text.slice(b, b + 4))) ins.push([b, en]); // ingiliscəsi artıq mötərizədə yazılıbsa, əlavə etmirik
          break;
        }
      });
      ins.sort((x, y) => y[0] - x[0]).forEach(([b, en]) => {
        const hit = nodes.find(([nd, off]) => b > off && b <= off + nd.nodeValue.length); if (!hit) return;
        const [nd, off] = hit; if (b < off + nd.nodeValue.length) nd.splitText(b - off);
        const sp = document.createElement('span'); sp.className = 'en'; sp.lang = 'en'; sp.textContent = ` (${en})`;
        nd.parentNode.insertBefore(sp, nd.nextSibling);
      });
    });
  }

  function makeApi(cid) {
    return {
      done(i) {
        if (prog[cid].done[i]) return;
        prog[cid].done[i] = true; touch(cid); renderSide();
        logAct(); saveMe();
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
      // variantlar hər dəfə qarışdırılır: düzgün cavab həmişə eyni yerdə olmasın
      shuffle(it.o.map((o, oi) => oi)).forEach(oi => {
        const o = it.o[oi], b = document.createElement('button'); b.textContent = o; b.dataset.oi = oi;
        b.onclick = () => {
          if (d.dataset.done) return; d.dataset.done = 1; answered++;
          const ok = oi === it.a; if (ok) right++;
          const lt = (el.closest('section') || {}).dataset ? el.closest('section').dataset.title : '';
          recordAnswer(api.cid, `${api.cid}:${key}:${qi}`, ok, { q: it.q, o: it.o, a: it.a, e: it.e, c: api.cid, l: section, t: lt });
          b.classList.add(ok ? 'right' : 'wrong'); opts.querySelector(`[data-oi="${it.a}"]`).classList.add('right');
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
      <div class="side-links">${[['xerite', '🗺️ Kurs xəritəsi'], ['konspekt', '📄 Konspekt'], ['elave', '🛠️ Layihə və əlavə oxu']].map(([k, n]) => `<a class="notes-link ${notesMode && location.hash === '#' + curCid + '-' + k ? 'on' : ''}" href="#${curCid}-${k}">${n}</a>`).join('')}<button class="notes-link reset-link" id="resetBtn" type="button">↺ Kursu sıfırla</button></div>`;
    $('#resetBtn').onclick = () => resetDialog(curCid);
    $('#side').querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { location.hash = curCid + '-' + b.dataset.go; }; });
    const act = $('#side nav button.active');
    if (act && window.matchMedia('(max-width:860px)').matches) act.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  function showLesson(i) {
    notesMode = false;
    i = Math.max(0, Math.min(lessonEls.length - 1, i));
    current = i;
    lessonEls.forEach((s, j) => s.classList.toggle('show', j === i));
    $('#lessonHost').hidden = false; $('#notesView').hidden = true;
    const p = prog[curCid];
    if (p.last !== i) { p.last = i; touch(curCid); }
    $('#pager').innerHTML = (i > 0 ? `<a class="btn ghost" href="#${curCid}-${i}">← Əvvəlki</a>` : '<span></span>') +
      (i < lessonEls.length - 1 ? `<a class="btn" href="#${curCid}-${i + 2}">Növbəti →</a>` : `<a class="btn" href="#${curCid}-elave">Layihə və əlavə oxu →</a>`);
    $('#crumb').innerHTML = `<b>${esc(byId[curCid].title)}</b> · ${i + 1}. ${esc(lessonEls[i].dataset.title)}`;
    renderSide();
    window.scrollTo({ top: 0 });
  }

  // ---------- routing ----------
  function parseHash() {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h === 'elfecinler' || h === 'vurgular') return { view: 'page', page: 'qeydlerim' };
    if (PAGES[h]) return { view: 'page', page: h };
    const m = h.match(/^([a-z0-9]+)(?:-(\d+|qeydler|xerite|konspekt|elave))?$/);
    if (!m || !byId[m[1]]) return { view: 'home' };
    if (AUX[m[2]]) return { view: 'notes', cid: m[1], kind: m[2] };
    return { view: 'course', cid: m[1], lesson: m[2] ? +m[2] - 1 : null };
  }
  async function route() {
    const r = parseHash();
    hideBar();
    if (mapRO) { mapRO.disconnect(); mapRO = null; }
    if (askCtl) askCtl.abort();
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
    $('#courseView').classList.add('ready');
    if (r.view === 'notes') { $('#askCard').hidden = true; await showAux(r.kind); return; }
    showLesson(r.lesson == null ? prog[r.cid].last : r.lesson);
    setupAsk(current);
    if (pendingMark) {
      const el = document.querySelector(`mark.hl[data-hl="${pendingMark}"]`);
      pendingMark = null;
      if (el) { const blk = el; setTimeout(() => { blk.scrollIntoView({ behavior: 'smooth', block: 'center' }); blk.classList.add('ak-flash'); setTimeout(() => blk.classList.remove('ak-flash'), 2200); }, 60); }
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
      $('#home').classList.add('ready');
      return;
    }
    catalog.forEach(c => { byId[c.id] = c; loadLocal(c.id); });
    connect();
    await route();
    CARDS = await getJSON('data/cards.json');
    CARD = {}; CARDS.forEach(c => { CARD[c.id] = c; });
    checkBadges();
    if (!$('#home').hidden) renderHome();
    else if (!$('#pageView').hidden && location.hash === '#sehvler') route();
    if (inClaude) {
      try { sampleFn = await window.claude.use('sample'); } catch (e) { sampleFn = null; }
      if (sampleFn && curCid && !notesMode) setupAsk(current);
    }
  })();
})();
