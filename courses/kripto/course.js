/* Kriptoqrafiya kursu. Dərs indeksləri: 0 sorter, 1 Sezar, 2 tezlik, 3 Vijener, 4 XOR, 5 SHA-256, 6 DH, 7 RSA, 8 sıra, 9 parol, 10 zəncir. */
LMS.registerCourse('kripto', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const AZ = 'ABCÇDEƏFGĞHXIİJKQLMNOÖPRSŞTUÜVYZ', N = AZ.length;
  const up = s => s.toLocaleUpperCase('az');
  const shift = (t, k) => [...up(t)].map(ch => { const i = AZ.indexOf(ch); return i < 0 ? ch : AZ[((i + k) % N + N) % N]; }).join('');
  const sha = async s => {
    if (!(window.crypto && crypto.subtle)) return null;
    const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
    return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  };
  const modpow = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), y = BigInt(e); const M = BigInt(m); while (y > 0n) { if (y & 1n) r = r * x % M; x = x * x % M; y >>= 1n; } return Number(r); };

  api.sorter('k1Sort', { bins: ['Məxfilik', 'Bütövlük', 'Autentiklik'], done: 0, end: 'Bir sistem çox vaxt hər üçünü birlikdə təmin edir: HTTPS kimi.', items: [
    ['WhatsApp mesajını operator oxuya bilməsin', 0], ['Yüklənən proqram faylının yolda dəyişdirilmədiyinə əmin olmaq', 1], ['Bankın saytı olduğuna əmin olmaq, saxta sayt olmadığına', 2],
    ['Tibbi kartın məzmununu yalnız həkim görsün', 0], ['Müqavilədəki məbləğin imzadan sonra dəyişdirilmədiyini yoxlamaq', 1], ['Vergi bəyannaməsini sizin imzaladığınızı sübut etmək', 2]] });

  // ===== Sezar =====
  (() => {
    const plain = 'GİZLİ GÖRÜŞ SABAH SAAT DOQQUZDA MUZEYİN QARŞISINDA';
    const k = 4 + Math.floor(Math.random() * 24), secret = shift(plain, k);
    $('czSecret').textContent = secret;
    function enc() { const kk = +$('czKin').value; $('czK').textContent = kk; $('czOut').textContent = shift($('czIn').value, kk); }
    function guess() {
      const g = +$('czGuess').value || 0, d = shift(secret, -g);
      $('czTry').textContent = d;
      $('czMsg').innerHTML = g === k ? `<div class="msg ok">✅ Sındırdınız! Açar ${k} idi. Cəmi 31 variantı olan şifrə kompüter üçün bir anlıq işdir.</div>` : '';
      if (g === k) api.done(1);
    }
    $('czIn').oninput = enc; $('czKin').oninput = enc; $('czGuess').oninput = guess;
    $('czBrute').onclick = () => { $('czTry').innerHTML = Array.from({ length: 31 }, (_, i) => `<div>${String(i + 1).padStart(2, ' ')}: ${esc(shift(secret, -(i + 1)))}</div>`).join(''); $('czMsg').innerHTML = '<div class="msg info">Mənalı mətni tapın və onun nömrəsini yuxarıdakı xanaya yazın.</div>'; };
    enc(); guess();
  })();

  // ===== Tezlik analizi =====
  (() => {
    const REF = up('Azərbaycan Respublikası Cənubi Qafqazda yerləşir. Ölkənin paytaxtı Bakı şəhəridir. Azərbaycan zəngin tarixə, mədəniyyətə və təbiətə malikdir. Xəzər dənizinin sahilində yerləşən Bakı qədim və müasir memarlığı ilə tanınır. İnsanlar qonaqpərvərliyi ilə məşhurdur. Azərbaycan muğamı və xalçaçılıq sənəti dünya irsi siyahısına daxil edilib. Ölkədə neft və qaz sənayesi inkişaf edib, son illərdə isə turizm və informasiya texnologiyaları sürətlə böyüyür. Gənclər elmə və təhsilə böyük maraq göstərir.');
    const PLAIN = 'Məntiq və kriptoqrafiya bir-biri ilə sıx bağlıdır. Şifrəni açmaq üçün diqqətli olmaq və dilin qanunauyğunluqlarını bilmək lazımdır. Hər dildə bəzi hərflər digərlərindən daha çox işlənir və bu, şifrəni açmaq üçün əsas ipucudur. Ərəb alimi əl-Kindi bunu min ildən çox əvvəl kəşf edib.';
    const kf = 5 + Math.floor(Math.random() * 20), CIPH = shift(PLAIN, kf);
    const freq = t => { const c = Array(N).fill(0); let s = 0; for (const ch of t) { const i = AZ.indexOf(ch); if (i >= 0) { c[i]++; s++; } } return c.map(x => x / (s || 1)); };
    const bars = (el, f) => { const m = Math.max(...f, 0.001); el.innerHTML = f.map(x => `<i style="height:${x / m * 100}%"></i>`).join(''); };
    $('fqL1').innerHTML = $('fqL2').innerHTML = [...AZ].map(c => `<span>${c}</span>`).join('');
    bars($('fqR'), freq(REF));
    function draw() {
      const s = +$('fqKin').value; $('fqK').textContent = s;
      const dec = shift(CIPH, -s); bars($('fqC'), freq(dec));
      $('fqOut').textContent = dec;
      const ok = s === kf;
      $('fqMsg').innerHTML = ok ? '<div class="msg ok">✅ Qrafiklər üst-üstə düşdü və mətn oxunaqlı oldu! Tezlik analizi əsrlər boyu bütün sadə əvəzetmə şifrələrini sındırıb.</div>' : '';
      if (ok) api.done(2);
    }
    $('fqKin').oninput = draw; draw();
  })();

  // ===== Vijener =====
  (() => {
    function enc() {
      const key = [...up($('vgKey').value)].filter(c => AZ.includes(c)), t = up($('vgIn').value);
      if (!key.length) { $('vgOut').textContent = '(açar söz yazın)'; return; }
      let j = 0, out = '';
      for (const ch of t) { const i = AZ.indexOf(ch); if (i < 0) { out += ch; continue; } out += AZ[(i + AZ.indexOf(key[j % key.length])) % N]; j++; }
      $('vgOut').textContent = out;
      const as = [...t].map((c, i) => [c, out[i]]).filter(([c]) => c === 'A').map(([, o]) => o);
      $('vgInfo').innerHTML = as.length > 1 ? `Açıq mətndəki “A” hərfləri şifrədə belə görünür: <b>${[...new Set(as)].join(', ')}</b>. Eyni hərf fərqli hərflərə çevrilir, ona görə də sadə tezlik analizi işləmir.` : '';
      if (ready) api.done(3);
    }
    let ready = false;
    $('vgIn').oninput = enc; $('vgKey').oninput = enc; enc(); ready = true;
  })();

  // ===== XOR =====
  (() => {
    const te = new TextEncoder(), td = new TextDecoder();
    const b8 = n => n.toString(2).padStart(8, '0');
    function draw() {
      const m = te.encode($('xrIn').value), k = te.encode($('xrKey').value || 'K');
      const c = m.map((x, i) => x ^ k[i % k.length]), back = c.map((x, i) => x ^ k[i % k.length]);
      $('xrBits').innerHTML = `<div><b>Mesaj (M)</b>${[...m].map(b8).join(' ')}</div><div><b>Açar (K)</b>${[...m].map((_, i) => b8(k[i % k.length])).join(' ')}</div><div><b>Şifr (M⊕K)</b>${[...c].map(b8).join(' ')}</div><div><b>Hex</b>${[...c].map(x => x.toString(16).padStart(2, '0')).join(' ')}</div><div><b>(M⊕K)⊕K</b>${esc(td.decode(back))}</div>`;
      $('xrMsg').innerHTML = `<div class="msg info">Eyni açarla ikinci dəfə XOR etdikdə mesaj geri qayıtdı: “${esc(td.decode(back))}”.${k.length < m.length ? ' Diqqət: açar mesajdan qısadır və təkrarlanır. Bu, birdəfəlik bloknot deyil və zəif şifrədir.' : ''}</div>`;
      if (ready) api.done(4);
    }
    let ready = false;
    $('xrIn').oninput = draw; $('xrKey').oninput = draw; draw(); ready = true;
  })();

  // ===== SHA-256 =====
  (() => {
    async function draw() {
      const [a, b] = await Promise.all([sha($('hsA').value), sha($('hsB').value)]);
      if (!a) { $('hsMsg').innerHTML = '<div class="msg bad">Bu brauzerdə kriptoqrafiya modulu əlçatan deyil.</div>'; return; }
      $('hsHA').textContent = a;
      $('hsHB').innerHTML = [...b].map((ch, i) => ch === a[i] ? ch : `<span class="d">${ch}</span>`).join('');
      let bits = 0; for (let i = 0; i < 64; i += 2) { let x = parseInt(a.substr(i, 2), 16) ^ parseInt(b.substr(i, 2), 16); while (x) { bits += x & 1; x >>= 1; } }
      $('hsMsg').innerHTML = a === b ? '<div class="msg info">Mətnlər eynidir, hash-lər də eynidir: deterministiklik.</div>' : `<div class="msg ok">256 bitdən <b>${bits}</b>-i fərqlidir (${(bits / 2.56).toFixed(0)}%). İdeal hash-də bu, təxminən 50%-dir. Mətnlər arasında fərq bir simvol olsa belə, hash-lər tamam fərqlidir: uçqun effekti.</div>`;
      if (a !== b) api.done(5);
    }
    $('hsA').oninput = draw; $('hsB').oninput = draw; draw();
  })();

  // ===== Diffie-Hellman =====
  (() => {
    const p = 23, g = 5;
    function draw() {
      const a = Math.max(1, Math.min(22, +$('dhA').value || 1)), b = Math.max(1, Math.min(22, +$('dhB').value || 1));
      const A = modpow(g, a, p), B = modpow(g, b, p), sA = modpow(B, a, p), sB = modpow(A, b, p);
      $('dhOut').innerHTML = `<div class="p a"><h4>👩 Alisa</h4>gizli: a = <b>${a}</b><br>göndərir: A = 5<sup>${a}</sup> mod 23 = <b>${A}</b><br>hesablayır: B<sup>a</sup> mod 23 = <b>${sA}</b></div>
        <div class="p e"><h4>🕵️ Eva görür</h4>p = 23, g = 5<br>A = ${A}, B = ${B}<br>Gizli açar? <b>?</b><br><small>Kiçik ədədlərdə hər variantı yoxlaya bilər, real ədədlərdə isə yox.</small></div>
        <div class="p b"><h4>👨 Bob</h4>gizli: b = <b>${b}</b><br>göndərir: B = 5<sup>${b}</sup> mod 23 = <b>${B}</b><br>hesablayır: A<sup>b</sup> mod 23 = <b>${sB}</b></div>`;
      $('dhMsg').innerHTML = `<div class="msg ok">Alisa və Bob gizli ədədlərini heç vaxt göndərmədilər, amma ikisi də eyni açarı aldı: <b>${sA}</b>. Real sistemlərdə p yüzlərlə rəqəmli ədəddir və ya elliptik əyrilər istifadə olunur.</div>`;
      if (ready) api.done(6);
    }
    let ready = false;
    $('dhA').oninput = draw; $('dhB').oninput = draw; draw(); ready = true;
  })();

  // ===== RSA =====
  (() => {
    const gcd = (a, b) => b ? gcd(b, a % b) : a;
    const inv = (e, m) => { let [r0, r1, s0, s1] = [m, e, 0, 1]; while (r1) { const q = Math.floor(r0 / r1);[r0, r1] = [r1, r0 - q * r1];[s0, s1] = [s1, s0 - q * s1]; } return ((s0 % m) + m) % m; };
    function draw() {
      const p = +$('rsP').value, q = +$('rsQ').value, n = p * q, phi = (p - 1) * (q - 1);
      const e = [3, 5, 7, 11, 13, 17, 19, 23].find(x => gcd(x, phi) === 1), d = inv(e, phi);
      let m = Math.max(2, Math.min(n - 1, +$('rsM').value || 2));
      const c = modpow(m, e, n), m2 = modpow(c, d, n), sig = modpow(m, d, n), ver = modpow(sig, e, n);
      $('rsOut').innerHTML = `1) n = p · q = ${p} · ${q} = <b>${n}</b><br>2) φ(n) = (p−1)(q−1) = <b>${phi}</b><br>3) Açıq açar: (e = <b>${e}</b>, n = ${n})<br>4) Gizli açar: d = <b>${d}</b> (çünki e·d mod φ = 1)<br>
        🔒 Şifrələmə: c = m<sup>e</sup> mod n = ${m}<sup>${e}</sup> mod ${n} = <b>${c}</b><br>🔓 Deşifrələmə: c<sup>d</sup> mod n = <b>${m2}</b><br>✍️ İmza: s = m<sup>d</sup> mod n = <b>${sig}</b> → yoxlama: s<sup>e</sup> mod n = <b>${ver}</b> ${ver === m ? '✓' : '✗'}`;
      $('rsMsg').innerHTML = `<div class="msg ok">Mesaj ${m} açıq açarla şifrələndi və yalnız gizli açarla geri açıldı. İmza isə əksinədir: gizli açarla yaradılır, hər kəs açıq açarla yoxlayır. Kim n = ${n} ədədini vuruqlara ayırsa, d-ni tapa bilər. Burada bu asandır, 600 rəqəmli ədəddə isə mümkün deyil.</div>`;
      if (ready) api.done(7);
    }
    let ready = false;
    ['rsP', 'rsQ', 'rsM'].forEach(id => $(id).addEventListener('input', draw)); draw(); ready = true;
  })();

  api.order('k9Ord', { done: 8, ok: 'Asimmetrik kriptoqrafiya etibar və açar mübadiləsi üçün, sürətli simmetrik AES isə trafik üçün istifadə olunur.', hint: 'Fikirləşin: brauzer şifrələməyə başlamazdan əvvəl qarşı tərəfin həqiqətən o sayt olduğuna əmin olmalıdır.', steps: [
    'Brauzer sayta qoşulur və təhlükəsiz əlaqə istəyir', 'Sayt sertifikatını (açıq açar + CA imzası) göndərir', 'Brauzer CA imzasını yoxlayır: sertifikat bu sayta aiddirmi, vaxtı keçməyibmi?', 'Diffie-Hellman ilə ortaq gizli açar yaradılır', 'Bütün trafik bu açarla AES ilə şifrələnir', 'Ünvan sətrində 🔒 görünür'] });

  // ===== Parol gücü =====
  (() => {
    const COMMON = ['123456', '123456789', 'password', 'qwerty', '111111', '12345678', 'parol', 'salam123', 'azerbaijan', 'baku2026', 'admin', '000000', 'iloveyou', 'abc123', '12345'];
    const fmtT = s => s < 1 ? 'dərhal' : s < 60 ? Math.round(s) + ' saniyə' : s < 3600 ? Math.round(s / 60) + ' dəqiqə' : s < 86400 ? Math.round(s / 3600) + ' saat' : s < 31536000 ? Math.round(s / 86400) + ' gün' : s < 31536000 * 1000 ? Math.round(s / 31536000) + ' il' : s < 31536000 * 1e6 ? Math.round(s / 31536000 / 1000) + ' min il' : 'milyon ildən çox';
    let tries = 0;
    function draw() {
      const p = $('pwIn').value, L = [...p].length;
      let pool = 0; if (/[a-z]/.test(p)) pool += 26; if (/[A-Z]/.test(p)) pool += 26; if (/\d/.test(p)) pool += 10; if (/[^\w\sçşğıöüəÇŞĞİÖÜƏ]/.test(p)) pool += 33; if (/[çşğıöüəÇŞĞİÖÜƏ]/.test(p)) pool += 14; if (/\s/.test(p)) pool += 1;
      let bits = L * Math.log2(Math.max(pool, 1));
      const common = COMMON.includes(p.toLowerCase());
      if (common) bits = 5;
      const fast = Math.pow(2, bits) / 2 / 1e10, slow = Math.pow(2, bits) / 2 / 1e4;
      const pct = Math.min(100, bits / 100 * 100), col = bits < 40 ? 'var(--ex-red-b)' : bits < 65 ? 'var(--ex-amber-b)' : 'var(--ex-green-b)';
      $('pwBar').style.width = pct + '%'; $('pwBar').style.background = col;
      $('pwOut').innerHTML = `Uzunluq: <b>${L}</b> · simvol hovuzu: <b>${pool}</b> · entropiya: <b>${bits.toFixed(0)} bit</b>${common ? ' · ⚠️ <b>ən çox istifadə olunan parollar siyahısındadır!</b>' : ''}<br>
        Sürətli hash ilə oflayn hücum (saniyədə 10 milyard cəhd): <b>${fmtT(fast)}</b><br>Argon2 və ya bcrypt ilə qorunan sayt (saniyədə ~10 000 cəhd): <b>${fmtT(slow)}</b><br>
        <small class="fb">Bu, sadələşdirilmiş qiymətləndirmədir: real hücumçular lüğət sözlərini və tipik nümunələri (məsələn, “Ad + il + !”) daha tez yoxlayır.</small>`;
      if (++tries > 2) api.done(9);
    }
    $('pwIn').oninput = draw;
    document.querySelectorAll('[data-pw]').forEach(b => b.onclick = () => { $('pwIn').value = b.dataset.pw; draw(); });
    draw();
  })();

  // ===== Hash zənciri =====
  (() => {
    const blocks = [{ data: 'Genezis bloku' }, { data: 'Əli → Vəli: 5' }, { data: 'Vəli → Aysel: 2' }, { data: 'Aysel → Əli: 1' }];
    let tampered = false;
    const H = (i, prev, data) => sha(`${i}|${prev}|${data}`);
    async function rebuild() { let prev = '0'.repeat(16); for (let i = 0; i < blocks.length; i++) { blocks[i].prev = prev; blocks[i].hash = await H(i, prev, blocks[i].data); prev = blocks[i].hash; } }
    async function render() {
      const ok = [];
      for (let i = 0; i < blocks.length; i++) { const b = blocks[i], real = await H(i, b.prev, b.data); ok.push(real === b.hash && (i === 0 || b.prev === blocks[i - 1].hash) && (i === 0 || ok[i - 1])); }
      $('chBox').innerHTML = blocks.map((b, i) => `<div class="blk ${ok[i] ? '' : 'bad'}"><b>Blok #${i}</b> ${ok[i] ? '✓' : '✗ qırılıb'}<br>məlumat:<input data-i="${i}" value="${esc(b.data)}"><div class="h">əvvəlki: ${b.prev.slice(0, 16)}…</div><div class="h">hash: ${b.hash.slice(0, 16)}…</div></div>`).join('');
      $('chBox').querySelectorAll('input').forEach(inp => inp.onchange = async () => { blocks[+inp.dataset.i].data = inp.value; tampered = true; await render(); });
      const bad = ok.filter(x => !x).length;
      $('chMsg').innerHTML = bad ? `<div class="msg bad">${bad} blok qırıldı! Bir blokdakı dəyişiklik ondan sonrakı bütün blokları etibarsız edir. Dəyişikliyi gizlətmək üçün hücumçu sonrakı bütün blokların hash-ini yenidən hesablamalıdır. Real blokçeyndə bu, böyük hesablama işi (proof-of-work) tələb edir və şəbəkənin çoxluğu fərqli zəncirə sahib olduğu üçün qəbul olunmur.</div>`
        : `<div class="msg ok">Zəncir etibarlıdır.${tampered ? ' Hash-ləri yenidən hesabladınız: kompüterinizdə bu asandır, amma minlərlə iştirakçısı olan şəbəkədə hamını inandırmaq mümkün deyil.' : ''}</div>`;
      if (tampered && !bad) api.done(10);
    }
    $('chFix').onclick = async () => { await rebuild(); await render(); };
    (async () => { if (!(await sha('x'))) { $('chMsg').innerHTML = '<div class="msg bad">Bu brauzerdə kriptoqrafiya modulu əlçatan deyil.</div>'; return; } await rebuild(); await render(); })();
  })();

  const QUIZ = {
    intro: [
      { q: 'Kerkhofs prinsipinə görə nə gizli saxlanmalıdır?', o: ['Yalnız açar', 'Alqoritm'], a: 0, e: 'Etibarlı alqoritmlər açıqdır.' },
      { q: 'Faylın yolda dəyişdirilmədiyini yoxlamaq hansı məqsəddir?', o: ['Bütövlük', 'Məxfilik'], a: 0, e: 'Hash.' },
      { q: 'Skitala harada istifadə olunub?', o: ['Qədim Sparta', 'Orta əsr Çin'], a: 0, e: 'Çubuq və dəri lent.' },
    ],
    caesar: [
      { q: 'Azərbaycan əlifbası ilə Sezar şifrəsində neçə mümkün açar var?', o: ['31', '1000', '2²⁵⁶'], a: 0, e: '32 hərf, 0 sürüşmə şifrə deyil.' },
      { q: 'Kobud güc hücumu nədir?', o: ['Bütün mümkün açarları yoxlamaq', 'Kompüteri sındırmaq'], a: 0, e: 'Az açar, tez sınma.' },
      { q: 'Sezar adətən neçə hərf sürüşdürürdü?', o: ['3', '13'], a: 0, e: 'Svetoninin yazdığına görə.' },
    ],
    freq: [
      { q: 'Tezlik analizinin ilk məlum təsviri kimə aiddir?', o: ['Əl-Kindi', 'Alan Türinq'], a: 0, e: 'IX əsr.' },
      { q: 'Tezlik analizi niyə işləyir?', o: ['Dildə bəzi hərflər daha tez-tez işlənir və şifrə bu nümunəni saxlayır', 'Kompüter sürətlidir'], a: 0, e: 'Sadə əvəzetmə tezlikləri gizlətmir.' },
    ],
    vig: [
      { q: 'Vijener şifrəsi tezlik analizini niyə çətinləşdirir?', o: ['Eyni hərf fərqli hərflərə çevrilir', 'Hərflər silinir'], a: 0, e: 'Açar söz fərqli sürüşmələr verir.' },
      { q: 'Enigma şifrələrini açan komandaya kim rəhbərlik etmiş tanınmış alimlərdən biridir?', o: ['Alan Türinq', 'Albert Eynşteyn'], a: 0, e: 'Bletçli Park. Polşalı riyaziyyatçılar əsası qoymuşdu.' },
      { q: 'Enigma-nın sınmasına nə kömək etdi?', o: ['Operatorların təkrarlanan, təxmin edilən mesajları', 'Maşının sadəliyi'], a: 0, e: 'İnsan faktoru.' },
    ],
    sym: [
      { q: 'Simmetrik şifrələmədə:', o: ['Eyni açar şifrələyir və açır', 'İki fərqli açar var'], a: 0, e: 'AES.' },
      { q: '(M ⊕ K) ⊕ K = ?', o: ['M', 'K', '0'], a: 0, e: 'XOR-un xüsusiyyəti.' },
      { q: 'Birdəfəlik bloknotun açarını təkrar istifadə etsək:', o: ['Şifr zəifləyir və sındırıla bilər', 'Daha güclü olur'], a: 0, e: 'Venona layihəsi.' },
      { q: 'Simmetrik şifrələmənin əsas problemi:', o: ['Açarı təhlükəsiz paylamaq', 'Yavaşlıq'], a: 0, e: 'Həlli Diffie-Hellman.' },
    ],
    hash: [
      { q: 'SHA-256 nəticəsinin uzunluğu:', o: ['Həmişə 256 bit', 'Girişdən asılıdır'], a: 0, e: 'Sabit uzunluq.' },
      { q: 'Uçqun effekti:', o: ['Kiçik dəyişiklik hash-də bitlərin təxminən yarısını dəyişir', 'Hash yavaşlayır'], a: 0, e: 'Laboratoriyada gördünüz.' },
      { q: 'Hash-dən ilkin mətni bərpa etmək:', o: ['Praktiki olaraq mümkün deyil', 'Asandır'], a: 0, e: 'Bir istiqamətli funksiya.' },
    ],
    dh: [
      { q: 'Diffie-Hellman nəyi mümkün edir?', o: ['Açıq kanalda ortaq gizli açar yaratmağı', 'Mesajı imzalamağı'], a: 0, e: '1976.' },
      { q: 'Eva A və B-ni görür. Niyə açarı tapa bilmir?', o: ['Diskret loqarifm böyük ədədlərdə çox çətindir', 'A və B şifrələnib'], a: 0, e: 'Rəngi ayırmaq çətindir.' },
    ],
    rsa: [
      { q: 'RSA-da mesajı kim aça bilər?', o: ['Gizli açarın sahibi', 'Açıq açarı olan hər kəs'], a: 0, e: 'Poçt qutusu analogiyası.' },
      { q: 'Rəqəmsal imza hansı açarla yaradılır?', o: ['Gizli', 'Açıq'], a: 0, e: 'Yoxlama isə açıq açarla aparılır.' },
      { q: 'RSA-nın təhlükəsizliyi nəyə əsaslanır?', o: ['Böyük ədədləri vuruqlara ayırmağın çətinliyinə', 'Alqoritmin gizliliyinə'], a: 0, e: 'Şor alqoritmi bunu təhdid edir.' },
    ],
    https: [
      { q: '🔒 işarəsi nəyə zəmanət verir?', o: ['Əlaqənin şifrələnməsinə və saytın ünvanına uyğunluğuna', 'Saytın dürüst olmasına'], a: 0, e: 'Fırıldaqçı saytın da sertifikatı ola bilər.' },
      { q: 'HTTPS-də trafik hansı şifrə ilə şifrələnir?', o: ['Simmetrik (AES)', 'Yalnız RSA'], a: 0, e: 'Sürət üçün.' },
      { q: 'Let\'s Encrypt nə dəyişdi?', o: ['Pulsuz, avtomatik sertifikatlar hamı üçün əlçatan oldu', 'Saytları bağladı'], a: 0, e: '2015-dən.' },
    ],
    pass: [
      { q: 'Saytlar parolları necə saxlamalıdır?', o: ['Duz əlavə edilmiş yavaş hash ilə (Argon2, bcrypt)', 'Açıq mətnlə'], a: 0, e: 'Sızma halında da qoruyur.' },
      { q: 'Hansı daha güclüdür?', o: ['qırmızı-alma-dağ-pişik-7', 'P@s5w!'], a: 0, e: 'Uzunluq.' },
      { q: 'Hər sayt üçün ayrı parol niyə lazımdır?', o: ['Bir sayt sızsa, digərləri qorunsun', 'Lazım deyil'], a: 0, e: 'Parol meneceri istifadə edin.' },
    ],
    chain: [
      { q: 'Blokçeyndə bir blokun dəyişdirilməsi nəyə səbəb olur?', o: ['Sonrakı bütün bloklar etibarsız olur', 'Heç nə'], a: 0, e: 'Hash zənciri.' },
      { q: 'Kripto pul kisəsi əslində nədir?', o: ['Gizli açar', 'Bank hesabı'], a: 0, e: 'İtirsəniz, pul itir.' },
      { q: 'Kvant kompüterləri hansı alqoritmlər üçün daha böyük təhlükədir?', o: ['RSA və Diffie-Hellman', 'AES-256'], a: 0, e: 'Şor alqoritmi.' },
    ],
    final: [
      { q: 'Kriptoqrafiyanın dörd məqsədi:', o: ['Məxfilik, bütövlük, autentiklik, inkar edilməzlik', 'Sürət, rəng, ölçü, qiymət'], a: 0, e: 'Hər birinin öz aləti var.' },
      { q: 'Kerkhofs prinsipi:', o: ['Yalnız açar gizli olmalıdır', 'Alqoritm gizli olmalıdır'], a: 0, e: 'Açıq alqoritmlər yoxlanılıb.' },
      { q: 'Sezar şifrəsini sındırmağın ən sadə yolu:', o: ['Bütün açarları yoxlamaq', 'Kvant kompüteri'], a: 0, e: '31 variant.' },
      { q: 'Tezlik analizi kimin adı ilə bağlıdır?', o: ['Əl-Kindi', 'Nyuton'], a: 0, e: 'IX əsr.' },
      { q: 'Vijener şifrəsini XIX əsrdə kim sındırdı?', o: ['Bebbic və Kasiski', 'Sezar'], a: 0, e: 'Açarın təkrarlanmasından istifadə etdilər.' },
      { q: 'Enigma-nı sındıran mərkəz:', o: ['Bletçli Park', 'Silikon vadisi'], a: 0, e: 'Türinq və komandası.' },
      { q: 'Nəzəri cəhətdən sındırılmaz şifr:', o: ['Düzgün istifadə olunan birdəfəlik bloknot', 'Sezar'], a: 0, e: 'Şennon, 1949.' },
      { q: 'Bu gün ən çox istifadə olunan simmetrik alqoritm:', o: ['AES', 'Enigma'], a: 0, e: '2001.' },
      { q: 'Hash funksiyası:', o: ['Bir istiqamətlidir', 'Asanlıqla geri çevrilir'], a: 0, e: 'Barmaq izi.' },
      { q: 'Diffie-Hellman:', o: ['Açıq kanalda ortaq açar yaradır', 'Faylları sıxır'], a: 0, e: '1976.' },
      { q: 'RSA-da imza:', o: ['Gizli açarla yaradılır, açıq açarla yoxlanılır', 'Açıq açarla yaradılır'], a: 0, e: 'İnkar edilməzlik.' },
      { q: 'HTTPS kilidinin mənası:', o: ['Əlaqə şifrələnib', 'Sayt mütləq etibarlıdır'], a: 0, e: 'Ünvanı yoxlayın.' },
      { q: 'Parol saxlamaq üçün ən yaxşısı:', o: ['Argon2 / bcrypt + duz', 'Açıq mətn'], a: 0, e: 'Yavaş hash.' },
      { q: 'Blokçeyn hansı alətləri birləşdirir?', o: ['Hash zənciri və rəqəmsal imzalar', 'Sezar və Vijener'], a: 0, e: 'Yeni kriptoqrafiya deyil.' },
      { q: 'Post-kvant standartlarını kim təsdiqlədi?', o: ['NIST (2024)', 'FIFA'], a: 0, e: 'ML-KEM, ML-DSA, SLH-DSA.' },
    ],
  };
  api.quizzes(QUIZ);
});
