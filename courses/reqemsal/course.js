/* Rəqəmsal transformasiya kursu: interaktiv hissələr və testlər.
   Dərs indeksləri (0-dan): 0 pillələr, 2 yetkinlik, 3 müştəri səyahəti, 4 analitika pillələri,
   6 ROI, 7 Agile, 8 Kotter, 9 fişinq, 10 OKR, 11 yol xəritəsi. */
LMS.registerCourse('reqemsal', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('az-AZ').replace(/,/g, ' ');

  // ================= 1. Pillələr =================
  (() => {
    const I = [['Kağız arxivi skan edib PDF etmək', 1], ['Onlayn növbə sistemi qurmaq', 2], ['Bank filialsız, yalnız mobil tətbiqlə işləyən bank modeli', 3], ['Restoranın kağız menyusunu QR-kodlu PDF etmək', 1], ['Müqavilələri elektron imza ilə bağlamaq', 2], ['DVD icarəsindən striminq abunəliyinə keçmək', 3], ['Mühasibatlığın Excel-dən vahid ERP sisteminə keçməsi', 2], ['Taksi parkından sürücülər və sərnişinləri birləşdirən platformaya keçmək', 3], ['Faks əvəzinə sənədləri e-poçtla göndərmək', 1]];
    let i = 0, right = 0;
    const item = $('lvItem'), msg = $('lvMsg');
    function next() {
      if (i >= I.length) { item.innerHTML = ''; msg.innerHTML = `<div class="msg ok">${right} / ${I.length} düzgün. Diqqət edin: 3-cü pillədə yalnız alət deyil, <b>pulun qazanılma üsulu</b> dəyişir.</div>`; api.done(0); return; }
      item.innerHTML = `<div class="msg info sorter-item"><b>${esc(I[i][0])}</b></div><div class="row" style="margin-top:8px"><button class="btn ghost" data-a="1">1. Rəqəmə çevirmə</button><button class="btn ghost" data-a="2">2. Proses</button><button class="btn" data-a="3">3. Transformasiya</button></div>`;
      item.querySelectorAll('button').forEach(b => b.onclick = () => {
        const ok = +b.dataset.a === I[i][1]; if (ok) right++;
        const c = document.createElement('span'); c.className = 'chip'; c.textContent = (ok ? '' : '✗ ') + I[i][0];
        $('lvB' + I[i][1]).appendChild(c);
        msg.innerHTML = ok ? '' : `<div class="msg bad">“${esc(I[i][0])}” ${I[i][1]}-ci pillədir.</div>`;
        i++; next();
      });
    }
    next();
  })();

  // ================= 3. Yetkinlik radarı =================
  (() => {
    const D = [
      ['Strategiya', ['Rəqəmsal plan yoxdur', 'Ayrı-ayrı təşəbbüslər var', 'Yazılı strategiya var', 'Strategiya büdcə və hədəflərlə bağlıdır', 'Rəqəmsal yanaşma biznes modelinin özüdür']],
      ['Müştəri', ['Müştəri yalnız gəlib-zəng edərək xidmət alır', 'Sayt və sosial şəbəkə var', 'Əsas xidmətlər onlayndır', 'Bütün kanallar bir-biri ilə bağlıdır', 'Təcrübə hər müştəriyə görə fərdiləşdirilir']],
      ['Data', ['Data kağızda və ya dağınıq fayllarda', 'Excel hesabatları', 'Vahid baza və sadə dashboardlar', 'Data əsasında müntəzəm qərarlar', 'Proqnoz modelləri və avtomatlaşdırılmış qərarlar']],
      ['Texnologiya', ['Köhnə, bir-biri ilə əlaqəsiz sistemlər', 'Bir neçə bulud xidməti', 'Əsas sistemlər birləşdirilib', 'API-lər və bulud infrastrukturu', 'Çevik, modul arxitektura']],
      ['Proseslər', ['Hər şey kağız və imza ilə', 'Bəzi formalar onlayndır', 'Əsas proseslər rəqəmsaldır', 'Təkrarlanan işlər avtomatlaşdırılıb', 'Proseslər data ilə daim təkmilləşdirilir']],
      ['İnsanlar və mədəniyyət', ['Dəyişikliyə müqavimət güclüdür', 'Bir neçə həvəskar var', 'Təlimlər keçirilir', 'Komandalar sınaqdan qorxmur', 'Davamlı öyrənmə mədəniyyəti']],
    ];
    const v = D.map(() => 2), touched = new Set();
    const box = $('matDims');
    D.forEach(([n, lv], i) => {
      const d = document.createElement('div'); d.className = 'dim';
      d.innerHTML = `<label><span>${n}</span><b>${v[i]}</b></label><input type="range" min="1" max="5" value="${v[i]}" aria-label="${n}"><small>${lv[v[i] - 1]}</small>`;
      const inp = d.querySelector('input');
      inp.oninput = () => { v[i] = +inp.value; d.querySelector('b').textContent = v[i]; d.querySelector('small').textContent = lv[v[i] - 1]; touched.add(i); draw(); };
      box.appendChild(d);
    });
    function pt(i, r) { const a = -Math.PI / 2 + i * 2 * Math.PI / D.length; return [150 + r * Math.cos(a), 150 + r * Math.sin(a)]; }
    function draw() {
      let g = '';
      for (let k = 1; k <= 5; k++) g += `<polygon points="${D.map((_, i) => pt(i, k * 22).join(',')).join(' ')}" fill="none" stroke="var(--line)"/>`;
      D.forEach((d, i) => { const [x, y] = pt(i, 110), [lx, ly] = pt(i, 132); g += `<line x1="150" y1="150" x2="${x}" y2="${y}" stroke="var(--line)"/><text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="var(--ink)" font-family="Noto Sans,sans-serif">${d[0].split(' ')[0]}</text>`; });
      g += `<polygon points="${v.map((x, i) => pt(i, x * 22).join(',')).join(' ')}" fill="var(--accent)" fill-opacity=".28" stroke="var(--accent)" stroke-width="3"/>`;
      g += v.map((x, i) => { const [px, py] = pt(i, x * 22); return `<circle cx="${px}" cy="${py}" r="5" fill="var(--accent)"/>`; }).join('');
      $('matRadar').innerHTML = g;
      const avg = v.reduce((a, b) => a + b, 0) / v.length, min = Math.min(...v), weak = D.filter((_, i) => v[i] === min).map(d => d[0]);
      $('matMsg').innerHTML = `<div class="msg ${avg >= 3.5 ? 'ok' : 'info'}">Orta yetkinlik: <b>${avg.toFixed(1)} / 5</b>. Ən zəif sahə: <b>${weak.join(', ')}</b>. Məhdudiyyətlər nəzəriyyəsinə görə (Məntiq kursu, 14-cü dərs) ilk sərmayə ən zəif halqaya getməlidir: güclü texnologiya zəif mədəniyyət və ya pis data ilə nəticə vermir.</div>`;
      if (touched.size >= 4) api.done(2);
    }
    draw();
  })();

  // ================= 4. Müştəri səyahəti =================
  (() => {
    const ST = ['Xəbər tutur', 'Müraciət edir', 'Gözləyir', 'Kartı alır', 'İstifadə edir'];
    const B = { before: [[3, 'Reklamı görür'], [2, 'Filiala gedir, növbə götürür'], [1, '1,5 saat növbə, 4 sənəd, 7 gün gözləmə'], [2, 'Yenidən filiala gəlir'], [3, 'Balansı öyrənmək üçün bankomata gedir']],
      after: [[4, 'Dostu tətbiqi tövsiyə edir'], [4, 'Tətbiqdə 5 dəqiqəyə müraciət, şəxsiyyəti onlayn təsdiq'], [4, 'Rəqəmsal kart dərhal hazırdır'], [5, 'Telefonla dərhal ödəyir, fiziki kart kuryerlə gəlir'], [5, 'Hər əməliyyat barədə anında bildiriş']] };
    const seen = new Set();
    function draw(k) {
      $('jmBefore').className = 'btn' + (k === 'before' ? '' : ' ghost'); $('jmAfter').className = 'btn' + (k === 'after' ? '' : ' ghost');
      const d = B[k], X = i => 70 + i * 125, Y = m => 200 - m * 32;
      const face = m => m >= 4 ? '😊' : m === 3 ? '😐' : m === 2 ? '😕' : '😠';
      let g = `<g font-family="Noto Sans,sans-serif" font-size="12">`;
      g += `<path d="M${d.map((p, i) => X(i) + ' ' + Y(p[0])).join(' L')}" fill="none" stroke="${k === 'after' ? 'var(--ex-green-b)' : 'var(--ex-red-b)'}" stroke-width="4" stroke-linejoin="round"/>`;
      d.forEach((p, i) => { g += `<circle cx="${X(i)}" cy="${Y(p[0])}" r="18" fill="var(--panel)" stroke="var(--line)"/><text x="${X(i)}" y="${Y(p[0]) + 6}" text-anchor="middle" font-size="18">${face(p[0])}</text><text x="${X(i)}" y="228" text-anchor="middle" fill="var(--muted)">${ST[i]}</text>`; });
      $('jmSvg').innerHTML = g + '</g>';
      $('jmTxt').innerHTML = `<ol>${d.map((p, i) => `<li><b>${ST[i]}:</b> ${esc(p[1])}</li>`).join('')}</ol>` + (k === 'after' ? '<div class="msg ok">Ən böyük “ağrı nöqtəsi” (gözləmə) aradan qalxdı. Transformasiya ən pis anı düzəltməklə başlayır.</div>' : '<div class="msg bad">Ən aşağı nöqtə “Gözləyir” addımıdır: transformasiya ilk növbədə buranı hədəfləməlidir.</div>');
      seen.add(k); if (seen.size === 2) api.done(3);
    }
    $('jmBefore').onclick = () => draw('before'); $('jmAfter').onclick = () => draw('after');
    draw('before');
  })();

  // ================= 5. Analitika pillələri =================
  (() => {
    const L = [['Təsviri', 'Nə oldu?', 'Keçən ay satış 12% azaldı.', '#3a78d8'], ['Diaqnostik', 'Niyə oldu?', 'Azalma iki filialda idi: yaxınlıqda rəqib mağaza açılıb.', '#7656d4'], ['Proqnostik', 'Nə olacaq?', 'Model gələn ay bu filiallarda daha 8% azalma gözləyir.', '#c98a12'], ['Preskriptiv', 'Nə etməliyik?', 'Sistem tövsiyə edir: həmin filiallarda sadiqlik kartına 2x bal və çatdırılma pulsuz olsun.', '#2c9457']];
    const box = $('ladBox'), seen = new Set();
    L.forEach((l, i) => {
      const b = document.createElement('button');
      b.innerHTML = `<span class="lv" style="background:${l[3]}">${i + 1}</span><span><b>${l[0]} analitika: “${l[1]}”</b><small>Kliklə: nümunəyə bax</small></span>`;
      b.onclick = () => { b.classList.add('on'); b.querySelector('small').textContent = l[2]; seen.add(i); if (seen.size === L.length) api.done(4); };
      box.appendChild(b);
    });
  })();

  // ================= 7. ROI kalkulyatoru =================
  (() => {
    const ids = ['roiN', 'roiM', 'roiP', 'roiH', 'roiC', 'roiS'];
    let changed = false;
    function calc() {
      const [n, m, p, h, c, s] = ids.map(id => Math.max(0, +$(id).value || 0));
      const hours = n * m / 60 * Math.min(p, 100) / 100, save = hours * h - s, payback = save > 0 ? c / save : Infinity;
      $('roiOut').innerHTML = [[fmt(hours) + ' saat', 'ayda qənaət olunan vaxt'], [fmt(hours / 160 * 10) / 10 + ' işçi', 'tam ştat ekvivalenti'], [fmt(save) + ' ₼', 'aylıq xalis qənaət'], [isFinite(payback) ? payback.toFixed(1) + ' ay' : '—', 'xərcin geri qayıtması']]
        .map(([a, b]) => `<div class="kpi"><div class="n">${a}</div><div class="l">${b}</div></div>`).join('');
      $('roiMsg').innerHTML = !isFinite(payback) ? '<div class="msg bad">Aylıq qənaət dəstək xərcini ödəmir: bu prosesi avtomatlaşdırmaq hələlik sərfəli deyil. Əvvəlcə prosesi sadələşdirin.</div>'
        : payback <= 12 ? `<div class="msg ok">Xərc ${payback.toFixed(1)} aya qayıdır: güclü namizəddir. Amma xatırlayın: qənaət olunan saatlar yalnız işçilər daha dəyərli işə yönəldiləndə real dəyərə çevrilir.</div>`
        : `<div class="msg info">Geri qayıtma ${payback.toFixed(1)} aydır: diqqətlə qiymətləndirin. Bəlkə daha ucuz həll (hazır xidmət, sadə skript) var?</div>`;
      if (changed) api.done(6);
    }
    ids.forEach(id => $(id).addEventListener('input', () => { changed = true; calc(); }));
    calc();
  })();

  // ================= 8. Agile sorter =================
  (() => {
    const I = [['Hər 2 həftədən bir müştəriyə işləyən versiya göstərilir', 'A'], ['Bütün tələblər layihənin əvvəlində 200 səhifəlik sənəddə təsdiqlənir', 'W'], ['Plan rəyə görə dəyişir', 'A'], ['Nəticəni müştəri yalnız 14 aydan sonra görür', 'W'], ['Əvvəlcə MVP buraxılır, sonra genişləndirilir', 'A'], ['Dəyişiklik üçün rəsmi “dəyişiklik sorğusu” və yeni müqavilə lazımdır', 'W']];
    let i = 0, right = 0;
    function next() {
      if (i >= I.length) { $('agItem').innerHTML = ''; $('agMsg').innerHTML = `<div class="msg ok">${right} / ${I.length} düzgün. Qeyd: şəlalə pis deyil. Tələbləri dəyişməyən işlərdə (körpü tikintisi, qanunla müəyyən olunmuş hesabat) o hələ də yaxşı işləyir.</div>`; api.done(7); return; }
      $('agItem').innerHTML = `<div class="msg info sorter-item"><b>${esc(I[i][0])}</b></div><div class="row" style="margin-top:8px"><button class="btn" data-a="A">Agile</button><button class="btn ghost" data-a="W">Şəlalə</button></div>`;
      $('agItem').querySelectorAll('button').forEach(b => b.onclick = () => {
        const ok = b.dataset.a === I[i][1]; if (ok) right++;
        $('agMsg').innerHTML = ok ? '<div class="msg ok">✓</div>' : `<div class="msg bad">Bu, ${I[i][1] === 'A' ? 'Agile' : 'şəlalə'} yanaşmasıdır.</div>`;
        i++; next();
      });
    }
    next();
  })();

  // ================= 9. Kotter =================
  (() => {
    const K = ['Təcililik hissi yarat: “niyə indi?”', 'Güclü dəyişiklik koalisiyası qur', 'Vizyon və strategiya hazırla', 'Vizyonu hamıya çatdır', 'Maneələri aradan qaldır, insanlara səlahiyyət ver', 'Qısamüddətli qələbələr qazan və göstər', 'Uğuru möhkəmləndir, daha çox dəyişiklik et', 'Dəyişikliyi mədəniyyətə yerləşdir'];
    const box = $('ktBox'), msg = $('ktMsg');
    let shown, picked;
    function reset() { shown = K.map((_, i) => i).sort(() => Math.random() - .5); picked = []; msg.innerHTML = ''; draw(); }
    function draw() {
      box.className = 'order';
      box.innerHTML = shown.map(i => { const p = picked.indexOf(i); return `<button data-i="${i}" class="${p >= 0 ? 'picked' : ''}"><span class="n">${p >= 0 ? p + 1 : ''}</span>${esc(K[i])}</button>`; }).join('');
      box.querySelectorAll('button').forEach(b => b.onclick = () => { const i = +b.dataset.i, p = picked.indexOf(i); if (p >= 0) picked.splice(p, 1); else picked.push(i); draw(); });
    }
    $('ktCheck').onclick = () => {
      if (picked.length < K.length) { msg.innerHTML = '<div class="msg info">Bütün 8 addıma nömrə verin.</div>'; return; }
      const wrong = picked.filter((v, i) => v !== i).length;
      msg.innerHTML = !wrong ? '<div class="msg ok">✅ Mükəmməl! İlk 3 addım iqlim yaradır, 4–6-cı addımlar təşkilatı cəlb edir, 7–8-ci addımlar dəyişikliyi qalıcı edir.</div>' : `<div class="msg bad">${wrong} addım yerində deyil. İpucu: hər şey “niyə indi?” sualı ilə başlayır, mədəniyyətə yerləşdirmək isə ən sondur.</div>`;
      if (!wrong) api.done(8);
    };
    $('ktReset').onclick = reset; reset();
  })();

  // ================= 10. Fişinq =================
  (() => {
    const W = ['Göndərənin ünvanı saxtadır: “numunebank-az.co”, bankın əsl domeni isə numunebank.az-dır.', 'Təcililik və hədə: “24 saat”, “bloklanacaq”, üç nida işarəsi. Fırıldaqçılar düşünməyə vaxt vermək istəmir.', 'Adsız müraciət: bankınız sizi adınızla tanıyır.', 'Bank heç vaxt CVV kodunu və SMS şifrəni soruşmur. Bu, ən güclü əlamətdir.', 'Qısaldılmış link: hara apardığı görünmür. Bankın saytına həmişə özünüz yazıb daxil olun.'];
    const found = new Set();
    document.querySelectorAll('.mail .sus').forEach(el => el.onclick = () => {
      const k = +el.dataset.s; el.classList.add('found'); found.add(k);
      $('phMsg').innerHTML = `<div class="msg info">🚩 ${esc(W[k])}</div><div class="score">Tapılıb: ${found.size} / 5</div>` + (found.size === 5 ? '<div class="msg ok">Əla! Bütün 5 əlaməti tapdınız. Real həyatda belə məktubu açmayın, linkə klikləməyin və bankın rəsmi nömrəsinə zəng edib xəbər verin.</div>' : '');
      if (found.size === 5) api.done(9);
    });
  })();

  // ================= 11. OKR =================
  (() => {
    const krs = [...document.querySelectorAll('.okrK')];
    function check() {
      let good = 0;
      krs.forEach(inp => {
        const t = inp.value, ok = /\d/.test(t) && /(-dən|-dan|dən|dan|qədər|→|%|saat|gün|dəqiqə|₼)/i.test(t);
        inp.nextElementSibling.textContent = ok ? '✅' : '⚠️'; if (ok) good++;
      });
      const o = $('okrO').value.trim();
      $('okrMsg').innerHTML = `<div class="msg ${good === krs.length ? 'ok' : 'info'}"><b>${esc(o || 'Məqsəd')}</b><br>${good} / ${krs.length} əsas nəticə ölçülə biləndir.${good < krs.length ? ' ⚠️ işarəli nəticəyə başlanğıc və hədəf rəqəm əlavə edin: “… 30%-dən 10%-ə”.' : ' Bu OKR-i rüb sonunda dəqiq qiymətləndirə bilərsiniz.'}</div>`;
      if (good === krs.length) api.done(10);
    }
    [$('okrO'), ...krs].forEach(x => x.addEventListener('input', check));
    check();
  })();

  // ================= 12. Yol xəritəsi =================
  (() => {
    const R = {
      'Restoran / kafe': [['Onlayn menyu və sifariş (WhatsApp və ya sadə sayt)', 'Google Xəritədə profil, rəylərə cavab', 'Kassa sistemində satış hesabatları'], ['Çatdırılma platformaları ilə inteqrasiya', 'Sadiqlik proqramı (telefon nömrəsi ilə)', 'Anbar qalıqlarının avtomatik izlənməsi'], ['Satış datası ilə menyu optimallaşdırması', 'Tələbatın proqnozu: məhsul tullantısının azalması', 'Öz tətbiqi, ancaq data göstərsə ki, lazımdır']],
      'Klinika': [['Onlayn qəbula yazılış', 'SMS xatırlatmalar', 'Elektron pasiyent kartı'], ['Analiz nəticələrinin onlayn çatdırılması', 'Telefon/video konsultasiya', 'Sığorta ilə elektron hesablaşma'], ['Pasiyent datasının təhlili (təkrar müraciətlər, gəlməmələr)', 'Profilaktik xatırlatma proqramları', 'Fərdi məlumatların qorunması auditi']],
      'Pərakəndə mağaza': [['Onlayn kataloq və sosial şəbəkə satışları', 'Vahid kassa və anbar sistemi', 'Onlayn ödəniş'], ['Onlayn mağaza və çatdırılma', 'Müştəri bazası (CRM) və sadiqlik', 'Satış analitikası dashboardu'], ['Tələbatın proqnozu və avtomatik sifariş', 'Fərdi təkliflər', 'Kanallar arası vahid təcrübə (onlayn sifariş, mağazadan götürmə)']],
      'Dövlət qurumu': [['Ən çox müraciət olunan 3 xidməti onlayn etmək', 'Elektron növbə', 'Müraciətlərin statusunu izləmək'], ['Digər qurumlarla məlumat mübadiləsi (“bir dəfə ver” prinsipi)', 'Elektron imza ilə sənəd dövriyyəsi', 'Vətəndaş məmnuniyyəti sorğuları'], ['Proaktiv xidmətlər (məs. doğum qeydiyyatı ilə müavinətin avtomatik təyini)', 'Açıq data', 'Kibertəhlükəsizlik və davamlılıq planı']],
    };
    const box = $('rmSectors');
    Object.keys(R).forEach((k, i) => { const b = document.createElement('button'); b.textContent = k; b.onclick = () => show(k); box.appendChild(b); });
    function show(k) {
      [...box.children].forEach(b => b.classList.toggle('on', b.textContent === k));
      const [a, b, c] = R[k];
      $('rmRoad').innerHTML = [['0–3 ay: tez qələbələr', a, 'p1'], ['3–12 ay: əsas sistemlər', b, 'p2'], ['12+ ay: data və yeni model', c, 'p3']]
        .map(([t, l, cl]) => `<div class="ph ${cl}"><h4>${t}</h4><ul>${l.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
      api.done(11);
    }
  })();

  // ================= Testlər =================
  const QUIZ = {
    intro: [
      { q: 'Rəqəmsal transformasiya ilk növbədə nədir?', o: ['Yeni kompüterlər almaq', 'Texnologiyanın köməyi ilə dəyər yaratma üsulunu dəyişmək', 'Sayt açmaq'], a: 1, e: 'Texnologiya vasitədir, məqsəd isə yeni dəyərdir.' },
      { q: 'Blockbuster-in əsas səhvi nə idi?', o: ['Kompüterləri yox idi', 'Biznes modelini dəyişmək imkanını (Netflix) rədd etdi'], a: 1, e: '2000-ci ildə Netflix-i almaq təklifini rədd etdi.' },
      { q: 'İlk rəqəmsal fotoaparatı hansı şirkətin mühəndisi ixtira edib?', o: ['Kodak', 'Sony', 'Canon'], a: 0, e: '1975, Stiv Sasson. Amma Kodak bu ixtiradan istifadə etmədi.' },
      { q: 'Kağız sənədi skan etmək hansı pillədir?', o: ['Rəqəmə çevirmə', 'Transformasiya'], a: 0, e: 'Proses dəyişmir, yalnız format dəyişir.' },
    ],
    drivers: [
      { q: 'Müştəri gözləntiləri niyə dəyişir?', o: ['Başqa sahələrdəki ən yaxşı rəqəmsal təcrübə hamı üçün standarta çevrilir', 'Dəyişmir'], a: 0, e: 'Taksi 3 dəqiqəyə gəlirsə, bankda 3 saat gözləmək qəbuledilməz görünür.' },
      { q: 'Bulud texnologiyası kiçik biznesə nə verir?', o: ['Öz serveri olmadan güclü sistemlərdən istifadə imkanı', 'Pulsuz internet'], a: 0, e: 'İstifadə etdiyin qədər ödəyirsən.' },
      { q: 'Taksi platformalarının əsas yeniliyi nə idi?', o: ['Yeni avtomobillər', 'Biznes modeli: avtomobil parkı əvəzinə sürücü və sərnişini birləşdirən platforma'], a: 1, e: 'Qiymət əvvəlcədən məlum, qarşılıqlı reytinq, xəritədə izləmə.' },
    ],
    strategy: [
      { q: 'Düzgün ardıcıllıq hansıdır?', o: ['Texnologiya → problem', 'Problem → məqsəd → həll → texnologiya'], a: 1, e: '“Parlaq obyekt” sindromundan qaçın.' },
      { q: 'Yetkinlik qiymətləndirməsində ən zəif sahə “data”dırsa, ilk sərmayə hara getməlidir?', o: ['Ən güclü sahəyə', 'Ən zəif sahəyə, yəni darboğaza'], a: 1, e: 'Zəncir ən zəif halqasından qırılır.' },
      { q: 'Klinikanın strategiyası üçün hansı daha yaxşı məqsəddir?', o: ['“Yeni sayt açmaq”', '“Pasiyent zəng etmədən 1 dəqiqəyə qəbula yazıla bilsin”'], a: 1, e: 'Məqsəd müştərinin dili ilə yazılır.' },
    ],
    cx: [
      { q: 'Müştəri səyahəti xəritəsinin əsas məqsədi:', o: ['Ağrı nöqtələrini tapmaq', 'Rəngli təqdimat hazırlamaq'], a: 0, e: 'Ən pis an transformasiyanın ilk hədəfidir.' },
      { q: 'ASAN xidmətin əsas prinsipi:', o: ['“Bir pəncərə”: qurumlar bir yerə gəlir, vətəndaş bir yerə gedir', 'Bütün xidmətləri ləğv etmək'], a: 0, e: '2012-ci ildə yaradılıb.' },
      { q: 'ASAN xidmət hansı beynəlxalq mükafatı alıb?', o: ['BMT-nin Dövlət Qulluğu Mükafatı (2015)', 'Oskar'], a: 0, e: 'UN Public Service Award.' },
    ],
    data: [
      { q: '“Gələn ay satış nə qədər olacaq?” Bu, hansı analitika növüdür?', o: ['Təsviri', 'Proqnostik', 'Diaqnostik'], a: 1, e: 'Gələcəyi proqnozlaşdırır.' },
      { q: '“Niyə satış düşdü?” Bu, hansı analitika növüdür?', o: ['Diaqnostik', 'Preskriptiv'], a: 0, e: 'Səbəbi axtarır.' },
      { q: 'Müştəri bazasında eyni adam üç fərqli yazılışla var. Bu, hansı problemdir?', o: ['Data keyfiyyəti', 'Kibertəhlükəsizlik'], a: 0, e: '“Zibil girir, zibil çıxır.”' },
      { q: 'Datanın dəyərini nə yaradır?', o: ['Onun həcmi', 'Ondan çıxan və hərəkətə çevrilən qərar'], a: 1, e: 'Qərarsız data sadəcə xərcdir.' },
    ],
    tech: [
      { q: 'Şirkətin saytı, anbarı və ödəniş sistemi bir-biri ilə “danışmır”. Nə lazımdır?', o: ['API inteqrasiyası', 'Yeni ofis'], a: 0, e: 'API sistemləri birləşdirir.' },
      { q: 'Soyuducu anbarlarda temperaturu uzaqdan izləmək lazımdır.', o: ['IoT sensorları', 'ERP'], a: 0, e: 'Əşyaların interneti.' },
      { q: 'Yük il ərzində çox dəyişir (bayramlarda 10 dəfə artır). Server almaq, yoxsa bulud?', o: ['Bulud: lazım olanda genişlənir', 'Ən güclü serveri almaq'], a: 0, e: 'İstifadə etdiyin qədər ödəyirsən.' },
      { q: 'Estoniyanın X-Road sistemi nəyi təmin edir?', o: ['Qurumlar arasında təhlükəsiz məlumat mübadiləsini: vətəndaş eyni məlumatı iki dəfə vermir', 'Yolların təmirini'], a: 0, e: '2001-ci ildən işləyir.' },
    ],
    process: [
      { q: 'Avtomatlaşdırmadan əvvəl nə etmək lazımdır?', o: ['Prosesi xəritəyə çəkib sadələşdirmək', 'Dərhal robot almaq'], a: 0, e: 'Pis prosesi avtomatlaşdırsanız, daha sürətli pis proses alarsınız.' },
      { q: 'Hansını tam avtomatlaşdırmaq ən çətindir?', o: ['Hər ay eyni formada hesabat', 'Hər dəfə fərqli olan mürəkkəb müştəri şikayəti'], a: 1, e: 'İnsan mülahizəsi tələb edir.' },
      { q: 'Avtomatlaşdırmanın qənaəti nə vaxt real dəyərə çevrilir?', o: ['Azad olan vaxt daha dəyərli işə yönəldiləndə', 'Həmişə avtomatik'], a: 0, e: 'Əks halda qənaət yalnız kağız üzərində qalır.' },
    ],
    agile: [
      { q: 'MVP nədir?', o: ['Ən bahalı versiya', 'İdeyanı yoxlayan minimum işlək məhsul'], a: 1, e: 'Minimum Viable Product.' },
      { q: 'Agile-in əsas dövrü:', o: ['Qur → ölç → öyrən', 'Plan → gözlə → təslim et'], a: 0, e: 'Qısa iterasiyalar.' },
      { q: 'Restoran 6 aya tətbiq hazırlatmaq əvəzinə nə etməlidir?', o: ['Əvvəlcə sadə kanalla (WhatsApp, Instagram) tələbatı yoxlamalıdır', 'Heç nə'], a: 0, e: 'Pul sübut olunmuş ehtiyaca xərclənir.' },
    ],
    people: [
      { q: 'Transformasiyalar ən çox nəyə görə uğursuz olur?', o: ['İnsanlar və mədəniyyət', 'Elektrik kəsilməsi'], a: 0, e: 'Texnologiya adətən ən asan hissədir.' },
      { q: 'Kotterin birinci addımı:', o: ['Təcililik hissi yaratmaq', 'Sistemi almaq'], a: 0, e: '“Niyə indi?” sualı.' },
      { q: 'Satış menecerləri yeni CRM-i işlətmir. Ən yaxşı addım:', o: ['Cərimə tətbiq etmək', 'Sistemi onların öz işini asanlaşdıracaq şəkildə birlikdə qurmaq'], a: 1, e: '“Mənə nə fayda?” sualına cavab.' },
    ],
    security: [
      { q: 'Hesablara avtomatlaşdırılmış hücumların böyük əksəriyyətinin qarşısını nə alır?', o: ['İkiaddımlı doğrulama (MFA)', 'Uzun e-poçt imzası'], a: 0, e: 'Microsoft-un məlumatına görə 99%-dən çox.' },
      { q: 'E-poçtla “təcili pul köçür” tələbi gəlib. Nə etmək lazımdır?', o: ['Dərhal köçürmək', 'Başqa kanalla (telefonla) təsdiqləmək'], a: 1, e: 'BEC fırıldaqçılığı.' },
      { q: 'Bank məktubda CVV kodunu soruşur. Bu nədir?', o: ['Normal təhlükəsizlik yoxlaması', 'Demək olar ki, mütləq fişinqdir'], a: 1, e: 'Bank CVV-ni heç vaxt soruşmur.' },
      { q: 'Azərbaycanda fərdi məlumatların qorunmasını hansı qanun tənzimləyir?', o: ['“Fərdi məlumatlar haqqında” Qanun (2010)', 'Heç biri'], a: 0, e: 'Avropa ilə işləyənlər GDPR-ə də əməl edir.' },
    ],
    measure: [
      { q: 'Hansı nəticə ölçüsüdür?', o: ['“200 işçi təlim keçdi”', '“Müraciətə cavab müddəti 2 gündən 2 saata düşdü”'], a: 1, e: 'Nəticə müştəri və biznes üçün dəyişikliyi göstərir.' },
      { q: 'OKR-də “Key Result” necə olmalıdır?', o: ['Ölçülə bilən, rəqəmli', 'Ümumi və ilhamverici'], a: 0, e: 'İlhamverici olan məqsəddir, KR isə ölçülür.' },
      { q: 'Operatorlar zəngləri problemi həll etmədən tez bitirirlər. Bu, nəyin nümunəsidir?', o: ['Qudhart qanunu: göstərici hədəfə çevriləndə pozulur', 'Uğurlu transformasiya'], a: 0, e: 'Nəticə göstəricisi seçin: “ilk zəngdə həll olunanların payı”.' },
    ],
    road: [
      { q: 'Yol xəritəsinin ilk mərhələsində nə olmalıdır?', o: ['Tez görünən, ucuz qələbələr', 'Ən bahalı və uzun layihə'], a: 0, e: 'Qısamüddətli qələbələr inam yaradır (Kotter, 6-cı addım).' },
      { q: 'Öz mobil tətbiqi nə vaxt hazırlanmalıdır?', o: ['Data həqiqətən ehtiyac olduğunu göstərəndə', 'Ən birinci gün'], a: 0, e: 'Sübut olunmuş ehtiyac.' },
    ],
    final: [
      { q: 'Rəqəmsal transformasiyanın əsası:', o: ['Dəyər yaratma üsulunu dəyişmək', 'Kompüter sayını artırmaq'], a: 0, e: 'Texnologiya vasitədir.' },
      { q: 'Netflix-in transformasiyası:', o: ['DVD-ləri poçtla göndərməkdən striminqə keçmək', 'DVD mağazaları açmaq'], a: 0, e: '2007.' },
      { q: 'Kodak-ın dərsi:', o: ['Texnologiyaya sahib olmaq kifayət deyil, onu biznes modelinə çevirmək lazımdır', 'Rəqəmsal foto gələcəksizdir'], a: 0, e: 'İxtiranı özü edib istifadə etmədi.' },
      { q: 'Strategiyanın başlanğıc nöqtəsi:', o: ['Müştərinin problemi', 'Rəqibin aldığı texnologiya'], a: 0, e: 'Problem → məqsəd → həll → texnologiya.' },
      { q: 'Müştəri səyahətində ilk hədəf:', o: ['Ən böyük ağrı nöqtəsi', 'Ən xoş an'], a: 0, e: 'Ən pis anı düzəldin.' },
      { q: '“Nə etməliyik?” sualına cavab verən analitika:', o: ['Preskriptiv', 'Təsviri'], a: 0, e: '4-cü pillə.' },
      { q: 'Sistemləri bir-birinə qoşmaq üçün:', o: ['API', 'Skaner'], a: 0, e: 'Proqramların danışma qaydası.' },
      { q: '“Bir dəfə ver” prinsipi ilə məşhur ölkə:', o: ['Estoniya (X-Road)', 'Heç biri'], a: 0, e: '2001-ci ildən.' },
      { q: 'Avtomatlaşdırmadan əvvəl:', o: ['Sadələşdirmək', 'Mürəkkəbləşdirmək'], a: 0, e: 'Pis prosesi rəqəmsallaşdırmayın.' },
      { q: 'MVP-nin məqsədi:', o: ['İdeyanı ən ucuz yolla real müştərilərlə yoxlamaq', 'Mükəmməl məhsul buraxmaq'], a: 0, e: 'Qur → ölç → öyrən.' },
      { q: 'Transformasiyanın ən çətin hissəsi adətən:', o: ['İnsanlar və mədəniyyət', 'Server almaq'], a: 0, e: 'Kotterin 8 addımı.' },
      { q: 'Kotterə görə dəyişiklik nə ilə başlayır?', o: ['Təcililik hissi', 'Mədəniyyətə yerləşdirmə'], a: 0, e: 'Mədəniyyətə yerləşdirmə sondur.' },
      { q: 'Fişinqin ən güclü əlaməti:', o: ['CVV və SMS şifrənin soruşulması', 'Məktubda loqonun olması'], a: 0, e: 'Bank bunu heç vaxt soruşmur.' },
      { q: 'Hansı daha yaxşı göstəricidir?', o: ['Onlayn sifarişlərin payı 10%-dən 35%-ə', 'Sayt istifadəyə verildi'], a: 0, e: 'Nəticə ölçüsü.' },
      { q: 'Göstərici hədəfə çevriləndə pozulur. Bu nədir?', o: ['Qudhart qanunu', 'Mur qanunu'], a: 0, e: 'Göstəriciləri ağılla seçin.' },
    ],
  };
  api.quizzes(QUIZ);
});
