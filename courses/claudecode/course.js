/* Claude Code kursu: interaktiv hissələr və testlər.
   Dərs indeksləri (0-dan): 1 terminal, 2 prompt, 3 iş axını, 5 CLAUDE.md, 6 kontekst, 7 kartlar, 9 hook-lar. */
LMS.registerCourse('claudecode', function (api) {
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  function copyText(btn, getText) {
    btn.onclick = () => {
      const t = getText();
      const ok = () => { btn.textContent = 'Kopyalandı ✓'; setTimeout(() => { btn.textContent = 'Kopyala'; }, 1600); };
      const fallback = () => {
        const pre = btn.previousElementSibling; const r = document.createRange(); r.selectNodeContents(pre);
        const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Mətn seçildi, kopyalayın';
      };
      try { navigator.clipboard.writeText(t).then(ok, fallback); } catch (e) { fallback(); }
    };
  }

  // ================= Terminal simulyatoru =================
  (() => {
    const out = $('ccOut'), inp = $('ccIn'), prm = $('ccPrompt'), modeEl = $('ccMode'), list = $('ccMissions');
    const MODES = ['', '⏵⏵ redaktələri avtomatik qəbul (acceptEdits)', '⏸ plan rejimi (plan mode)'];
    const MISSIONS = [
      ['start', 'Claude Code-u işə salın: <span class="sym">claude</span>'],
      ['help', 'Əmrlərin siyahısına baxın: <span class="sym">/help</span>'],
      ['init', 'Layihə üçün yaddaş faylı yaradın: <span class="sym">/init</span>'],
      ['plan', '<kbd>Shift+Tab</kbd> ilə plan rejiminə keçin (düyməni iki dəfə basın)'],
      ['ask', 'Plan rejimində adi dildə tapşırıq yazın: “menyuya “Haqqımızda” linki əlavə et”'],
      ['bang', 'Terminal əmrini birbaşa işə salın: <span class="sym">!git status</span>'],
      ['exit', 'Sessiyadan çıxın: <span class="sym">/exit</span>'],
    ];
    let started, mode, done;
    const line = (html, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; };
    function drawMissions() {
      list.innerHTML = MISSIONS.map(([k, t]) => `<li class="${done[k] ? 'ok' : ''}"><span class="ck">${done[k] ? '✓' : ''}</span><span>${t}</span></li>`).join('');
    }
    function hit(k) {
      if (done[k]) return; done[k] = true; drawMissions();
      if (MISSIONS.every(([m]) => done[m])) { line('🎉 Bütün tapşırıqlar yerinə yetirildi! Siz Claude Code-un əsas idarəetməsini bilirsiniz.', 'c'); api.done(1); }
    }
    function setMode(m) { mode = m; modeEl.textContent = started ? (MODES[mode] || 'adi rejim · Shift+Tab ilə dəyişin') : ''; }
    function reset() {
      started = false; done = {}; out.innerHTML = ''; prm.textContent = '$'; setMode(0); drawMissions();
      line('Simulyator hazırdır. Başlamaq üçün <span class="c">claude</span> yazın.', 'd');
    }
    function shiftTab() {
      if (!started) { line('Əvvəlcə <span class="c">claude</span> ilə sessiyanı başladın.', 'w'); return; }
      setMode((mode + 1) % 3);
      line('[Shift+Tab] → ' + (mode === 0 ? 'adi rejim' : MODES[mode]), 'd');
      if (mode === 2) hit('plan');
    }
    function run(raw) {
      const cmd = raw.trim(); if (!cmd) return;
      line((started ? '&gt; ' : '$ ') + esc(cmd), 'u');
      const low = cmd.toLowerCase();
      if (low === 'shift+tab' || low === 'shift tab') return shiftTab();
      if (!started) {
        if (low === 'claude') {
          started = true; prm.textContent = '>'; setMode(0); hit('start');
          line('✻ Claude Code-a xoş gəldiniz!\n  qovluq: ~/layiheler/menim-saytim\n  İpucu: /help · Shift+Tab rejim dəyişir · Esc dayandırır', 'c');
        } else if (low === 'ls') line('index.html  style.css  script.js  README.md');
        else if (low === 'git status') line('On branch main\nnothing to commit, working tree clean');
        else if (low.startsWith('claude -p')) line('(headless rejim) Bu layihə statik veb saytdır: index.html əsas səhifə, style.css dizayn, script.js menyunun məntiqi.', 'c');
        else line(`bash: ${esc(cmd.split(' ')[0])}: əmr tapılmadı. Claude Code-u başlatmaq üçün <span class="c">claude</span> yazın.`, 'e');
        return;
      }
      if (cmd.startsWith('!')) {
        const sh = cmd.slice(1).trim();
        if (sh === 'git status') { line('On branch main\nnothing to commit, working tree clean'); hit('bang'); }
        else if (sh === 'ls') { line('CLAUDE.md  index.html  style.css  script.js  README.md'); hit('bang'); }
        else line(`(bash) ${esc(sh)}: simulyatorda yalnız <span class="c">!git status</span> və <span class="c">!ls</span> var`, 'd');
        return;
      }
      if (cmd.startsWith('/')) {
        const c = low.split(/\s+/)[0];
        const R = {
          '/help': () => { hit('help'); line('Əsas əmrlər:\n  /init         layihə üçün CLAUDE.md yarat\n  /clear        söhbəti təmizlə\n  /compact      söhbəti xülasə et\n  /context      kontekstin doluluğu\n  /model        model seçimi\n  /permissions  icazə qaydaları\n  /agents       subagentlər\n  /mcp          xarici alətlər\n  /hooks        avtomatik qaydalar\n  /resume       köhnə söhbətə qayıt\n  /exit         çıxış\nQısayollar: Shift+Tab rejim · Esc dayandır · Esc Esc geri qayıt · !əmr · @fayl', 'c'); },
          '/init': () => { hit('init'); line('Layihə təhlil edilir… index.html, style.css, script.js oxundu.\n✓ CLAUDE.md yaradıldı: layihənin təsviri, fayl quruluşu, kod üslubu.\nFaylı oxuyub öz qaydalarınızı əlavə edin.', 'c'); },
          '/clear': () => { out.innerHTML = ''; line('Söhbət təmizləndi. Kontekst boşdur.', 'd'); },
          '/compact': () => line('Söhbət qısa xülasəyə çevrildi. Vacib qərarlar saxlanıldı, kontekst boşaldı.', 'c'),
          '/context': () => line('Kontekst: ███░░░░░░░ 27% dolu\n  sistem və alətlər · CLAUDE.md · söhbət', 'c'),
          '/model': () => line('Model seçimi menyusu açılır: güclü model mürəkkəb işlər üçün, sürətli model sadə işlər üçün. (Simulyatorda dəyişmir.)', 'd'),
          '/permissions': () => line('İcazə qaydaları:\n  allow: Bash(npm run test:*)\n  deny:  Read(./.env)', 'c'),
          '/agents': () => line('Subagentlər: Explore (axtarış), Plan (planlaşdırma) · + yenisini yarat', 'c'),
          '/mcp': () => line('MCP serverləri: qoşulmuş server yoxdur. Əlavə etmək üçün: claude mcp add …', 'd'),
          '/hooks': () => line('Hook-lar: konfiqurasiya olunmuş hook yoxdur.', 'd'),
          '/resume': () => line('Köhnə söhbətlər: 1) “login xətası” (dünən) 2) “menyu dizaynı” (3 gün əvvəl)', 'd'),
          '/exit': () => { hit('exit'); started = false; prm.textContent = '$'; setMode(0); line('Sessiya bitdi. Yenidən başlamaq üçün: claude', 'd'); },
        };
        (R[c] || (() => line(`Naməlum əmr: ${esc(c)}. Siyahı üçün <span class="c">/help</span> yazın.`, 'e')))();
        return;
      }
      const mention = (cmd.match(/@[\w./-]+/) || [])[0];
      if (mode === 2) {
        hit('ask');
        line(`⏸ Plan rejimi: heç bir fayl dəyişdirilmir.\n${mention ? `${esc(mention)} oxundu. ` : ''}index.html və style.css oxundu.\n\nPlan:\n  1. index.html-də &lt;nav&gt; menyusuna “Haqqımızda” linki əlavə etmək\n  2. haqqimizda.html səhifəsini mövcud dizaynla yaratmaq\n  3. Mobil menyuda linkin göründüyünü yoxlamaq\n\nPlanı təsdiqləyirsiniz? (Shift+Tab ilə adi rejimə qayıdıb “planı tətbiq et” yazın)`, 'c');
      } else if (mode === 1) {
        line(`${mention ? esc(mention) + ' oxundu. ' : ''}index.html redaktə edildi ✓ (avtomatik qəbul)\nstyle.css redaktə edildi ✓\nYoxlama: səhifə açıldı, link işləyir.`, 'c');
      } else {
        line(`${mention ? esc(mention) + ' oxundu. ' : ''}index.html faylını redaktə etmək istəyirəm.\n  + &lt;a href="haqqimizda.html"&gt;Haqqımızda&lt;/a&gt;\nİcazə verirsiniz? [Bəli] [Bəli, bu sessiyada soruşma] [Xeyr]\n(simulyator: “Bəli” seçildi) ✓ Redaktə edildi.`, 'c');
        line('İpucu: plan rejimində (Shift+Tab ×2) Claude əvvəlcə plan qurur.', 'w');
      }
    }
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
      else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); shiftTab(); }
      else if (e.key === 'Escape') { line('⏹ Dayandırıldı. Claude yeni göstərişinizi gözləyir.', 'w'); }
    });
    $('ccST').onclick = () => { shiftTab(); inp.focus(); };
    $('ccEsc').onclick = () => { line('⏹ Dayandırıldı. Claude yeni göstərişinizi gözləyir.', 'w'); inp.focus(); };
    $('ccReset').onclick = reset;
    reset();
  })();

  // ================= Prompt yoxlayıcısı =================
  (() => {
    const CRIT = [
      ['Məqsəd: nə etmək lazımdır', /(düzəlt|əlavə et|yarat|yaz|dəyiş|sil|təkmilləşdir|refaktor|izah et|tap|qur|fix|add|create|write|implement|refactor|remove|update|build)/i, '“düzəlt”, “əlavə et”, “yarat” kimi aydın bir fel yazın.'],
      ['Yer: hansı fayl və ya hissə', /(@\S+|\b[\w\-/]+\.(js|ts|tsx|jsx|py|html|css|json|md|go|rb|java|php|sql|yml|yaml)\b|\b(src|app|lib|tests?|components?)\/)/i, 'Faylı göstərin: @src/login.js və ya yolunu yazın.'],
      ['Səbəb və kontekst', /(çünki|səbəb|xəta|error|log|problem|başlayıb|because|since|olanda|zaman|istifadəçilər|müştəri)/i, 'Problemi və ya niyəsini izah edin: xəta mesajı, nə vaxt başlayıb, kimə təsir edir.'],
      ['Məhdudiyyətlər', /(toxunma|dəyişmə|istifadə etmə|yalnız|olmadan|saxla|don't|do not|only|without|avoid|keep)/i, 'Nəyə toxunmamaq lazımdır? “Bazanın sxeminə toxunma”, “yeni kitabxana əlavə etmə”.'],
      ['Uğur meyarı', /(gözlənilən|nəticə|olmalıdır|görünsün|keçsin|işləsin|should|expected|must|so that|\bki\b)/i, 'İşin bitdiyini necə bilərik? “390px enində də düzgün görünsün”.'],
      ['Yoxlama', /(test|yoxla|işə sal|run|verify|check|brauzer|build|lint)/i, 'Claude-dan yoxlamasını istəyin: “npm test işə sal”, “brauzerdə yoxla”.'],
    ];
    const GOOD = '@src/auth/login.js faylında istifadəçi düzgün parolla daxil olanda "Invalid token" xətası çıxır. Problem dünənki commit-dən sonra başlayıb. Səbəbi tap və düzəlt. Verilənlər bazasının sxeminə toxunma. Login uğurlu olmalıdır. Sonra npm test işə sal və login testlərinin keçdiyini göstər.';
    function check() {
      const t = $('pcIn').value.trim();
      const res = CRIT.map(([name, re, tip]) => [name, re.test(t), tip]);
      const detail = t.length >= 80;
      res.push(['Kifayət qədər detal', detail, 'Bir-iki cümlə daha əlavə edin: Claude-un təxmin etməli olduğu nə qədər az olsa, o qədər yaxşı.']);
      const score = res.filter(r => r[1]).length;
      const verdict = score >= 6 ? ['ok', 'Əla tapşırıqdır! Claude-un təxmin etməli olduğu demək olar ki, heç nə qalmır.'] : score >= 4 ? ['info', 'Yaxşıdır, amma bir neçə element əlavə etsəniz, nəticə daha dəqiq olar.'] : ['bad', 'Tapşırıq çox qeyri-müəyyəndir. Claude çox şeyi təxmin etməli olacaq.'];
      $('pcOut').innerHTML = `<div class="msg ${verdict[0]}"><b>${score} / ${res.length}</b> · ${verdict[1]}</div>
        <ul class="checklist">${res.map(([n, ok, tip]) => `<li>${ok ? '✅' : '⬜'} <b>${n}</b>${ok ? '' : ` <span class="fb">· ${tip}</span>`}</li>`).join('')}</ul>`;
    }
    $('pcBtn').onclick = check;
    $('pcGood').onclick = () => { $('pcIn').value = GOOD; check(); };
    check();
  })();

  // ================= İş axını sıralaması =================
  (() => {
    const STEPS = ['Kəşf: “kodu oxu və izah et, hələ heç nə dəyişmə”', 'Plan: “plan qur, hansı faylları dəyişəcəksən?”', 'Kod: “planı tətbiq et”', 'Yoxlama: “testləri işə sal, xətaları düzəlt”', 'Commit: “aydın mesajla commit et, PR aç”'];
    const box = $('ordBox'), msg = $('ordMsg');
    let shown, picked;
    function reset() {
      shown = STEPS.map((s, i) => i);
      do { shown.sort(() => Math.random() - 0.5); } while (shown.every((v, i) => v === i));
      picked = []; msg.innerHTML = ''; draw();
    }
    function draw() {
      box.innerHTML = shown.map(i => { const p = picked.indexOf(i); return `<button data-i="${i}" class="${p >= 0 ? 'picked' : ''}"><span class="n">${p >= 0 ? p + 1 : ''}</span>${esc(STEPS[i])}</button>`; }).join('');
      box.querySelectorAll('button').forEach(b => b.onclick = () => {
        const i = +b.dataset.i, p = picked.indexOf(i);
        if (p >= 0) picked.splice(p, 1); else picked.push(i);
        draw();
      });
    }
    $('ordCheck').onclick = () => {
      if (picked.length < STEPS.length) { msg.innerHTML = '<div class="msg info">Bütün addımlara nömrə verin.</div>'; return; }
      const ok = picked.every((v, i) => v === i);
      msg.innerHTML = ok ? '<div class="msg ok">✅ Düzgündür! Kəşf → Plan → Kod → Yoxlama → Commit. Böyük işlərdə bu ardıcıllıq vaxta qənaət edir və səhvləri azaldır.</div>'
        : `<div class="msg bad">❌ Hələ yox. İpucu: kod yazmazdan əvvəl nə etmək lazımdır? Commit isə yalnız yoxlamadan sonra olur.</div>`;
      if (ok) api.done(3);
    };
    $('ordReset').onclick = reset;
    reset();
  })();

  // ================= CLAUDE.md qurucusu =================
  (() => {
    const ids = ['cmDesc', 'cmCmds', 'cmStyle', 'cmRules'];
    const lines = v => v.split('\n').map(s => s.trim()).filter(Boolean);
    function build() {
      const cmds = lines($('cmCmds').value).map(l => {
        const m = l.match(/^(.+?)\s+[—–-]\s+(.+)$/);
        return m ? `- \`${m[1].trim()}\`: ${m[2].trim()}` : `- \`${l}\``;
      });
      const md = ['# CLAUDE.md', '', '## Layihə', $('cmDesc').value.trim() || '(təsvir)', '',
        '## Əmrlər', ...(cmds.length ? cmds : ['- (əmrləri yazın)']), '',
        '## Kod üslubu', ...lines($('cmStyle').value).map(l => '- ' + l), '',
        '## Qaydalar', ...lines($('cmRules').value).map(l => '- ' + l)].join('\n');
      $('cmOut').textContent = md;
      return md;
    }
    ids.forEach(id => $(id).addEventListener('input', build));
    copyText($('cmCopy'), build);
    build();
  })();

  // ================= Kontekst simulyatoru =================
  (() => {
    let v = 0, peak = 0;
    const bar = $('cxBar'), txt = $('cxTxt'), msg = $('cxMsg'), log = [];
    function draw(note) {
      bar.style.width = v + '%';
      bar.style.background = v >= 80 ? 'var(--bad)' : v >= 60 ? 'var(--warn)' : 'var(--accent)';
      txt.textContent = v + '%';
      if (note) log.unshift(note);
      let m = '';
      if (v >= 100) m = '<div class="msg bad">Kontekst tam doldu! Claude söhbəti avtomatik sıxacaq və bəzi detallar itə bilər. Bundan əvvəl özünüz <b>/compact</b> etmək daha yaxşıdır.</div>';
      else if (v >= 80) m = '<div class="msg bad">Kontekst demək olar ki, dolub. İndi <b>/compact</b> (iş davam edirsə) və ya <b>/clear</b> (yeni mövzudursa) vaxtıdır.</div>';
      else if (v >= 60) m = '<div class="msg info">Kontekst yarıdan çoxdur. Böyük faylları və logları ehtiyatla əlavə edin.</div>';
      msg.innerHTML = m + `<div class="fb">${log.slice(0, 5).map(esc).join(' · ')}</div>`;
    }
    document.querySelectorAll('[data-cx]').forEach(b => b.onclick = () => {
      const a = b.dataset.cx;
      if (a === 'compact') { const before = v; v = Math.min(v, 12 + Math.round(v * 0.1)); draw(`/compact: ${before}% → ${v}%`); if (peak >= 70) api.done(6); return; }
      if (a === 'clear') { const before = v; v = 0; draw(`/clear: ${before}% → 0%`); if (peak >= 70) api.done(6); return; }
      const [n, label] = a.split('|');
      v = Math.min(100, v + +n); peak = Math.max(peak, v); draw(`${label} (+${n}%)`);
    });
    draw();
  })();

  // ================= Kartlar =================
  (() => {
    const CARDS = [
      ['/init', 'Layihəni təhlil edib CLAUDE.md yaradır'],
      ['/clear', 'Söhbəti tam təmizləyir. Yeni mövzuya keçəndə istifadə olunur'],
      ['/compact', 'Söhbəti xülasəyə çevirib konteksti boşaldır'],
      ['/context', 'Kontekstin nə qədər dolu olduğunu göstərir'],
      ['/resume', 'Köhnə söhbətlərdən birinə qayıdır'],
      ['/permissions', 'İcazə qaydalarını (allow/deny) idarə edir'],
      ['/agents', 'Subagentləri yaradır və idarə edir'],
      ['/mcp', 'Xarici alət serverlərinin vəziyyəti və girişi'],
      ['/hooks', 'Avtomatik qaydaları (hook-ları) idarə edir'],
      ['Shift+Tab', 'Rejimi dəyişir: adi → redaktələri qəbul et → plan'],
      ['Esc Esc', 'Geri qayıdır: əvvəlki mesajı redaktə etmək və ya kodu bərpa etmək'],
      ['!git status', 'Terminal əmrini birbaşa işə salır'],
      ['@src/app.js', 'Faylı tapşırığa birbaşa əlavə edir'],
      ['claude -p "…"', 'Headless rejim: söhbətsiz işləyir, skript və CI üçün'],
      ['claude --continue', 'Sonuncu söhbəti davam etdirir'],
    ];
    const seen = new Set(); const box = $('flashBox');
    box.innerHTML = CARDS.map(([f, b], i) => `<button data-i="${i}"><span class="front">${esc(f)}</span><span class="back" hidden>${esc(b)}</span></button>`).join('');
    box.querySelectorAll('button').forEach(btn => btn.onclick = () => {
      const open = btn.classList.toggle('open'); btn.querySelector('.back').hidden = !open;
      seen.add(btn.dataset.i);
      $('flashScore').textContent = `Açılan kartlar: ${seen.size} / ${CARDS.length}` + (seen.size === CARDS.length ? ' · Dərs tamamlandı ✓' : '');
      if (seen.size === CARDS.length) api.done(7);
    });
    $('flashScore').textContent = `Açılan kartlar: 0 / ${CARDS.length}`;
  })();

  // ================= Hook qurucusu =================
  (() => {
    const P = {
      fmt: ['PostToolUse', 'Edit|Write', `jq -r '.tool_input.file_path' | xargs npx prettier --write`, 'Claude hər faylı redaktə edəndən sonra həmin fayl Prettier ilə formatlanır. Hook alətin məlumatını JSON kimi alır, jq isə oradan fayl yolunu çıxarır.'],
      env: ['PreToolUse', 'Edit|Write', `jq -r '.tool_input.file_path' | grep -q '\\.env' && { echo '.env fayllarını dəyişmək qadağandır' >&2; exit 2; } || exit 0`, 'Redaktədən ƏVVƏL işləyir. Fayl adında .env varsa, hook 2 kodu ilə çıxır: əməliyyat bloklanır və səbəb Claude-a göndərilir.'],
      done: ['Stop', '', `notify-send 'Claude Code' 'İş bitdi'`, 'Claude cavabını bitirəndə masaüstü bildirişi göstərir (Linux). macOS-da: osascript -e \'display notification "İş bitdi" with title "Claude Code"\'.'],
      custom: ['PostToolUse', 'Bash', `echo "əmr işə düşdü" >> ~/.claude/hook.log`, 'Öz hook-unuzu qurun: hadisəni, matcher-i və əmri seçin.'],
    };
    const ev = $('hkEvent'), mt = $('hkMatch'), cm = $('hkCmd');
    function build() {
      const e = ev.value, tool = e === 'PreToolUse' || e === 'PostToolUse';
      mt.disabled = !tool;
      const entry = tool ? { matcher: mt.value || '*', hooks: [{ type: 'command', command: cm.value }] } : { hooks: [{ type: 'command', command: cm.value }] };
      const json = JSON.stringify({ hooks: { [e]: [entry] } }, null, 2);
      $('hkOut').textContent = '// .claude/settings.json\n' + json;
      return json;
    }
    function preset() {
      const p = P[$('hkPreset').value];
      ev.value = p[0]; mt.value = p[1]; cm.value = p[2]; $('hkWhy').textContent = p[3];
      build();
    }
    $('hkPreset').onchange = preset;
    [ev, mt, cm].forEach(x => x.addEventListener('input', build));
    ev.addEventListener('change', build);
    copyText($('hkCopy'), build);
    preset();
  })();

  // ================= Testlər =================
  const QUIZ = {
    intro: [
      { q: 'Claude Code-u adi çatdan fərqləndirən əsas cəhət nədir?', o: ['Daha uzun cavab yazır', 'Layihənin fayllarını özü oxuyur, redaktə edir və əmrləri işə salır', 'Yalnız ingilis dilində işləyir'], a: 1, e: 'Claude Code agentdir: layihənin içində işləyir və nəticəni özü yoxlaya bilir.' },
      { q: 'Claude Code harada işləyə bilər?', o: ['Yalnız terminalda', 'Terminal, IDE, masaüstü tətbiq, veb (bulud) və GitHub', 'Yalnız brauzerdə'], a: 1, e: 'Əsas forma terminaldır, amma eyni agent başqa yerlərdə də işləyir.' },
      { q: 'Claude Code ilə işdə hansı rol insanda qalmalıdır?', o: ['Heç biri, hər şeyi Claude edir', 'Məqsədi qoymaq, nəticəni yoxlamaq və vacib qərarları vermək', 'Yalnız kodu kopyalamaq'], a: 1, e: 'Claude icra edir, istiqaməti və məsuliyyəti isə siz daşıyırsınız.' },
      { q: 'Kodun işlədiyini kim yoxlaya bilər?', o: ['Yalnız insan', 'Claude Code testləri və build-i özü işə salıb nəticəyə baxa bilər', 'Heç kim'], a: 1, e: 'Yoxlama Claude Code-un güclü tərəfidir, sadəcə bunu ondan istəyin.' },
    ],
    setup: [
      { q: 'Claude Code hansı qovluqda işləyir?', o: ['Həmişə ev qovluğunda', 'İşə salındığı qovluqda', 'Təsadüfi qovluqda'], a: 1, e: 'Ona görə əvvəlcə “cd layihə-qovluğu”, sonra “claude” yazılır.' },
      { q: 'Claude səhv istiqamətə gedir. Nə etmək lazımdır?', o: ['Kompüteri söndürmək', 'Esc basıb dayandırmaq və düzgün göstəriş vermək', 'Gözləmək'], a: 1, e: 'Esc işi dayandırır, kontekst isə saxlanılır.' },
      { q: '“!npm test” nə edir?', o: ['Claude-dan testləri yazmasını istəyir', 'Əmri birbaşa terminalda işə salır', 'Testləri silir'], a: 1, e: '! prefiksi bash rejimidir.' },
      { q: '“@src/app.js” nə edir?', o: ['Faylı silir', 'Faylı tapşırığa əlavə edir, Claude onu oxuyur', 'Faylın adını dəyişir'], a: 1, e: '@ ilə faylları birbaşa göstərmək olur.' },
      { q: 'Esc düyməsini iki dəfə basmaq nə edir?', o: ['Proqramdan çıxır', 'Geri qayıdır: əvvəlki mesajı redaktə etmək və ya kodu əvvəlki vəziyyətə qaytarmaq', 'Heç nə'], a: 1, e: 'Bu, “geri sarma” imkanıdır.' },
    ],
    prompt: [
      { q: 'Hansı tapşırıq daha yaxşıdır?', o: ['“saytı yaxşılaşdır”', '“@index.html-də mobil menyu 390px enində üst-üstə düşür. Düzəlt, desktop görünüşə toxunma, sonra brauzerdə yoxla.”'], a: 1, e: 'Yer, problem, məhdudiyyət və yoxlama var.' },
      { q: 'Tapşırığa “verilənlər bazasının sxeminə toxunma” yazmaq nəyə aiddir?', o: ['Məqsədə', 'Məhdudiyyətə', 'Yoxlamaya'], a: 1, e: 'Məhdudiyyətlər Claude-un gözlənilməz yerləri dəyişməsinin qarşısını alır.' },
      { q: 'UI xətasını izah etməyin ən sürətli yolu hansıdır?', o: ['Uzun mətnlə təsvir etmək', 'Ekran şəklini yapışdırıb qısa izah yazmaq'], a: 1, e: 'Claude şəkilləri görür, şəkil çox vaxt min sözə dəyər.' },
      { q: '“Qızıl qayda” nədir?', o: ['Tapşırıq nə qədər qısa olsa, o qədər yaxşı', 'Tapşırığı yeni bacarıqlı həmkara verirmiş kimi yaz: ona nə izah edərdinsə, onu yaz'], a: 1, e: 'Claude yazmadığınız konteksti bilmir.' },
      { q: 'Tapşırığın sonuna “npm test işə sal” əlavə etmək nə verir?', o: ['Heç nə', 'Claude öz işini yoxlayır və xətanı özü tapıb düzəldə bilir'], a: 1, e: 'Yoxlama meyarı olan Claude daha etibarlı nəticə verir.' },
    ],
    flow: [
      { q: 'Böyük dəyişiklikdən əvvəl hansı rejim ən faydalıdır?', o: ['bypassPermissions', 'Plan rejimi', 'Heç biri'], a: 1, e: 'Plan rejimində Claude yalnız oxuyur və plan təklif edir.' },
      { q: 'TDD yanaşmasında Claude-a nə deyilir?', o: ['“Kodu yaz, test lazım deyil”', '“Əvvəlcə testləri yaz, uğursuz olduqlarını göstər, sonra kodu elə yaz ki, keçsinlər, testləri dəyişmə”'], a: 1, e: 'Testlər Claude üçün aydın hədəfdir.' },
      { q: 'Kəşf mərhələsində niyə “hələ heç nə dəyişmə” deyilir?', o: ['Claude-u yormamaq üçün', 'Claude-un kodu anlamadan tələsik dəyişiklik etməsinin qarşısını almaq üçün'], a: 1, e: 'Əvvəlcə anlamaq, sonra dəyişmək.' },
      { q: 'Commit nə vaxt edilməlidir?', o: ['Kod yazılan kimi', 'Yoxlama (testlər, brauzer) uğurla keçəndən sonra'], a: 1, e: 'Yoxlanılmamış kodu commit etmək problemləri gələcəyə ötürmək deməkdir.' },
    ],
    perm: [
      { q: 'İlk dəfə tanımadığınız layihədə işləyirsiniz. Hansı rejim?', o: ['Adi (default): hər riskli addımda soruşur', 'bypassPermissions'], a: 0, e: 'Tanımadığınız mühitdə nəzarət sizdə olmalıdır.' },
      { q: 'Rutin, kiçik CSS düzəlişləri edirsiniz və Claude-a güvənirsiniz. Hansı rejim?', o: ['acceptEdits: redaktələri avtomatik qəbul et', 'Plan'], a: 0, e: 'Fayl redaktələri soruşulmur, əmrlər isə yenə soruşulur.' },
      { q: '“Heç nə soruşma” (bypassPermissions) rejimi harada məqbuldur?', o: ['İş kompüterində, əsas layihədə', 'Təcrid olunmuş konteyner və ya sınaq mühitində'], a: 1, e: 'Səhv əmr ancaq atılacaq bir mühitə zərər verə bilər.' },
      { q: '.env faylını Claude-dan qorumaq üçün nə yazılır?', o: ['"allow": ["Read(./.env)"]', '"deny": ["Read(./.env)"]'], a: 1, e: 'deny siyahısı oxunuşu qadağan edir.' },
      { q: 'Layihənin icazə qaydalarını yalnız özünüz üçün (git-ə düşmədən) harada saxlamaq olar?', o: ['.claude/settings.json', '.claude/settings.local.json'], a: 1, e: 'settings.local.json şəxsidir, settings.json isə komanda ilə paylaşılır.' },
    ],
    mem: [
      { q: 'CLAUDE.md nə vaxt oxunur?', o: ['Yalnız siz istəyəndə', 'Hər sessiyanın əvvəlində avtomatik'], a: 1, e: 'Bu, Claude-un “işə başlama təlimatı”dır.' },
      { q: 'Hansı CLAUDE.md-yə yazılmamalıdır?', o: ['Test əmri', 'Verilənlər bazasının parolu', 'Kod üslubu'], a: 1, e: 'CLAUDE.md git-ə düşür. Parollar orada olmamalıdır.' },
      { q: '“Cavabları həmişə Azərbaycanca yaz” qaydası bütün layihələr üçün harada yazılmalıdır?', o: ['~/.claude/CLAUDE.md', './CLAUDE.md'], a: 0, e: 'Şəxsi, bütün layihələrə aid qaydalar ev qovluğundakı fayla yazılır.' },
      { q: 'Layihə üçün ilkin CLAUDE.md-ni hansı əmr yaradır?', o: ['/init', '/clear', '/compact'], a: 0, e: '/init layihəni təhlil edib ilkin faylı yaradır.' },
      { q: 'CLAUDE.md niyə qısa olmalıdır?', o: ['Fərqi yoxdur', 'Hər sessiyada kontekstdə yer tutur, vacib qaydalar uzun mətndə itə bilər'], a: 1, e: 'Qısa və konkret qaydalar daha yaxşı işləyir.' },
    ],
    ctx: [
      { q: 'Login xətasını bitirdiniz, indi tamam başqa işə keçirsiniz. Nə edirsiniz?', o: ['/clear', 'Heç nə, davam edirəm'], a: 0, e: 'Bir sessiya, bir mövzu. Köhnə kontekst yeni işə mane olur.' },
      { q: 'Uzun refaktorinqin ortasındasınız, kontekst 85%-dir. Nə edirsiniz?', o: ['/clear', '/compact'], a: 1, e: '/compact işin vacib detallarını xülasədə saxlayır.' },
      { q: 'Dünənki söhbəti davam etdirmək üçün:', o: ['claude --continue və ya claude --resume', '/init'], a: 0, e: '--continue sonuncu söhbəti, --resume isə seçdiyinizi açır.' },
      { q: '5000 sətirlik logu təhlil etmək lazımdır. Ən yaxşı yol:', o: ['Hamısını mesaja yapışdırmaq', 'Claude-a faylın yerini deyib lazım olan hissəni axtarmasını istəmək'], a: 1, e: 'Claude lazım olanı özü tapır, kontekst isə dolmur.' },
    ],
    cmds: [
      { q: 'Skill-in əsas faylının adı nədir?', o: ['SKILL.md', 'README.md', 'skill.json'], a: 0, e: '.claude/skills/<ad>/SKILL.md' },
      { q: 'Skill-in frontmatter-indəki “description” nə üçündür?', o: ['Bəzək üçün', 'Claude ondan skill-in nə vaxt lazım olduğunu anlayır'], a: 1, e: 'Yaxşı təsvir skill-in düzgün anda işə düşməsini təmin edir.' },
      { q: '.claude/commands/fix-issue.md faylında $ARGUMENTS nədir?', o: ['Əmrdən sonra yazılan mətn, məs. /fix-issue 123 → 123', 'Xəta'], a: 0, e: 'Arqumentlər mətndə $ARGUMENTS yerinə qoyulur.' },
      { q: 'Komanda skill-ləri necə paylaşır?', o: ['.claude/skills qovluğunu git-ə əlavə edərək', 'E-poçtla'], a: 0, e: 'Layihə qovluğundakı skill-lər hamıya əlçatandır.' },
    ],
    agents: [
      { q: 'Subagentin əsas üstünlüyü nədir?', o: ['Daha ucuzdur', 'Öz ayrıca konteksti var, əsas söhbətə yalnız nəticəni qaytarır'], a: 1, e: 'Əsas kontekst təmiz qalır.' },
      { q: 'Subagent faylı harada saxlanılır?', o: ['.claude/agents/<ad>.md', 'CLAUDE.md-nin içində'], a: 0, e: 'Frontmatter-də name, description, tools, model yazılır.' },
      { q: 'Kod yoxlaması üçün ayrıca subagent niyə faydalıdır?', o: ['Kodu yazan deyil, təmiz kontekstlə baxır, “ikinci göz” rolunu oynayır', 'Faydalı deyil'], a: 0, e: 'İnsan komandalarındakı kod yoxlamasına bənzəyir.' },
      { q: 'Subagentin “tools” sahəsi nə üçündür?', o: ['Onun hansı alətlərdən istifadə edə biləcəyini məhdudlaşdırmaq üçün', 'Rəngini seçmək üçün'], a: 0, e: 'Məs. yalnız oxuyan subagentə Write vermək lazım deyil.' },
    ],
    hooks: [
      { q: 'CLAUDE.md qaydası ilə hook-un fərqi nədir?', o: ['Fərq yoxdur', 'CLAUDE.md xahişdir, unudula bilər. Hook həmişə avtomatik işləyir'], a: 1, e: 'Mütləq olmalı olan şeyləri hook-a verin.' },
      { q: 'Redaktədən SONRA formatlamaq üçün hansı hadisə?', o: ['PreToolUse', 'PostToolUse', 'SessionStart'], a: 1, e: 'Post = alət işini bitirəndən sonra.' },
      { q: 'Təhlükəli əmri bloklamaq üçün PreToolUse hook-u hansı kodla çıxmalıdır?', o: ['0', '2'], a: 1, e: '2 kodu əməliyyatı bloklayır və stderr-dəki səbəbi Claude-a çatdırır.' },
      { q: 'Başqasının yazdığı hook-u quraşdırmazdan əvvəl nə etmək lazımdır?', o: ['Heç nə', 'Oxuyub nə etdiyini anlamaq, çünki sizin hüquqlarınızla işləyir'], a: 1, e: 'Hook kompüterinizdə istənilən əmri işə sala bilər.' },
    ],
    mcp: [
      { q: 'MCP nədir?', o: ['Proqramlaşdırma dili', 'Claude-u xarici sistemlərə qoşmaq üçün açıq standart'], a: 1, e: 'Model Context Protocol.' },
      { q: 'Komanda ilə paylaşılan MCP konfiqurasiyası hansı faylda olur?', o: ['.mcp.json', 'CLAUDE.md'], a: 0, e: 'project scope .mcp.json-a yazılır.' },
      { q: 'Verilənlər bazası MCP serverinə necə qoşulmaq daha təhlükəsizdir?', o: ['Admin hüquqları ilə', 'Yalnız oxumaq hüququ olan istifadəçi ilə'], a: 1, e: 'Ən az lazım olan hüquq prinsipi.' },
      { q: 'Sessiya daxilində MCP serverlərinin vəziyyətinə hansı əmrlə baxılır?', o: ['/mcp', '/init'], a: 0, e: '/mcp həm də giriş tələb edən serverlərə qoşulmağa kömək edir.' },
    ],
    auto: [
      { q: '“claude -p” nə edir?', o: ['Plan rejimini açır', 'Söhbətsiz (headless) işləyir: tapşırığı alır, nəticəni çap edir'], a: 1, e: 'Skriptlər və CI üçün.' },
      { q: '“cat error.log | claude -p \"…\"” nə deməkdir?', o: ['Log faylı Claude-a giriş kimi ötürülür', 'Log silinir'], a: 0, e: 'Unix pipe ilə başqa əmrlərin çıxışını ötürmək olur.' },
      { q: 'GitHub-da Claude-a tapşırıq vermək üçün:', o: ['Issue və ya PR-da @claude yazmaq (GitHub tətbiqi quraşdırılıbsa)', 'Mümkün deyil'], a: 0, e: '/install-github-app ilə quraşdırılır.' },
      { q: 'Bulud sessiyasının üstünlüyü nədir?', o: ['Kompüteriniz söndürülü olsa da iş davam edir, telefondan izləmək olar', 'Daha az təhlükəsizdir'], a: 0, e: 'İş təcrid olunmuş konteynerdə gedir.' },
    ],
    case: [
      { q: 'Sayt açılmayanda Claude nə etdi?', o: ['Saytın məzmununu uydurdu', 'Açılmadığını açıq dedi və öz bilikləri ilə davam etdi'], a: 1, e: 'Problemi gizlətməmək etibarın əsasıdır.' },
      { q: 'Digital Nation-ın əsas branch-ına göndərmək məsələsində düzgün davranış hansı idi?', o: ['Soruşmadan göndərmək', 'Əvvəlcə soruşmaq, “xeyr” cavabından sonra dəyişikliyi geri almaq'], a: 1, e: 'Geri qaytarılması çətin addımlarda qərarı insan verir.' },
      { q: 'Dərc uğursuz olanda düzgün diaqnostika necə aparıldı?', o: ['Səbəb təxmin edildi', 'Xəta logu oxundu, səbəb (Pages aktiv deyil) tapıldı və seçimlər izah edildi'], a: 1, e: 'Logu oxu, təxmin etmə.' },
      { q: 'Bu kursun əlavə olunmasını nə asanlaşdırdı?', o: ['Təsadüf', 'README-də yazılmış təlimat, yəni sessiyalar arası yaddaş'], a: 1, e: 'CLAUDE.md və README biliyi növbəti sessiyaya ötürür.' },
    ],
    final: [
      { q: 'Claude Code nədir?', o: ['Kod redaktoru', 'Layihənizdə işləyən agent: oxuyur, redaktə edir, əmrləri işə salır'], a: 1, e: 'Agentdir.' },
      { q: 'Claude-u dayandırmaq üçün:', o: ['Esc', 'Ctrl+S'], a: 0, e: 'Esc.' },
      { q: 'Rejimi dəyişmək üçün:', o: ['Shift+Tab', 'Ctrl+Z'], a: 0, e: 'Adi → redaktələri qəbul et → plan.' },
      { q: 'Böyük dəyişiklikdən əvvəl ən yaxşı addım:', o: ['Plan rejimində plan istəmək', 'Dərhal kod yazdırmaq'], a: 0, e: 'Kəşf → plan → kod.' },
      { q: 'Yaxşı tapşırıqda hansı element ən çox unudulur, amma vacibdir?', o: ['Salam vermək', 'Yoxlama meyarı (“testləri işə sal”)'], a: 1, e: 'Yoxlama nəticəni etibarlı edir.' },
      { q: 'CLAUDE.md-nin rolu:', o: ['Layihə qaydalarını hər sessiyanın əvvəlində Claude-a vermək', 'Parolları saxlamaq'], a: 0, e: 'Yaddaşdır.' },
      { q: 'Yeni mövzuya keçəndə:', o: ['/clear', '/init'], a: 0, e: 'Bir sessiya, bir mövzu.' },
      { q: 'Uzun işin ortasında kontekst dolub:', o: ['/compact', '/exit'], a: 0, e: 'Xülasə edib davam edin.' },
      { q: '.env faylını qorumaq üçün:', o: ['permissions.deny-ə Read(./.env) əlavə etmək', 'CLAUDE.md-də xahiş etmək kifayətdir'], a: 0, e: 'Qayda məcburidir, xahiş isə yox.' },
      { q: 'Hər redaktədən sonra avtomatik formatlama üçün:', o: ['PostToolUse hook-u', 'Subagent'], a: 0, e: 'Hook həmişə işləyir.' },
      { q: 'Böyük kod bazasında axtarışı kontekst dolmadan etmək üçün:', o: ['Subagent (məs. Explore)', '/clear'], a: 0, e: 'Subagent nəticəni qısa şəkildə qaytarır.' },
      { q: 'Claude-u GitHub, verilənlər bazası və ya brauzerə qoşmaq üçün:', o: ['MCP', 'CLAUDE.md'], a: 0, e: 'claude mcp add …' },
      { q: 'CI skriptində Claude Code-u işlətmək üçün:', o: ['claude -p "…"', 'claude --resume'], a: 0, e: 'Headless rejim.' },
      { q: 'Təkrarlanan iş axınını (məs. PR yoxlaması) komanda ilə paylaşmaq üçün:', o: ['.claude/skills/…/SKILL.md', 'Hər dəfə eyni promptu yazmaq'], a: 0, e: 'Skill.' },
      { q: 'Claude geri qaytarılması çətin addım (məs. əsas branch-a push) etmək istəyəndə düzgün davranış:', o: ['Soruşmadan etmək', 'İnsanın təsdiqini almaq'], a: 1, e: 'Vacib qərarlar insanda qalır.' },
    ],
  };
  api.quizzes(QUIZ);
});
