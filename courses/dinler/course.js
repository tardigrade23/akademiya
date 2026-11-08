/* Dinlər, miflər və insan: dinşünaslıq baxışı ilə dinlərin tarixi, miflər, əxlaq və fəlsəfə ilə əlaqələr.
   Dərs indeksləri: 1 “Hansı mif?” oyunu, 12 “Qızıl qayda” oyunu. Qalan dərslər testlə tamamlanır. */
LMS.registerCourse('dinler', function (api) {
  api.sorter('dnMyth', { bins: ['Mesopotamiya', 'Yunanıstan', 'Skandinaviya', 'Hindistan'], done: 1,
    end: 'Fərqli xalqlar oxşar suallar verib: dünya necə yarandı, sonu necə olacaq, insan niyə əziyyət çəkir?', items: [
      ['Atrahasis daşqından gəmidə xilas olur', 0, 'Akkad dastanı, e.ə. XVIII əsr.'],
      ['Marduk Tiamatı məğlub edib onun bədənindən dünyanı yaradır', 0, '“Enuma Eliş”.'],
      ['Prometey odu oğurlayıb insanlara verir', 1, 'Hesiod, “Teoqoniya”.'],
      ['Pandora bəlalarla dolu küpü açır', 1, 'Hesiod, “Əməklər və günlər”.'],
      ['Dünya ağacı Yggdrasil doqquz aləmi birləşdirir', 2, '“Edda”.'],
      ['Ragnarök: tanrıların son döyüşü və dünyanın yenidən doğuluşu', 2, '“Völuspa”.'],
      ['Balıq Manunu daşqın barədə xəbərdar edir', 3, '“Şatapatha Brahmana”.'],
      ['Vişnu dünyanı xilas etmək üçün müxtəlif surətlərdə (avatar) enir', 3, 'Puranalar.'],
    ] });

  api.sorter('dnGold', { bins: ['Çin', 'Hindistan', 'İbrahimi dinlər', 'İran'], done: 12,
    end: 'Eyni qayda, altı ənənə: başqasına özünə istəmədiyini etmə.', items: [
      ['“Özünə istəmədiyini başqasına etmə.” (Söhbətlər, 15.24)', 0, 'Konfutsi.'],
      ['“Özünə zərərli saydığını başqasına etmə.” (Mahabharata)', 1, 'Hind dastanı.'],
      ['“Başqalarını özünü incidəcək yolla incitmə.” (Udanavarqa)', 1, 'Buddist mətn.'],
      ['“Sənə nifrət doğuranı yaxınına etmə.” (Şabbat 31a)', 2, 'Hillel, Talmud.'],
      ['“İnsanların sizinlə necə davranmasını istəyirsinizsə, siz də elə davranın.” (Matta 7:12)', 2, 'Dağüstü vəz.'],
      ['“Özünüz üçün istədiyinizi qardaşınız üçün istəməyincə iman etmiş olmazsınız.”', 2, 'Nəvəvinin 40 hədisi, 13.'],
      ['“Özü üçün yaxşı olmayanı başqasına etməyən təbiət yaxşıdır.” (Dadistan-i Dinik)', 3, 'Zərdüşti mətn, IX əsr.'],
    ] });

  const QUIZ = {
    nedir: [
      { q: 'Bu kurs hansı suala cavab vermir?', o: ['Hansı din doğrudur?', 'İnsanlar nəyə inanır?', 'İnanclar cəmiyyətə necə təsir edir?'], a: 0, e: 'Dinşünaslıq təsvir edir və anlayır, mühakimə etmir.' },
      { q: 'Dürkheymə görə dinin əsas funksiyası:', o: ['İnsanları icmada birləşdirmək', 'Təbiəti izah etmək', 'Fərdi xoşbəxtlik'], a: 0, e: '“Dini həyatın elementar formaları”, 1912.' },
      { q: 'Uilyam Ceyms dinin mərkəzinə nəyi qoyur?', o: ['Fərdi təcrübəni', 'İqtisadiyyatı', 'Dövləti'], a: 0, e: '“Dini təcrübənin müxtəlifliyi”, 1902.' },
      { q: '“Metodoloji aqnostisizm” nə deməkdir?', o: ['Alim inancın doğruluğunu mühakimə etmədən onu təsvir edir', 'Alim dinə inanmamalıdır', 'Dinləri öyrənmək olmaz'], a: 0, e: 'Bu, alimin şəxsi inancı deyil, metodudur.' },
    ],
    mif: [
      { q: 'Dinşünaslıqda “mif”:', o: ['Mənanı izah edən müqəddəs hekayədir', 'Yalandır', 'Uşaq nağılıdır'], a: 0, e: 'Yunanca mythos: söz, hekayə.' },
      { q: 'Nuh hekayəsinə bənzər daha qədim daşqın hekayəsini kim tapdı?', o: ['Corc Smit, 1872', 'Darvin, 1859', 'Kempbell, 1949'], a: 0, e: 'Gilqameş dastanının XI lövhəsi.' },
      { q: 'Kempbellin “Min sifətli qəhrəman” kitabının əsas fikri:', o: ['Qəhrəman mifləri oxşar quruluşa malikdir', 'Miflər yalandır', 'Miflər yalnız Yunanıstanda var'], a: 0, e: 'Evdən çıxış, sınaq, dəyişmiş qayıdış.' },
    ],
    qedim: [
      { q: 'Animizm:', o: ['Təbiət varlıqlarının ruhu olduğuna inam', 'Heyvanlara sitayiş qadağası', 'Təktanrılıq'], a: 0, e: 'Termin: Edvard Taylor, 1871.' },
      { q: 'Göbəklitəpəni təəccüblü edən nədir?', o: ['Onu əkinçiliyi bilməyən ovçu-toplayıcılar tikib', 'Orada yazı tapılıb', 'O, Roma dövrünə aiddir'], a: 0, e: 'Təqr. e.ə. 9500.' },
      { q: 'Şanidar “çiçək dəfni” hekayəsi niyə şübhəlidir?', o: ['Tozcuqları heyvanlar gətirə bilərdi', 'Mağara tapılmayıb', 'Neandertallar orada yaşamayıb'], a: 0, e: 'Alternativ izahı yoxlamaq elmi metodun əsasıdır.' },
      { q: '“Şaman” sözü haradan gəlir?', o: ['Sibirdəki evenk dilindən', 'Latın dilindən', 'Sanskritdən'], a: 0, e: 'Tunqus dili.' },
    ],
    mesopotamiya: [
      { q: '“Enuma Eliş”də dünyanı kim yaradır?', o: ['Marduk, Tiamatın bədənindən', 'Zevs', 'Ahura Məzda'], a: 0, e: 'Babilin yaradılış mifi.' },
      { q: 'Gilqameş dastanının əsas sualı:', o: ['Ölümlə necə barışmaq olar?', 'Şəhəri necə tikmək olar?', 'Müharibəni necə udmaq olar?'], a: 0, e: 'Ölümsüzlük çiçəyini ilan oğurlayır.' },
      { q: 'Misirdə ölənin ürəyi nə ilə tərəzidə çəkilir?', o: ['Maatın lələyi ilə', 'Qızıl ilə', 'Daş ilə'], a: 0, e: '“Ölülər kitabı”, 125-ci fəsil.' },
      { q: 'Exnaton nə etməyə çalışıb?', o: ['Yalnız Atona sitayişi tətbiq etməyə', 'Piramida tikməyə', 'Yazını qadağan etməyə'], a: 0, e: 'İlk təktanrılıq cəhdlərindən.' },
    ],
    yunan: [
      { q: '“Pandoranın qutusu” Hesiodda əslində nədir?', o: ['Gil küp (pithos)', 'Taxta sandıq', 'Qızıl qutu'], a: 0, e: 'Səhv Erazmın tərcüməsindən gəlir.' },
      { q: 'Falesin əsas yeniliyi:', o: ['Təbiəti təbiətin özü ilə izah etməyə çalışması', 'Suyun doğru cavab olması', 'Yeni tanrı tapması'], a: 0, e: '“Mifdən loqosa”.' },
      { q: 'Ksenofanın atlar və öküzlər haqqında fikri:', o: ['İnsanlar tanrıları öz surətlərində təsəvvür edir', 'Heyvanların dini var', 'Tanrılar heyvandır'], a: 0, e: 'Fraqment B15.' },
    ],
    zerdust: [
      { q: 'Zərdüştiliyin əxlaqi formulu:', o: ['Yaxşı fikir, yaxşı söz, yaxşı əməl', 'Oruc, namaz, zəkat', 'Ren, li, syao'], a: 0, e: 'Humata, huxta, hvarşta.' },
      { q: 'Aşa və druc:', o: ['Həqiqət/nizam və yalan/xaos', 'İki tanrı', 'İki bayram'], a: 0, e: 'İnsan azad seçimi ilə tərəf seçir.' },
      { q: 'Zərdüştiləri “atəşpərəst” adlandırmaq:', o: ['Kənardan baxışdır: od nur və saflığın simvoludur', 'Dəqiq təsvirdir', 'Onların öz adıdır'], a: 0, e: 'İçəridən və kənardan təsvir fərqlidir.' },
      { q: 'Nitsşenin Zaratustrası:', o: ['Tarixi Zərdüştlə əlaqəsi olmayan ədəbi obrazdır', 'Avestanın tərcüməsidir', 'Tarixi bioqrafiyadır'], a: 0, e: '“Belə dedi Zaratustra”, 1883–1885.' },
    ],
    hindu: [
      { q: '“Tat tvam asi” (Sən osan) ideyası:', o: ['Atman və Brahman birdir', 'Tanrı yoxdur', 'Hər şey keçicidir'], a: 0, e: 'Çhandoqya Upanişad, 6.8.7.' },
      { q: 'Samsara:', o: ['Doğuş, ölüm və yenidən doğuş dövrü', 'Azad olmaq', 'Vəzifə'], a: 0, e: 'Mokşa ondan azad olmaqdır.' },
      { q: 'Nasadiya himni nə ilə təəccübləndirir?', o: ['Yaradılış haqqında şübhə ilə', 'Uzunluğu ilə', 'Qanunları ilə'], a: 0, e: '“Bəlkə bilir, bəlkə də bilmir.”' },
      { q: '“Bhaqavad-Gita”da Krişna Arcunaya nəyi öyrədir?', o: ['Vəzifəni nəticəyə bağlanmadan yerinə yetirməyi', 'Döyüşdən qaçmağı', 'Sarayda qalmağı'], a: 0, e: 'Gita, 2.47.' },
    ],
    budda: [
      { q: '“Budda” sözü nə deməkdir?', o: ['Oyanmış', 'Şahzadə', 'Müəllim'], a: 0, e: 'Bodhi ağacının altında “oyanış”.' },
      { q: 'İkinci nəcib həqiqətə görə iztirabın səbəbi:', o: ['Yapışmaq, arzu (tanha)', 'Tanrıların cəzası', 'Yoxsulluq'], a: 0, e: 'Dukkha → tanha → nirvana → yol.' },
      { q: 'Anatta təlimi:', o: ['Dəyişməz “mən” yoxdur', 'Hər şey əbədidir', 'Ruh Brahmandır'], a: 0, e: 'Hinduizmin atman ideyası ilə mübahisə.' },
      { q: 'Kalama suttası nəyi tövsiyə edir?', o: ['Yalnız ənənə və ya kitab olduğu üçün qəbul etməməyi', 'Müəllimə tam itaəti', 'Heç nəyə inanmamağı'], a: 0, e: 'Meyar: ağıllıların bəyəndiyi və zərər verməyən.' },
    ],
    cin: [
      { q: '“San tszyao” nədir?', o: ['Üç təlim: Konfutsiçilik, Daosizm, Buddizm', 'Üç imperator', 'Üç kitab'], a: 0, e: 'Çoxları üçünə eyni vaxtda bağlıdır.' },
      { q: 'Konfutsinin ölüm haqqında cavabı:', o: ['Hələ həyatı bilmirsən, ölümü necə biləsən?', 'Ölüm yoxdur', 'Ölüm yeni həyatdır'], a: 0, e: '“Söhbətlər”, 11.12.' },
      { q: 'U-vey:', o: ['Təbiətin axarına qarşı zorla getməmək', 'Ciddi qanunlar', 'Valideynə hörmət'], a: 0, e: 'Su yumşaqdır, amma daşı oyur.' },
      { q: '“Dao de tszin”in ilk misrası:', o: ['Söylənə bilən Dao əbədi Dao deyil', 'Əvvəlcə söz var idi', 'Dinlə, ey İsrail'], a: 0, e: 'Fəsil 1.' },
    ],
    yahudi: [
      { q: 'Şema nə ilə başlayır?', o: ['“Dinlə, ey İsrail: Rəbb təkdir”', '“Oxu!”', '“Əvvəlcə söz var idi”'], a: 0, e: '“Qanunun təkrarı” 6:4.' },
      { q: 'Hillel bir ayaq üstə Tövratı necə izah etdi?', o: ['Sənə nifrət doğuranı yaxınına etmə, qalanı şərhdir', 'Qovdu', 'Bütün qanunları sadaladı'], a: 0, e: 'Şabbat 31a. Qovan Şammay idi.' },
      { q: 'Eramızın 70-ci ilindən sonra yəhudilik nəyin ətrafında qurulur?', o: ['Kitab, dua və təhsil', 'Məbəd qurbanı', 'Dövlət'], a: 0, e: 'İkinci Məbəd dağıldı.' },
      { q: 'Maimonidin “Çaşqınlar üçün bələdçi” əsərinin məqsədi:', o: ['Tövratı Aristotel fəlsəfəsi ilə uzlaşdırmaq', 'Tarix yazmaq', 'Qanun kitabı'], a: 0, e: 'XII əsr, ərəb dilində.' },
    ],
    xristian: [
      { q: 'İsa haqqında ən erkən mətnlər:', o: ['Pavelin məktubları', 'İncillər', 'Nikeya qərarları'], a: 0, e: 'Təxminən 50–60-cı illər.' },
      { q: '1054-cü ildə nə baş verdi?', o: ['Katolik və Pravoslav kilsələri ayrıldı', 'Lüter tezislərini yaydı', 'Nikeya məclisi'], a: 0, e: 'Böyük parçalanma.' },
      { q: 'Lüterin ideyalarının sürətlə yayılmasına nə kömək etdi?', o: ['Çap maşını', 'Radio', 'Roma ordusu'], a: 0, e: 'Texnologiya avtoriteti dəyişir.' },
      { q: '“Zaman nədir? Heç kim soruşmasa, bilirəm...” kimin sözüdür?', o: ['Avqustin', 'Lüter', 'Pavel'], a: 0, e: '“Etiraflar”, XI, 14.' },
    ],
    islam: [
      { q: 'İslam təqvimi hansı hadisədən başlayır?', o: ['Hicrət, 622', 'İlk vəhy, 610', 'Məkkənin fəthi'], a: 0, e: 'Məkkədən Mədinəyə köç.' },
      { q: 'Sünni və şiə ayrılığının əsas səbəbi:', o: ['Peyğəmbərdən sonra rəhbərlik məsələsi', 'Namazın sayı', 'Dil'], a: 0, e: 'Xəlifə və ya Əlinin nəsli.' },
      { q: '“Alqoritm” sözü kimin adından gəlir?', o: ['Əl-Xarəzmi', 'İbn Sina', 'İbn Rüşd'], a: 0, e: '“Əl-cəbr” də onun kitabıdır.' },
      { q: 'Avropada “Şarih” (şərhçi) kimə deyirdilər?', o: ['İbn Rüşdə', 'Qəzaliyə', 'Mövlanaya'], a: 0, e: 'Aristotel şərhləri.' },
    ],
    exlaq: [
      { q: 'Qızıl qaydanın müxtəlif ənənələrdə olması:', o: ['Fərqli izahlara malikdir: insan təbiəti, ilahi mənbə, qarşılıqlılıq', 'Təsadüfdür', 'Yalnız bir ənənədən köçürülüb'], a: 0, e: 'Dərsdəki üç izah.' },
      { q: 'Evtifron dilemması hansı sualı verir?', o: ['Yaxşı əmr olunduğu üçün yaxşıdır, yoxsa yaxşı olduğu üçün əmr olunur?', 'Tanrılar varmı?', 'Ədalət nədir?'], a: 0, e: 'Platon, “Evtifron”, 10a.' },
      { q: '“Allah yoxdursa, hər şeyə icazə var” cümləsi:', o: ['Dostoyevskinin romanında dəqiq bu şəkildə yoxdur', 'Dostoyevskinin öz mövqeyidir', 'Nitsşenindir'], a: 0, e: 'Fikir personajlar arasında müzakirə olunur.' },
    ],
    inanc: [
      { q: 'Qaunilonun “ən mükəmməl ada” misalı nəyi tənqid edir?', o: ['Ontoloji arqumenti', 'Dizayn arqumentini', 'Paskalın mərcini'], a: 0, e: 'Eyni məntiq absurd nəticə verir.' },
      { q: 'Kantın ontoloji arqumentə etirazı:', o: ['Varlıq predikat deyil', 'Allah yoxdur', 'Anselm yanlış tərcümə olunub'], a: 0, e: '“Saf ağlın tənqidi”, 1781.' },
      { q: 'Peylinin saat bənzətməsinə ən güclü cavab kimdən gəldi?', o: ['Darvin: təbii seçmə', 'Anselm', 'Paskal'], a: 0, e: 'Yum isə daha əvvəl (1779) məntiqi suallar vermişdi.' },
      { q: 'Rasselin çayniki nəyi göstərir?', o: ['Sübut yükü iddia edəndədir', 'Kosmosda çaynik var', 'Heç nəyi bilmək olmaz'], a: 0, e: '1952.' },
      { q: 'Kainatın “ilk atom”dan başladığını ilk təklif edənlərdən biri:', o: ['Keşiş və fizik Jorj Lemetr', 'Darvin', 'Haksli'], a: 0, e: '1927–1931.' },
    ],
    final: [
      { q: 'Ninian Smart dinləri neçə ölçü ilə müqayisə etməyi təklif edir?', o: ['7', '3', '12'], a: 0, e: 'Təcrübə, mif, təlim, əxlaq, ayin, icma, maddi mədəniyyət.' },
      { q: 'Eliadeyə görə dindar insan dünyanı necə bölür?', o: ['Müqəddəs və profan', 'Xeyir və şər', 'Göy və yer'], a: 0, e: '“Müqəddəs və profan”, 1957.' },
      { q: 'Göbəklitəpə təxminən neçənci ilə aiddir?', o: ['E.ə. 9500', 'E.ə. 2500', 'Eramızın 500-cü ili'], a: 0, e: 'Stounhencdən 6000 il qədim.' },
      { q: 'Hammurapi qanunlarının stelasında padşah qanunları kimdən alır?', o: ['Şamaşdan', 'Marduk', 'Maatdan'], a: 0, e: 'Qanunun gücünü tanrıya bağlamaq.' },
      { q: '“Mifdən loqosa” keçid kimin adı ilə başlayır?', o: ['Miletli Fales', 'Homer', 'Platon'], a: 0, e: 'E.ə. VI əsr.' },
      { q: 'Ahura Məzda hansı dinin ali varlığıdır?', o: ['Zərdüştilik', 'Hinduizm', 'Daosizm'], a: 0, e: 'Müdrik Rəbb.' },
      { q: '“Həqiqət birdir, müdriklər onu müxtəlif adlarla çağırır” hansı mətndəndir?', o: ['Riqveda', 'Quran', 'Talmud'], a: 0, e: '1.164.46.' },
      { q: 'Nirvana sözünün hərfi mənası:', o: ['Sönmək', 'Oyanmaq', 'Cənnət'], a: 0, e: 'Arzunun sönməsi.' },
      { q: 'Konfutsiçiliyin əsas anlayışı “jen”:', o: ['İnsanlıq, xeyirxahlıq', 'Boşluq', 'Qurban'], a: 0, e: 'Li: ədəb, syao: hörmət.' },
      { q: 'İbrahimi dinlər:', o: ['Yəhudilik, Xristianlıq, İslam', 'Hinduizm, Buddizm, Caynizm', 'Daosizm, Konfutsiçilik, Şinto'], a: 0, e: 'Ortaq kök: İbrahim.' },
      { q: 'Nikeya məclisi hansı ildə keçirilib?', o: ['325', '1054', '1517'], a: 0, e: 'Üçlük təliminin əsasları.' },
      { q: 'Quranın ilk nazil olan sözü (ənənəyə görə):', o: ['“Oxu!”', '“Dinlə!”', '“Ol!”'], a: 0, e: '“Ələq” 96:1.' },
      { q: 'Qəzalinin “Filosofların təhafütü”nə kim cavab yazıb?', o: ['İbn Rüşd', 'İbn Sina', 'Əl-Xarəzmi'], a: 0, e: '“Təhafütün təhafütü”.' },
      { q: 'Şər problemi hansı üç xüsusiyyəti uzlaşdırmağa çalışır?', o: ['Qadirlik, xeyirxahlıq və şərin varlığı', 'Zaman, məkan və səbəb', 'İman, əməl və bilik'], a: 0, e: 'Epikura aid edilən trilemma.' },
      { q: '“Aqnostik” sözünü kim yaradıb?', o: ['Tomas Haksli, 1869', 'Bertran Rassel, 1952', 'Devid Yum, 1779'], a: 0, e: '“Bilinə bilməz”.' },
    ],
  };
  api.quizzes(QUIZ);
});
