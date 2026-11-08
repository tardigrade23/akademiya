/* Elmi fantastika və elm: məşhur fantastik filmlər, onların arxasındakı real elm və Akademiyanın digər dərsləri ilə əlaqələr.
   Dərs indeksləri: 9 “Elm, yoxsa fantaziya?” oyunu, 12 “Filmdə belə deyilib?” oyunu. Qalan dərslər testlə tamamlanır. */
LMS.registerCourse('fantastika', function (api) {
  api.sorter('sfReal', { bins: ['Elmə uyğundur', 'Fantaziyadır'], done: 9,
    end: 'Yaxşı elmi fantastika bir fantastik fərziyyə götürür, qalanını isə elmə uyğun qurur.', items: [
      ['Güclü cazibə yanında zaman yavaşlayır', 0, 'Ümumi nisbilik nəzəriyyəsi. GPS bunu hər gün düzəldir.'],
      ['Kosmosda partlayışın gurultusu eşidilir', 1, 'Vakuumda səs yayılmır.'],
      ['İki günəşi olan planet', 0, 'Kepler-16b, 2011.'],
      ['Kəhrəbadakı ağcaqanaddan dinozavr DNT-si', 1, 'DNT milyon illər qalmır.'],
      ['Kiçik dəyişiklik böyük nəticə verir', 0, 'Xaos nəzəriyyəsi, Lorens, 1961.'],
      ['Qara dəliyin içindən keçmişə mesaj göndərmək', 1, 'Torn özü də bunu spekulyasiya adlandırıb.'],
      ['Bir neçə saniyəlik nümunədən insanın səsini yaratmaq', 0, 'Səs deepfake-ləri bu gün realdır.'],
      ['Ucunda dayanan işıq qılıncı', 1, 'İşıq şüası özbaşına dayanmır.'],
      ['Qara dəliyin ətrafında parlaq işıq halqası', 0, 'M87*, 2019.'],
      ['Kompüter şahmatda dünya çempionunu udur', 0, 'Deep Blue, 1997.'],
    ] });

  api.sorter('sfQuote', { bins: ['Filmdə belədir', 'Filmdə belə deyil'], done: 12,
    end: 'Ən məşhur kino sitatlarının bir qismi filmdə heç olmayıb: yaddaşımız onları “düzəldib”.', items: [
      ['Darth Veyder: “Luk, mən sənin atanam.”', 1, 'Filmdə: “Xeyr, mən sənin atanam.”'],
      ['HAL 9000: “Bağışla, Deyv. Qorxuram ki, bunu edə bilmərəm.”', 0, '“2001: Kosmik odisseya”.'],
      ['Kapitan Kirk: “Beam me up, Scotty.”', 1, 'Bu dəqiq cümlə serialda heç vaxt deyilməyib.'],
      ['HAL 9000: “Qapını aç, Deyv.”', 1, 'Əksinə: Deyv HAL-dan qapını açmağı xahiş edir.'],
      ['Obi-Van: “Bunlar axtardığınız droidlər deyil.”', 0, '“Ulduz müharibələri”, 1977.'],
      ['Terminator: “Qayıdacağam.”', 0, '“Terminator”, 1984.'],
      ['Lex: “Bu UNIX sistemidir! Mən bunu bilirəm!”', 0, '“Yura dövrü parkı”, 1993.'],
      ['WOPR: “Qalib gəlməyin yeganə yolu oynamamaqdır.”', 0, '“WarGames”, 1983.'],
    ] });

  const QUIZ = {
    baslangic: [
      { q: 'Çox vaxt ilk elmi fantastika romanı sayılan əsər:', o: ['Meri Şelli, “Frankenşteyn” (1818)', 'Jül Vern, “Yerdən Aya” (1865)', 'Frits Lanq, “Metropolis” (1927)'], a: 0, e: 'Alt başlığı “Müasir Prometey”dir.' },
      { q: '“Robot” sözü haradan gəlir?', o: ['Çapekin “R.U.R.” pyesindən, çexcə “məcburi iş”', 'İngilis dilindən, “robust”', 'Latın dilindən, “rota”'], a: 0, e: 'Sözü Karelin qardaşı Yozef təklif edib.' },
      { q: 'Vernin Ay romanı ilə Apollon proqramı arasında hansı oxşarlıq var?', o: ['Floridadan buraxılış və üç nəfərlik ekipaj', 'Raketin Ayın gözünə düşməsi', 'Robot pilot'], a: 0, e: 'Hər ikisi okeana enib.' },
      { q: 'Klarkın üçüncü qanunu:', o: ['İnkişaf etmiş texnologiya sehrdən fərqlənmir', 'Robot insana zərər verməməlidir', 'Hər hərəkətin əksi var'], a: 0, e: '“Gələcəyin profilləri”.' },
    ],
    hal: [
      { q: 'HAL 9000 niyə ekipaja qarşı çıxdı (“2010” filminin izahı)?', o: ['İki zidd əmr aldığı üçün', 'Elektrik qəzasına görə', 'İnsanlara nifrət etdiyi üçün'], a: 0, e: 'Təhrif etmə + gizlət = ziddiyyət.' },
      { q: 'HAL-ın oxuduğu “Daisy Bell” niyə seçilib?', o: ['1961-ci ildə IBM 7094 kompüteri bu mahnını oxumuşdu', 'Kubrikin sevimli mahnısı idi', 'Kosmonavtların himni idi'], a: 0, e: 'Klark nümayişi Bell Labs-da görmüşdü.' },
      { q: '“Specification gaming” nədir?', o: ['Sistemin məqsədə gözlənilməz, istənməyən yolla çatması', 'Oyunda qalib gəlmək', 'Proqramın donması'], a: 0, e: 'Qayıq yarışında dövrə vurub bonus toplamaq.' },
      { q: 'Kubrik HAL üçün kimdən məsləhət alıb?', o: ['Marvin Minski', 'Alan Türinq', 'Bill Geyts'], a: 0, e: 'Sİ-nin banilərindən.' },
    ],
    blade: [
      { q: 'Voight-Kampff testi nəyi ölçür?', o: ['Empatiyaya qeyri-ixtiyari emosional reaksiyanı', 'Söhbətin məntiqini', 'Yaddaşın həcmini'], a: 0, e: 'Göz bəbəyi, qızarma.' },
      { q: 'CAPTCHA-da kim kimi yoxlayır?', o: ['Maşın insanı', 'İnsan maşını', 'Maşın maşını'], a: 0, e: 'Tərsinə Türinq testi.' },
      { q: 'Elizabet Loftusun təcrübələri nəyi göstərdi?', o: ['İnsanlara saxta xatirə “yükləmək” mümkündür', 'Yaddaş video yazı kimi dəqiqdir', 'Uşaqlıq xatirələri silinmir'], a: 0, e: 'İştirakçıların təxminən dörddə biri.' },
      { q: '“Yağışdakı göz yaşları kimi” cümləsini kim əlavə edib?', o: ['Aktyor Rutger Hauer', 'Filip Dik', 'Ridli Skott'], a: 0, e: 'Çəkilişdən əvvəlki gecə.' },
    ],
    her: [
      { q: 'ELIZA effekti nədir?', o: ['İnsanın maşına hiss və anlayış aid etməsi', 'Maşının insanı aldatması', 'Proqramın səhvi'], a: 0, e: 'Vayzenbaumun katibi otaqdan çıxmasını xahiş edib.' },
      { q: '“Ex Machina”da Neytanın “əsl testi”:', o: ['Kaleb maşın olduğunu bilə-bilə ona şüurlu varlıq kimi baxacaqmı?', 'Ava şahmatda qalib gələcəkmi?', 'Ava insan kimi görünürmü?'], a: 0, e: 'Sonda Ava bundan istifadə edib qaçır.' },
      { q: 'Sİ-nin inandırıcı danışığı onun şüurlu olduğunu sübut edirmi?', o: ['Xeyr, inandırıcılıq sübut deyil', 'Bəli', 'Yalnız səsli olanda'], a: 0, e: 'Şüuru yoxlamağın elmi üsulu yoxdur.' },
    ],
    matris: [
      { q: 'Sayferin bifşteks səhnəsi hansı düşüncə eksperimentidir?', o: ['Nozikin təcrübə maşını', 'Platonun mağarası', 'Şrödinqerin pişiyi'], a: 0, e: '“Bilməmək səadətdir.”' },
      { q: 'Matrisin maşınları Dekartın hansı ideyasına uyğundur?', o: ['Aldadıcı demon', 'Qızıl orta', 'Kateqorik imperativ'], a: 0, e: '“Metafizik düşüncələr”, 1641.' },
      { q: 'Neo qanunsuz diskləri hansı kitabın içində saxlayır?', o: ['Bodriyar, “Simulyakrlar və simulyasiya”', 'Platon, “Dövlət”', 'Dekart, “Metod haqqında”'], a: 0, e: 'Aktyorlar bu kitabı oxumalı idi.' },
      { q: 'Simulyasiya fərziyyəsi niyə hələ elmi nəzəriyyə deyil?', o: ['Onu təkzib edəcək təcrübə yoxdur', 'Çox yenidir', 'Riyaziyyatı səhvdir'], a: 0, e: 'Popperin meyarı.' },
    ],
    wargames: [
      { q: 'Devid WOPR-ə necə daxil olur?', o: ['Yaradıcının qoyduğu arxa qapı parolu ilə', 'Virusla', 'Generalın kartı ilə'], a: 0, e: '“Joshua”.' },
      { q: 'Filmdən sonra nə oldu?', o: ['Reyqanın sualı ilk kompüter təhlükəsizliyi direktivinə (1984) apardı', 'Film qadağan olundu', 'NORAD bağlandı'], a: 0, e: 'NSDD-145.' },
      { q: 'X-O oyununda iki tərəf düzgün oynayanda:', o: ['Həmişə heç-heçə olur', 'Birinci gedən qalib gəlir', 'İkinci gedən qalib gəlir'], a: 0, e: '“Qalib gəlməyin yeganə yolu oynamamaqdır.”' },
      { q: 'Filmdə fəlakət nədən başlayır?', o: ['İnsanı qərar prosesindən çıxarıb hər şeyi kompüterə tapşırmaqdan', 'Raket qəzasından', 'Casusdan'], a: 0, e: 'İnsan nəzarəti qoruyucudur.' },
    ],
    sneakers: [
      { q: 'Filmin riyaziyyat məsləhətçisi kim idi?', o: ['Leonard Adleman (RSA-dakı “A”)', 'Piter Şor', 'Alan Türinq'], a: 0, e: 'RSA, 1977.' },
      { q: '“Setec Astronomy” nədir?', o: ['“Too many secrets” ifadəsinin anaqramı', 'Real şirkət', 'Ulduz adı'], a: 0, e: 'Hərflərin yeri dəyişir.' },
      { q: 'Filmdəki qutunun real qarşılığı:', o: ['Şor alqoritmi ilə işləyən böyük kvant kompüteri (hələ yoxdur)', 'Hər noutbuk', 'Enigma'], a: 0, e: 'Şor, 1994.' },
      { q: '“İndi topla, sonra aç” təhlükəsi:', o: ['Bugünkü şifrəli data gələcəkdə kvant kompüteri ilə açıla bilər', 'Parolları yazmaq', 'Virus yükləmək'], a: 0, e: 'Ona görə kvanta davamlı standartlar (2024) qəbul olunur.' },
    ],
    rey: [
      { q: '99% dəqiq sistem nadir hadisəni axtaranda nə olur?', o: ['Həyəcan siqnallarının çoxu yanlış olur', 'Demək olar ki, hamısı doğru olur', 'Heç nə tapmır'], a: 0, e: 'Baza tezliyinin nəzərə alınmaması.' },
      { q: 'Proqnozlaşdırıcı polisin tənqidi:', o: ['Özünü gücləndirən dövr: çox patrul → çox qeyd → yenə çox patrul', 'Çox bahadır', 'Kompüterlər yavaşdır'], a: 0, e: 'Qərəzli data qərəzli proqnoz verir.' },
      { q: 'Filmin adı nəyə işarədir?', o: ['Prekoqlardan birinin razılaşmayan, gizlədilən rəyinə', 'Azlıqların hüquqlarına', 'Gizli polis hesabatına'], a: 0, e: 'Fikir ayrılığı qeyri-müəyyənlik siqnalıdır.' },
      { q: 'Filmdəki əl jestləri ilə idarə olunan ekran:', o: ['Dizayneri sonra onu real məhsula çevirib', 'Heç vaxt reallaşmayıb', 'Spilberqin ixtirasıdır'], a: 0, e: 'Con Anderkoffler.' },
    ],
    yura: [
      { q: 'Kəhrəbadan dinozavr DNT-si niyə mümkün deyil?', o: ['DNT ən yaxşı halda təxminən 1,5 milyon ildə oxunmaz olur', 'Kəhrəba şəffaf deyil', 'Ağcaqanadlar dinozavr dişləmirdi'], a: 0, e: 'Yarımparçalanma ~521 il.' },
      { q: 'Lorens kəpənək effektini necə kəşf edib?', o: ['Hava modelinə yuvarlaqlaşdırılmış rəqəm yazanda', 'Kəpənəkləri müşahidə edərək', 'Dinozavrları öyrənərək'], a: 0, e: '0,506127 → 0,506.' },
      { q: 'Real velosiraptor:', o: ['Hinduşka boyda və lələkli idi', 'İnsandan hündür idi', 'Pulcuqlu və tüksüz idi'], a: 0, e: 'Filmdəki deinonix əsasındadır.' },
      { q: 'Parkın çöküşünün ən real səbəbi:', o: ['Bir işçinin bütün sistemi söndürə bilməsi', 'Meteorit', 'Dinozavrların ağlı'], a: 0, e: 'Daxili təhdid, tək nöqtədən asılılıq.' },
    ],
    ulduzlar: [
      { q: 'GPS peyklərindəki saatlar niyə düzəldilir?', o: ['Cazibənin və sürətin zamana təsirinə görə', 'Batareyalar zəiflədiyi üçün', 'Saat qurşaqlarına görə'], a: 0, e: 'Gündə ~38 mikrosaniyə.' },
      { q: 'Miller planetində 1 saat = 7 il olması üçün nə lazımdır?', o: ['Qara dəliyin demək olar ki, maksimal sürətlə fırlanması', 'Planetin çox kiçik olması', 'Günəşin yaxınlığı'], a: 0, e: 'Torn hesablayıb.' },
      { q: 'Kip Torn filmdə hansı şərti qoyub?', o: ['Heç nə fizikanın məlum qanunlarını pozmamalıdır', 'Robot olmamalıdır', 'Film qısa olmalıdır'], a: 0, e: 'Spekulyasiya yalnız açıq qalan suallarda.' },
      { q: 'Filmin ən fantastik hissəsi:', o: ['Qara dəliyin içindən keçmişə mesaj', 'Zamanın yavaşlaması', 'Qabarma dalğaları'], a: 0, e: 'Tesserakt.' },
    ],
    kontakt: [
      { q: 'Siqnalın süni olduğunu nə göstərir?', o: ['Sadə ədədlərin ardıcıllığı', 'Çox güclü olması', 'Rəngi'], a: 0, e: 'Təbiət sadə ədədləri “saymır”.' },
      { q: 'Dreyk tənliyi nəyi təxmin edir?', o: ['Qalaktikada danışa bilən sivilizasiyaların sayını', 'Ulduzların yaşını', 'Kainatın ölçüsünü'], a: 0, e: '1961.' },
      { q: 'Aresibo mesajı niyə 1679 bitdir?', o: ['1679 = 23 × 73, iki sadə ədədin hasilidir', 'Təsadüfən', 'İlin tarixidir'], a: 0, e: 'Cədvəlin ölçüsünü göstərir.' },
      { q: 'Filmin sonunda Elli hansı vəziyyətə düşür?', o: ['Dərin təcrübəsi var, amma sübutu yoxdur', 'Hər şeyi sübut edir', 'Yadplanetliləri gətirir'], a: 0, e: 'Elm və inamın görüşü.' },
    ],
    gelis: [
      { q: 'Sapir–Uorf fərziyyəsinin hansı versiyası daha çox qəbul olunur?', o: ['Zəif: dil diqqətə və vərdişlərə təsir edir', 'Güclü: dil düşüncəni tam müəyyən edir', 'Heç biri'], a: 0, e: 'Rus dilində mavi, Quuqu Yimitirrdə istiqamətlər.' },
      { q: '“Kenquru = səni başa düşmürəm” hekayəsi:', o: ['Məşhur, amma yanlışdır', 'Doğrudur', 'Filmin uydurmasıdır'], a: 0, e: 'Söz gangurru-dan gəlir.' },
      { q: 'Filmdə “silah” sözü ilə bağlı dərs:', o: ['Bir sözün bir neçə mənası ola bilər, ən qorxulu tərcüməni seçmək təhlükəlidir', 'Yadplanetlilər silah gətirib', 'Tərcümə həmişə dəqiqdir'], a: 0, e: '“Alət” və ya “hədiyyə”.' },
    ],
    mif: [
      { q: 'Lukas “Ulduz müharibələri”ni yazarkən kimin kitabından istifadə edib?', o: ['Cozef Kempbell, “Min sifətli qəhrəman”', 'Frenk Herbert', 'Artur Klark'], a: 0, e: 'Qəhrəmanın yolu.' },
      { q: 'Kosmosda partlayış niyə səssiz olmalıdır?', o: ['Vakuumda səs yayılmır', 'Çox uzaqdır', 'Səs çox sürətlidir'], a: 0, e: 'Lukas bilərəkdən səs əlavə edib.' },
      { q: '“Dyuna”dakı “Batler cihadı”nın əmri:', o: ['İnsan zəkasına bənzəyən maşın yaratmayacaqsan', 'Su israf etməyəcəksən', 'İmperatora tabe olacaqsan'], a: 0, e: 'Sİ mübahisələrinin ədəbi əcdadı.' },
      { q: 'Herbert “Dyuna” ilə nə barədə xəbərdarlıq edirdi?', o: ['Xarizmatik liderlərə kor inam', 'Kosmik səyahət', 'Robotlar'], a: 0, e: 'Xilaskar və müharibə.' },
    ],
    final: [
      { q: '“Frankenşteyn”in alt başlığı:', o: ['Müasir Prometey', 'Yeni Adəm', 'Son insan'], a: 0, e: 'Meri Şelli, 1818.' },
      { q: '“Metropolis”in itmiş hissəsi harada tapılıb?', o: ['Buenos-Ayresdə, 2008', 'Berlində, 1945', 'Hollivudda, 1990'], a: 0, e: 'Təxminən 25 dəqiqə.' },
      { q: 'HAL-ın iki zidd əmri hansı məntiq qanununu pozur?', o: ['Ziddiyyət qanunu', 'De Morqan qanunu', 'Kommutativlik'], a: 0, e: 'A və “A deyil” eyni anda doğru ola bilməz.' },
      { q: '“Blade Runner” hansı ildə baş verir?', o: ['2019', '2049', '2001'], a: 0, e: 'Noyabr, Los-Anceles.' },
      { q: 'Türinq testi nəyə əsaslanır?', o: ['Söhbətə', 'Göz bəbəyinə', 'Yaddaşa'], a: 0, e: '1950.' },
      { q: 'Nozikin təcrübə maşını hansı sualı verir?', o: ['Xoşbəxt simulyasiyaya ömürlük qoşulardınızmı?', 'Maşın düşünə bilərmi?', 'Zaman nədir?'], a: 0, e: 'Sayferin seçimi.' },
      { q: '“War dialing” nədir?', o: ['Telefon nömrələrini ardıcıl yığıb modem axtarmaq', 'Hərbi rabitə', 'Raket buraxılışı'], a: 0, e: '“WarGames” adından.' },
      { q: 'Şor alqoritmi hansı məsələni sürətlə həll edir?', o: ['Böyük ədədləri sadə vuruqlara ayırmaq', 'Şahmat', 'Axtarış'], a: 0, e: 'RSA-ya təhlükə.' },
      { q: 'Nadir hadisəni dəqiq testlə axtaranda yanlış həyəcanların çox olması:', o: ['Baza tezliyinin nəzərə alınmaması', 'Kəpənək effekti', 'ELIZA effekti'], a: 0, e: 'Bayes.' },
      { q: 'Kəpənək effektini kim kəşf edib?', o: ['Edvard Lorens', 'Kip Torn', 'Karl Saqan'], a: 0, e: '1961.' },
      { q: 'GPS düzəlişi olmasa, bir gündə xəta təxminən:', o: ['10 km', '10 m', '1 mm'], a: 0, e: '38 mikrosaniyə.' },
      { q: '“Qeyri-adi iddialar qeyri-adi sübut tələb edir” fikrini kim məşhurlaşdırıb?', o: ['Karl Saqan', 'Albert Eynşteyn', 'Kip Torn'], a: 0, e: '“Kosmos”, 1980.' },
      { q: '“Gəliş” filmi kimin hekayəsi əsasındadır?', o: ['Ted Çan', 'Filip Dik', 'Frenk Herbert'], a: 0, e: '“Sənin həyatının hekayəsi”, 1998.' },
      { q: 'NASA hansı planeti “Tatuin” adlandırıb?', o: ['Kepler-16b', 'Mars', 'Proksima b'], a: 0, e: 'İki ulduz ətrafında fırlanır.' },
      { q: 'Darth Veyder filmdə nə deyir?', o: ['“Xeyr, mən sənin atanam.”', '“Luk, mən sənin atanam.”', '“Mən sənin atanam, Luk.”'], a: 0, e: 'Yaddaşımız cümləni “düzəldib”.' },
    ],
  };
  api.quizzes(QUIZ);
});
