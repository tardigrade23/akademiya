/* Nəfs, iradə və vicdan: əxlaq psixologiyası, fəlsəfə, dini ənənələr və Azərbaycan ədəbiyyatı.
   Dərs indeksləri: 3 “Təsdiqlənib, yoxsa yox?” oyunu, 7 “Utanc, yoxsa günahkarlıq?” oyunu. Qalan dərslər testlə tamamlanır. */
LMS.registerCourse('nefs', function (api) {
  api.sorter('nfRepl', { bins: ['Təsdiqlənib', 'Təsdiqlənməyib'], done: 3,
    end: 'Psixologiyanın ən məşhur nəticələrinin bir qismi təkrarlananda alınmayıb. Tək təcrübə sübut deyil.', items: [
      ['İnsanların çoxu avtoritetin göstərişi ilə başqasına zərər verməyə hazırdır (Milqram)', 0, 'Yumşaldılmış təkrarlar: ABŞ 2009, Polşa 2017.'],
      ['İradə əzələ kimi istifadə etdikcə tükənir', 1, '2016: 23 laboratoriyada effekt demək olar ki, sıfırdır.'],
      ['Marşmellou testi uşağın gələcək uğurunu güclü proqnozlaşdırır', 1, '2018: effekt zəifdir, ailə şəraiti nəzərə alınanda azalır.'],
      ['“Əgər X olsa, Y edəcəyəm” planı məqsədə çatmağa kömək edir', 0, 'Yüzə yaxın təcrübənin meta-analizi.'],
      ['Qəzəbi yumruq kisəsinə vuraraq boşaltmaq onu azaldır', 1, 'Buşman, 2002: əksinə, aqressivlik artır.'],
      ['Vərdiş 21 günə formalaşır', 1, 'Lalli, 2009: orta hesabla 66 gün, 18–254 gün arası.'],
      ['Bir nəfərin imtina etməsi başqalarının itaətini kəskin azaldır', 0, 'Milqramın variasiyaları və Aşın konformizm təcrübələri.'],
      ['Kinoda gizli “popkorn ye” kadrı satışı artırıb', 1, '1957-ci ildə bunu iddia edən Ceyms Vikeri sonra təcrübəni uydurduğunu etiraf edib.'],
    ] });

  api.sorter('nfShame', { bins: ['Utanc: “mən pisəm”', 'Günahkarlıq: “pis iş gördüm”'], done: 7,
    end: 'Günahkarlıq düzəltməyə aparır, utanc gizlənməyə. Uşağa “sən pissən” yox, “bu iş pis idi” deyin.', items: [
      ['“Mən axmağın biriyəm.”', 0, 'Bütün şəxsiyyət mühakimə olunur.'],
      ['“Ona dediyim söz kobud oldu.”', 1, 'Konkret əməl.'],
      ['“Heç kimin üzünə baxa bilmirəm.”', 0, 'Gizlənmək istəyi.'],
      ['“Gedib üzr istəməliyəm.”', 1, 'Düzəltmək istəyi.'],
      ['“Mən heç vaxt yaxşı insan olmayacağam.”', 0, 'Dəyişməz “mən”.'],
      ['“Söz verdim, tutmadım. Sabah düzəldəcəyəm.”', 1, 'Əmələ baxır və gələcəyə yönəlib.'],
      ['“Kaş yerə girəydim.”', 0, 'Yox olmaq istəyi.'],
      ['“Borcumu bu həftə qaytarmalıyam.”', 1, 'Konkret addım.'],
    ] });

  const QUIZ = {
    teb: [
      { q: 'Menqtszıya görə insan təbiəti:', o: ['Yaxşıdır: mərhəmət anadangəlmədir', 'Pisdir: yaxşılıq tərbiyə ilə gəlir', 'Neytraldır'], a: 0, e: 'Quyuya yıxılan uşaq nümunəsi.' },
      { q: 'Hobbsa görə dövlətsiz həyat necə olardı?', o: ['Tənha, yoxsul, iyrənc, vəhşi və qısa', 'Azad və xoşbəxt', 'Sakit və sadə'], a: 0, e: '“Leviafan”, 1651.' },
      { q: 'Kömək etdikləri üçün mükafat alan kiçik uşaqlar sonra:', o: ['Daha az kömək ediblər', 'Daha çox kömək ediblər', 'Fərq olmayıb'], a: 0, e: 'Mükafat daxili motivasiyanı zəiflədə bilər.' },
      { q: 'Nizaminin “İsgəndərnamə”sindəki ideal xalqın xüsusiyyəti:', o: ['Qapılarda qıfıl yoxdur, heç kim yalan danışmır', 'Güclü ordusu var', 'Sərt qanunları var'], a: 0, e: 'İnsan düzgün yaşaya bilər.' },
    ],
    nefs: [
      { q: 'Platonun “Fedr”ində arabaçı nəyi simvolizə edir?', o: ['Ağlı', 'İstəyi', 'Bədəni'], a: 0, e: 'Azğın at istəkdir.' },
      { q: 'Freyd eqonu nəyə bənzədib?', o: ['Ata minmiş adama', 'Gəmi kapitanına', 'Dövlət başçısına'], a: 0, e: '“Mən və O”, 1923.' },
      { q: '“Nəfs-i ləvvamə” nədir?', o: ['Özünü qınayan nəfs', 'Pisliyə sövq edən nəfs', 'Sakitləşmiş nəfs'], a: 0, e: 'Quran, 75:2.' },
      { q: '“Seçim korluğu” təcrübəsi nəyi göstərdi?', o: ['İnsanlar seçmədikləri fotonu niyə seçdiklərini inamla izah ediblər', 'İnsanlar həmişə seçimini xatırlayır', 'Fotolar eyni idi'], a: 0, e: 'Səbəb çox vaxt sonradan tapılır.' },
      { q: 'Seyid Yəhya Bakuvi hansı təriqətin şeyxi idi?', o: ['Xəlvətiyyə', 'Mövləviyyə', 'Nəqşbəndiyyə'], a: 0, e: 'Nəfsin yeddi pilləsi.' },
    ],
    istek: [
      { q: 'Berricin kəşfinə görə dopamin nə yaradır?', o: ['İstək', 'Həzz', 'Yuxu'], a: 0, e: '“İstəmək” və “xoşlamaq” fərqli sistemlərdir.' },
      { q: 'Yeddi ölümcül günah siyahısı əvvəlcə neçə idi?', o: ['Səkkiz', 'On', 'Üç'], a: 0, e: 'Evaqri Pontlu, IV əsr.' },
      { q: 'Epikura görə şöhrət və sərvət istəyi:', o: ['Boş istəkdir, sonu yoxdur', 'Təbii və zəruridir', 'Fəzilətdir'], a: 0, e: '“Kimə az kifayət etmirsə, ona heç nə kifayət etməz.”' },
      { q: 'Füzulinin Məcnunu sonda niyə Leylini qəbul etmir?', o: ['Onun eşqi artıq qovuşmağa ehtiyac duymur', 'Onu tanımır', 'Ona qəzəblidir'], a: 0, e: 'Məcazi eşqdən həqiqi eşqə.' },
    ],
    irade: [
      { q: 'Marşmellou testinin 2018-ci il təkrarı nə göstərdi?', o: ['Effekt zəifdir və ailə şəraiti ilə bağlıdır', 'Effekt daha güclüdür', 'Uşaqlar hamısı gözləyib'], a: 0, e: 'Təxminən 900 uşaq.' },
      { q: 'Vədini tutmayan böyüklə qarşılaşan uşaqlar:', o: ['Daha az gözləyiblər', 'Daha çox gözləyiblər', 'Fərq olmayıb'], a: 0, e: '“Sonra” etibarlı deyilsə, gözləmək məntiqsizdir.' },
      { q: 'İradəsi güclü insanların sirri (2012-ci il araşdırması):', o: ['Vəsvəsəyə daha az düşürlər', 'Daha çox mübarizə aparırlar', 'Daha az yatırlar'], a: 0, e: 'Şəraiti dəyişirlər.' },
      { q: '“İradə tükənir” nəzəriyyəsinin 2016-cı il təkrarı:', o: ['Effekt demək olar ki, sıfır çıxdı', 'Tam təsdiqləndi', 'Effekt ikiqat artdı'], a: 0, e: '23 laboratoriya.' },
    ],
    odissey: [
      { q: 'Odissey sirenlərdən necə qorunur?', o: ['Özünü dirəyə bağlatdırır', 'Qulaqlarını tutur və qaçır', 'Sirenlərlə vuruşur'], a: 0, e: 'Qərarı güclü anda verir.' },
      { q: 'Akrasiya nədir?', o: ['Yaxşını bildiyi halda pisi etmək', 'Bilməmək', 'Cəsarət'], a: 0, e: 'Aristotel, “Nikomax etikası”, VII.' },
      { q: 'Hiperbolik endirim:', o: ['İndiki an gələcəkdən həmişə daha ağır gəlir', 'Qiymətlərin endirilməsi', 'Pulun dəyərinin artması'], a: 0, e: '100 bu gün > 110 bir həftə sonra.' },
      { q: 'Basatın Təpəgözlə qarşılaşması hansı səhnəyə bənzəyir?', o: ['Odisseyin Polifemlə qarşılaşmasına', 'Prometeyin oduna', 'Gilqameşin səfərinə'], a: 0, e: 'Qoyun dərisinə girib qaçmaq.' },
    ],
    azad: [
      { q: 'Libetin təcrübəsində nə müəyyən edilib?', o: ['Beyin siqnalı qərar hissindən əvvəl başlayır', 'Qərarlar təsadüfidir', 'Beyin qərar vermir'], a: 0, e: '0,3–0,5 saniyə.' },
      { q: 'Şurqerin (2012) izahı:', o: ['Siqnal qərar deyil, təsadüfi dalğalanmadır', 'Libet tam haqlıdır', 'Azad iradə sübut olunub'], a: 0, e: 'Dalğalanma həddi keçəndə qərar verilir.' },
      { q: 'Kompatibilizm:', o: ['Azadlıq öz istək və dəyərlərinə görə hərəkət etməkdir', 'Azad iradə yoxdur', 'Hər şey təsadüfdür'], a: 0, e: 'Filosofların əksəriyyəti.' },
      { q: 'Əşəri məktəbinin “kəsb” ideyası:', o: ['Əməli Allah yaradır, insan onu qazanır və məsuliyyət daşıyır', 'İnsanın heç bir seçimi yoxdur', 'İnsan hər şeyin yaradıcısıdır'], a: 0, e: 'Cəbriyyə ilə qədəriyyə arasında.' },
    ],
    vicdan: [
      { q: 'Sokratın daxili səsi (daimonion) ona nə deyirdi?', o: ['Yalnız nəyi etməyəcəyini', 'Nə edəcəyini', 'Gələcəyi'], a: 0, e: '“Apologiya”, 31d.' },
      { q: 'Milqram təcrübəsində itaəti ən çox nə azaldıb?', o: ['Yanında başqalarının imtina etməsi', 'Yüksək maaş', 'İştirakçının yaşı'], a: 0, e: '~65%-dən ~10%-ə.' },
      { q: '“Şərin bayağılığı” ifadəsi kimindir?', o: ['Hanna Arendt', 'Stenli Milqram', 'İmmanuel Kant'], a: 0, e: 'Eyxman məhkəməsi, 1961.' },
      { q: 'Nizaminin hekayəsində Ənuşirəvanın vicdanını nə oyadır?', o: ['İki bayquşun söhbəti', 'Vəzirin nəsihəti', 'Üsyan'], a: 0, e: 'Güzgü effekti.' },
    ],
    utanc: [
      { q: 'Günahkarlığın daxili cümləsi:', o: ['“Mən pis iş gördüm.”', '“Mən pisəm.”', '“Hamı pisdir.”'], a: 0, e: 'Utanc şəxsiyyətə, günahkarlıq əmələ baxır.' },
      { q: 'Darvinə görə ən insani ifadə:', o: ['Qızarmaq', 'Gülmək', 'Ağlamaq'], a: 0, e: '1872.' },
      { q: 'Rut Benediktin “utanc mədəniyyəti” fikrinin tənqidi:', o: ['O, Yaponiyaya getməmişdi və bütün cəmiyyətlərdə hər iki hiss var', 'Fikir tam doğrudur', 'Yaponiyada utanc yoxdur'], a: 0, e: 'Sərhəd yox, vurğu fərqi.' },
      { q: '“Ayıb” sözünün mənası:', o: ['Ərəbcə “qüsur”', 'Türkcə “qırmızı”', 'Farsca “gizlətmək”'], a: 0, e: 'Eyb.' },
    ],
    exlaq: [
      { q: 'Haydta görə əxlaqi mühakimədə əvvəl nə gəlir?', o: ['Hiss', 'Arqument', 'Qanun'], a: 0, e: '“Bilmirəm niyə, amma yanlışdır.”' },
      { q: 'Kapuçin meymunları nəyə etiraz edib?', o: ['Yanındakına eyni işə görə üzüm verilməsinə', 'Az yeməyə', 'Qəfəsə'], a: 0, e: 'Brosnan və de Vaal, 2003.' },
      { q: '“Moral Machine” layihəsində hamının razılaşdığı prinsip:', o: ['Daha çox insanı xilas etmək', 'Həmişə sürücünü xilas etmək', 'Təsadüfi seçim'], a: 0, e: '~40 milyon qərar.' },
      { q: 'Haydtın təməllərindən biri deyil:', o: ['Sürət', 'Ədalət', 'Sədaqət'], a: 0, e: 'Qayğı, ədalət, sədaqət, hörmət, paklıq, azadlıq.' },
    ],
    medeniyyet: [
      { q: 'WEIRD nəyi bildirir?', o: ['Qərbli, təhsilli, sənayeləşmiş, varlı, demokratik nümunələri', 'Qəribə təcrübələri', 'Yeni bir test növünü'], a: 0, e: 'Henrik və həmkarları, 2010.' },
      { q: 'Ultimatum oyununda ən yüksək təklifləri kim edib?', o: ['Lamalera balinaçıları', 'Maçiqenqalar', 'ABŞ tələbələri'], a: 0, e: 'Ov birlikdə və dəqiq qaydalarla bölünür.' },
      { q: 'Nisbett və Koenə görə “namus mədəniyyəti” harada yaranır?', o: ['Dövlətin zəif olduğu çobanlıq bölgələrində', 'Böyük şəhərlərdə', 'Dəniz sahillərində'], a: 0, e: 'Namus yeganə qoruyucu idi.' },
      { q: 'Axundzadənin komediyalarının hədəfi:', o: ['Xurafat və ədalətsiz adətlər', 'Səyahət', 'Elm'], a: 0, e: '1850–1855.' },
    ],
    fezilet: [
      { q: 'Platonun dörd əsas fəzilətinə daxil deyil:', o: ['Zənginlik', 'Cəsarət', 'Ədalət'], a: 0, e: 'Müdriklik, cəsarət, ölçülülük, ədalət.' },
      { q: '“Mərhəmətli samariyalı” təcrübəsində köməyə ən çox nə mane olub?', o: ['Tələsmək', 'Dini baxış', 'Yaş'], a: 0, e: '63% → 10%.' },
      { q: 'Franklin təvazökarlıq haqqında nə etiraf edib?', o: ['Onun yalnız görünüşünü qazana bildiyini', 'Onu tam qazandığını', 'Ona ehtiyac olmadığını'], a: 0, e: '13-cü fəzilət.' },
      { q: 'Tusinin “Əxlaqi-Nasiri”si hansı ənənələri birləşdirir?', o: ['Yunan fəlsəfəsi və islam əxlaqı', 'Buddizm və Konfutsiçilik', 'Roma hüququ və ingilis ənənəsi'], a: 0, e: '1235.' },
    ],
    verdis: [
      { q: '“Biz təkrarən etdiyimiz şeyik” cümləsini kim yazıb?', o: ['Uill Dürant', 'Aristotel', 'Uilyam Ceyms'], a: 0, e: 'Fikir Aristotelin, cümlə Dürantın.' },
      { q: 'Lallinin araşdırmasında vərdiş orta hesabla neçə günə formalaşıb?', o: ['66', '21', '7'], a: 0, e: '18–254 gün arası.' },
      { q: '“İcra niyyəti” nümunəsi:', o: ['“Bazar ertəsi işdən sonra birbaşa idman zalına gedəcəyəm”', '“Daha çox idman edəcəyəm”', '“İdman vacibdir”'], a: 0, e: '“Əgər X, onda Y.”' },
      { q: 'Bir günü buraxmaq vərdişin formalaşmasına necə təsir edib?', o: ['Demək olar ki, təsir etməyib', 'Prosesi sıfırlayıb', 'Prosesi sürətləndirib'], a: 0, e: 'Damla-damla göl olar.' },
    ],
    qezeb: [
      { q: 'Qəzəbi yumruq kisəsinə vuraraq “boşaltmaq”:', o: ['Aqressivliyi artırır', 'Qəzəbi tam söndürür', 'Heç bir təsiri yoxdur'], a: 0, e: 'Buşman, 2002.' },
      { q: 'Senekaya görə qəzəbin ən yaxşı dərmanı:', o: ['Gecikdirmək', 'Qışqırmaq', 'Unutmaq'], a: 0, e: '“Qəzəb haqqında”, II, 29.' },
      { q: '“Ağ” paxıllıq insanı nəyə həvəsləndirir?', o: ['Daha çox çalışmağa', 'Başqasını aşağı çəkməyə', 'Heç nəyə'], a: 0, e: 'Holland dilində iki söz.' },
      { q: 'Sabirin “Nə işim var” satirasının hədəfi:', o: ['Laqeydlik', 'Qəzəb', 'Paxıllıq'], a: 0, e: 'Vicdanın susması.' },
    ],
    reqemsal: [
      { q: 'Skinnerin təcrübəsində ən güclü vərdişi nə yaradıb?', o: ['Gözlənilməz mükafat', 'Hər dəfə mükafat', 'Cəza'], a: 0, e: 'Oyun avtomatı və lent.' },
      { q: '“Dark patterns” nədir?', o: ['İstifadəçini istəmədiyi addıma yönəldən dizayn', 'Qaranlıq mövzu', 'Virus'], a: 0, e: 'Harri Brinyall, 2010.' },
      { q: 'Sonsuz lentin ixtiraçısı sonra nə deyib?', o: ['Peşman olduğunu', 'Ən yaxşı ixtirası olduğunu', 'Heç nə'], a: 0, e: 'Aza Raskin.' },
      { q: 'Rəqəmsal “Odissey dirəyi” nümunəsi:', o: ['Bildirişləri söndürmək', 'Daha çox tətbiq yükləmək', 'Telefonu yastığın altında saxlamaq'], a: 0, e: 'Şəraiti dəyişmək.' },
    ],
    final: [
      { q: 'Syuntszıya görə yaxşılıq haradan gəlir?', o: ['Tərbiyə və səydən', 'Anadangəlmə mərhəmətdən', 'Təsadüfdən'], a: 0, e: 'Əyri taxtanı düzəltmək.' },
      { q: 'Nəfs-i mütməinnə:', o: ['Sakitləşmiş nəfs', 'Özünü qınayan nəfs', 'Pisliyə sövq edən nəfs'], a: 0, e: 'Quran, 89:27.' },
      { q: 'Olds və Milnerin siçovulları ləngi niyə basırdı?', o: ['Beyindəki istək sistemi stimullaşdırılırdı', 'Yem alırdılar', 'Su alırdılar'], a: 0, e: '1954.' },
      { q: '“Mənə paklıq ver, amma hələ yox” duası kimindir?', o: ['Avqustin', 'Aristotel', 'Seneka'], a: 0, e: '“Etiraflar”.' },
      { q: 'Laplasın demonu nəyi simvolizə edir?', o: ['Tam determinizmi', 'Şəri', 'Şansı'], a: 0, e: '1814.' },
      { q: 'Libetə görə insanın əlində nə qalır?', o: ['Hərəkəti son anda dayandırmaq (“azad istəməmək”)', 'Heç nə', 'Hər şeyi qabaqcadan bilmək'], a: 0, e: '“Free won’t”.' },
      { q: 'Milqram təcrübəsinin əsas variantında 450 volta qədər gedənlər:', o: ['~65%', '~5%', '~95%'], a: 0, e: 'Yel, 1961–1963.' },
      { q: 'Tenqniyə görə günahkarlığa meylli insanlar:', o: ['Başqalarının hisslərini daha yaxşı anlayır', 'Daha tez qəzəblənir', 'Daha çox gizlənir'], a: 0, e: 'Utanc müdafiəyə aparır.' },
      { q: '“Həya imandandır” fikrinin mənbəyi:', o: ['Hədis', 'Platon', 'Konfutsi'], a: 0, e: 'Həya daxili əyləcdir.' },
      { q: 'Kapuçin meymunlarının təcrübəsi nəyi göstərir?', o: ['Ədalət hissinin kökləri insandan qədimdir', 'Meymunlar xiyarı sevmir', 'Meymunlar saymağı bilir'], a: 0, e: 'Xiyar və üzüm.' },
      { q: 'Psixologiya təcrübələrinin təxminən 96%-i kimlər üzərində aparılıb?', o: ['Qərbin sənaye ölkələrindən olan insanlar', 'Bütün dünya xalqları bərabər', 'Yalnız uşaqlar'], a: 0, e: 'WEIRD.' },
      { q: 'Hartşorn və Meyin (1928) əsas tapıntısı:', o: ['Dürüstlük şəraitdən çox asılıdır', 'Uşaqlar həmişə dürüstdür', 'Dürüstlük irsidir'], a: 0, e: 'Situasionizm.' },
      { q: '“Vərdiş 21 günə yaranır” fikrinin mənbəyi:', o: ['Plastik cərrah Maksvell Maltsın kitabı (1960)', 'Aristotel', 'Lallinin araşdırması'], a: 0, e: '“Ən azı” sözü itib.' },
      { q: 'Qürurun sağlam forması nəyə baxır?', o: ['Əməyə: “yaxşı iş gördüm”', 'Şəxsiyyətə: “mən onlardan yaxşıyam”', 'Pula'], a: 0, e: 'Təkəbbürün əksi.' },
      { q: 'Avropa İttifaqının aldadıcı dizaynı onlayn platformalarda qadağan edən aktı:', o: ['Rəqəmsal Xidmətlər Aktı (2022)', 'Ümumi Məlumatların Qorunması Reqlamenti (2016)', 'Sİ Aktı (2024)'], a: 0, e: 'DSA, 25-ci maddə.' },
    ],
  };
  api.quizzes(QUIZ);
});
