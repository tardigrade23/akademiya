/* Chief AI Officer kursu. Dərs indeksləri: 0 sorter, 1 matris, 2 biznes keysi, 3 qərar köməkçisi, 4 checklist, 5 sorter, 6 sıra, 7 sorter, 8 100 gün. */
LMS.registerCourse('caio', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('az-AZ').replace(/,/g, ' ');

  api.sorter('c1Sort', { bins: ['CAIO', 'CIO / CTO', 'CDO (data)', 'Biznes rəhbəri'], done: 0, end: 'CAIO Sİ strategiyası, portfel və riskə cavabdehdir, amma hər use-case-in biznes sahibi şöbə rəhbəridir.', items: [
    ['Hansı Sİ layihələrinə investisiya qoyulacağını prioritetləşdirmək', 0], ['Şirkətin serverlərini və şəbəkəsini idarə etmək', 1], ['Müştəri datasının keyfiyyətinə və kataloquna cavabdeh olmaq', 2],
    ['Satış şöbəsində Sİ köməkçisinin nəticələrinə cavabdeh olmaq', 3], ['Şirkətin Sİ istifadə siyasətini hazırlamaq', 0], ['Data idarəetməsi standartlarını müəyyən etmək', 2], ['Sİ risklərinin reyestrini aparmaq', 0], ['Məhsulun texnoloji arxitekturasını seçmək', 1]] });

  // ===== Matris =====
  (() => {
    const U = [['Zəng xülasəsi', 8, 8], ['Zərər şəkillərinin qiymətləndirilməsi', 9, 3], ['Daxili sənəd axtarışı (RAG)', 6, 8], ['Sİ ilə korporativ şeir', 1, 9], ['Fırıldaqçılığın aşkarlanması', 9, 5], ['Tam avtomat kredit qərarı', 7, 2]];
    const sel = $('mxSel'); U.forEach((u, i) => sel.insertAdjacentHTML('beforeend', `<option value="${i}">${esc(u[0])}</option>`));
    const touched = new Set();
    const quad = (v, f) => v >= 6 && f >= 6 ? ['Tez qələbə', 'Dərhal başlayın: görünən nəticə inam yaradır.'] : v >= 6 ? ['Strateji mərc', 'Böyük dəyər, amma hazırlıq lazımdır (data, risk). Yol xəritəsinə salın.'] : f >= 6 ? ['Doldurucu', 'Asandır, amma dəyəri azdır. Hazır alətlə həll edin və ya təxirə salın.'] : ['Qaçın', 'Az dəyər və çətin icra. Resurs sərf etməyin.'];
    function draw() {
      const i = +sel.value; U[i][1] = +$('mxVin').value; U[i][2] = +$('mxFin').value;
      $('mxV').textContent = U[i][1]; $('mxF').textContent = U[i][2];
      const X = f => 40 + (f - 1) / 9 * 260, Y = v => 270 - (v - 1) / 9 * 250;
      let g = `<g font-family="Noto Sans,sans-serif" font-size="11"><rect x="170" y="20" width="130" height="125" fill="var(--ex-green)"/><rect x="40" y="20" width="130" height="125" fill="var(--ex-amber)"/><rect x="170" y="145" width="130" height="125" fill="var(--ex-blue)"/><rect x="40" y="145" width="130" height="125" fill="var(--ex-red)"/>
        <text x="235" y="36" text-anchor="middle" fill="var(--ink)" font-weight="700">Tez qələbə</text><text x="105" y="36" text-anchor="middle" fill="var(--ink)" font-weight="700">Strateji mərc</text><text x="235" y="262" text-anchor="middle" fill="var(--ink)" font-weight="700">Doldurucu</text><text x="105" y="262" text-anchor="middle" fill="var(--ink)" font-weight="700">Qaçın</text>
        <text x="170" y="292" text-anchor="middle" fill="var(--muted)">icra oluna bilmə →</text><text x="14" y="150" fill="var(--muted)" transform="rotate(-90 14 150)" text-anchor="middle">dəyər →</text>`;
      U.forEach(([n, v, f], k) => { g += `<circle cx="${X(f)}" cy="${Y(v)}" r="${k === i ? 9 : 6}" fill="${k === i ? 'var(--accent)' : 'var(--muted)'}" stroke="var(--panel)" stroke-width="2"/>`; if (k === i) g += `<text x="${Math.min(X(f) + 12, 230)}" y="${Y(v) + 4}" fill="var(--ink)" font-weight="700">${esc(n.slice(0, 16))}</text>`; });
      $('mxSvg').innerHTML = g + '</g>';
      const [q, t] = quad(U[i][1], U[i][2]);
      $('mxMsg').innerHTML = `<div class="msg info"><b>${q}:</b> ${t}</div>`;
    }
    sel.onchange = () => { const i = +sel.value; $('mxVin').value = U[i][1]; $('mxFin').value = U[i][2]; draw(); };
    $('mxVin').oninput = $('mxFin').oninput = () => { touched.add(sel.value); draw(); if (touched.size >= 3) api.done(1); };
    sel.onchange();
  })();

  // ===== Biznes keysi =====
  (() => {
    const ids = ['bcN', 'bcM', 'bcH', 'bcR', 'bcRM', 'bcA', 'bcC', 'bcU']; let changed = false;
    function calc() {
      const [n, m, h, r, rm, a, c, u] = ids.map(id => Math.max(0, +$(id).value || 0));
      const used = n * Math.min(u, 100) / 100;
      const gross = used * m / 60 * h, review = used * Math.min(r, 100) / 100 * rm / 60 * h, aiCost = used * a;
      const net = gross - review - aiCost, pay = net > 0 ? c / net : Infinity;
      $('bcOut').innerHTML = [[fmt(gross) + ' ₼', 'ümumi qənaət / ay'], [fmt(review) + ' ₼', 'insan yoxlaması / ay'], [fmt(aiCost) + ' ₼', 'Sİ xərci / ay'], [fmt(net) + ' ₼', 'xalis dəyər / ay'], [isFinite(pay) ? pay.toFixed(1) + ' ay' : '—', 'geri qayıtma']]
        .map(([x, l]) => `<div class="kpi"><div class="n">${x}</div><div class="l">${l}</div></div>`).join('');
      $('bcMsg').innerHTML = !isFinite(pay) ? '<div class="msg bad">Layihə xalis dəyər yaratmır: yoxlama və ya Sİ xərci qənaətdən çoxdur. Prosesi dəyişin və ya bu use-case-dən imtina edin.</div>'
        : `<div class="msg ${pay <= 12 ? 'ok' : 'info'}">Geri qayıtma: ${pay.toFixed(1)} ay. İstifadə səviyyəsini 70%-dən 40%-ə endirin və nəticənin necə dəyişdiyinə baxın: <b>adoption</b> çox vaxt texnologiyadan daha vacibdir.</div>`;
      if (changed) api.done(2);
    }
    ids.forEach(id => $(id).addEventListener('input', () => { changed = true; calc(); })); calc();
  })();

  // ===== Qur / al / tərəfdaş =====
  (() => {
    const Q = ['Bu use-case şirkətiniz üçün rəqabət üstünlüyüdürmü (unikal proses, unikal data)?', 'Daxildə Sİ mühəndisləri komandası varmı?', 'Bazarda bu tapşırıq üçün hazır, keyfiyyətli məhsul varmı?', 'Nəticə 3 ay ərzində lazımdır?'];
    const ans = Q.map(() => null);
    function draw() {
      $('bbQs').innerHTML = Q.map((q, i) => `<div class="qrow"><span>${esc(q)}</span><span class="yn"><button data-i="${i}" data-v="1" class="${ans[i] === 1 ? 'on' : ''}">Bəli</button><button data-i="${i}" data-v="0" class="${ans[i] === 0 ? 'on' : ''}">Xeyr</button></span></div>`).join('');
      $('bbQs').querySelectorAll('button').forEach(b => b.onclick = () => { ans[+b.dataset.i] = +b.dataset.v; draw(); });
      if (ans.some(a => a === null)) { $('bbOut').innerHTML = '<div class="fb">Bütün suallara cavab verin.</div>'; return; }
      const [adv, team, market, fast] = ans;
      let r;
      if (!adv && market) r = ['ALIN', 'Bu, rəqabət üstünlüyü deyil və hazır məhsul var. Öz həllinizi qurmaq resurs itkisidir.'];
      else if (adv && team && !fast) r = ['QURUN', 'Unikal dəyər, daxili komanda və vaxt var. Öz həlliniz rəqiblərin kopyalaya bilməyəcəyi üstünlük yaradacaq.'];
      else if (adv && !team) r = ['TƏRƏFDAŞLIQ', 'Bu, unikal dəyərdir, amma komanda yoxdur. Tərəfdaşla qurun və bu müddətdə daxili bacarıq yaradın, bilik transferini müqavilədə yazın.'];
      else if (fast && market) r = ['ALIN (indi), QURUN (sonra)', 'Tez nəticə üçün hazır məhsulla başlayın, uzunmüddətli dövrdə öz həllinizi planlaşdırın.'];
      else r = ['TƏRƏFDAŞLIQ və ya kiçik pilot', 'Mənzərə qarışıqdır. Kiçik, 8 həftəlik pilotla hipotezi yoxlayın.'];
      $('bbOut').innerHTML = `<div class="msg ok"><b>Tövsiyə: ${r[0]}</b><br>${r[1]}</div>`;
      api.done(3);
    }
    draw();
  })();

  // ===== Governance checklist =====
  (() => {
    const C = ['Yazılı Sİ istifadə siyasəti var', 'İcazə verilən Sİ alətlərinin siyahısı var', 'Sİ-yə verilməsi qadağan olan data növləri müəyyən edilib', 'İstifadə olunan Sİ sistemlərinin reyestri aparılır', 'Yüksək riskli qərarlarda insan nəzarəti məcburidir', 'İşçilər Sİ savadlılığı təlimi keçib', 'Sİ provayderləri ilə müqavilələrdə data istifadəsi şərtləri yazılıb', 'Sİ insidentləri üçün bildiriş və reaksiya qaydası var'];
    $('gvChk').innerHTML = C.map((c, i) => `<label><input type="checkbox" data-i="${i}"> <span>${esc(c)}</span></label>`).join('');
    const upd = () => {
      const n = [...$('gvChk').querySelectorAll('input')].filter(x => x.checked).length;
      const lvl = n <= 2 ? ['Başlanğıc', 'bad', 'İlk addım: 1 səhifəlik Sİ siyasəti və icazəli alətlərin siyahısı. Bu, bir həftəlik işdir.'] : n <= 5 ? ['İnkişaf edən', 'info', 'Əsaslar var. İndi reyestr, təlim və provayder müqavilələri üzərində işləyin.'] : ['Yetkin', 'ok', 'Güclü əsas! Növbəti addım: NIST AI RMF və ya ISO/IEC 42001 ilə sistemli audit.'];
      $('gvMsg').innerHTML = `<div class="msg ${lvl[1]}"><b>${n} / ${C.length} · ${lvl[0]}</b>. ${lvl[2]}</div>`;
      api.done(4);
    };
    $('gvChk').querySelectorAll('input').forEach(x => x.onchange = upd);
  })();

  api.sorter('c6Sort', { bins: ['Mərkəzləşmiş (CoE)', 'Hub-and-spoke', 'Mərkəzləşməmiş'], done: 5, end: 'Model təşkilatın yetkinliyindən asılıdır: əvvəlcə mərkəz bilik toplayır, sonra bacarıq şöbələrə yayılır.', items: [
    ['Sİ ilə təzəcə başlayan, 3 Sİ mütəxəssisi olan orta şirkət', 0], ['Bir neçə ildir Sİ istifadə edən, 10 biznes bölməsi olan böyük bank', 1], ['Hər biri müstəqil məhsul olan 5 kiçik startapdan ibarət holdinq', 2],
    ['Sərt tənzimlənən, risklərə çox həssas sığorta şirkəti (ilk il)', 0], ['Sİ platforması hazır olan, şöbələrin öz Sİ analitikləri olan telekom şirkəti', 1]] });

  api.order('c7Ord', { done: 6, ok: 'Əvvəlcə qaydalar və alət, sonra təlim və çempionlar, sonra ölçmə və genişlənmə.', hint: 'Fikirləşin: insanlara təlim verməzdən əvvəl hansı aləti, hansı qaydalarla istifadə edəcəklərini bilməlidirlər.', steps: [
    'Sİ siyasətini və icazəli alətləri müəyyən etmək', 'Hamı üçün əsas Sİ savadlılığı təlimi', 'Hər şöbədən “Sİ çempionları” seçmək və dərindən öyrətmək', 'Şöbələrdə 2–3 praktik use-case ilə sınaq', 'Uğurlu nümunələri paylaşmaq və nəticələri ölçmək', 'İşləyən təcrübələri standart iş prosesinə çevirmək'] });

  api.sorter('c8Sort', { bins: ['İstifadə', 'Dəyər', 'Risk və keyfiyyət'], done: 7, end: 'Üç növün hamısı lazımdır: istifadə yoxdursa, dəyər olmaz; risk ölçülmürsə, dəyər bir gün itə bilər.', items: [
    ['Həftəlik aktiv istifadəçilərin sayı', 0], ['Müraciətin orta həll müddəti 2 gündən 6 saata düşdü', 1], ['Sİ cavablarında xəta faizi', 2], ['İstifadəçilərin neçə faizi alətə 2-ci həftə də qayıdır', 0],
    ['Satış menecerinin həftəlik zəng sayı 30% artdı', 1], ['Məxfilik insidentlərinin sayı', 2], ['Hər müraciətə xərcin azalması', 1], ['Müştəri şikayətlərində “robot cavabı” sözlərinin tezliyi', 2]] });

  // ===== 100 gün =====
  (() => {
    const P = {
      '1–30: Dinlə və xəritələ': ['Baş direktor və şöbə rəhbərləri ilə 20+ görüş: problemlər, gözləntilər', 'Mövcud Sİ istifadəsinin auditi, “kölgə Sİ” daxil', 'Data və İT infrastrukturunun vəziyyəti', 'Hüquq, risk, İT təhlükəsizliyi ilə ortaq çərçivə'],
      '31–60: Fokuslan və qaydaları qoy': ['Use-case portfeli: 20–30 ideya, matris, 3 prioritet', 'Müvəqqəti Sİ siyasəti və icazəli korporativ alət', 'Sİ şurası: biznes, hüquq, İT, risk nümayəndələri', 'İlk pilotların kartları: sahib, meyar, müddət'],
      '61–100: Nəticə göstər': ['1–2 “tez qələbə” pilotunun nəticəsi rəqəmlərlə', 'Hamı üçün Sİ savadlılığı proqramının başlanması', '12–18 aylıq yol xəritəsi və büdcə', 'Direktorlar şurasına ilk hesabat: dəyər, risk, növbəti addımlar'],
    };
    const seen = new Set(), keys = Object.keys(P);
    $('hdTabs').innerHTML = keys.map((k, i) => `<button data-i="${i}">${k.split(':')[0]} gün</button>`).join('');
    const show = i => {
      [...$('hdTabs').children].forEach((b, j) => b.classList.toggle('on', i === j));
      $('hdBody').innerHTML = `<div class="ex life"><span class="tag">${esc(keys[i])}</span><ul>${P[keys[i]].map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
      seen.add(i); if (seen.size === keys.length) api.done(8);
    };
    $('hdTabs').querySelectorAll('button').forEach(b => b.onclick = () => show(+b.dataset.i));
    show(0);
  })();

  const QUIZ = {
    role: [
      { q: 'CAIO-nun əsas sualı:', o: ['Sİ ilə hansı biznes dəyərini təhlükəsiz şəkildə yaradırıq?', 'Hansı serverləri alaq?'], a: 0, e: 'Dəyər + təhlükəsizlik.' },
      { q: 'ABŞ federal qurumlarından CAIO təyin etmək nə vaxt tələb olundu?', o: ['2024', '2010'], a: 0, e: '2024-cü ilin martında.' },
      { q: 'Hər use-case-in biznes sahibi kimdir?', o: ['Müvafiq şöbənin rəhbəri', 'Yalnız CAIO'], a: 0, e: 'CAIO koordinasiya edir.' },
    ],
    strategy: [
      { q: 'Strategiyaya düzgün başlanğıc:', o: ['Biznes problemi', 'Ən populyar Sİ aləti'], a: 0, e: 'Problem → dəyər → həll.' },
      { q: 'Yüksək dəyər, yüksək icra oluna bilmə:', o: ['Tez qələbə', 'Qaçın'], a: 0, e: 'Dərhal başlayın.' },
      { q: 'Yüksək dəyər, aşağı icra oluna bilmə:', o: ['Strateji mərc: hazırlıqla yol xəritəsinə', 'Dərhal ləğv'], a: 0, e: 'Data hazırlığı lazımdır.' },
    ],
    bizcase: [
      { q: 'Sİ layihəsinin gizli xərci:', o: ['Nəticələrin insan tərəfindən yoxlanması', 'Ofis icarəsi'], a: 0, e: 'Hesablamaya daxil edin.' },
      { q: 'İstifadə səviyyəsi aşağı düşəndə:', o: ['Dəyər də düşür', 'Dəyər dəyişmir'], a: 0, e: 'Adoption vacibdir.' },
    ],
    buybuild: [
      { q: 'Ümumi ofis tapşırıqları üçün (rəqabət üstünlüyü deyil):', o: ['Hazır məhsul almaq', 'Öz modelini qurmaq'], a: 0, e: 'Gigiyena, üstünlük deyil.' },
      { q: 'Unikal data, daxili komanda və vaxt varsa:', o: ['Qurmaq', 'Heç nə etməmək'], a: 0, e: 'Kopyalana bilməyən üstünlük.' },
      { q: 'Provayderlə müqavilədə nə mütləq yazılmalıdır?', o: ['Datanın harada saxlandığı və model öyrətmək üçün istifadə olunub-olunmadığı', 'Ofisin rəngi'], a: 0, e: 'Data suverenliyi.' },
    ],
    gov: [
      { q: 'NIST AI RMF-in dörd funksiyası:', o: ['Govern, Map, Measure, Manage', 'Plan, Do, Check, Act'], a: 0, e: '2023.' },
      { q: 'ISO/IEC 42001 nədir?', o: ['Sİ idarəetmə sistemləri standartı', 'Şəbəkə protokolu'], a: 0, e: '2023, sertifikatlaşdırıla bilir.' },
      { q: '“Kölgə Sİ” ilə ən yaxşı mübarizə:', o: ['Təhlükəsiz korporativ alət və aydın qaydalar', 'Tam qadağa'], a: 0, e: 'Qadağa adətən işləmir.' },
    ],
    org: [
      { q: 'Sİ-yə yeni başlayan təşkilat üçün tipik model:', o: ['Mərkəzləşmiş (CoE)', 'Tam mərkəzləşməmiş'], a: 0, e: 'Bilik toplanır.' },
      { q: 'Hub-and-spoke modelində mərkəz nə edir?', o: ['Platforma və qaydaları təmin edir', 'Bütün layihələri özü edir'], a: 0, e: 'Şöbələr icra edir.' },
    ],
    literacy: [
      { q: 'AB Sİ Aktına görə Sİ savadlılığı tələbi nə vaxtdan qüvvədədir?', o: ['2025-ci ilin fevralından', 'Heç vaxt'], a: 0, e: 'İşçilər üçün kifayət qədər savadlılıq.' },
      { q: '“Sİ çempionları” nə üçündür?', o: ['Həmkarların həmkarlara nümunə olması və kömək etməsi üçün', 'Yarış üçün'], a: 0, e: 'Sosial sübut.' },
    ],
    measure: [
      { q: '“Pilot cəhənnəmi” nədir?', o: ['Pilotların istehsala və real dəyərə çatmaması', 'Uğurlu pilot'], a: 0, e: 'Tipik problem.' },
      { q: 'Pilot kartında ən çox unudulan bənd:', o: ['Uğursuz olarsa dayandırmaq qərarı', 'Pilotun adı'], a: 0, e: 'Aydın çıxış meyarı.' },
      { q: '“Həftəlik aktiv istifadəçilər” hansı növ göstəricidir?', o: ['İstifadə', 'Risk'], a: 0, e: 'Adoption.' },
    ],
    hundred: [
      { q: 'İlk 30 gündə əsas iş:', o: ['Dinləmək və mənzərəni xəritələmək', '30 pilot başlatmaq'], a: 0, e: 'İnam və anlayış.' },
      { q: '100-cü günə qədər nə göstərilməlidir?', o: ['1–2 pilotun rəqəmli nəticəsi və yol xəritəsi', 'Yalnız prezentasiya'], a: 0, e: 'Görünən dəyər.' },
    ],
    final: [
      { q: 'CAIO nəyə cavabdehdir?', o: ['Sİ-nin dəyəri və təhlükəsiz istifadəsi', 'Yalnız serverlər'], a: 0, e: 'Strategiya, portfel, governance, insanlar, ölçmə.' },
      { q: 'Use-case-in iki qiymətləndirmə oxu:', o: ['Dəyər və icra oluna bilmə', 'Rəng və ölçü'], a: 0, e: 'Matris.' },
      { q: '“Tez qələbə”:', o: ['Yüksək dəyər, asan icra', 'Aşağı dəyər, çətin icra'], a: 0, e: 'Dərhal başlayın.' },
      { q: 'Biznes keysində insan yoxlaması:', o: ['Xərc kimi nəzərə alınmalıdır', 'Nəzərə alınmamalıdır'], a: 0, e: 'Gizli xərc.' },
      { q: 'Rəqabət üstünlüyü olmayan ümumi tapşırıq üçün:', o: ['Almaq', 'Qurmaq'], a: 0, e: 'Resurs qənaəti.' },
      { q: 'Data suverenliyi nəyə aiddir?', o: ['Datanın harada və necə emal olunmasına', 'Ofis yerinə'], a: 0, e: 'Müqavilədə yazılır.' },
      { q: 'NIST AI RMF:', o: ['Könüllü risk idarəetmə çərçivəsi', 'Məcburi AB qanunu'], a: 0, e: 'Məcburi qanun AB Sİ Aktıdır.' },
      { q: 'Sertifikatlaşdırıla bilən Sİ idarəetmə standartı:', o: ['ISO/IEC 42001', 'HTML5'], a: 0, e: '2023.' },
      { q: '“Kölgə Sİ”:', o: ['İşçilərin icazəsiz şəxsi Sİ alətləri istifadə etməsi', 'Gecə işləyən Sİ'], a: 0, e: 'Data riskidir.' },
      { q: 'Böyük, yetkin təşkilat üçün tipik model:', o: ['Hub-and-spoke', 'Heç bir model'], a: 0, e: 'Standart + sürət.' },
      { q: 'Sİ tətbiqində birinci addım:', o: ['Siyasət və icazəli alətlər', 'Hamını işdən çıxarmaq'], a: 0, e: 'Sonra təlim.' },
      { q: 'Pilotdan əvvəl nə yazılmalıdır?', o: ['Rəqəmli uğur meyarı və biznes sahibi', 'Heç nə'], a: 0, e: 'Pilot kartı.' },
      { q: 'Üç növ göstərici:', o: ['İstifadə, dəyər, risk/keyfiyyət', 'Rəng, səs, ölçü'], a: 0, e: 'Hamısı lazımdır.' },
      { q: 'CAIO-nun ilk 30 günü:', o: ['Dinlə və xəritələ', 'Böyük satınalma'], a: 0, e: 'İnam qurmaq.' },
      { q: 'Sİ savadlılığı kim üçündür?', o: ['Hamı üçün, rollara uyğun səviyyədə', 'Yalnız mühəndislər üçün'], a: 0, e: 'Rollara görə təlim.' },
    ],
  };
  api.quizzes(QUIZ);
});
