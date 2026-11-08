/* Kvant hesablamaları kursu: interaktiv simulyatorlar və testlər.
   Dərs indeksləri (0-dan): 2 Blox sferası, 3 ölçmə, 4 bir kubitlik laboratoriya,
   5 iki kubit və Bell vəziyyəti, 7 Qrover, 8 BB84. */
LMS.registerCourse('kvant', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const S2 = Math.SQRT1_2;

  // ---------- kompleks ədədlər ----------
  const C = (re, im = 0) => ({ re, im });
  const add = (a, b) => C(a.re + b.re, a.im + b.im);
  const mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
  const abs2 = a => a.re * a.re + a.im * a.im;
  const arg = a => Math.atan2(a.im, a.re);
  const fmtC = a => {
    const r = Math.abs(a.re) < 5e-4 ? 0 : a.re, i = Math.abs(a.im) < 5e-4 ? 0 : a.im;
    if (!i) return r.toFixed(3);
    if (!r) return (i < 0 ? '−' : '') + Math.abs(i).toFixed(3) + 'i';
    return `${r.toFixed(3)}${i < 0 ? ' − ' : ' + '}${Math.abs(i).toFixed(3)}i`;
  };
  const G = {
    X: [[C(0), C(1)], [C(1), C(0)]],
    Y: [[C(0), C(0, -1)], [C(0, 1), C(0)]],
    Z: [[C(1), C(0)], [C(0), C(-1)]],
    H: [[C(S2), C(S2)], [C(S2), C(-S2)]],
    S: [[C(1), C(0)], [C(0), C(0, 1)]],
    T: [[C(1), C(0)], [C(0), C(S2, S2)]],
  };
  const apply1 = (M, v) => [add(mul(M[0][0], v[0]), mul(M[0][1], v[1])), add(mul(M[1][0], v[0]), mul(M[1][1], v[1]))];
  function blochOf(v) {
    const th = 2 * Math.acos(Math.min(1, Math.sqrt(abs2(v[0]))));
    const ph = abs2(v[1]) < 1e-9 || abs2(v[0]) < 1e-9 ? 0 : arg(v[1]) - arg(v[0]);
    return [th, ph];
  }

  // ---------- Blox sferasının çəkilməsi ----------
  function drawBloch(svg, th, ph) {
    const R = 105, cx = 150, cy = 150;
    const P = (x, y, z) => [cx + R * (0.94 * y - 0.42 * x), cy + R * (0.28 * x - 0.94 * z)];
    const ring = (f) => Array.from({ length: 73 }, (_, k) => { const t = k / 72 * 2 * Math.PI; return P(...f(t)).join(','); }).join(' ');
    const x = Math.sin(th) * Math.cos(ph), y = Math.sin(th) * Math.sin(ph), z = Math.cos(th);
    const [vx, vy] = P(x, y, z), [zx, zy] = P(0, 0, z);
    const lab = (t, p, s) => `<text x="${P(...p)[0]}" y="${P(...p)[1]}" text-anchor="middle" dominant-baseline="middle" font-family="var(--mono)" font-size="13" font-weight="700" fill="var(--muted)">${t}</text>`;
    svg.innerHTML = `
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="var(--accent-soft)" stroke="var(--line)" stroke-width="2"/>
      <polyline points="${ring(t => [Math.cos(t), Math.sin(t), 0])}" fill="none" stroke="var(--muted)" stroke-dasharray="4 5"/>
      <polyline points="${ring(t => [0, Math.cos(t), Math.sin(t)])}" fill="none" stroke="var(--line)"/>
      <line x1="${P(0, 0, 1)[0]}" y1="${P(0, 0, 1)[1]}" x2="${P(0, 0, -1)[0]}" y2="${P(0, 0, -1)[1]}" stroke="var(--muted)"/>
      <line x1="${P(1, 0, 0)[0]}" y1="${P(1, 0, 0)[1]}" x2="${P(-1, 0, 0)[0]}" y2="${P(-1, 0, 0)[1]}" stroke="var(--line)"/>
      <line x1="${P(0, 1, 0)[0]}" y1="${P(0, 1, 0)[1]}" x2="${P(0, -1, 0)[0]}" y2="${P(0, -1, 0)[1]}" stroke="var(--line)"/>
      ${lab('|0⟩', [0, 0, 1.18])}${lab('|1⟩', [0, 0, -1.18])}${lab('|+⟩', [1.32, 0, 0])}${lab('|i⟩', [0, 1.22, 0])}
      <line x1="${vx}" y1="${vy}" x2="${zx}" y2="${zy}" stroke="var(--accent)" stroke-dasharray="3 4" opacity=".6"/>
      <line x1="${cx}" y1="${cy}" x2="${vx}" y2="${vy}" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
      <circle cx="${vx}" cy="${vy}" r="8" fill="var(--accent)" stroke="var(--panel)" stroke-width="2"/>`;
  }
  const bars = (labels, probs) => labels.map((l, i) => `<div class="pbar"><span>${l}</span><div class="t"><i style="width:${(probs[i] * 100).toFixed(1)}%"></i></div><b>${(probs[i] * 100).toFixed(1)}%</b></div>`).join('');

  // ================= Blox laboratoriyası =================
  (() => {
    const tIn = $('blTin'), pIn = $('blPin'); let moved = 0;
    function draw() {
      const th = tIn.value * Math.PI / 180, ph = pIn.value * Math.PI / 180;
      $('blT').textContent = tIn.value + '°'; $('blP').textContent = pIn.value + '°';
      const a = Math.cos(th / 2), b = C(Math.sin(th / 2) * Math.cos(ph), Math.sin(th / 2) * Math.sin(ph));
      $('blAmp').innerHTML = `|ψ⟩ = <b>${a.toFixed(3)}</b>|0⟩ + <b>(${fmtC(b)})</b>|1⟩`;
      $('blBars').innerHTML = bars(['P(0)', 'P(1)'], [a * a, abs2(b)]);
      drawBloch($('blSvg'), th, ph);
      const eq = Math.abs(tIn.value - 90) < 3;
      $('blMsg').innerHTML = eq ? '<div class="msg info">Ekvatordasınız: ölçmə 50/50 verir. Fazanı (φ) dəyişin: ehtimallar dəyişmir, amma vəziyyət fərqli olur. Bu fərq qapılarla işləyəndə və interferensiyada özünü göstərir.</div>' : '';
      if (++moved > 5) api.done(2);
    }
    tIn.oninput = draw; pIn.oninput = draw;
    document.querySelectorAll('[data-bl]').forEach(b => b.onclick = () => { const [t, p] = b.dataset.bl.split(','); tIn.value = t; pIn.value = p; draw(); });
    draw();
  })();

  // ================= Ölçmə laboratoriyası =================
  (() => {
    let n0 = 0, n1 = 0;
    const tIn = $('msTin');
    const p0 = () => Math.cos(tIn.value * Math.PI / 360) ** 2;
    function draw(last) {
      $('msT').textContent = tIn.value + '°';
      $('msInfo').innerHTML = `Nəzəri ehtimal: P(0) = <b>${(p0() * 100).toFixed(1)}%</b>, P(1) = <b>${((1 - p0()) * 100).toFixed(1)}%</b>${last != null ? ` · son ölçmə: <b>${last}</b>` : ''}`;
      const tot = n0 + n1 || 1, mx = Math.max(n0, n1, 1);
      $('msHist').innerHTML = [['0', n0], ['1', n1]].map(([l, n]) => `<div><b>${n}</b><i style="height:${n / mx * 110}px"></i><span>${l} · ${(n / tot * 100).toFixed(1)}%</span></div>`).join('');
      const total = n0 + n1;
      $('msMsg').innerHTML = total >= 1000 ? `<div class="msg ok">${total} ölçmədə nəticələrin payı nəzəri ehtimala çox yaxındır. Bir ölçmə təsadüfdür, min ölçmə isə amplitudları göstərir.</div>` : total ? `<div class="fb">Cəmi ${total} ölçmə. Az ölçmədə nəticə nəzəri ehtimaldan xeyli fərqlənə bilər.</div>` : '';
      if (total >= 1000) api.done(3);
    }
    document.querySelectorAll('[data-ms]').forEach(b => b.onclick = () => { let last; for (let k = 0; k < +b.dataset.ms; k++) { last = Math.random() < p0() ? 0 : 1; last ? n1++ : n0++; } draw(last); });
    tIn.oninput = () => { n0 = n1 = 0; draw(); };
    $('msReset').onclick = () => { n0 = n1 = 0; draw(); };
    draw();
  })();

  // ================= Bir kubitlik laboratoriya =================
  (() => {
    let v, seq;
    const PZ = [
      ['one', '|1⟩ vəziyyətini alın (ölçmə həmişə 1 versin)', (v, s) => abs2(v[1]) > 0.999],
      ['half', '50/50 superpozisiya alın', (v, s) => Math.abs(abs2(v[0]) - 0.5) < 0.001],
      ['minus', '|−⟩ vəziyyətini alın (ekvatorda, |+⟩-ın əks tərəfi)', (v, s) => { const [t, p] = blochOf(v); return Math.abs(t - Math.PI / 2) < 1e-3 && Math.abs(Math.cos(p) + 1) < 1e-3; }],
      ['hh', 'H-ı iki dəfə tətbiq edib yenidən |0⟩ alın (interferensiya!)', (v, s) => s.filter(g => g === 'H').length >= 2 && abs2(v[0]) > 0.999],
      ['hzh', 'X istifadə etmədən, yalnız H və Z ilə |1⟩ alın', (v, s) => s.length && s.every(g => g === 'H' || g === 'Z') && abs2(v[1]) > 0.999],
    ];
    const solved = new Set();
    function reset() { v = [C(1), C(0)]; seq = []; draw(); }
    function draw() {
      $('g1Wire').textContent = 'q ─ |0⟩ ─' + seq.map(g => `[${g}]─`).join('') + '─ 📏';
      $('g1Amp').innerHTML = `|ψ⟩ = (${fmtC(v[0])})|0⟩ + (${fmtC(v[1])})|1⟩`;
      $('g1Bars').innerHTML = bars(['P(0)', 'P(1)'], [abs2(v[0]), abs2(v[1])]);
      drawBloch($('g1Svg'), ...blochOf(v));
      PZ.forEach(([k, , f]) => { if (f(v, seq)) solved.add(k); });
      $('g1Puz').innerHTML = PZ.map(([k, t]) => `<li class="${solved.has(k) ? 'ok' : ''}">${solved.has(k) ? '✅' : '⬜'} ${esc(t)}</li>`).join('') + `<li class="fb" style="border:0;background:none">Həll edilib: ${solved.size} / ${PZ.length}${solved.size >= 4 ? ' · Dərs tamamlandı ✓' : ' · 4 tapmacanı həll edin. Hər tapmacadan əvvəl “Sıfırla” düyməsini basın.'}</li>`;
      if (solved.size >= 4) api.done(4);
    }
    const box = $('g1Btns');
    ['X', 'Y', 'Z', 'H', 'S', 'T'].forEach(g => { const b = document.createElement('button'); b.textContent = g; b.onclick = () => { v = apply1(G[g], v); seq.push(g); draw(); }; box.appendChild(b); });
    const r = document.createElement('button'); r.className = 'reset'; r.textContent = 'Sıfırla'; r.onclick = reset; box.appendChild(r);
    reset();
  })();

  // ================= İki kubit =================
  (() => {
    const L = ['00', '01', '10', '11']; // q0q1
    let v, seq;
    const idx = (q0, q1) => q0 * 2 + q1;
    function one(g, q) {
      const M = G[g], out = v.map(() => C(0));
      for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
        const i = idx(a, b), bit = q === 0 ? a : b;
        for (let nb = 0; nb < 2; nb++) {
          const j = q === 0 ? idx(nb, b) : idx(a, nb);
          out[j] = add(out[j], mul(M[nb][bit], v[i]));
        }
      }
      v = out;
    }
    function cnot() { const o = v.slice(); o[idx(1, 0)] = v[idx(1, 1)]; o[idx(1, 1)] = v[idx(1, 0)]; v = o; }
    function reset() { v = [C(1), C(0), C(0), C(0)]; seq = []; $('g2Hist').innerHTML = ''; $('g2Msg').innerHTML = ''; draw(); }
    const isBell = () => Math.abs(abs2(v[0]) - .5) < 1e-3 && Math.abs(abs2(v[3]) - .5) < 1e-3;
    function draw() {
      $('g2Wire').innerHTML = 'q0 ─|0⟩─' + seq.map(s => s[1] === 0 || s[0] === 'CNOT' ? `[${s[0] === 'CNOT' ? '●' : s[0]}]─` : '────').join('') + '─📏<br>q1 ─|0⟩─' + seq.map(s => s[0] === 'CNOT' ? '[⊕]─' : s[1] === 1 ? `[${s[0]}]─` : '────').join('') + '─📏';
      $('g2Bars').innerHTML = bars(L.map(l => '|' + l + '⟩'), v.map(abs2));
    }
    const box = $('g2Btns');
    [['H', 0], ['H', 1], ['X', 0], ['X', 1], ['Z', 0], ['CNOT']].forEach(([g, q]) => {
      const b = document.createElement('button'); b.textContent = g === 'CNOT' ? 'CNOT q0→q1' : `${g} q${q}`;
      b.onclick = () => { if (g === 'CNOT') cnot(); else one(g, q); seq.push([g, q]); draw(); };
      box.appendChild(b);
    });
    const r = document.createElement('button'); r.className = 'reset'; r.textContent = 'Sıfırla'; r.onclick = reset; box.appendChild(r);
    $('g2Meas').onclick = () => {
      const p = v.map(abs2), cnt = [0, 0, 0, 0];
      for (let k = 0; k < 100; k++) { let r = Math.random(), i = 0; while (i < 3 && r > p[i]) { r -= p[i]; i++; } cnt[i]++; }
      const mx = Math.max(...cnt, 1);
      $('g2Hist').innerHTML = L.map((l, i) => `<div><b>${cnt[i]}</b><i style="height:${cnt[i] / mx * 110}px"></i><span>${l}</span></div>`).join('');
      if (isBell()) { $('g2Msg').innerHTML = '<div class="msg ok">🎉 Bell vəziyyəti! Yalnız 00 və 11 alınır: kubitlərin nəticələri həmişə eynidir, amma hansının alınacağı təsadüfidir. Bu, dolaşıqlıqdır. Real kvant kompüterlərində də ilk sınaq dövrələrindən biri məhz budur.</div>'; api.done(5); }
      else $('g2Msg').innerHTML = '<div class="msg info">Bu, hələ Bell vəziyyəti deyil. “Sıfırla” basın və sınayın: əvvəlcə q0-a H, sonra CNOT.</div>';
    };
    reset();
  })();

  // ================= Qrover =================
  (() => {
    const N = 8, sel = $('grT');
    for (let i = 0; i < N; i++) sel.insertAdjacentHTML('beforeend', `<option value="${i}">${i.toString(2).padStart(3, '0')}</option>`);
    sel.value = '5';
    let a, steps;
    function reset() { a = Array(N).fill(1 / Math.sqrt(N)); steps = 0; draw(); }
    function step() {
      const t = +sel.value; a[t] = -a[t];
      const m = a.reduce((s, x) => s + x, 0) / N; a = a.map(x => 2 * m - x);
      steps++; draw();
    }
    function draw() {
      const t = +sel.value;
      $('grBars').innerHTML = a.map((x, i) => {
        const h = Math.abs(x) * 80;
        return `<div class="col"><i style="${x >= 0 ? `bottom:50%;height:${h}%` : `top:50%;height:${h}%`};background:${i === t ? 'var(--ex-red-b)' : 'var(--accent)'}"></i><span>${i.toString(2).padStart(3, '0')}</span></div>`;
      }).join('');
      const p = a[t] * a[t];
      const opt = Math.round(Math.PI / 4 * Math.sqrt(N));
      let m = `Addım: <b>${steps}</b> · axtarılanın tapılma ehtimalı: <b>${(p * 100).toFixed(1)}%</b> (klassik təsadüfi seçim: 12.5%).`;
      if (steps === opt) m += ` <br>Optimal addım sayına çatdınız: π/4·√8 ≈ ${opt}. İndi ölçsəniz, ~${(p * 100).toFixed(0)}% ehtimalla düzgün cavabı alacaqsınız.`;
      if (steps > opt) m += ' <br>⚠️ Daha bir addım ehtimalı <b>azaldır</b>! Qrover alqoritmi fırlanmadır: “həddən artıq fırlansanız”, hədəfi keçirsiniz. Ona görə addım sayını əvvəlcədən hesablamaq lazımdır.';
      $('grMsg').innerHTML = `<div class="msg ${p > 0.9 ? 'ok' : 'info'}">${m}</div>`;
      if (p > 0.9) api.done(7);
    }
    $('grStep').onclick = step; $('grReset').onclick = reset; sel.onchange = reset;
    reset();
  })();

  // ================= BB84 =================
  (() => {
    const rb = () => Math.random() < 0.5 ? 0 : 1;
    const B = ['+', '×'];
    $('bbRun').onclick = () => {
      const eve = $('bbEve').checked, n = 16, rows = [];
      for (let k = 0; k < n; k++) {
        const ab = rb(), aB = rb();
        let bit = ab, basis = aB, eB = null;
        if (eve) { eB = rb(); const eBit = eB === basis ? bit : rb(); bit = eBit; basis = eB; }
        const bB = rb(), bBit = bB === basis ? bit : rb();
        rows.push({ ab, aB, eB, bB, bBit, keep: aB === bB });
      }
      const kept = rows.filter(r => r.keep), err = kept.filter(r => r.ab !== r.bBit).length;
      const cell = (r, v, extra = '') => `<td class="${!r.keep ? 'd' : extra}">${v}</td>`;
      $('bbTable').innerHTML = `<table class="bb">
        <tr><th>Alisanın biti</th>${rows.map(r => cell(r, r.ab)).join('')}</tr>
        <tr><th>Alisanın bazisi</th>${rows.map(r => cell(r, B[r.aB])).join('')}</tr>
        ${eve ? `<tr><th>🕵️ Evanın bazisi</th>${rows.map(r => cell(r, B[r.eB])).join('')}</tr>` : ''}
        <tr><th>Bobun bazisi</th>${rows.map(r => cell(r, B[r.bB])).join('')}</tr>
        <tr><th>Bobun nəticəsi</th>${rows.map(r => cell(r, r.bBit, r.keep ? (r.ab === r.bBit ? 'k' : 'x') : '')).join('')}</tr></table>`;
      const rate = kept.length ? err / kept.length : 0;
      $('bbMsg').innerHTML = `<div class="msg ${err ? 'bad' : 'ok'}">Bazisləri uyğun gələn <b>${kept.length}</b> bit açar üçün saxlanıldı (solğun sütunlar atılır). Səhvlər: <b>${err}</b> (${(rate * 100).toFixed(0)}%). ` +
        (eve ? (err ? 'Eva kanalı dinlədi və fotonları dəyişdi: Alisa ilə Bob açarın bir hissəsini müqayisə edib səhvləri görür və bu açarı atırlar. Uzun açarlarda Eva təxminən <b>25%</b> səhv yaradır.' : 'Bu dəfə Eva təsadüfən iz qoymadı, amma uzun açarda (məsələn, 1000 bit) o, mütləq təxminən 25% səhv yaradır. Yenidən göndərin.') : 'Dinləyən yoxdur: Alisa ilə Bobun açarı tam eynidir. İndi “Eva kanalı dinləyir” seçin.') + '</div>';
      if (eve) api.done(8);
    };
  })();

  // ================= Testlər =================
  const QUIZ = {
    intro: [
      { q: 'Kubitin klassik bitdən əsas fərqi:', o: ['Daha çox yaddaş tutur', '0 və 1-in superpozisiyasında ola bilər', 'Daha sürətli fırlanır'], a: 1, e: 'Superpozisiya: α|0⟩ + β|1⟩.' },
      { q: 'Kvant kompüteri noutbukunuzu əvəz edəcəkmi?', o: ['Bəli, tezliklə', 'Xeyr, o, xüsusi məsələlər üçün ixtisaslaşmış alətdir'], a: 1, e: 'Gündəlik işlər üçün klassik kompüter həmişə daha yaxşıdır.' },
      { q: 'Kvant kompüteri ideyasını 1981-ci ildə kim irəli sürüb?', o: ['Riçard Feynman', 'Albert Eynşteyn', 'Alan Türinq'], a: 0, e: '“Təbiəti simulyasiya etmək üçün kvant kompüteri lazımdır.”' },
      { q: 'Kvant kompüterinin nəticəsi necə alınır?', o: ['Həmişə dəqiq', 'Ölçmə ilə, ehtimallı şəkildə'], a: 1, e: 'Ona görə alqoritm çox dəfə işə salınır.' },
    ],
    weird: [
      { q: 'İkiqat yarıq təcrübəsində elektronların hansı yarıqdan keçdiyini ölçsək, nə olur?', o: ['İnterferensiya mənzərəsi yox olur', 'Heç nə dəyişmir'], a: 0, e: 'Ölçmə superpozisiyanı pozur.' },
      { q: 'Superpozisiya nədir?', o: ['Kubit əslində 0 və ya 1-dir, sadəcə bilmirik', 'Amplitudların qarışığı: onlar bir-birini gücləndirə və ya söndürə bilir'], a: 1, e: 'Gizli qiymət olsaydı, interferensiya olmazdı.' },
      { q: 'Böyük cisimlər niyə superpozisiyada görünmür?', o: ['Dekoherensiya: ətraf mühitlə qarşılıqlı təsir superpozisiyanı dərhal pozur', 'Onlar kvant qanunlarına tabe deyil'], a: 0, e: 'Şredinger pişiyi buna görə həm diri, həm ölü görünmür.' },
      { q: '1927-ci il Solvey konfransı nə ilə məşhurdur?', o: ['Kvant mexanikasının banilərini bir yerə toplaması ilə', 'İlk kompüterin təqdimatı ilə'], a: 0, e: '29 iştirakçıdan 17-si Nobel mükafatçısı olub və ya olacaqdı.' },
    ],
    qubit: [
      { q: '|ψ⟩ = 0.6|0⟩ + 0.8|1⟩. Ölçəndə 1 alınma ehtimalı:', o: ['0.8 = 80%', '0.64 = 64%', '0.36 = 36%'], a: 1, e: '|β|² = 0.8² = 0.64.' },
      { q: 'Blox sferasının şimal qütbü:', o: ['|0⟩', '|1⟩', '|+⟩'], a: 0, e: 'Cənub qütbü |1⟩-dir.' },
      { q: '|+⟩ və |−⟩ ölçmədə eyni ehtimalları verir. Onlar eyni vəziyyətdirmi?', o: ['Bəli', 'Xeyr, fazaları fərqlidir və interferensiyada fərqli davranırlar'], a: 1, e: 'Faza ölçmədə birbaşa görünmür, amma vacibdir.' },
      { q: 'Amplitudların kvadratlarının cəmi nəyə bərabərdir?', o: ['1', '0', '2'], a: 0, e: '|α|² + |β|² = 1, yəni ehtimalların cəmi.' },
    ],
    measure: [
      { q: 'Ölçmədən sonra kubitin vəziyyəti:', o: ['Dəyişmir', 'Ölçülən nəticəyə (|0⟩ və ya |1⟩) çökür'], a: 1, e: 'Ölçmə geri qaytarılmazdır.' },
      { q: 'Kvant alqoritmləri niyə yüzlərlə və ya minlərlə dəfə işə salınır?', o: ['Hər ölçmə təsadüfi olduğu üçün statistika lazımdır', 'Kompüter yavaş olduğu üçün'], a: 0, e: '“Shots”.' },
      { q: 'n kubitdən bir ölçmədə neçə bit məlumat alırıq?', o: ['n bit', '2ⁿ bit'], a: 0, e: 'Daxili vəziyyət 2ⁿ amplituddur, amma ölçmədə yalnız n bit alınır.' },
    ],
    gates: [
      { q: 'X qapısının klassik analoqu:', o: ['DEYİL (NOT)', 'VƏ (AND)'], a: 0, e: '|0⟩ ↔ |1⟩.' },
      { q: '|0⟩-a H tətbiq etsək:', o: ['|1⟩', '50/50 superpozisiya |+⟩', 'Dəyişməz'], a: 1, e: 'Adamar qapısı.' },
      { q: 'H iki dəfə tətbiq olunsa (HH|0⟩):', o: ['50/50 qalır', 'Yenidən |0⟩ alınır'], a: 1, e: 'İnterferensiya: |1⟩-ə aparan yollar bir-birini söndürür.' },
      { q: 'Kvant qapıları ilə ölçmənin fərqi:', o: ['Qapılar geri qaytarılandır, ölçmə isə yox', 'Fərq yoxdur'], a: 0, e: 'Unitar əməliyyatlar.' },
    ],
    entangle: [
      { q: 'Bell vəziyyətini ölçəndə hansı nəticələr alınır?', o: ['00, 01, 10, 11 bərabər', 'Yalnız 00 və 11'], a: 1, e: '(|00⟩ + |11⟩)/√2.' },
      { q: 'Bell vəziyyəti necə qurulur?', o: ['H q0, sonra CNOT', 'X q0, sonra X q1'], a: 0, e: 'Laboratoriyada etdiyiniz kimi.' },
      { q: 'Dolaşıqlıqla işıqdan sürətli mesaj göndərmək olarmı?', o: ['Bəli', 'Xeyr: hər tərəf yalnız təsadüfi nəticə görür'], a: 1, e: 'Uyğunluq yalnız adi kanalla müqayisədə görünür.' },
      { q: '2022-ci il fizika üzrə Nobel mükafatı nəyə görə verilib?', o: ['Dolaşıqlığın təcrübə ilə sübutuna görə', 'İlk kvant kompüterinə görə'], a: 0, e: 'Aspe, Klauzer, Zaylinger.' },
    ],
    interf: [
      { q: '“Kvant kompüteri bütün cavabları eyni anda yoxlayır”. Bu:', o: ['Doğrudur', 'Yanlış sadələşdirmədir: əsas iş interferensiya ilə görülür'], a: 1, e: 'Ölçəndə təsadüfi bir cavab alınır.' },
      { q: 'Yaxşı kvant alqoritmi nə edir?', o: ['Səhv cavabların amplitudlarını söndürür, düzgün cavabınkını gücləndirir', 'Hər şeyi təsadüfi edir'], a: 0, e: 'Dağıdıcı və quruculuq interferensiyası.' },
      { q: 'Doyç alqoritmi klassik üsulla müqayisədə funksiyanı neçə dəfə çağırır?', o: ['1 dəfə (klassik üsulda 2)', '100 dəfə'], a: 0, e: 'Kiçik, amma prinsipcə vacib üstünlük.' },
    ],
    algo: [
      { q: '1 milyon elementdə axtarış üçün Qrover təxminən neçə addım tələb edir?', o: ['~1 000', '~500 000', '~1 milyon'], a: 0, e: '~√N. Dəqiq desək, π/4·√N ≈ 785.' },
      { q: 'Qrover alqoritmində lazım olandan çox addım atsaq:', o: ['Ehtimal daha da artır', 'Ehtimal azalır: hədəf “keçilir”'], a: 1, e: 'Laboratoriyada gördüyünüz kimi.' },
      { q: 'Şor alqoritmi hansı şifrələməni təhdid edir?', o: ['RSA', 'Yalnız köhnə parolları'], a: 0, e: 'Vuruqlara ayırmanı sürətləndirir.' },
      { q: 'Bu gün RSA-2048-i Şor alqoritmi ilə açmaq mümkündürmü?', o: ['Bəli', 'Xeyr: bunun üçün çox sayda, xətası düzəldilmiş kubit lazımdır'], a: 1, e: 'Belə kompüter hələ yoxdur.' },
    ],
    crypto: [
      { q: '“İndi topla, sonra aç” təhlükəsi nədir?', o: ['Şifrələnmiş məlumatı bu gün toplayıb gələcəkdə kvant kompüteri ilə açmaq', 'Kompüter virusu'], a: 0, e: 'Uzunmüddətli sirlər indidən qorunmalıdır.' },
      { q: 'NIST ilk post-kvant standartlarını nə vaxt təsdiqlədi?', o: ['2024-cü il avqust', '1984'], a: 0, e: 'ML-KEM, ML-DSA, SLH-DSA.' },
      { q: 'BB84-də Eva kanalı dinləyəndə nə baş verir?', o: ['Heç kim bilmir', 'Açarda səhvlər yaranır (~25%) və dinləmə aşkarlanır'], a: 1, e: 'Ölçmə vəziyyəti dəyişir.' },
      { q: 'BB84-də hansı bitlər açar üçün saxlanılır?', o: ['Alisa ilə Bobun bazisləri üst-üstə düşən bitlər', 'Hamısı'], a: 0, e: 'Qalanları atılır.' },
    ],
    hardware: [
      { q: 'Superkeçirici kubitlər hansı temperaturda işləyir?', o: ['Otaq temperaturunda', 'Mütləq sıfırdan bir neçə millidərəcə yuxarı'], a: 1, e: 'Kosmosdan da soyuqdur.' },
      { q: 'Dekoherensiya nədir?', o: ['Kubitin ətraf mühitin təsiri ilə kvant vəziyyətini itirməsi', 'Yeni kubit növü'], a: 0, e: 'Əsas düşmən.' },
      { q: 'Məntiqi kubit nədir?', o: ['Çoxlu fiziki kubitdən xəta düzəlişi ilə qurulan etibarlı kubit', 'Proqramdakı dəyişən'], a: 0, e: 'Kvant xəta düzəlişi.' },
      { q: 'NISQ dövrü nə deməkdir?', o: ['Küylü, orta ölçülü kvant cihazları dövrü', 'Kvant kompüterlərinin sonu'], a: 0, e: 'Preskill, 2018.' },
    ],
    myths: [
      { q: '“Kvant kompüterləri bütün məsələləri sürətləndirir.”', o: ['Mif', 'Fakt'], a: 0, e: 'Yalnız müəyyən növ məsələləri.' },
      { q: '“Kvant kompüterləri molekulların simulyasiyasında böyük üstünlük verə bilər.”', o: ['Mif', 'Fakt'], a: 1, e: 'Feynmanın ilk ideyası və ən perspektivli sahə.' },
      { q: '“Kvant enerjili bilərzik sağlamlığı yaxşılaşdırır.”', o: ['Mif', 'Fakt'], a: 0, e: 'Marketinq. Kvant hesablamaları ilə əlaqəsi yoxdur.' },
      { q: '“Bu gün kvant kompüteri bank şifrələrini aça bilir.”', o: ['Mif', 'Fakt'], a: 0, e: 'Hələ yox, amma hazırlıq indidən görülməlidir.' },
    ],
    start: [
      { q: 'IBM-in kvant proqramlaşdırma kitabxanası:', o: ['Qiskit', 'Pandas'], a: 0, e: 'Cirq isə Google-undur.' },
      { q: 'Qiskit-də qc.cx(0, 1) nə edir?', o: ['CNOT qapısı: 0 idarəedici, 1 hədəf', 'Kubiti silir'], a: 0, e: 'Dolaşıqlıq üçün.' },
      { q: 'Real kvant kompüterində proqram işə salmaq üçün:', o: ['Öz laboratoriyanızı qurmalısınız', 'Bulud vasitəsilə (məsələn, IBM Quantum) qoşulmaq olar'], a: 1, e: '2016-cı ildən mümkündür.' },
    ],
    final: [
      { q: 'Kubit ölçüləndə nə alınır?', o: ['0 və ya 1', 'Kompleks ədəd'], a: 0, e: 'Amplitudlar birbaşa görünmür.' },
      { q: '|ψ⟩ = (|0⟩ + |1⟩)/√2 üçün P(1):', o: ['50%', '71%', '100%'], a: 0, e: '(1/√2)² = 0.5.' },
      { q: 'Blox sferasında enlik (θ) nəyi müəyyən edir?', o: ['Ölçmə ehtimallarını', 'Kubitin rəngini'], a: 0, e: 'P(0) = cos²(θ/2).' },
      { q: 'Faza (φ) ölçmədə birbaşa görünürmü?', o: ['Xeyr, amma interferensiyaya təsir edir', 'Bəli'], a: 0, e: '|+⟩ və |−⟩.' },
      { q: 'H qapısının rolu:', o: ['Superpozisiya yaratmaq', 'Kubiti silmək'], a: 0, e: 'Adamar.' },
      { q: 'HH|0⟩ = ?', o: ['|0⟩', '|1⟩', '50/50'], a: 0, e: 'İnterferensiya.' },
      { q: 'Dolaşıq kubitlər üçün hansı doğrudur?', o: ['Ayrılıqda öz vəziyyətləri yoxdur, nəticələri korrelyasiyalıdır', 'Onlar fiziki olaraq birləşiblər'], a: 0, e: 'Bell vəziyyəti.' },
      { q: 'Kvant üstünlüyünün əsas mənbəyi:', o: ['İnterferensiya', 'Daha sürətli elektrik'], a: 0, e: 'Amplitudların söndürülməsi və gücləndirilməsi.' },
      { q: 'Qrover alqoritminin sürətlənməsi:', o: ['Kvadratik (√N)', 'Eksponensial'], a: 0, e: 'N → √N.' },
      { q: 'Şor alqoritmi nəyi sürətləndirir?', o: ['Vuruqlara ayırmanı', 'Video emalını'], a: 0, e: 'RSA üçün təhdid.' },
      { q: 'Post-kvant kriptoqrafiya nədir?', o: ['Kvant kompüterinin də sürətlə aça bilmədiyi klassik alqoritmlər', 'Kvant kompüterində işləyən şifrə'], a: 0, e: 'NIST standartları, 2024.' },
      { q: 'BB84-ün təhlükəsizliyinin əsası:', o: ['Ölçmənin vəziyyəti dəyişməsi', 'Uzun parol'], a: 0, e: 'Dinləmə iz qoyur.' },
      { q: 'Dekoherensiyanın qarşısını almaq üçün superkeçirici kubitlər:', o: ['Çox güclü soyudulur', 'Qızdırılır'], a: 0, e: 'Millikelvinlər.' },
      { q: 'Google 2019-cu ildə nə elan etdi?', o: ['Xüsusi məsələdə kvant üstünlüyü (Sycamore, 53 kubit)', 'RSA-nın açılmasını'], a: 0, e: 'IBM nəticəni mübahisələndirdi.' },
      { q: 'Kvant kompüterlərinin ən perspektivli tətbiqi:', o: ['Kimya və materialların simulyasiyası', 'Mətn redaktəsi'], a: 0, e: 'Feynmanın ideyası.' },
    ],
  };
  api.quizzes(QUIZ);
});
