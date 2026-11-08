/* Süni intellekt kursu. Dərs indeksləri: 0 sorter, 1 sorter, 2 reqressiya, 3 neyron, 5 dil modeli, 6 prompt, 7 sorter, 8 sorter. */
LMS.registerCourse('si', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  api.sorter('s1Sort', { bins: ['Sİ / maşın öyrənməsi', 'Adi proqram'], done: 0, end: 'Fərq: Sİ qaydaları datadan öyrənir, adi proqram isə yazılmış qaydalara əməl edir.', items: [
    ['Kalkulyator', 1, 'Qaydalar əvvəlcədən yazılıb.'], ['Spam filtri', 0, 'Minlərlə məktubdan öyrənir.'], ['Üzlə telefon kilidi', 0], ['Excel-də SUM düsturu', 1],
    ['Video platformasının tövsiyələri', 0], ['Səhər 7:00-da çalan zəngli saat', 1], ['Səsli köməkçi', 0], ['Bankın şübhəli əməliyyat aşkarlaması', 0], ['Vergi kalkulyatoru (qanundakı düsturla)', 1]] });
  api.sorter('s2Sort', { bins: ['Nəzarətli', 'Nəzarətsiz', 'Möhkəmləndirmə'], done: 1, end: 'Nəzarətli öyrənmə “düzgün cavab” etiketi tələb edir, nəzarətsiz öyrənmə strukturu özü tapır, möhkəmləndirmə isə mükafatla öyrənir.', items: [
    ['Rentgen şəkillərindən sətəlcəmi tanımaq (həkimlər işarələyib)', 0], ['Müştəriləri alış vərdişlərinə görə qruplara bölmək', 1], ['Robotun yerimeyi sınaq və səhvlə öyrənməsi', 2],
    ['Mənzilin qiymətini sahəsinə görə proqnozlaşdırmaq', 0], ['Bank əməliyyatlarında qeyri-adi davranışı tapmaq', 1], ['Şahmat proqramının özü ilə milyonlarla oyun oynaması', 2], ['Məktubun spam olub-olmadığını müəyyən etmək', 0]] });

  // ================= Reqressiya =================
  (() => {
    const D = [[40, 70], [55, 92], [65, 110], [75, 118], [90, 150], [100, 160], [120, 196], [140, 228]];
    const wIn = $('lrWin'), bIn = $('lrBin');
    const X = x => 30 + (x - 30) / 130 * 280, Y = y => 220 - y / 260 * 200;
    const loss = (w, b) => D.reduce((s, [x, y]) => s + (w * x + b - y) ** 2, 0) / D.length;
    let anim = null;
    function draw() {
      const w = +wIn.value, b = +bIn.value, L = loss(w, b);
      $('lrW').textContent = w.toFixed(2); $('lrB').textContent = Math.round(b);
      $('lrLoss').innerHTML = `Model: qiymət = ${w.toFixed(2)} · sahə ${b >= 0 ? '+' : '−'} ${Math.abs(b).toFixed(0)}<br>Orta kvadratik xəta: <b>${L.toFixed(0)}</b>`;
      let g = '<g font-family="var(--mono)" font-size="10" fill="var(--muted)"><line x1="30" y1="220" x2="310" y2="220" stroke="var(--line)"/><line x1="30" y1="20" x2="30" y2="220" stroke="var(--line)"/><text x="290" y="234">m²</text><text x="4" y="16">min ₼</text>';
      D.forEach(([x, y]) => { const py = w * x + b; g += `<line x1="${X(x)}" y1="${Y(y)}" x2="${X(x)}" y2="${Y(py)}" stroke="var(--ex-red-b)" stroke-dasharray="3 3"/>`; });
      g += `<line x1="${X(30)}" y1="${Y(w * 30 + b)}" x2="${X(160)}" y2="${Y(w * 160 + b)}" stroke="var(--accent)" stroke-width="3"/>`;
      D.forEach(([x, y]) => { g += `<circle cx="${X(x)}" cy="${Y(y)}" r="5" fill="var(--ex-blue-b)"/>`; });
      $('lrSvg').innerHTML = g + '</g>';
      if (L < 60) { $('lrMsg').innerHTML = '<div class="msg ok">Əla! Xəta çox kiçikdir: model nöqtələrə yaxşı uyğun gəlir. Qırmızı xətlər modelin hər nöqtədəki səhvidir.</div>'; api.done(2); }
    }
    $('lrGo').onclick = () => {
      if (anim) return;
      let w = +wIn.value, b = +bIn.value, k = 0;
      const lr = 0.00004;
      anim = setInterval(() => {
        for (let r = 0; r < 400; r++) {
          let gw = 0, gb = 0;
          D.forEach(([x, y]) => { const e = w * x + b - y; gw += 2 * e * x / D.length; gb += 2 * e / D.length; });
          w -= lr * gw; b -= lr * 400 * gb;
        }
        wIn.value = Math.max(0, Math.min(3, w)); bIn.value = Math.max(-50, Math.min(150, b)); draw();
        if (++k >= 40) { clearInterval(anim); anim = null; $('lrMsg').innerHTML += '<div class="fb">Kompüter 16 000 kiçik addımla xətanı minimuma endirdi. Bu, qradiyent enişidir.</div>'; }
      }, 50);
    };
    api.onUnmount(() => { if (anim) clearInterval(anim); });
    wIn.oninput = draw; bIn.oninput = draw; draw();
  })();

  // ================= Neyron =================
  (() => {
    const ins = ['pW1in', 'pW2in', 'pBin'].map($), solved = new Set();
    function draw() {
      const [w1, w2, b] = ins.map(i => +i.value);
      $('pW1').textContent = w1; $('pW2').textContent = w2; $('pB').textContent = b;
      const rows = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([a, c]) => [a, c, w1 * a + w2 * c + b > 0 ? 1 : 0]);
      $('pTable').innerHTML = `<table class="tt"><tr><th>x₁</th><th>x₂</th><th>çıxış</th><th>VƏ</th><th>VƏ YA</th></tr>${rows.map(([a, c, o]) => `<tr><td>${a}</td><td>${c}</td><td class="res"><b>${o}</b></td><td>${a & c}</td><td>${a | c}</td></tr>`).join('')}</table>`;
      if (rows.every(([a, c, o]) => o === (a & c))) solved.add('and');
      if (rows.every(([a, c, o]) => o === (a | c))) solved.add('or');
      $('pPuz').innerHTML = [['and', 'Neyron VƏ (AND) kimi işləsin'], ['or', 'Neyron VƏ YA (OR) kimi işləsin']].map(([k, t]) => `<li class="${solved.has(k) ? 'ok' : ''}">${solved.has(k) ? '✅' : '⬜'} ${t}</li>`).join('') +
        (solved.size === 2 ? '<li class="fb" style="border:0">Bir neyron sadə qaydanı öyrənə bilir. Amma “XOR”u (yalnız biri 1 olanda 1) bir neyron heç vaxt öyrənə bilməz. Bu məhdudiyyət 1969-cu ildə sübut olundu və onu çoxqatlı şəbəkələr həll etdi.</li>' : '');
      if (solved.size === 2) api.done(3);
    }
    ins.forEach(i => i.oninput = draw); draw();
  })();

  // ================= Oyuncaq dil modeli =================
  (() => {
    const corpus = 'bu gün hava çox gözəldir . bu gün biz parka gedirik . bu gün dərs çox maraqlıdır . biz parka gedirik və top oynayırıq . hava çox soyuqdur . hava gözəldir və günəş parlayır . biz dərs oxuyuruq . süni intellekt çox maraqlıdır . süni intellekt dərs oxumağa kömək edir . məntiq çox maraqlıdır . biz məntiq oxuyuruq . günəş parlayır və hava istidir .'.split(' ');
    const M = {};
    for (let i = 0; i < corpus.length - 1; i++) { const a = corpus[i], b = corpus[i + 1]; (M[a] = M[a] || {})[b] = (M[a][b] || 0) + 1; }
    const starts = ['bu', 'biz', 'hava', 'süni', 'məntiq', 'günəş'];
    const sel = $('lmStart'); starts.forEach(s => sel.insertAdjacentHTML('beforeend', `<option>${s}</option>`));
    let toks, gens = 0;
    const tIn = $('lmTin');
    function probs(w) {
      const n = M[w] || { '.': 1 }, T = +tIn.value;
      const ks = Object.keys(n), ws = ks.map(k => Math.pow(n[k], 1 / T)), s = ws.reduce((a, b) => a + b, 0);
      return ks.map((k, i) => [k, ws[i] / s]).sort((a, b) => b[1] - a[1]);
    }
    function draw() {
      $('lmT').textContent = (+tIn.value).toFixed(1);
      $('lmOut').innerHTML = toks.map((t, i) => i === toks.length - 1 && toks.length > 1 ? `<b>${esc(t)}</b>` : esc(t)).join(' ');
      const p = probs(toks[toks.length - 1]);
      $('lmCand').innerHTML = `<div class="fb">“${esc(toks[toks.length - 1])}” sözündən sonra növbəti token üçün ehtimallar:</div>` + p.slice(0, 5).map(([k, v]) => `<div class="cand"><span>${esc(k)}</span><div class="t"><i style="width:${v * 100}%"></i></div><b>${(v * 100).toFixed(0)}%</b></div>`).join('');
    }
    function step() {
      const p = probs(toks[toks.length - 1]); let r = Math.random(), k = 0;
      while (k < p.length - 1 && r > p[k][1]) { r -= p[k][1]; k++; }
      toks.push(p[k][0]); if (toks.length > 40) toks = toks.slice(-40); draw();
    }
    function reset() { toks = [sel.value]; draw(); }
    $('lmStep').onclick = step;
    $('lmAuto').onclick = () => {
      for (let i = 0; i < 8; i++) step();
      gens++;
      $('lmMsg').innerHTML = `<div class="msg info">Temperatur aşağı olanda model ən ehtimallı sözləri seçir: mətn ardıcıl, amma darıxdırıcı olur. Temperatur yüksək olanda gözlənilməz sözlər çıxır: mətn yaradıcı, amma bəzən mənasız olur. Böyük dil modelləri də eyni prinsiplə işləyir, sadəcə milyardlarla parametr və trilyonlarla token üzərində.</div>`;
      if (gens >= 2) api.done(5);
    };
    $('lmReset').onclick = reset; sel.onchange = reset; tIn.oninput = draw;
    reset();
  })();

  // ================= Prompt qurucusu =================
  (() => {
    const F = [['pbRole', 'Kontekst'], ['pbTask', 'Tapşırıq'], ['pbCons', 'Məhdudiyyətlər'], ['pbFmt', 'Format'], ['pbEx', 'Nümunə']];
    function build() {
      const parts = F.map(([id, n]) => [n, $(id).value.trim()]).filter(([, v]) => v);
      $('pbOut').textContent = parts.map(([n, v]) => `${n}: ${v}`).join('\n\n') || '(sahələri doldurun)';
      const miss = F.slice(0, 4).filter(([id]) => !$(id).value.trim()).map(([, n]) => n);
      $('pbMsg').innerHTML = miss.length ? `<div class="msg info">Çatışmır: <b>${miss.join(', ')}</b>. Məsələn, məhdudiyyət: “5–7 cümlə, rəsmi ton, hüquqi termin işlətmə”. Format: “salamlama, 3 bəndlik siyahı, imza”.</div>` : '<div class="msg ok">Əla prompt! Model artıq kimin üçün, nə, hansı həcmdə və hansı formada yazacağını bilir.</div>';
      if (!miss.length) api.done(6);
    }
    F.forEach(([id]) => $(id).addEventListener('input', build)); build();
  })();

  api.sorter('s8Sort', { bins: ['Mütləq yoxlanılmalıdır', 'Yüngül baxış kifayətdir'], done: 7, end: 'Qayda: nəticə nə qədər vacibdirsə və səhvin qiyməti nə qədər yüksəkdirsə, yoxlama bir o qədər ciddi olmalıdır.', items: [
    ['Məhkəməyə təqdim olunacaq sənəddəki istinadlar', 0], ['Dosta yazılan ad günü təbriki', 1], ['Dərmanın dozası haqqında məlumat', 0], ['Müqavilədəki məbləğlər və tarixlər', 0], ['Bloq yazısı üçün başlıq variantları', 1], ['Kodun təhlükəsizlik hissəsi', 0], ['Toplantı üçün gündəlik qaralaması', 1], ['Tarixi faktlar olan referat', 0]] });
  api.sorter('s9Sort', { bins: ['Qəbuledilməz', 'Yüksək', 'Məhdud', 'Minimal'], done: 8, end: 'Sİ Aktının məntiqi belədir: insan həyatına təsir nə qədər böyükdürsə, tələb də bir o qədər sərtdir.', items: [
    ['Vətəndaşlara davranışlarına görə “sosial reytinq” vermək', 0], ['İşə qəbulda CV-ləri avtomatik seçmək', 1], ['Saytdakı müştəri xidməti çatbotu', 2], ['Spam filtri', 3], ['Kredit almaq hüququnun qiymətləndirilməsi', 1],
    ['Sİ ilə yaradılmış realistik video (deepfake)', 2], ['Video oyunlardakı rəqiblər', 3], ['Uşaqların zəif cəhətlərindən istifadə edib onları zərərli davranışa təhrik edən oyuncaq', 0], ['İmtahan nəticələrinin avtomatik qiymətləndirilməsi', 1]] });

  const QUIZ = {
    intro: [
      { q: 'Maşın öyrənməsinin klassik proqramlaşdırmadan fərqi:', o: ['Qaydaları datadan özü öyrənir', 'Daha sürətli işləyir'], a: 0, e: 'Data + cavablar → qaydalar.' },
      { q: '“Süni intellekt” terminini kim təklif edib?', o: ['Con Makkarti', 'Alan Türinq', 'Bill Qeyts'], a: 0, e: '1955-ci il, Dartmut seminarına hazırlıq zamanı.' },
      { q: 'Bu gün ümumi Sİ (AGI) mövcuddurmu?', o: ['Bəli', 'Xeyr, bugünkü sistemlər dar ixtisaslıdır, AGI isə mübahisəli mövzudur'], a: 1, e: 'Dar Sİ hər yerdədir.' },
      { q: 'Deep Blue Kasparovu necə məğlub etdi?', o: ['Özü öyrənərək', 'İnsanların yazdığı qaydalarla saniyədə yüz milyonlarla gedişi yoxlayaraq'], a: 1, e: '1997.' },
    ],
    mltypes: [
      { q: 'Etiketlənmiş nümunələrlə öyrənmə:', o: ['Nəzarətli', 'Nəzarətsiz'], a: 0, e: 'Supervised.' },
      { q: 'AlphaGo özü ilə oynayaraq öyrənirdi. Bu nədir?', o: ['Möhkəmləndirmə ilə öyrənmə', 'Nəzarətsiz öyrənmə'], a: 0, e: 'Mükafat: qələbə.' },
      { q: 'Müştəriləri əvvəlcədən verilmiş qruplar olmadan seqmentlərə bölmək:', o: ['Nəzarətsiz', 'Nəzarətli'], a: 0, e: 'Klasterləşmə.' },
    ],
    learn: [
      { q: 'Xəta funksiyası nəyi ölçür?', o: ['Modelin proqnozunun real cavabdan nə qədər uzaq olduğunu', 'Kompüterin sürətini'], a: 0, e: 'Öyrənmə onu minimuma endirir.' },
      { q: 'Qradiyent enişi nədir?', o: ['Parametrləri xətanı azaldan istiqamətdə kiçik addımlarla dəyişmək', 'Datanı silmək'], a: 0, e: 'Dumanlı dağdan enmək kimi.' },
      { q: 'Böyük dil modelinin bu laboratoriyadakı modeldən əsas fərqi:', o: ['Prinsip eynidir, parametr sayı isə milyardlarladır', 'Tamamilə başqa prinsiplə işləyir'], a: 0, e: '2 parametr və milyardlarla parametr.' },
    ],
    nn: [
      { q: 'Süni neyron nə edir?', o: ['Girişləri çəkilərə vurub cəmləyir və həddi yoxlayır', 'Bioloji hüceyrə yaradır'], a: 0, e: 'Sadə riyazi funksiyadır.' },
      { q: 'Bir neyron hansı funksiyanı öyrənə bilməz?', o: ['XOR', 'VƏ', 'VƏ YA'], a: 0, e: 'Bunun üçün çoxqatlı şəbəkə lazımdır.' },
      { q: 'İlk öyrənən neyron şəbəkə maşını:', o: ['Mark I Perseptron (1958)', 'ENIAC'], a: 0, e: 'Frenk Rozenblat.' },
    ],
    deep: [
      { q: '“Dərin” öyrənmədə “dərin” nə deməkdir?', o: ['Çoxlu qat', 'Çox böyük kompüter'], a: 0, e: 'Hər qat daha mürəkkəb xüsusiyyət öyrənir.' },
      { q: '2012-ci il Sİ bumunun üç səbəbi:', o: ['Böyük data, GPU-lar, yaxşı alqoritmlər', 'Yeni internet, yeni dil, yeni ölkə'], a: 0, e: 'AlexNet.' },
      { q: 'AlphaGo kimi məğlub etdi?', o: ['Li Sedolu (Qo, 2016)', 'Kasparovu (şahmat)'], a: 0, e: 'Kasparovu Deep Blue məğlub edib.' },
    ],
    llm: [
      { q: 'Dil modelinin əsas işi:', o: ['Növbəti tokeni proqnozlaşdırmaq', 'İnternetdə axtarış etmək'], a: 0, e: 'Cavab token-token qurulur.' },
      { q: 'Transformer arxitekturası nə vaxt təqdim olunub?', o: ['2017', '1997'], a: 0, e: '“Attention Is All You Need”.' },
      { q: 'Temperatur artırılanda:', o: ['Cavablar daha müxtəlif və gözlənilməz olur', 'Model daha dəqiq olur'], a: 0, e: 'Yaradıcılıq və dəqiqlik arasında balans.' },
    ],
    prompt: [
      { q: 'Hansı prompt daha yaxşıdır?', o: ['“Məktub yaz”', 'Kontekst, tapşırıq, məhdudiyyət və format göstərilən prompt'], a: 1, e: 'Model təxmin etmir.' },
      { q: 'Mürəkkəb tapşırıqda faydalı fənd:', o: ['Modeldən əvvəlcə sual verməsini istəmək', 'Promptu mümkün qədər qısa yazmaq'], a: 0, e: '“Məndən nə lazımdır? Əvvəlcə 5 sual ver.”' },
    ],
    limits: [
      { q: 'Halüsinasiya nədir?', o: ['Modelin inamla uydurma fakt yaratması', 'Kompüterin istiləşməsi'], a: 0, e: 'Hər faktı yoxlayın.' },
      { q: 'Amazon-un işə qəbul sisteminin problemi:', o: ['Keçmiş datadakı gender qərəzini öyrəndi', 'Çox yavaş idi'], a: 0, e: 'Model datanın güzgüsüdür.' },
      { q: 'Pulsuz Sİ xidmətinə nəyi yazmamalı?', o: ['Müştəri datasını və parolları', 'Ümumi sualları'], a: 0, e: 'Məxfilik.' },
    ],
    ethics: [
      { q: 'AB Sİ Aktının əsas yanaşması:', o: ['Riskə əsaslanan', 'Hamısını qadağan etmək'], a: 0, e: 'Dörd risk səviyyəsi.' },
      { q: 'İşə qəbulda CV seçən Sİ hansı səviyyədir?', o: ['Yüksək risk', 'Minimal risk'], a: 0, e: 'İnsan nəzarəti və sənədləşmə tələb olunur.' },
      { q: 'Çatbot üçün əsas tələb:', o: ['İnsan Sİ ilə danışdığını bilməlidir', 'Qadağandır'], a: 0, e: 'Şəffaflıq.' },
    ],
    work: [
      { q: 'Sİ ən yaxşı nəticəni nə vaxt verir?', o: ['İnsanın işini gücləndirəndə', 'İnsanı tam əvəz edəndə'], a: 0, e: '“İnsan + Sİ”.' },
      { q: 'Hansı insanda qalmalıdır?', o: ['Son yoxlama və məsuliyyət', 'Qaralama yazmaq'], a: 0, e: 'Qaralamanı Sİ yaza bilər.' },
    ],
    final: [
      { q: 'Maşın öyrənməsi:', o: ['Datadan qaydaları öyrənir', 'Qaydaları proqramçı yazır'], a: 0, e: 'Data + cavablar → qaydalar.' },
      { q: 'Spam filtri hansı növ öyrənmədir?', o: ['Nəzarətli', 'Möhkəmləndirmə'], a: 0, e: 'Etiketli məktublar.' },
      { q: 'Qradiyent enişi:', o: ['Xətanı azaltmaq üçün parametrləri addım-addım dəyişmək', 'Datanı artırmaq'], a: 0, e: 'Öyrənmənin mühərriki.' },
      { q: 'Bir neyron XOR-u öyrənə bilərmi?', o: ['Xeyr', 'Bəli'], a: 0, e: 'Çoxqatlı şəbəkə lazımdır.' },
      { q: 'Dərin öyrənmədə qatların rolu:', o: ['Sadədən mürəkkəbə xüsusiyyətlər öyrənmək', 'Datanı saxlamaq'], a: 0, e: 'Kənarlar → formalar → obyektlər.' },
      { q: 'LLM cavabı necə yaradır?', o: ['Token-token, ehtimallara görə', 'Hazır cavabları bazadan götürür'], a: 0, e: 'Növbəti token proqnozu.' },
      { q: 'Müasir dil modellərinin arxitekturası:', o: ['Transformer', 'Perseptron'], a: 0, e: '2017.' },
      { q: 'Yüksək temperatur:', o: ['Daha yaradıcı, amma daha az proqnozlaşdırılan cavablar', 'Daha dəqiq faktlar'], a: 0, e: 'Balans.' },
      { q: 'Yaxşı promptun əsas hissəsi:', o: ['Kontekst və aydın tapşırıq', 'Çoxlu nida işarəsi'], a: 0, e: 'Model təxmin etməsin.' },
      { q: 'Halüsinasiyaya qarşı əsas qayda:', o: ['Vacib faktları müstəqil mənbədən yoxlamaq', 'Modelə daha çox güvənmək'], a: 0, e: 'Vəkillərin dərsi.' },
      { q: 'Model niyə qərəzli ola bilər?', o: ['Öyrəndiyi datada qərəz olduğu üçün', 'Proqramçılar istədiyi üçün'], a: 0, e: 'Data güzgüdür.' },
      { q: 'Sosial reytinq sistemi AB Sİ Aktına görə:', o: ['Qadağandır', 'Minimal risklidir'], a: 0, e: 'Qəbuledilməz risk.' },
      { q: 'Kredit qiymətləndirən Sİ:', o: ['Yüksək risk', 'Minimal risk'], a: 0, e: 'İnsanların həyatına təsir edir.' },
      { q: 'Sİ-ni işdə istifadə etməyin ən yaxşı yolu:', o: ['Təkrarlanan işləri həvalə edib nəticəni yoxlamaq', 'Hər şeyi yoxlamadan həvalə etmək'], a: 0, e: 'Gücləndirmə.' },
      { q: 'AlphaGo hansı oyunda dünya çempionlarından birini məğlub edib?', o: ['Qo', 'Şahmat'], a: 0, e: '2016, Li Sedol.' },
    ],
  };
  api.quizzes(QUIZ);
});
