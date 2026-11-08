/* Praktiki kibertəhlükəsizlik kursu. Dərs indeksləri: 0 sorter, 1 hesab yoxlaması, 2 sorter, 3 ehtiyat nüsxə, 4 router, 5 SQL, 7 sıra, 8 biznes balı, 9 sorter. */
LMS.registerCourse('kiber', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // Ümumi checklist aləti: items [[mətn, ağırlıq, tövsiyə]]
  function checklist(boxId, outId, items, done, levels) {
    const box = $(boxId);
    box.innerHTML = items.map(([t], i) => `<label><input type="checkbox" data-i="${i}"> <span>${esc(t)}</span></label>`).join('');
    const upd = touched => {
      const ch = [...box.querySelectorAll('input')].map(x => x.checked);
      const max = items.reduce((s, it) => s + it[1], 0), got = items.reduce((s, it, i) => s + (ch[i] ? it[1] : 0), 0);
      const pct = Math.round(got / max * 100);
      const miss = items.map((it, i) => [it, i]).filter(([, i]) => !ch[i]).sort((a, b) => b[0][1] - a[0][1]).slice(0, 3);
      const [label, cls] = pct < 40 ? levels[0] : pct < 75 ? levels[1] : levels[2];
      $(outId).innerHTML = `<div class="msg ${cls}"><span class="score-big">${pct}%</span> · <b>${label}</b>${miss.length ? '<br>Ən vacib növbəti addımlar:<ol style="margin:4px 0">' + miss.map(([it]) => `<li>${esc(it[2])}</li>`).join('') + '</ol>' : '<br>Əla! Bütün əsas addımlar atılıb.'}</div>`;
      if (touched) api.done(done);
    };
    box.querySelectorAll('input').forEach(x => x.onchange = () => upd(true));
    upd(false);
  }
  const LV = [['Risk yüksəkdir', 'bad'], ['Orta səviyyə', 'info'], ['Yaxşı qorunur', 'ok']];

  api.sorter('b1Sort', { bins: ['Məxfilik', 'Bütövlük', 'Əlçatanlıq'], done: 0, end: 'Hər insident bu üç prinsipdən ən azı birini pozur. Ransomware isə çox vaxt hər üçünü.', items: [
    ['Xəstəxananın pasiyent bazası internetdə satışa çıxarılıb', 0], ['Hücumçu onlayn mağazada qiymətləri 1 ₼-a endirib', 1], ['Bankın saytı DDoS hücumu ilə 5 saat açılmır', 2],
    ['Qaimə-fakturadakı bank hesabı nömrəsi dəyişdirilib', 1], ['Ransomware bütün serverlərdəki faylları şifrələyib', 2], ['İşçi müştəri siyahısını şəxsi e-poçtuna göndərib', 0]] });

  checklist('acChk', 'acOut', [
    ['E-poçt hesabımda MFA aktivdir', 3, 'E-poçtda MFA-nı aktivləşdirin: o, bütün digər hesabların bərpa açarıdır.'],
    ['Bank tətbiqində MFA və ya biometrik giriş var', 3, 'Bank hesabında əlavə qorumanı aktivləşdirin.'],
    ['Parol meneceri istifadə edirəm', 3, 'Parol meneceri quraşdırın və vacib hesablardan başlayaraq parolları dəyişin.'],
    ['Heç bir parolu iki saytda təkrar istifadə etmirəm', 3, 'Təkrarlanan parolları dəyişin, ən vacib hesablardan başlayın.'],
    ['WhatsApp və ya Telegram-da iki addımlı doğrulama (PIN) aktivdir', 2, 'Messencerdə iki addımlı doğrulamanı (PIN) aktivləşdirin.'],
    ['Bərpa e-poçtum və telefon nömrəm aktualdır', 1, 'Bərpa e-poçtunu və telefonu yoxlayın.'],
    ['Mümkün olan yerdə passkey istifadə edirəm', 1, 'Google, Apple və Microsoft hesablarında passkey yaradın.'],
    ['Sızma xəbərdarlıq xidmətini yoxlamışam', 1, 'E-poçtunuzun sızmalarda olub-olmadığını etibarlı sızma yoxlama xidmətində yoxlayın.'],
  ], 1, LV);

  api.sorter('b3Sort', { bins: ['Fırıldaq', 'Etibarlı ola bilər'], done: 2, end: 'Əsas əlamətlər: təcililik, kod və ya kart məlumatı tələbi, qısaldılmış və ya qəribə link, gözlənilməz udu və ya bağlama.', items: [
    ['SMS: “Bağlamanız gömrükdə saxlanılıb. 2.30 ₼ ödəyin: bit.ly/gomruk-az”', 0, 'Qısaldılmış link və gözlənilməz kiçik ödəniş tipik smişinqdir.'],
    ['Bankın tətbiqindəki bildiriş: “Kartınızla 45 ₼ ödəniş edildi”, sizin həqiqətən etdiyiniz alış-veriş', 1],
    ['Zəng: “Bankın təhlükəsizlik şöbəsindənik. Kartınızı bloklamaq üçün SMS ilə gələn kodu deyin”', 0, 'Bank heç vaxt SMS kodunu soruşmur.'],
    ['WhatsApp: “Ana, nömrəmi dəyişmişəm, telefonum xarab olub. Təcili 300 ₼ lazımdır, bu karta köçür”', 0, 'Tanış ssenari. Köhnə nömrəyə zəng edin və ya yalnız ailəyə məlum olan sual verin.'],
    ['E-poçt: “Siz iPhone 16 udmusunuz! Çatdırılma üçün 5 ₼ ödəyin”', 0],
    ['Dövlət xidmətləri portalında, özünüz daxil olduqdan sonra gördüyünüz bildiriş', 1],
    ['Telegram: “Kripto investisiya, ayda 40% zəmanətli gəlir”', 0, 'Zəmanətli yüksək gəlir fırıldaqçılığın klassik əlamətidir.'],
    ['Mağazanın saytında sifarişdən dərhal sonra e-poçta gələn sifariş təsdiqi', 1]] });

  checklist('bkChk', 'bkOut', [
    ['Vacib fayllarım ən azı 2 fərqli yerdə saxlanılır', 3, 'Vacib faylların ikinci nüsxəsini yaradın (xarici disk və ya bulud).'],
    ['Nüsxələrdən biri başqa yerdədir (bulud və ya başqa ünvan)', 3, 'Bir nüsxəni başqa yerdə saxlayın: yanğın və ya oğurluq hamısını məhv etməsin.'],
    ['Oflayn nüsxəm var: disk ehtiyat nüsxədən sonra ayrılır', 3, 'Oflayn nüsxə yaradın: ransomware-ə qarşı ən güclü müdafiədir.'],
    ['Ehtiyat nüsxə avtomatik və ya müntəzəm olaraq aparılır', 2, 'Ehtiyat nüsxəni avtomatlaşdırın və ya təqvimə həftəlik xatırlatma qoyun.'],
    ['Son 3 ayda bərpanı sınamışam: fayl həqiqətən açılır', 2, 'Bərpanı sınayın: yoxlanılmamış ehtiyat nüsxə ehtiyat nüsxə deyil.'],
    ['Telefonun foto və kontaktları da ehtiyat nüsxəyə düşür', 1, 'Telefonun avtomatik bulud ehtiyat nüsxəsini aktivləşdirin.'],
  ], 3, [['3-2-1 tələb olunur', 'bad'], ['Qismən qorunur', 'info'], ['3-2-1 qaydasına uyğundur', 'ok']]);

  checklist('rtChk', 'rtOut', [
    ['Router-in idarəetmə parolu standart deyil (admin/admin deyil)', 3, 'Router-in idarəetmə parolunu dəyişin.'],
    ['Wi-Fi WPA2 və ya WPA3 ilə şifrələnib, parolu güclüdür', 3, 'Wi-Fi-ı WPA2/WPA3 ilə şifrələyin, uzun parol qoyun.'],
    ['Router-in proqram təminatı (firmware) yenilənir', 2, 'Firmware yeniləməsini yoxlayın və ya avtomatik yeniləməni aktivləşdirin.'],
    ['WPS funksiyası söndürülüb', 1, 'WPS-i söndürün: o, Wi-Fi parolunu sındırmağı asanlaşdırır.'],
    ['Qonaqlar və ağıllı cihazlar (TV, kamera) üçün ayrı şəbəkə var', 2, 'Qonaq şəbəkəsi yaradın və ağıllı cihazları oraya köçürün.'],
    ['Router-in uzaqdan idarəetməsi internetdən bağlıdır', 2, 'Uzaqdan idarəetməni (remote management) söndürün.'],
  ], 4, LV);

  // ===== SQL injeksiyası =====
  (() => {
    function draw() {
      const u = $('sqU').value, p = $('sqP').value;
      $('sqBad').innerHTML = `<span class="k">sorğu</span> = "SELECT * FROM istifadeciler WHERE ad = '" + ad + "' AND parol = '" + parol + "'"\n\n<span class="k">→ bazaya gedən sorğu:</span>\nSELECT * FROM istifadeciler WHERE ad = '<span class="u">${esc(u)}</span>' AND parol = '<span class="u">${esc(p)}</span>'`;
      $('sqGood').innerHTML = `<span class="k">sorğu</span> = "SELECT * FROM istifadeciler WHERE ad = ? AND parol_hash = ?"\nicra(sorğu, [ad, hash(parol)])\n\n<span class="k">→ baza istifadəçi adını yalnız MƏTN kimi qəbul edir:</span>\nad = <span class="u">${esc(JSON.stringify(u))}</span>`;
      const inj = /'\s*or\s*'?1'?\s*=\s*'?1/i.test(u) || /--/.test(u);
      $('sqMsg').innerHTML = inj ? `<div class="msg bad">Zəif kodda istifadəçinin yazdığı <b>'</b> işarəsi sorğunun mətnini “qırdı” və <b>OR '1'='1'</b> şərti həmişə doğru oldu. Baza bütün istifadəçiləri qaytarır və hücumçu parolsuz daxil olur. Parametrli sorğuda isə eyni mətn sadəcə qəribə bir istifadəçi adıdır və heç nə baş vermir.</div>` : '<div class="msg info">Normal giriş. İndi “Injeksiya nümunəsini daxil et” düyməsini basın.</div>';
      if (inj) api.done(5);
    }
    $('sqU').oninput = draw; $('sqP').oninput = draw;
    $('sqInj').onclick = () => { $('sqU').value = "' OR '1'='1' --"; draw(); };
    draw();
  })();

  api.order('b8Ord', { done: 7, ok: 'NIST modeli: hazırlıq → aşkarlama → məhdudlaşdırma → aradan qaldırma → bərpa → dərslər. Ən çox unudulan mərhələ sonuncudur.', hint: 'Fikirləşin: problemi aradan qaldırmazdan əvvəl onun yayılmasını dayandırmaq lazımdır.', steps: [
    'Hazırlıq: plan, kontaktlar, ehtiyat nüsxələr, təlim', 'Aşkarlama və təhlil: nə baş verib, nə qədər genişdir?', 'Məhdudlaşdırma: yoluxmuş kompüterləri şəbəkədən ayırmaq', 'Aradan qaldırma: zərərli proqramı və zəifliyi yox etmək', 'Bərpa: sistemləri təmiz ehtiyat nüsxədən qaytarmaq', 'Sonrakı təhlil: nə öyrəndik, nəyi dəyişirik?'] });

  checklist('smChk', 'smOut', [
    ['Bütün e-poçt və maliyyə hesablarında MFA var', 3, 'Bütün e-poçt və maliyyə hesablarında MFA-nı məcburi edin.'],
    ['Komanda parol meneceri istifadə edir, ortaq parol yoxdur', 2, 'Komanda üçün parol meneceri tətbiq edin.'],
    ['Kompüterlərdə avtomatik yeniləmə aktivdir', 2, 'Bütün kompüterlərdə avtomatik yeniləməni aktivləşdirin.'],
    ['Oflayn ehtiyat nüsxə var və bərpa yoxlanılıb', 3, 'Oflayn ehtiyat nüsxə qurun və bərpanı sınayın.'],
    ['İşçilər admin hüququ ilə işləmir', 2, 'Adi işçilərdən admin hüququnu alın.'],
    ['İşdən çıxan işçinin girişləri həmin gün bağlanır', 2, 'İşdən çıxma üçün yoxlama siyahısı hazırlayın.'],
    ['Ödəniş rekvizitlərinin dəyişməsi telefonla təsdiqlənir', 3, 'Rekvizit dəyişikliyini telefonla təsdiqləmə qaydası tətbiq edin.'],
    ['İldə ən azı bir dəfə fişinq təlimi keçirilir', 1, 'Qısa fişinq təlimi keçirin.'],
    ['Qonaq Wi-Fi şəbəkəsi işçi şəbəkəsindən ayrıdır', 1, 'Qonaqlar üçün ayrı Wi-Fi şəbəkəsi yaradın.'],
    ['İnsident zamanı kimə zəng ediləcəyi yazılıb', 1, 'İnsident kontaktları siyahısı hazırlayın.'],
  ], 8, LV);

  api.sorter('b10Sort', { bins: ['Paylaşmaq olar', 'Paylaşmaq olmaz'], done: 9, end: 'Qayda: fırıldaqçının sizi və ya evinizi hədəf almasına kömək edə biləcək məlumatı paylaşmayın.', items: [
    ['Səfərdən qayıtdıqdan sonra təbiət şəkilləri', 0], ['Təyyarə biletinin barkodlu şəkli', 1, 'Barkodda bron məlumatı var: bronu dəyişmək və ya ləğv etmək mümkündür.'], ['Yeni sürücülük vəsiqənizin şəkli', 1],
    ['Oxuduğunuz kitab haqqında fikir', 0], ['“2 həftəlik məzuniyyətə çıxdıq, ev boşdur 😄”', 1], ['Bank kartının şəkli (“ilk maaş kartım!”)', 1], ['Peşəkar nailiyyətiniz haqqında yazı', 0], ['Uşağın məktəbinin adı və forması aydın görünən şəkil', 1]] });

  const QUIZ = {
    threats: [
      { q: 'CIA üçlüyü:', o: ['Məxfilik, bütövlük, əlçatanlıq', 'Kəşfiyyat agentliyi'], a: 0, e: 'Confidentiality, Integrity, Availability.' },
      { q: 'Ən geniş yayılmış hücumçu qrupu:', o: ['Pul qazanmaq istəyən kibercinayətkarlar', 'Kosmik agentliklər'], a: 0, e: 'Fişinq, ransomware.' },
      { q: 'Morris qurdundan sonra nə yaradıldı?', o: ['İlk CERT komandası', 'İlk antivirus'], a: 0, e: '1988.' },
    ],
    accounts: [
      { q: 'Credential stuffing nədir?', o: ['Sızan parolların başqa saytlarda avtomatik yoxlanması', 'Parolun uzadılması'], a: 0, e: 'Təkrar parol təhlükəlidir.' },
      { q: 'Ən etibarlı MFA növü:', o: ['Passkey / fiziki açar', 'SMS'], a: 0, e: 'Saxta saytda işləmir.' },
      { q: 'Tanışınız WhatsApp-da “səhvən göndərdiyi kodu” istəyir:', o: ['Vermirəm: bu, mənim hesabımın açarıdır', 'Göndərirəm, tanışdır'], a: 0, e: 'Onun hesabı artıq sındırılıb.' },
    ],
    phish: [
      { q: 'Sosial mühəndisliyin əsas siqnalı:', o: ['Təcililik və qorxu', 'Uzun mətn'], a: 0, e: 'Dayan, yoxla, düşün.' },
      { q: 'Bankdan zəng gəlir və SMS kodu soruşulur:', o: ['Dəstəyi asıb bankın rəsmi nömrəsinə özüm zəng edirəm', 'Kodu deyirəm'], a: 0, e: 'Bank kodu soruşmur.' },
      { q: 'Smişinq nədir?', o: ['SMS vasitəsilə fişinq', 'Sosial şəbəkə'], a: 0, e: 'SMS + fishing.' },
    ],
    devices: [
      { q: '3-2-1 qaydası:', o: ['3 nüsxə, 2 daşıyıcı, 1-i başqa yerdə', '3 parol, 2 telefon, 1 kompüter'], a: 0, e: 'Ehtiyat nüsxə qaydası.' },
      { q: 'Ransomware-ə qarşı ən güclü ehtiyat nüsxə:', o: ['Oflayn nüsxə', 'Eyni diskdəki nüsxə'], a: 0, e: 'Şifrələnə bilməz.' },
      { q: 'Küçədə USB fləş kart tapdınız:', o: ['Kompüterə qoşmuram', 'Kimin olduğunu bilmək üçün qoşuram'], a: 0, e: 'USB yemi hücumu.' },
    ],
    network: [
      { q: 'VPN nədən qorumur?', o: ['Fişinqdən və zərərli proqramdan', 'İctimai Wi-Fi-da trafikin dinlənməsindən'], a: 0, e: 'VPN yalnız tuneldir.' },
      { q: 'Ağıllı TV və kameralar üçün:', o: ['Ayrı qonaq şəbəkəsi', 'Admin şəbəkəsi'], a: 0, e: 'Riskləri ayırın.' },
      { q: 'İctimai Wi-Fi-da bank əməliyyatı üçün daha təhlükəsiz:', o: ['Mobil internet', 'Açıq Wi-Fi'], a: 0, e: 'Saxta giriş nöqtəsi riski.' },
    ],
    web: [
      { q: 'OWASP Top 10 (2021) siyahısında birinci yer:', o: ['Giriş nəzarətinin pozulması', 'Yavaş sayt'], a: 0, e: 'Broken Access Control.' },
      { q: 'SQL injeksiyasına qarşı əsas müdafiə:', o: ['Parametrli sorğular', 'Uzun parol'], a: 0, e: 'Məlumat kod kimi icra olunmur.' },
      { q: 'Başqasının saytını icazəsiz yoxlamaq:', o: ['Hüquqi məsuliyyət yaradır', 'Normaldır'], a: 0, e: 'CTF və bug bounty proqramları istifadə edin.' },
    ],
    ransom: [
      { q: 'WannaCry-dan qorunan kompüterlər:', o: ['Yeniləmələri vaxtında quraşdırılanlar', 'Ən bahalılar'], a: 0, e: 'Yeniləmə 2 ay əvvəl buraxılmışdı.' },
      { q: 'İkiqat şantaj nədir?', o: ['Həm faylları şifrələmək, həm də məlumatı dərc etməklə hədələmək', 'İki dəfə ödəmək'], a: 0, e: 'Müasir taktika.' },
      { q: 'Mütəxəssislər fidyə ödənişi barədə nə tövsiyə edir?', o: ['Ödəməməyi', 'Dərhal ödəməyi'], a: 0, e: 'Zəmanət yoxdur.' },
    ],
    incident: [
      { q: 'Hesab sındırılıbsa, ilk addım:', o: ['Parolu dəyişmək və bütün sessiyalardan çıxmaq', 'Gözləmək'], a: 0, e: 'Sonra MFA.' },
      { q: 'NIST modelinin birinci mərhələsi:', o: ['Hazırlıq', 'Bərpa'], a: 0, e: 'İnsidentdən əvvəl.' },
      { q: 'Məhdudlaşdırma mərhələsində:', o: ['Yoluxmuş sistemləri şəbəkədən ayırmaq', 'Hesabat yazmaq'], a: 0, e: 'Yayılmanı dayandırın.' },
    ],
    smb: [
      { q: 'Təchizatçıdan “yeni bank hesabı” məktubu gəlib:', o: ['Əvvəlcədən məlum nömrəyə zəng edib təsdiqləyirəm', 'Dərhal köçürürəm'], a: 0, e: 'BEC fırıldağı.' },
      { q: 'İşdən çıxan işçinin girişləri nə vaxt bağlanmalıdır?', o: ['Həmin gün', 'Bir aydan sonra'], a: 0, e: 'Offboarding.' },
    ],
    privacy: [
      { q: 'OSINT nədir?', o: ['Açıq mənbələrdən məlumat toplamaq', 'Antivirus'], a: 0, e: 'Sosial şəbəkələr mənbədir.' },
      { q: 'Məzuniyyət şəkillərini nə vaxt paylaşmaq daha təhlükəsizdir?', o: ['Qayıtdıqdan sonra', 'Yola düşəndə'], a: 0, e: 'Ev boş qalmasın.' },
      { q: 'Fənər tətbiqi kontaktlara giriş istəyir:', o: ['İcazə vermirəm', 'Verirəm'], a: 0, e: 'Lazımsız icazə.' },
    ],
    final: [
      { q: 'Ransomware CIA üçlüyündən ən çox hansını pozur?', o: ['Əlçatanlıq', 'Heç birini'], a: 0, e: 'Fayllar əlçatmaz olur.' },
      { q: 'Hesab təhlükəsizliyinin üç qızıl qaydası:', o: ['Parol meneceri, MFA, e-poçtun qorunması', 'Antivirus, VPN, Wi-Fi'], a: 0, e: 'Əsas müdafiə.' },
      { q: 'SMS MFA-sının zəifliyi:', o: ['SİM kartın dəyişdirilməsi (SIM swap) və fişinq', 'Çox güclü olması'], a: 0, e: 'Passkey daha etibarlıdır.' },
      { q: 'Fırıldaq mesajının əsas əlaməti:', o: ['Təcililik və kod/kart məlumatı tələbi', 'Düzgün qrammatika'], a: 0, e: 'Dayan, yoxla, düşün.' },
      { q: 'Bank SMS kodunu soruşurmu?', o: ['Xeyr, heç vaxt', 'Bəli'], a: 0, e: 'Kodu heç kimə verməyin.' },
      { q: '3-2-1 qaydasında “1”:', o: ['Bir nüsxə başqa yerdə', 'Bir parol'], a: 0, e: 'Yanğın və oğurluğa qarşı.' },
      { q: 'Router üçün ilk addım:', o: ['Standart idarəetmə parolunu dəyişmək', 'Antenaları çevirmək'], a: 0, e: 'Açıq qapı olmasın.' },
      { q: 'VPN:', o: ['Trafiki tunellə şifrələyir, amma fişinqdən qorumur', 'Tam anonimlik verir'], a: 0, e: 'Reklama ehtiyatla yanaşın.' },
      { q: 'SQL injeksiyasının qarşısını alır:', o: ['Parametrli sorğular', 'Böyük server'], a: 0, e: 'Məlumat və kod ayrılır.' },
      { q: 'WannaCry-ın dərsi:', o: ['Yeniləmələri gecikdirməmək', 'Kompüteri söndürmək'], a: 0, e: 'Yamaq 2 ay əvvəl buraxılmışdı.' },
      { q: 'Fidyə ödəmək:', o: ['Məlumatın qaytarılmasına zəmanət vermir', 'Həmişə işləyir'], a: 0, e: 'Ehtiyat nüsxə daha yaxşıdır.' },
      { q: 'İnsidentə reaksiyada sonuncu mərhələ:', o: ['Sonrakı təhlil və dərslər', 'Hazırlıq'], a: 0, e: 'Ən çox unudulan.' },
      { q: 'Rekvizit dəyişikliyi haqqında e-poçt:', o: ['Telefonla təsdiqlənməlidir', 'Dərhal icra olunmalıdır'], a: 0, e: 'BEC.' },
      { q: 'Paylaşmaq olmaz:', o: ['Təyyarə biletinin barkodu', 'Kitab haqqında fikir'], a: 0, e: 'Bron məlumatı.' },
      { q: 'Kiber insident barədə Azərbaycanda məlumat vermək olar:', o: ['CERT.az-a', 'Heç yerə'], a: 0, e: 'Fırıldaqçılıqda həm də polisə və banka.' },
    ],
  };
  api.quizzes(QUIZ);
});
