/* Fəlsəfə kursu: interaktiv hissələr və testlər.
   Dərs indeksləri (0-dan): 1 Sokrat dialoqu, 2 mağara, 3 qızıl orta, 4 zaman xətti,
   5 şübhə oyunu, 6 gəmi, 7 etik kompas, 9 cəhalət pərdəsi, 10 nəzarət dairəsi. */
LMS.registerCourse('felsefe', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ================= Sokrat dialoqu =================
  (() => {
    const N = {
      start: { s: 'Salam, dostum! Deyirlər, sən xoşbəxtliyin nə olduğunu bilirsən. Mənə də öyrət: <b>xoşbəxtlik nədir?</b>', c: [['Xoşbəxtlik çoxlu pulun olmasıdır.', 'money'], ['Xoşbəxtlik həmişə ləzzət almaqdır.', 'pleasure'], ['Xoşbəxtlik istədiyini əldə etməkdir.', 'want']] },
      money: { s: 'Maraqlıdır. Bəs varlı olub, amma xəstə, tənha və hər gün qorxu içində yaşayan adam? O, xoşbəxtdirmi?', c: [['Yox, belə adam xoşbəxt deyil.', 'money2'], ['Bəli, çünki pulu var.', 'money_stub']] },
      money_stub: { s: 'Deməli, sən bu adamın yerində olmağı, sağlamlığını və dostlarını pul ilə dəyişməyi seçərdin? Ürəyindən soruş.', c: [['Yox… seçməzdim. Deməli, pul tək kifayət deyil.', 'money2']] },
      money2: { s: 'Onda pul xoşbəxtliyin özü deyil, ola bilsin, ona aparan <b>vasitələrdən</b> biridir. Bəs vasitəni yaxşı edən nədir?', c: [['Onu düzgün istifadə etmək.', 'wisdom']] },
      pleasure: { s: 'Bir insan bütün günü şirniyyat yeyib ləzzət alır. Bir ildən sonra xəstələnir. Ləzzət onu xoşbəxt etdimi?', c: [['Yox, sonda ona zərər verdi.', 'pleasure2'], ['O anda etdi, bu kifayətdir.', 'pleasure_stub']] },
      pleasure_stub: { s: 'Bəs sən öz uşağına belə həyat arzulayardınmı: bir neçə il ləzzət, sonra uzun xəstəlik?', c: [['Yox, arzulamazdım. Deməli, ləzzət tək kifayət deyil.', 'pleasure2']] },
      pleasure2: { s: 'Deməli, bəzi ləzzətlər xeyirlidir, bəziləri zərərli. Onları bir-birindən ayırmaq üçün nə lazımdır?', c: [['Ağıl, yəni nəyin həqiqətən yaxşı olduğunu bilmək.', 'wisdom']] },
      want: { s: 'Bəs insan səhvən ona zərər verən şeyi istəyirsə, məsələn, sərxoş halda maşın sürməyi? Onu əldə etmək xoşbəxtlikdirmi?', c: [['Yox, çünki istədiyi əslində ona pislikdir.', 'want2']] },
      want2: { s: 'Deməli, xoşbəxtlik sadəcə istədiyini əldə etmək deyil, <b>doğru şeyi</b> istəmək və onu əldə etməkdir. Doğrunu bilmək üçün nə lazımdır?', c: [['Müdriklik.', 'wisdom']] },
      wisdom: { s: 'Gör, nə maraqlıdır! Başlanğıcda xoşbəxtliyi bildiyini düşünürdün. İndi isə birlikdə tapdıq ki, onun açarı <b>müdriklikdir</b>: nəyin həqiqətən yaxşı olduğunu bilmək. Mən də bilmirdim, sən də bilmirdin. Amma indi ikimiz də bir az daha az bilmirik. 🙂', end: true },
    };
    const box = $('socDlg');
    function say(html, who) { const d = document.createElement('div'); d.className = 'bubble ' + who; d.innerHTML = who === 's' ? '<b>Sokrat:</b> ' + html : esc(html); box.appendChild(d); }
    function show(k) {
      const n = N[k];
      say(n.s, 's');
      if (n.end) {
        const m = document.createElement('div'); m.className = 'msg ok';
        m.innerHTML = 'Bu, Sokrat metodudur: sizin tərifinizi əks-nümunə ilə yoxlayır və hər addımda onu daha dəqiq edir. Platonun dialoqlarında Sokrat məhz belə danışır.';
        box.appendChild(m); api.done(1); return;
      }
      const ch = document.createElement('div'); ch.className = 'choices';
      n.c.forEach(([t, nx]) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { ch.remove(); say(t, 'u'); setTimeout(() => show(nx), 250); }; ch.appendChild(b); });
      box.appendChild(ch);
    }
    function reset() { box.innerHTML = ''; show('start'); }
    $('socReset').onclick = reset; reset();
  })();

  // ================= Mağara =================
  (() => {
    const STEPS = [
      ['Dustaqlar', ['cv-prisoners', 'cv-wall'], 'Dustaqlar doğulduqları gündən zəncirlənib və yalnız qarşıdakı divara baxa bilirlər. Ömür boyu yalnız divardakı kölgələri görüblər və onları <b>yeganə reallıq</b> sayırlar.'],
      ['Kölgələrin mənbəyi', ['cv-objects', 'cv-fire', 'cv-wall'], 'Arxada od yanır. Od ilə dustaqlar arasında başqaları əşyalar daşıyır. Divardakı kölgələr bu əşyaların kölgəsidir. Dustaqlar bunu bilmir.'],
      ['Azad olmaq', ['cv-prisoners', 'cv-fire', 'cv-objects'], 'Bir dustaq azad edilir və geri dönür. Od gözlərini qamaşdırır, ağrı verir. Əvvəlcə kölgələri daha real sayır. Həqiqəti görmək çətin və ağrılıdır.'],
      ['Günəş', ['cv-free'], 'Mağaradan çıxır və günəşi görür: əsl dünyanı, əşyaların özünü. Platona görə günəş <b>Xeyir ideyasıdır</b>, bütün biliyin mənbəyidir. Fəlsəfə məhz bu yüksəliş yoludur.'],
      ['Geri qayıdış', ['cv-prisoners', 'cv-free', 'cv-wall'], 'O, digərlərini xilas etmək üçün mağaraya qayıdır. Amma qaranlıqda yaxşı görmür, dustaqlar isə ona gülür və onu təhlükəli sayırlar. Bu, Platonun müəllimi Sokratın taleyinə işarədir: həqiqəti deyən adam cəmiyyət tərəfindən rədd edildi.'],
    ];
    const ids = ['cv-wall', 'cv-prisoners', 'cv-objects', 'cv-fire', 'cv-free'];
    const box = $('caveSteps'), txt = $('caveTxt'), seen = new Set();
    STEPS.forEach((s, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + '. ' + s[0]; b.onclick = () => go(i); box.appendChild(b); });
    ids.forEach(id => { const g = document.getElementById(id); if (g) g.classList.add('hl'); });
    function go(i) {
      [...box.children].forEach((b, j) => b.classList.toggle('on', j === i));
      ids.forEach(id => { const g = document.getElementById(id); if (g) g.style.opacity = STEPS[i][1].includes(id) ? 1 : 0.18; });
      txt.innerHTML = STEPS[i][2];
      seen.add(i); if (seen.size === STEPS.length) api.done(2);
    }
    go(0);
  })();

  // ================= Qızıl orta =================
  (() => {
    const V = [['Qorxaqlıq', 'Cəsarət', 'Ehtiyatsızlıq', 'Risk qarşısında'], ['Xəsislik', 'Səxavət', 'İsrafçılıq', 'Pul xərcləyəndə'], ['Özünü kiçiltmə', 'Ləyaqət', 'Lovğalıq', 'Öz uğurların haqqında danışanda'], ['Laqeydlik', 'Səbir', 'Hirslilik', 'Sizi incidəndə']];
    const box = $('meanBox'), touched = new Set();
    V.forEach((v, i) => {
      const d = document.createElement('div'); d.className = 'mean';
      d.innerHTML = `<div><b>${v[3]}</b></div><div class="ends"><span>${v[0]}</span><span>${v[1]}</span><span>${v[2]}</span></div><input type="range" min="0" max="100" value="50" aria-label="${v[1]}"><div class="verdict"></div>`;
      const inp = d.querySelector('input'), ver = d.querySelector('.verdict');
      const upd = () => {
        const x = +inp.value;
        if (x < 30) { ver.textContent = `↙ ${v[0]} tərəfə meyl: ${v[1].toLowerCase()} üçün bir az daha cəsarətli addımlar atın.`; ver.style.color = 'var(--ex-blue-b)'; }
        else if (x > 70) { ver.textContent = `↗ ${v[2]} tərəfə meyl: bir az daha ölçülü olmağa çalışın.`; ver.style.color = 'var(--ex-red-b)'; }
        else { ver.textContent = `✓ Qızıl ortaya yaxın: ${v[1].toLowerCase()}. Aristotel razı qalardı.`; ver.style.color = 'var(--ex-green-b)'; }
      };
      inp.addEventListener('input', () => { upd(); touched.add(i); if (touched.size === V.length) api.done(3); });
      upd(); box.appendChild(d);
    });
  })();

  // ================= Zaman xətti =================
  (() => {
    const P = [
      [870, 'Fərabi', '870–950', 'Aristotelin ən böyük şərhçisi, Şərqdə “İkinci müəllim” adlanır. “Fazil şəhər əhlinin baxışları” əsərində ideal cəmiyyəti təsvir edib: cəmiyyətin məqsədi bütün üzvlərinin xoşbəxtliyidir.'],
      [980, 'İbn Sina', '980–1037', 'Filosof və həkim. “Tibb qanunu” əsəri Avropada əsrlər boyu əsas tibb dərsliyi olub. “Şəfa kitabı”nda “uçan adam” düşüncə təcrübəsini təsvir edib.'],
      [1040, 'Bəhmənyar', '? – 1066', 'Azərbaycanlı filosof, İbn Sinanın ən yaxın tələbəsi. “Ət-Təhsil” əsərində müəlliminin fəlsəfəsini sistemləşdirib. Məntiq, metafizika və təbiət fəlsəfəsi ilə məşğul olub.'],
      [1150, 'Nizami Gəncəvi', '1141–1209', 'Böyük şair və mütəfəkkir. “Xəmsə”nin ilk poeması “Sirlər xəzinəsi” fəlsəfi-əxlaqi əsərdir. “İsgəndərnamə”də ədalətli, bərabər insanların yaşadığı ideal cəmiyyəti təsvir edib.'],
      [1180, 'Sührəvərdi', '1154–1191', 'Cənubi Azərbaycanda, Sührəvərd kəndində doğulub. “İşraq” (nurlanma) fəlsəfəsinin banisidir: varlıq nurun dərəcələridir. Fikirlərinə görə Hələbdə edam edilib.'],
      [1230, 'Nəsirəddin Tusi', '1201–1274', 'Riyaziyyatçı, astronom və filosof. Marağada (Cənubi Azərbaycan) dövrünün ən böyük rəsədxanasını qurdu. “Əxlaqi-Nasiri” əsərində əxlaqı şəxs, ailə və cəmiyyət səviyyəsində təhlil edib.'],
      [1840, 'M. F. Axundzadə', '1812–1878', 'Şəkidə doğulub. Azərbaycan dramaturgiyasının və maarifçi fəlsəfəsinin banisi. “Kəmalüddövlə məktubları”nda despotizmi və xurafatı tənqid edib, ağlı və azad düşüncəni müdafiə edib.'],
      [1965, 'Lütfi Zadə', '1921–2017', 'Bakıda doğulub. 1965-ci ildə qeyri-səlis məntiqi yaradıb. Bu nəzəriyyə “ya doğru, ya yalan” ikiliyindən kənara çıxan müasir məntiq sahəsidir və bu gün məişət texnikasından avtomobillərə qədər tətbiq olunur. Məntiq kursunun 18-ci dərsinə baxın.'],
    ];
    const tl = $('tl'), card = $('tlCard'), seen = new Set();
    const x = (y, i) => 5 + i * 90 / (P.length - 1); // bərabər addımlar: dəqiq illər kartda yazılır
    P.forEach((p, i) => {
      const b = document.createElement('button'); b.style.left = x(p[0], i) + '%'; b.title = p[1]; b.setAttribute('aria-label', p[1]);
      const l = document.createElement('span'); l.style.left = x(p[0], i) + '%'; l.textContent = p[1].replace('M. F. ', '').split(' ')[0];
      if (i % 2) l.style.top = '-2px';
      b.onclick = () => show(i); tl.append(b, l);
    });
    function show(i) {
      [...tl.querySelectorAll('button')].forEach((b, j) => b.classList.toggle('on', j === i));
      const p = P[i]; card.innerHTML = `<h4>${p[1]}</h4><div class="fb" style="margin:0 0 6px">${p[2]}</div><div>${p[3]}</div>`;
      seen.add(i); if (seen.size === P.length) api.done(4);
    }
    show(0);
  })();

  // ================= Şübhə oyunu =================
  (() => {
    const B = [
      ['Qarşımda masa var.', 'Hisslər bəzən aldadır: suda çubuq əyri görünür, səhrada ilğım görünür.'],
      ['Mənim bədənim var.', 'Yuxuda da bədənim olduğunu hiss edirəm. İndi yuxuda olmadığımı necə bilim?'],
      ['2 + 3 = 5', 'Bəlkə güclü bir “şər cin” məni hər dəfə hesablayanda aldadır?'],
      ['Dünya mövcuddur.', 'Hər şey cinin yaratdığı bir illüziya ola bilər.'],
      ['Mən şübhə edirəm, yəni düşünürəm.', null],
    ];
    const box = $('doubtBox');
    B.forEach(([t, why], i) => {
      const r = document.createElement('div'); r.className = 'row2';
      r.innerHTML = `<span>${esc(t)}</span>`;
      const b = document.createElement('button'); b.className = 'btn ghost'; b.textContent = 'Şübhə et';
      b.onclick = () => {
        if (why) { r.classList.add('gone'); r.querySelector('span').innerHTML = `${esc(t)}<br><small class="fb">${esc(why)}</small>`; b.remove(); }
        else {
          r.classList.add('cogito'); b.remove();
          r.querySelector('span').innerHTML = `<b>${esc(t)}</b><br><small>Şübhə etməyin özü düşünməkdir. Şübhə edən kimsə mütləq var. <b>Cogito, ergo sum: düşünürəm, deməli varam.</b> Dekart bütün fəlsəfəsini bu təməl üzərində qurdu.</small>`;
          api.done(5);
        }
      };
      r.appendChild(b); box.appendChild(r);
    });
  })();

  // ================= Teseyin gəmisi =================
  (() => {
    const inp = $('shipIn'), svg = $('shipSvg'), q = $('shipQ');
    let voted = false;
    function draw() {
      const n = +inp.value; $('shipN').textContent = n;
      let planks = '';
      for (let i = 0; i < 20; i++) {
        const isNew = i < Math.round(n / 5);
        planks += `<rect x="${120 + i * 20}" y="110" width="18" height="34" rx="2" fill="${isNew ? 'var(--ex-amber-b)' : '#8a5a33'}"/>`;
      }
      svg.innerHTML = `<path d="M90 110h440l-40 56H130z" fill="var(--line)"/>${planks}<path d="M318 110V24" stroke="var(--muted)" stroke-width="5"/><path d="M322 30l90 70h-90z" fill="var(--panel)" stroke="var(--accent)" stroke-width="3"/><path d="M0 172c40-10 80 10 120 0s80 10 120 0 80 10 120 0 80 10 120 0 80 10 160 0" stroke="var(--ex-blue-b)" stroke-width="4" fill="none"/>
        <g font-family="Noto Sans,sans-serif" font-size="12" fill="var(--ink)"><rect x="20" y="14" width="12" height="12" fill="#8a5a33"/><text x="38" y="25">köhnə taxta</text><rect x="20" y="34" width="12" height="12" fill="var(--ex-amber-b)"/><text x="38" y="45">yeni taxta</text></g>`;
      if (n < 100) q.innerHTML = `<div class="msg info">${n === 0 ? 'Gəmi tam orijinaldır. Sürüşkəni çəkin.' : n < 50 ? 'Taxtaların bir hissəsi dəyişib. Çoxu deyir: “Əlbəttə, hələ də eyni gəmidir.”' : 'Taxtaların yarıdan çoxu yenidir. Hansı anda gəmi “başqa gəmi” oldu? 51-ci taxtada? Belə dəqiq sərhəd yoxdur. Bu, Məntiq kursundakı qeyri-səlis anlayışları xatırladır.'}</div>`;
      else if (!voted) {
        q.innerHTML = `<div class="msg info">Bütün taxtalar dəyişib. Daha bir problem: kimsə atılmış köhnə taxtaları toplayıb onlardan <b>ikinci gəmi</b> qurub. Hansı əsl Teseyin gəmisidir?</div>
          <div class="choices"><button data-v="a">Yeni taxtalarla limanda dayanan gəmi: davamlılıq vacibdir.</button><button data-v="b">Köhnə taxtalardan qurulan gəmi: maddə vacibdir.</button><button data-v="c">Heç biri, ya da ikisi də: “eyni” sözü burada aydın deyil.</button></div>`;
        q.querySelectorAll('button').forEach(b => b.onclick = () => {
          voted = true;
          const R = { a: 'Siz <b>davamlılıq</b> nəzəriyyəsini seçdiniz: kimlik forma, funksiya və tarixi davamlılıqla müəyyən olunur. Şəxsiyyət haqqında da çoxları belə düşünür: yaddaş və xarakter davam etdikcə siz “siz” qalırsınız.', b: 'Siz <b>maddi</b> nəzəriyyəni seçdiniz: kimlik onu təşkil edən maddə ilə bağlıdır. Amma insan bədəni də daim yenilənir. Onda siz 10 il əvvəlki insan deyilsiniz?', c: 'Siz <b>dil</b> mövqeyini seçdiniz: problem dünyada deyil, “eyni” sözünün qeyri-dəqiqliyindədir. Bəzi müasir filosoflar (məsələn, Derek Parfit) belə deyirdi: kimlik o qədər də vacib deyil, vacib olan psixoloji əlaqələrdir.' };
          q.innerHTML = `<div class="msg ok">${R[b.dataset.v]}</div>`; api.done(6);
        });
      }
    }
    inp.oninput = draw; draw();
  })();

  // ================= Etik kompas =================
  (() => {
    const D = [
      ['Dostunuz sizə yeni saç düzümünü göstərib soruşur: “Necədir?” Sizcə pis olub.', [['Dürüst deyirəm, amma nəzakətlə. Yalan demək olmaz.', 'D'], ['“Çox gözəl!” deyirəm. Onun əhvalı daha vacibdir.', 'U'], ['Düşünürəm: yaxşı dost burada nə edərdi? Həm dürüst, həm də qayğıkeş olmağa çalışıram.', 'F']]],
      ['Qəzada 5 nəfər ağır yaralanıb. Sağlam bir xəstənin orqanları onların hamısını xilas edə bilər.', [['Qəti olmaz: insanı vasitə kimi istifadə etmək olmaz.', 'D'], ['Riyazi baxımdan 5 həyat 1 həyatdan çoxdur, amma belə qayda cəmiyyəti qorxu içində yaşadar. Ona görə yox.', 'U'], ['Bunu yaxşı həkim heç vaxt etməz.', 'F']]],
      ['Şirkətiniz bir az qanunsuz yolla böyük qazanc əldə edə bilər. Heç kim bilməyəcək, işçilər də mükafat alacaq.', [['Qanunu pozmaq səhvdir, nəticəsindən asılı olmayaraq.', 'D'], ['Riskləri və hamıya dəyən zərəri hesablayıram. Ümumi zərər çox olarsa, yox.', 'U'], ['Mən elə insan olmaq istəmirəm.', 'F']]],
      ['Küçədə içində 500 ₼ olan pul kisəsi tapdınız. İçində sahibinin adı var.', [['Qaytarmaq borcdur.', 'D'], ['Qaytarıram: sahibinin itkisi mənim qazancımdan böyükdür.', 'U'], ['Qaytarıram, çünki dürüst insan belə edir.', 'F']]],
      ['Xəstəxanada yalnız bir dərman var. Bir yaşlı alim və bir gənc tələbə ona ehtiyac duyur.', [['Növbə ilə: kim birinci gəlibsə. İnsanları dəyərinə görə sıralamaq olmaz.', 'D'], ['Kim daha çox illik sağlam həyat qazanacaqsa, ona.', 'U'], ['Hikmətli və rəhmli həkim nə edərdi, onu düşünürəm.', 'F']]],
      ['Yalan danışmaq bir insanın həyatını xilas edəcək: qatil dostunuzun harada gizləndiyini soruşur.', [['Kanta görə yalan qadağandır. Susa bilərəm, amma yalan demərəm.', 'D'], ['Əlbəttə yalan deyirəm: həyat həqiqətdən vacibdir.', 'U'], ['Cəsarətli və müdrik insan dostunu qoruyar.', 'F']]],
    ];
    const box = $('ethBox'), score = { U: 0, D: 0, F: 0 };
    let i = 0;
    function step() {
      if (i >= D.length) return result();
      const [q, opts] = D[i];
      box.innerHTML = `<div class="fb">Dilemma ${i + 1} / ${D.length}</div><p><b>${esc(q)}</b></p><div class="choices"></div>`;
      const ch = box.querySelector('.choices');
      opts.map(o => o).sort(() => Math.random() - .5).forEach(([t, k]) => { const b = document.createElement('button'); b.textContent = t; b.onclick = () => { score[k]++; i++; step(); }; ch.appendChild(b); });
    }
    function result() {
      const N = { U: ['Utilitarizm', 'var(--ex-blue-b)', 'Nəticələrə baxırsınız: ən çox insan üçün ən yaxşısı.'], D: ['Deontologiya', 'var(--ex-red-b)', 'Prinsiplərə sadiqsiniz: bəzi şeylər nəticədən asılı olmayaraq düzgün və ya səhvdir.'], F: ['Fəzilət etikası', 'var(--ex-green-b)', 'Xarakterə baxırsınız: yaxşı insan necə hərəkət edərdi?'] };
      const top = Object.keys(score).sort((a, b) => score[b] - score[a])[0];
      box.innerHTML = `<p><b>Sizin etik profiliniz:</b></p>` + Object.keys(N).map(k => `<div class="vbar"><span>${N[k][0]}</span><div class="track"><i style="width:${score[k] / D.length * 100}%;background:${N[k][1]}"></i></div><b>${score[k]}</b></div>`).join('') +
        `<div class="msg ok">Ən güclü meyliniz: <b>${N[top][0]}</b>. ${N[top][2]} Əksər insanlar üç yanaşmanı qarışıq istifadə edir. Bu, normaldır: hər nəzəriyyə bəzi vəziyyətləri digərlərindən yaxşı izah edir.</div><button class="btn ghost" id="ethAgain">Yenidən</button>`;
      $('ethAgain').onclick = () => { i = 0; score.U = score.D = score.F = 0; step(); };
      api.done(7);
    }
    step();
  })();

  // ================= Cəhalət pərdəsi =================
  (() => {
    const S = [
      ['A: Bərabər', [1800, 1900, 2000, 2100, 2200], 'Hamı təxminən eyni yaşayır. Orta: 2000 ₼'],
      ['B: Böyük fərq', [300, 900, 2000, 4000, 12800], 'Orta gəlir ən yüksəkdir (4000 ₼), amma ən aşağı qrup çox kasıbdır.'],
      ['C: Təhlükəsizlik toru', [1400, 1800, 2600, 3600, 6100], 'Fərq var, amma ən aşağı qrup da layiqli yaşayır. Orta: 3100 ₼'],
    ];
    const box = $('veilBox');
    function choose() {
      box.innerHTML = `<div class="grid2" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr))">${S.map((s, i) => `<button class="opt-soc" data-i="${i}" style="text-align:left;border:1.5px solid var(--line);border-radius:12px;padding:12px;background:var(--panel);color:var(--ink);font:inherit;cursor:pointer"><b>${s[0]}</b><div style="display:flex;align-items:flex-end;gap:4px;height:70px;margin:8px 0">${s[1].map(v => `<i style="flex:1;background:var(--accent);opacity:.8;border-radius:3px 3px 0 0;height:${Math.max(4, v / 12800 * 70)}px"></i>`).join('')}</div><small class="fb">${s[2]}</small></button>`).join('')}</div>`;
      box.querySelectorAll('.opt-soc').forEach(b => b.onclick = () => reveal(+b.dataset.i));
    }
    function reveal(i) {
      const s = S[i], g = Math.floor(Math.random() * 5), inc = s[1][g];
      const names = ['ən kasıb 20%', 'aşağı-orta 20%', 'orta 20%', 'yuxarı-orta 20%', 'ən varlı 20%'];
      const bad = inc < 1000;
      box.innerHTML = `<div class="msg ${bad ? 'bad' : 'ok'}">Pərdə qalxdı! Siz <b>${s[0]}</b> cəmiyyətində <b>${names[g]}</b> qrupunda doğuldunuz. Aylıq gəliriniz: <b>${inc} ₼</b>. ${bad ? 'Bu, çox çətin həyatdır.' : ''}</div>
        <p>Roulz deyir ki, pərdə arxasında ağıllı insan riskə getməz və <b>ən pis vəziyyətin ən yaxşı olduğu</b> cəmiyyəti seçər (maksimin prinsipi). Bu, C cəmiyyətidir: ən aşağı gəlir 1400 ₼-dır. Utilitarist isə orta gəliri ən yüksək olan B-ni seçə bilərdi. Siz hansını seçdiniz və niyə?</p>
        <button class="btn ghost" id="veilAgain">Yenidən oyna</button>`;
      $('veilAgain').onclick = choose; api.done(9);
    }
    choose();
  })();

  // ================= Nəzarət dairəsi =================
  (() => {
    const I = [['Səhər neçədə oyanacağım', 1], ['Sabahkı hava', 0], ['İmtahana necə hazırlaşacağım', 1], ['Müəllimin mənə hansı qiyməti verəcəyi', 0], ['Mübahisədə səsimin tonu', 1], ['Başqalarının mənim haqqımda nə düşündüyü', 0], ['Dolların məzənnəsi', 0], ['Pulumu nəyə xərcləyəcəyim', 1], ['Tıxacın olub-olmaması', 0], ['Tıxaca necə reaksiya verəcəyim', 1]];
    let i = 0, right = 0;
    const item = $('ctlItem'), msg = $('ctlMsg');
    function next() {
      if (i >= I.length) {
        item.innerHTML = ''; msg.innerHTML = `<div class="msg ok">${right} / ${I.length} düzgün. Diqqət edin: hadisənin özü (tıxac) çox vaxt bizdən asılı deyil, amma ona <b>reaksiyamız</b> bizdən asılıdır. Epiktet: “İnsanları hadisələr deyil, hadisələr haqqında fikirləri narahat edir.”</div>`;
        api.done(10); return;
      }
      item.innerHTML = `<div class="msg info" style="font-size:1.05rem"><b>${esc(I[i][0])}</b></div><div class="row" style="margin-top:8px"><button class="btn" data-a="1">✅ Məndən asılıdır</button><button class="btn ghost" data-a="0">🌧️ Asılı deyil</button></div>`;
      item.querySelectorAll('button').forEach(b => b.onclick = () => {
        const ok = +b.dataset.a === I[i][1]; if (ok) right++;
        const chip = document.createElement('span'); chip.className = 'chip'; chip.textContent = (ok ? '' : '✗ ') + I[i][0];
        (I[i][1] ? $('ctlIn') : $('ctlOut')).appendChild(chip);
        msg.innerHTML = ok ? '' : `<div class="msg bad">“${esc(I[i][0])}” ${I[i][1] ? 'məndən asılıdır' : 'məndən asılı deyil'}.</div>`;
        i++; next();
      });
    }
    next();
  })();

  // ================= Testlər =================
  const QUIZ = {
    branches: [
      { q: '“Zaman həqiqətən mövcuddurmu, yoxsa bizim təsəvvürümüzdür?”', o: ['Metafizika', 'Etika', 'Estetika'], a: 0, e: 'Varlığın təbiəti haqqında sualdır.' },
      { q: '“Əmin olmadığım xəbəri paylaşmalıyammı?”', o: ['Etika', 'Məntiq', 'Estetika'], a: 0, e: 'Necə davranmalı sualıdır. Amma “bu xəbər doğrudurmu?” sualı epistemologiyaya aiddir.' },
      { q: '“Müasir incəsənət sərgisindəki boş kətan sənət əsəridirmi?”', o: ['Estetika', 'Siyasi fəlsəfə', 'Metafizika'], a: 0, e: 'Gözəllik və sənət haqqında sualdır.' },
      { q: '“Elmi bilik dini və ya şəxsi inancdan nə ilə fərqlənir?”', o: ['Epistemologiya', 'Etika', 'Estetika'], a: 0, e: 'Bilik nəzəriyyəsi.' },
      { q: '“Dövlət vətəndaşın şəxsi həyatına nə qədər qarışa bilər?”', o: ['Siyasi fəlsəfə', 'Məntiq', 'Estetika'], a: 0, e: 'Hakimiyyət və azadlıq.' },
    ],
    socrates: [
      { q: 'Sokratın məşhur fikri:', o: ['“Bilik gücdür”', '“Bildiyim yeganə şey heç nə bilmədiyimdir”', '“Düşünürəm, deməli varam”'], a: 1, e: '“Bilik gücdür” Bekona, “Düşünürəm, deməli varam” Dekarta aiddir.' },
      { q: 'Sokrat metodunun əsas aləti nədir?', o: ['Uzun nitq', 'Suallar və əks-nümunələr', 'Kitab yazmaq'], a: 1, e: 'Tərif əks-nümunə ilə yoxlanılır.' },
      { q: 'Sokratın fikirlərini bu günə qədər necə bilirik?', o: ['Öz kitablarından', 'Əsasən tələbəsi Platonun dialoqlarından'], a: 1, e: 'Sokrat heç nə yazmayıb.' },
      { q: '“Bütün quşlar uça bilir” tərifini Sokratsayağı yoxlamaq üçün:', o: ['Daha çox uçan quş tapmaq', 'Pinqvin kimi bir əks-nümunə göstərmək'], a: 1, e: 'Bir əks-nümunə ümumi iddianı təkzib edir (Məntiq kursu, 6-cı dərs).' },
    ],
    plato: [
      { q: 'Mağara alleqoriyasında kölgələr nəyi simvolizə edir?', o: ['Həqiqi bilik', 'Hisslərlə qavradığımız və həqiqət sandığımız zahiri görüntülər'], a: 1, e: 'Dustaqlar kölgələri reallıq sanır.' },
      { q: 'Mağaradan çıxan insan günəşi görür. Günəş nədir?', o: ['Xeyir ideyası, yəni biliyin ən yüksək mənbəyi', 'Od'], a: 0, e: 'Platonun “Dövlət” əsərində günəş Xeyir ideyasının simvoludur.' },
      { q: 'Platona görə “mükəmməl dairə” harada mövcuddur?', o: ['Kağızda', 'İdeyalar aləmində'], a: 1, e: 'Fiziki dairələr natamamdır, ideya isə mükəmməldir.' },
      { q: 'Mağaraya qayıdan insanın taleyi kimin taleyinə işarədir?', o: ['Sokratın', 'Aristotelin'], a: 0, e: 'Həqiqəti deyən Sokratı Afina məhkum etdi.' },
    ],
    aristotle: [
      { q: 'Aristotelə görə həyatın son məqsədi:', o: ['Pul', 'Evdemoniya, yəni çiçəklənən, yaxşı yaşanmış həyat', 'Hakimiyyət'], a: 1, e: 'Evdemoniya özü üçün istənilən yeganə məqsəddir.' },
      { q: 'Səxavət hansı iki ifratın ortasıdır?', o: ['Xəsislik və israfçılıq', 'Qorxaqlıq və ehtiyatsızlıq'], a: 0, e: 'Qızıl orta.' },
      { q: 'Qızıl orta riyazi ortadırmı?', o: ['Bəli, həmişə tən ortada', 'Xeyr, vəziyyətdən asılıdır və praktik müdriklik tələb edir'], a: 1, e: 'Phronesis, yəni praktik müdriklik.' },
      { q: '“Biz təkrar etdiyimiz şeylərik.” Bu fikir nəyi vurğulayır?', o: ['Xarakter vərdişlərlə formalaşır', 'Hər şey təsadüfdür'], a: 0, e: 'Fəzilət vərdişdir.' },
    ],
    east: [
      { q: 'Kimi Şərqdə “İkinci müəllim” adlandırıblar?', o: ['Fərabini', 'Nizamini', 'Tusini'], a: 0, e: '“Birinci müəllim” Aristoteldir.' },
      { q: 'Marağa rəsədxanasını kim qurub?', o: ['Nəsirəddin Tusi', 'İbn Sina', 'Sührəvərdi'], a: 0, e: '1259-cu ildə, Cənubi Azərbaycanda.' },
      { q: '“Uçan adam” düşüncə təcrübəsi nəyi göstərmək istəyir?', o: ['“Mən” özünüdərki bədən hisslərindən asılı deyil', 'İnsan uça bilər'], a: 0, e: 'İbn Sina: nəfs bədəndən fərqlidir.' },
      { q: 'İbn Sinanın azərbaycanlı tələbəsi kim olub?', o: ['Bəhmənyar', 'Axundzadə'], a: 0, e: 'Bəhmənyar, “Ət-Təhsil” əsərinin müəllifi.' },
      { q: '“Kəmalüddövlə məktubları”nın müəllifi:', o: ['M. F. Axundzadə', 'Nizami Gəncəvi'], a: 0, e: 'XIX əsr maarifçiliyi.' },
    ],
    knowledge: [
      { q: '“Cogito, ergo sum” nə deməkdir?', o: ['Düşünürəm, deməli varam', 'Bilik gücdür'], a: 0, e: 'Dekart.' },
      { q: 'Lokka görə doğulan uşağın ağlı:', o: ['Fitri ideyalarla doludur', 'Boş lövhədir (tabula rasa)'], a: 1, e: 'Empirizm.' },
      { q: 'Yumun induksiya problemi nədir?', o: ['Keçmişdə hər dəfə baş verən şeyin gələcəkdə də baş verəcəyini məntiqlə isbat edə bilmərik', 'Riyaziyyat yanlışdır'], a: 0, e: 'Vərdiş məntiqi isbat deyil.' },
      { q: 'Gettier problemi nəyi göstərir?', o: ['“Əsaslandırılmış doğru inanc” bilik üçün kifayət olmaya bilər', 'Bilik mümkün deyil'], a: 0, e: 'Dayanmış saat nümunəsi.' },
      { q: 'Rasionalizm və empirizmi kim birləşdirməyə çalışıb?', o: ['Kant', 'Hobbs'], a: 0, e: '“Məzmunsuz düşüncə boşdur, anlayışsız seyr kordur.”' },
    ],
    mind: [
      { q: 'Teseyin gəmisi paradoksu nə haqqındadır?', o: ['Kimlik: dəyişən şey nə vaxt “başqa” olur?', 'Dəniz ticarəti'], a: 0, e: 'Kimlik və davamlılıq.' },
      { q: 'Çin otağı arqumentinin müəllifi:', o: ['Con Sörl', 'Alan Türinq'], a: 0, e: 'Sörl, 1980.' },
      { q: 'Çin otağının əsas iddiası:', o: ['Simvolları qaydalarla emal etmək anlamaq demək deyil', 'Çin dili çətindir'], a: 0, e: 'Sintaksis semantika deyil.' },
      { q: 'Dekartın ağıl-bədən baxışı necə adlanır?', o: ['Dualizm', 'Fizikalizm'], a: 0, e: 'Ruh və bədən iki ayrı substansiyadır.' },
    ],
    ethics: [
      { q: 'Utilitarizmə görə düzgün hərəkət:', o: ['Ən çox insana ən çox xoşbəxtlik gətirəndir', 'Həmişə qaydaya əməl edəndir'], a: 0, e: 'Bentam və Mill.' },
      { q: 'Kantın kateqorik imperativinin yoxlama sualı:', o: ['“Hamı belə etsə nə olar?”', '“Mənə nə qazanc verir?”'], a: 0, e: 'Hərəkətin qaydası ümumi qanuna çevrilə bilməlidir.' },
      { q: 'Fəzilət etikasının əsas sualı:', o: ['“Nə etməliyəm?”', '“Necə insan olmalıyam?”'], a: 1, e: 'Aristotel.' },
      { q: 'Niyə çoxları körpüdən adam itələməyə razı deyil, amma qolu çəkməyə razıdır?', o: ['İnsanı birbaşa vasitə kimi istifadə etmək intuitiv olaraq daha pis görünür (Kant)', 'Riyazi nəticə fərqlidir'], a: 0, e: 'Nəticə eynidir, hərəkətin xarakteri isə fərqlidir.' },
    ],
    exist: [
      { q: '“Mənim başqa yolum yox idi, müdir məcbur etdi.” (Halbuki imtina etmək mümkün idi)', o: ['Pis niyyət', 'Autentik seçim'], a: 0, e: 'Azadlığı inkar etmək Sartra görə pis niyyətdir.' },
      { q: '“Bu işi seçdim, çünki mənə məna verir. Çətinlikləri qəbul edirəm.”', o: ['Pis niyyət', 'Autentik seçim'], a: 1, e: 'Seçiminə sahib çıxmaq.' },
      { q: '“Varlıq mahiyyətdən öndə gəlir” nə deməkdir?', o: ['İnsan əvvəlcə mövcud olur, sonra seçimləri ilə özünü yaradır', 'İnsanın taleyi əvvəlcədən yazılıb'], a: 0, e: 'Sartr.' },
      { q: 'Kamyunun Sizif haqqında nəticəsi:', o: ['“Sizifi xoşbəxt təsəvvür etmək lazımdır”', '“Sizif təslim olmalıdır”'], a: 0, e: 'Absurda qarşı üsyan və mənanı özün yaratmaq.' },
    ],
    politics: [
      { q: 'Hobbsa görə dövlətsiz “təbii vəziyyət”:', o: ['Cənnət kimidir', 'Hamının hamıya qarşı müharibəsidir'], a: 1, e: 'Həyat “tənha, kasıb, çirkin, vəhşi və qısa” olur.' },
      { q: 'Lokkun təbii hüquqları:', o: ['Həyat, azadlıq, mülkiyyət', 'Güc, şan, sərvət'], a: 0, e: 'ABŞ İstiqlal Bəyannaməsinə təsir edib.' },
      { q: '“İnsan azad doğulur, amma hər yerdə zəncirdədir” kimindir?', o: ['Russo', 'Hobbs'], a: 0, e: '“İctimai müqavilə”, 1762.' },
      { q: 'Roulzun cəhalət pərdəsi arxasında ağıllı insan hansı cəmiyyəti seçər?', o: ['Orta gəliri ən yüksək olanı', 'Ən pis vəziyyətdə olanların həyatının ən yaxşı olduğu cəmiyyəti'], a: 1, e: 'Maksimin prinsipi.' },
    ],
    stoic: [
      { q: 'Nəzarət dixotomiyası kimə aiddir?', o: ['Epiktetə', 'Platona'], a: 0, e: '“Bəzi şeylər bizdən asılıdır, bəziləri isə yox.”' },
      { q: 'Hansı sizdən asılıdır?', o: ['Başqalarının sizin haqqınızda fikri', 'Tənqidə necə reaksiya verəcəyiniz'], a: 1, e: 'Reaksiyamız bizdən asılıdır.' },
      { q: '“Özümə düşüncələr” əsərinin müəllifi:', o: ['Mark Avreli', 'Seneka'], a: 0, e: 'Roma imperatoru.' },
      { q: 'Stoik baxışla müsahibədən sonra nəyə görə özünüzü qiymətləndirməlisiniz?', o: ['Nəticəyə görə', 'Hazırlığınıza və davranışınıza görə'], a: 1, e: 'Nəticə xarici amillərdən də asılıdır.' },
    ],
    final: [
      { q: '“Fəlsəfə” sözünün mənası:', o: ['Müdrikliyə sevgi', 'Elmlərin anası'], a: 0, e: 'philo + sophia.' },
      { q: 'Sokrat metodu nəyə əsaslanır?', o: ['Sual vermək və əks-nümunə tapmaq', 'Ehtiraslı nitqlər'], a: 0, e: 'Elenxus.' },
      { q: 'Mağara alleqoriyasının müəllifi:', o: ['Platon', 'Aristotel'], a: 0, e: '“Dövlət”.' },
      { q: 'Cəsarət hansı iki ifratın ortasıdır?', o: ['Qorxaqlıq və ehtiyatsızlıq', 'Xəsislik və israfçılıq'], a: 0, e: 'Qızıl orta.' },
      { q: '“Uçan adam” düşüncə təcrübəsi kimə aiddir?', o: ['İbn Sinaya', 'Dekarta'], a: 0, e: '“Şəfa kitabı”.' },
      { q: 'İşraq (nurlanma) fəlsəfəsinin banisi:', o: ['Sührəvərdi', 'Fərabi'], a: 0, e: 'Sührəvərddə doğulub.' },
      { q: '“Düşünürəm, deməli varam”:', o: ['Dekart', 'Lokk'], a: 0, e: 'Cogito.' },
      { q: 'Empirizmə görə bilik haradan gəlir?', o: ['Təcrübədən', 'Fitri ideyalardan'], a: 0, e: 'Lokk, Yum.' },
      { q: 'Teseyin gəmisi hansı problemə aiddir?', o: ['Kimlik', 'Ədalət'], a: 0, e: 'Dəyişən şeyin kimliyi.' },
      { q: 'Çin otağı nəyi sual altına alır?', o: ['Maşınların həqiqətən anlayıb-anlamadığını', 'Tərcümənin keyfiyyətini'], a: 0, e: 'Sörl.' },
      { q: 'Utilitarizm nəyə baxır?', o: ['Nəticələrə', 'Niyyətə'], a: 0, e: 'Ən çox insan üçün ən çox xoşbəxtlik.' },
      { q: 'Kanta görə insana necə münasibət göstərmək olmaz?', o: ['Yalnız vasitə kimi', 'Məqsəd kimi'], a: 0, e: 'İnsan həmişə həm də məqsəddir.' },
      { q: '“Başqa yolum yox idi” (əslində vardı) ekzistensializmdə nədir?', o: ['Pis niyyət', 'Autentiklik'], a: 0, e: 'Sartr.' },
      { q: 'Cəhalət pərdəsi kimin ideyasıdır?', o: ['Con Roulz', 'Tomas Hobbs'], a: 0, e: '1971, “Ədalət nəzəriyyəsi”.' },
      { q: 'Stoisizmin əsas praktiki ideyası:', o: ['Asılı olanla asılı olmayanı ayırmaq', 'Bütün ləzzətlərdən qaçmaq'], a: 0, e: 'Epiktet.' },
    ],
  };
  api.quizzes(QUIZ);
});
