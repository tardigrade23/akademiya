/* Hikmət kursu: dünyanın gözlənilməz hikmətli sözləri, mənbələri və Akademiyanın digər dərsləri ilə əlaqələri.
   Dərs indeksləri: 3 “Kim dedi?” oyunu, 9 “Dedi, yoxsa demədi?” oyunu. Qalan dərslər testlə tamamlanır. */
LMS.registerCourse('hikmet', function (api) {
  api.sorter('hkWho', { bins: ['Ada Lavleys', 'Çarlz Bebbic', 'Alan Türinq', 'Edsger Deykstra'], done: 3,
    end: 'Dördü də eyni sualın ətrafında danışır: maşın nə edə bilər, nəyi edə bilməz?', items: [
      ['“Maşın heç nə yaratmaq iddiasında deyil.”', 0, 'G qeydi, 1843.'],
      ['“Maşına səhv rəqəmlər daxil etsək, düzgün cavab çıxacaqmı?” sualına təəccüb', 1, '1864.'],
      ['“Maşınlar düşünə bilərmi?” sualını nəzərdən keçirməyi təklif edirəm.', 2, '1950-ci il məqaləsinin ilk cümləsi.'],
      ['Kompüterin düşünməsi sualı sualtı qayığın üzməsi sualından maraqlı deyil.', 3, '1984.'],
      ['Yalnız qısa məsafəni irəlidə görə bilirik, amma orada görülməli çox iş var.', 2, 'Eyni məqalənin son cümləsi.'],
      ['Maşın yalnız ona necə əmr edəcəyimizi bildiyimiz işi görə bilər.', 0, 'Türinq bunu “Ledi Lavleysin etirazı” adlandırıb.'],
    ] });

  api.sorter('hkMyth', { bins: ['Həqiqətən deyib', 'Heç vaxt deməyib'], done: 9,
    end: 'Qayda sadədir: məşhur ad + ağıllı cümlə = yoxlamağa səbəb.', items: [
      ['Qaliley: “Və yenə də fırlanır!”', 1, 'İlk dəfə 1757-ci ildə yazıya düşüb.'],
      ['Nyuton: “Nəhənglərin çiyinlərində durduğum üçün daha uzağı görmüşəm.”', 0, 'Hukka məktub, 1676. Obraz isə daha qədimdir.'],
      ['Eynşteyn: “Dəlilik eyni şeyi təkrar edib fərqli nəticə gözləməkdir.”', 1, 'Onun yazılarında yoxdur.'],
      ['Mark Avreli: “Ən yaxşı qisas ona bənzəməməkdir.”', 0, '“Özümə düşüncələr”, VI, 6.'],
      ['Mari Antuanetta: “Qoy pirojna yesinlər.”', 1, 'Russo bunu o uşaq ikən yazıb.'],
      ['Volter: “Fikrinizlə razı deyiləm, amma söyləmək hüququnuzu müdafiə edəcəyəm.”', 1, 'Evelin Holl, 1906.'],
      ['Monten: “Pişiyimlə oynayanda, bəlkə o mənimlə oynayır?”', 0, '“Təcrübələr”, II, 12.'],
      ['Şerlok Holms: “Elementar, əzizim Vatson.”', 1, 'Konan Doylun hekayələrində yoxdur.'],
      ['Paskal: “Bu məktubu uzun yazdım, çünki qısa yazmağa vaxtım olmadı.”', 0, '16-cı məktub, 1656.'],
      ['Darvin: “Dəyişikliyə ən yaxşı uyğunlaşan sağ qalır.”', 1, 'Leon Meqinson, 1963.'],
    ] });

  const QUIZ = {
    bilik: [
      { q: 'Sokrat özünü niyə “müdrik” sayırdı?', o: ['Bilmədiyini bildiyini zənn etmədiyi üçün', 'Hər şeyi bildiyi üçün', 'Delfi kahini belə dediyi üçün'], a: 0, e: 'Başqaları bilmədiklərini bildiklərini zənn edirdi.' },
      { q: 'Konfutsi “bilik budur” sözlərini kimə deyib?', o: ['Tələsik şagirdi Zilu-ya', 'Çin imperatoruna', 'Lao-tszıya'], a: 0, e: '“Söhbətlər”, 2.17.' },
      { q: '“Cəhalət biliyə nisbətən daha tez-tez özünəinam doğurur” kimindir?', o: ['Darvinin', 'Eynşteynin', 'Rasselin'], a: 0, e: '“İnsanın mənşəyi”, 1871.' },
      { q: 'Feynmanın “yük kultu elmi” nəyi təsvir edir?', o: ['Forma etibarilə düzgün, amma özünü yoxlamayan işi', 'Yük daşıma logistikasını', 'Qədim dini ayinləri'], a: 0, e: 'Taxta qüllə var, təyyarə yoxdur.' },
    ],
    soz: [
      { q: 'Paskal məktubunun uzun olmasını necə izah edir?', o: ['Qısa yazmağa vaxtı olmayıb', 'Çox sözü olub', 'Ödəniş sözə görə olub'], a: 0, e: 'Qısalıq vaxt və düşüncə tələb edir.' },
      { q: 'Sent-Ekzüperinin mükəmməllik haqqındakı sözü əslində nə haqqındadır?', o: ['Təyyarə konstruksiyası', 'Şeir', 'Rəssamlıq'], a: 0, e: 'Pilot idi: “İnsanlar planeti”, 1939.' },
      { q: '“Dilimin sərhədləri dünyamın sərhədləridir” fikri hansı kitabdandır?', o: ['Vitgenşteyn, “Məntiqi-fəlsəfi traktat”', 'Oruell, “1984”', 'Platon, “Dövlət”'], a: 0, e: '5.6.' },
      { q: 'Oruellin azadlıq haqqındakı ön sözü ilk dəfə nə vaxt çap olunub?', o: ['1972-ci ildə, ölümündən sonra', '1945-ci ildə kitabla birlikdə', 'Heç vaxt'], a: 0, e: 'Tapılıb sonradan dərc olunub.' },
    ],
    elm: [
      { q: '“Nəhənglərin çiyinlərində” obrazı Nyutondan əvvəl kimə aid edilir?', o: ['Şartrlı Bernara (XII əsr)', 'Aristotelə', 'Qalileyə'], a: 0, e: 'Solsberili Con, 1159.' },
      { q: 'İbn əl-Heysəmə görə alim oxuduğu mətnlərə necə yanaşmalıdır?', o: ['Onların düşməninə çevrilməli, öz tənqidinə də şübhə etməlidir', 'Nüfuzlu müəllifə inanmalıdır', 'Yalnız qədim mətnləri oxumalıdır'], a: 0, e: '“Ptolemey haqqında şübhələr”.' },
      { q: 'Paster: təsadüf kimə üz tutur?', o: ['Hazır ağıllara', 'Bəxti gətirənlərə', 'Hamıya eyni dərəcədə'], a: 0, e: 'Lill, 1854.' },
      { q: '“Bütün modellər səhvdir, bəziləri faydalıdır” nə deməkdir?', o: ['Model reallıq deyil, amma iş görə bilər', 'Modellərdən istifadə etmək olmaz', 'Yalnız səhvsiz model faydalıdır'], a: 0, e: 'Xəritə ərazi deyil.' },
    ],
    masin: [
      { q: '“Ledi Lavleysin etirazı”nı kim adlandırıb və cavablandırıb?', o: ['Alan Türinq', 'Çarlz Bebbic', 'Con fon Neyman'], a: 0, e: '1950-ci il məqaləsində.' },
      { q: 'Bebbicin “səhv rəqəmlər” hekayəsi bu gün hansı prinsiplə ifadə olunur?', o: ['Zibil girir, zibil çıxır', 'Mur qanunu', 'Qudhart qanunu'], a: 0, e: 'Data keyfiyyəti.' },
      { q: 'ELIZA hekayəsi nəyi göstərdi?', o: ['Sadə proqram da insanlarda güclü aldanma yarada bilər', 'Kompüterlər psixoterapevti əvəz edə bilər', 'Proqram səhv işləyirdi'], a: 0, e: 'Veyzenbaum, 1976.' },
    ],
    zaman: [
      { q: 'Seneka “həyat qısadır” şikayətinə nə cavab verir?', o: ['Biz onu qısaldırıq, vaxtın çoxunu israf edirik', 'Doğrudur, heç nə etmək olmaz', 'Həyat əslində uzundur, qorxmaq lazım deyil'], a: 0, e: '“Həyatın qısalığı haqqında”.' },
      { q: 'Hippokratın “Həyat qısadır, sənət uzun” sözündə “sənət” nədir?', o: ['Həkimlik sənəti', 'Rəssamlıq', 'Musiqi'], a: 0, e: 'Tibbi öyrənmək ömür boyu çəkir.' },
      { q: 'Kyerkeqorun sözü hansı tələyə qarşı xəbərdarlıqdır?', o: ['“Mən bunu bilirdim” (retrospektiv determinizm)', 'Təsdiq meyli', 'Kəpənək effekti'], a: 0, e: 'Sonradan hər şey aydın görünür.' },
    ],
    ozunu: [
      { q: 'Epiktetə görə bizi nə narahat edir?', o: ['Hadisələr haqqında rəylərimiz', 'Hadisələrin özü', 'Başqa insanlar'], a: 0, e: '“Encheiridion”, 5.' },
      { q: 'Diogen İsgəndərdən nə istədi?', o: ['Günəşin qabağından çəkilməsini', 'Qızıl', 'Yeni çəllək'], a: 0, e: 'Plutarx, “İsgəndərin həyatı”, 14.' },
      { q: 'Frankl “son azadlıq” dedikdə nəyi nəzərdə tutur?', o: ['İstənilən şəraitdə öz münasibətini seçmək', 'Düşərgədən qaçmaq', 'Seçki hüququ'], a: 0, e: '“İnsan məna axtarışında”, 1946.' },
    ],
    guc: [
      { q: 'Yuvenalın “Gözətçiləri kim gözləyəcək?” sualı əvvəlcə nə haqqında idi?', o: ['Qısqanc ərlər və onların keşikçiləri', 'Senatın hakimiyyəti', 'Qladiator döyüşləri'], a: 0, e: 'Satira VI.' },
      { q: 'Monteskyenin cümləsi hansı ideyanın əsasıdır?', o: ['Hakimiyyət bölgüsü', 'Mütləq monarxiya', 'Ümumi seçki hüququ'], a: 0, e: '“Qanunların ruhu haqqında”, 1748.' },
      { q: '“Göstərici hədəfə çevriləndə yaxşı göstərici olmaqdan çıxır” formasını kim qısaldıb?', o: ['Merilin Stratern (1997)', 'Çarlz Qudhart', 'Adam Smit'], a: 0, e: 'Qudhartın orijinalı daha quru idi (1975).' },
    ],
    serq: [
      { q: 'Çjuan-tszının kəpənək yuxusu Qərbdə kimin sualını xatırladır?', o: ['Dekartın “yuxuda olduğumu necə bilim?” sualını', 'Kantın imperativini', 'Nyutonun cazibəsini'], a: 0, e: 'Amma Çjuan-tszı şübhə ilə rahat yaşamağı təklif edir.' },
      { q: 'Sədinin “Adəm övladı...” şeiri hansı dövrdə yazılıb?', o: ['Monqol yürüşləri dövründə (1258)', 'Səfəvilər dövründə', 'XX əsrdə'], a: 0, e: '“Gülüstan”.' },
      { q: 'Füzulinin “elm bir qeylü-qal imiş” misrasında “qeylü-qal” nə deməkdir?', o: ['Mübahisə, deyilən-danışılan', 'Yalan', 'Kitab'], a: 0, e: 'Elmi rədd etmir, onun tək başına kifayət etmədiyini deyir.' },
    ],
    paradoks: [
      { q: 'Epimenidin “Kritlilər həmişə yalan danışır” sözü niyə paradoksdur?', o: ['Özü də kritli idi', 'Kritdə heç vaxt olmamışdı', 'Bu, statistik faktdır'], a: 0, e: 'Özünəistinad: Gödelin teoreminə qədər gedib çıxır.' },
      { q: 'Axilles və tısbağa paradoksunu riyazi olaraq nə həll etdi?', o: ['Sonsuz sıralar və limit anlayışı', 'Ehtimal nəzəriyyəsi', 'Həndəsə'], a: 0, e: 'Sonsuz sayda addımın cəmi sonlu ola bilər.' },
      { q: 'Bor gerbinə hansı simvolu seçmişdi?', o: ['Yin-yan', 'Atom', 'Aslan'], a: 0, e: '“Əkslər bir-birini tamamlayır”.' },
    ],
    mif: [
      { q: '“Və yenə də fırlanır!” ilk dəfə nə vaxt yazıda görünür?', o: ['1757-ci ildə, Qalileydən 115 il sonra', '1633-cü ildə məhkəmə protokolunda', 'Qalileyin məktubunda'], a: 0, e: 'Baretti, London.' },
      { q: '“Fikrinizlə razı deyiləm...” cümləsini əslində kim yazıb?', o: ['Evelin Beatris Holl (1906)', 'Volter', 'Russo'], a: 0, e: 'Volterin münasibətini xülasə edirdi.' },
      { q: 'Məşhur ad + ağıllı cümlə: nə etməli?', o: ['Mənbəni yoxlamaq', 'Dərhal paylaşmaq', 'Adın nüfuzuna güvənmək'], a: 0, e: 'Nüfuza istinad arqument deyil.' },
    ],
    final: [
      { q: 'Sokrat və Konfutsinin ortaq fikri:', o: ['Bilmədiyini bilmək müdrikliyin başlanğıcıdır', 'Hər şeyi bilmək mümkündür', 'Bilik yalnız kitabdan gəlir'], a: 0, e: 'Eyni dövr, iki sivilizasiya.' },
      { q: 'Feynmanın birinci prinsipi:', o: ['Özünü aldatmamaq', 'Çox oxumaq', 'Nüfuza güvənmək'], a: 0, e: 'Ən asan aldadılan sənsən.' },
      { q: 'Paskal: qısa yazmaq...', o: ['uzun yazmaqdan çox vaxt tələb edir', 'asandır', 'mənasızdır'], a: 0, e: 'Qısalıq düşüncə tələb edir.' },
      { q: 'Vitgenşteynin son cümləsi:', o: ['Danışa bilmədiyimiz şey barədə susmalıyıq', 'Dil dünyadan böyükdür', 'Hər şeyi söyləmək olar'], a: 0, e: 'Traktat, 7.' },
      { q: 'İbn əl-Heysəm nəyə görə elmi metodun banilərindən sayılır?', o: ['Nüfuzlu mətnlərə və öz tənqidinə şübhəyə görə', 'Teleskopu kəşf etdiyinə görə', 'Ən çox kitab yazdığına görə'], a: 0, e: 'Ptolemeyi tənqid edib.' },
      { q: 'Plankın fikrincə yeni elmi həqiqət necə qalib gəlir?', o: ['Yeni nəsil onunla böyüyür', 'Opponentləri dərhal inandırır', 'Səsvermə ilə'], a: 0, e: '“Elm bir dəfnlə irəliləyir.”' },
      { q: 'Lavleys maşın haqqında nə yazıb?', o: ['Heç nə yaratmaq iddiasında deyil', 'İnsandan ağıllı olacaq', 'Heç vaxt işləməyəcək'], a: 0, e: 'G qeydi, 1843.' },
      { q: 'Türinq məqaləsinin ilk cümləsi:', o: ['“Maşınlar düşünə bilərmi?” sualını nəzərdən keçirməyi təklif edirəm', '“Kompüter beyindir”', '“Mən test icad etdim”'], a: 0, e: '1950.' },
      { q: 'Senekaya görə həyat...', o: ['qısa deyil, biz onu qısaldırıq', 'həmişə qısadır', 'mənasızdır'], a: 0, e: '“Həyatın qısalığı haqqında”.' },
      { q: 'Mark Avreliyə görə ən yaxşı qisas:', o: ['Ona bənzəməmək', 'Daha güclü cavab', 'Unutmaq mümkün deyil'], a: 0, e: 'VI, 6.' },
      { q: 'Fukididin Melos dialoqu nəyi göstərir?', o: ['Gücün ədalət arqumentinə qulaq asmamasını', 'Demokratiyanın qələbəsini', 'Ticarət müqaviləsini'], a: 0, e: '“Güclü bacardığını edir.”' },
      { q: 'Nəsiminin “Məndə sığar iki cahan” misrası:', o: ['İnsan ləyaqəti haqqında iddiadır', 'Təkəbbür nümunəsidir', 'Coğrafiya haqqındadır'], a: 0, e: 'Hürufilik təlimi.' },
      { q: 'Heraklitin “Yuxarı gedən yol və aşağı gedən yol eyni yoldur” sözü:', o: ['Əkslərin eyni şeyin iki tərəfi olmasını', 'Səyahət məsləhətini', 'Dağlar haqqında faktı'], a: 0, e: 'Fraqment B60.' },
      { q: '“Elementar, əzizim Vatson”:', o: ['Konan Doylun hekayələrində yoxdur', '“Qırmızı tonlarda etüd”dədir', 'Holmsun ilk sözüdür'], a: 0, e: 'Filmlərdən gəlir.' },
      { q: 'Məşhur sitat görəndə ilk addım:', o: ['Mənbəni (əsər, il) yoxlamaq', 'Paylaşmaq', 'Əzbərləmək'], a: 0, e: 'Bu kursun əsas dərsi.' },
    ],
  };
  api.quizzes(QUIZ);
});
