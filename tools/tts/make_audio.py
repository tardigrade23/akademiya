"""Dərslər üçün Azərbaycan dilində səs faylları yaradır (Meta MMS-TTS, açıq model).

    python3 tools/tts/make_audio.py                 # bütün dərslər (artıq olanları ötür)
    python3 tools/tts/make_audio.py mentiq:0,kvant:2 # yalnız göstərilən dərslər (0-dan sayılır)

Nəticə: courses/<kurs>/audio/<dərs>.mp3 və courses/<kurs>/audio/index.json
(hər dərs üçün müddət və abzasların vaxtları; pleyer oxunan abzası bunlarla işıqlandırır).
GitHub Actions-da işləyir (.github/workflows/tts.yml): model internetdən yüklənir.
"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np
from bs4 import BeautifulSoup

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
MODEL_IDS = ['facebook/mms-tts-azj-script_latin', 'facebook/mms-tts-aze']
SKIP_CARD = re.compile(r'laboratoriya|alət|simulyator|məşq|oyun|tapşırıq|kalkulyator|generator|yoxlayıcı|qurucu|kartlar|kətan|test', re.I)

ONES = ['sıfır', 'bir', 'iki', 'üç', 'dörd', 'beş', 'altı', 'yeddi', 'səkkiz', 'doqquz']
TENS = ['', 'on', 'iyirmi', 'otuz', 'qırx', 'əlli', 'altmış', 'yetmiş', 'səksən', 'doxsan']


def num(n):
    n = int(n)
    if n == 0: return 'sıfır'
    out = []
    for val, name in ((10**9, 'milyard'), (10**6, 'milyon'), (1000, 'min')):
        if n >= val:
            q, n = divmod(n, val)
            out.append(name if (q == 1 and val == 1000) else num(q) + ' ' + name)
    if n >= 100:
        q, n = divmod(n, 100); out.append('yüz' if q == 1 else ONES[q] + ' yüz')
    if n >= 10:
        q, n = divmod(n, 10); out.append(TENS[q])
    if n: out.append(ONES[n])
    return ' '.join(out)


def ordinal(word):
    vowels = [c for c in word if c in 'aıoueəiöü']
    v = vowels[-1] if vowels else 'i'
    suf = {'a': 'ıncı', 'ı': 'ıncı', 'o': 'uncu', 'u': 'uncu', 'ö': 'üncü', 'ü': 'üncü'}.get(v, 'inci')
    return word + (suf[1:] if word[-1] in 'aıoueəiöü' else suf)


LETTER = dict(zip('ABCÇDEƏFGĞHXIİJKQLMNOÖPRSŞTUÜVYZW', 'a be ce çe de e ə ef ge ğe ha xe i i je ka qe el em en o ö pe er es şe te u ü ve ye ze dubl-ve'.split()))
WORDS = {'ASAN', 'NASA', 'OWASP', 'NIST', 'ENIAC', 'AGI'}
REPL = [ ('AB ', 'Avropa İttifaqı '), ('e.ə.', 'eramızdan əvvəl'), ('məs.', 'məsələn'), ('və s.', 'və sairə'),
        ('|0⟩', ' sıfır vəziyyəti '), ('|1⟩', ' bir vəziyyəti '), ('|+⟩', ' plyus vəziyyəti '), ('|−⟩', ' minus vəziyyəti '), ('⟩', ' '), ('|', ' '),
        ('¬', ' deyil '), ('∧', ' və '), ('∨', ' və ya '), ('↔', ' ancaq və ancaq '), ('→', ' onda '), ('≡', ' ekvivalentdir '), ('⊢', ' deməli '),
        ('∀', ' bütün '), ('∃', ' elə var ki '), ('≈', ' təxminən '), ('×', ' vurulsun '), ('√', ' kök '), ('²', ' kvadrat'), ('⊕', ' iks or '),
        ('₼', ' manat'), ('&', ' və '), ('=', ' bərabərdir '), ('+', ' üstəgəl '), ('…', '.'), ('—', ', '), ('–', ', ')]


def normalize(t):
    t = re.sub(r'[\U0001F000-\U0001FAFF☀-➿️]', ' ', t)  # emoji
    t = re.sub(r'Sİ-?([nyNY]?)(\w*)', lambda m: 'süni intellekt' + m.group(2), t)  # Sİ-nin -> süni intellektin
    for a, b in REPL: t = t.replace(a, b)
    t = re.sub(r'\$\s?(\d[\d ,.]*)', r'\1 dollar', t)
    t = re.sub(r'(\d+)\s?%', lambda m: m.group(1) + ' faiz', t)
    t = re.sub(r'(\d+)-(?:ci|cı|cu|cü|inci|ıncı|uncu|üncü)\b', lambda m: ordinal(num(m.group(1))), t)
    t = re.sub(r'(\d+)[.,](\d+)', lambda m: num(m.group(1)) + ' tam ' + ' '.join(ONES[int(c)] for c in m.group(2)), t)
    t = re.sub(r'(\d+)-(\w)', lambda m: num(m.group(1)) + m.group(2), t)  # 5-dən -> beşdən
    t = re.sub(r'\d+', lambda m: ' ' + num(m.group(0)) + ' ', t)
    t = re.sub(r'\b([A-ZƏÇŞĞÖÜİ]{2,6})\b', lambda m: m.group(1) if m.group(1) in WORDS else ' '.join(LETTER.get(c, c) for c in m.group(1)), t)
    t = re.sub(r'(\w)-(\w{1,5})\b', r'\1\2', t)  # faiz-i -> faizi
    t = t.replace('ⁿ', ' üstü en')
    t = re.sub(r'[“”"«»()\[\]{}*_#/\\<>~^`]', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t


def segments(section, title, keys):
    segs = [(title, 'title')]
    cards = section.select('.card')
    for ci, card in enumerate(cards):
        h = card.find(['h2', 'h3'])
        if ci > 0 and (card.select_one('.quiz') or (h and SKIP_CARD.search(h.get_text()))): continue
        for el in card.find_all(['h3', 'p', 'li', 'span', 'div']):
            if el.find_parent(['table', 'figure', 'button', 'label', 'pre', 'svg']) or el.find_parent(class_='quiz'): continue
            anc = el.find_parent(attrs={'id': True})
            if el.get('id') or (anc is not None and anc is not card and card in anc.parents): continue  # dinamik çıxışlar
            cls = el.get('class') or []
            if el.name == 'span' and 'tag' not in cls: continue
            if el.name == 'div' and 'note' not in cls: continue
            if el.name == 'li' and el.find('p'): continue
            if el.name in ('p', 'li', 'span') and el.find_parent(class_='note'): continue
            txt = re.sub(r'\s+', ' ', el.get_text(' ')).strip()
            if len(txt) < 2: continue
            segs.append((txt, el.name))
    if keys:
        segs.append(('Əsas fikirlər.', 'h3'))
        segs += [(k, 'li') for k in keys]
    return segs


def main():
    import torch
    from transformers import VitsModel, AutoTokenizer
    model = tok = None
    for mid in MODEL_IDS:
        try:
            tok = AutoTokenizer.from_pretrained(mid); model = VitsModel.from_pretrained(mid); print('model:', mid); break
        except Exception as e:  # noqa: BLE001
            print('model unavailable:', mid, type(e).__name__)
    if model is None: sys.exit('no model')
    model.eval(); torch.manual_seed(7)
    sr = model.config.sampling_rate
    vocab = tok.get_vocab(); print('vocab:', ''.join(sorted(k for k in vocab if len(k) == 1)))

    only = {}
    if len(sys.argv) > 1 and sys.argv[1]:
        for x in sys.argv[1].split(','):
            c, l = x.split(':'); only.setdefault(c, set()).add(int(l))
    cat = json.load(open(os.path.join(ROOT, 'courses/catalog.json')))['courses']
    keys = json.load(open(os.path.join(ROOT, 'data/keys.json')))
    for c in cat:
        cid = c['id']
        if only and cid not in only: continue
        soup = BeautifulSoup(open(os.path.join(ROOT, f'courses/{cid}/lessons.html'), encoding='utf-8').read(), 'html.parser')
        outdir = os.path.join(ROOT, f'courses/{cid}/audio'); os.makedirs(outdir, exist_ok=True)
        ipath = os.path.join(outdir, 'index.json')
        index = json.load(open(ipath)) if os.path.exists(ipath) else {}
        for l, sec in enumerate(soup.select('section.lesson')):
            if only and l not in only[cid]: continue
            if not only and str(l) in index and os.path.exists(os.path.join(outdir, f'{l}.mp3')): continue
            if not (keys.get(cid) or [None] * 999)[l]: continue  # yekun imtahan
            segs = segments(sec, sec.get('data-title', ''), keys[cid][l])
            pcm, marks, t = [], [], 0.0
            for txt, kind in segs:
                spoken = normalize(txt)
                if not re.search(r'\w', spoken): continue
                with torch.no_grad():
                    wav = model(**tok(spoken.lower(), return_tensors='pt')).waveform[0].numpy()
                gap = 0.6 if kind in ('title', 'h3') else 0.35
                pcm.append(wav); pcm.append(np.zeros(int(sr * gap), dtype=np.float32))
                d = len(wav) / sr
                marks.append([round(t, 2), round(t + d, 2), txt[:160]])
                t += d + gap
            audio = np.concatenate(pcm)
            audio = audio / max(1e-6, float(np.abs(audio).max())) * 0.9
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                w = wave.open(f.name, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
                w.writeframes((audio * 32767).astype(np.int16).tobytes()); w.close()
                subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', f.name, '-ac', '1', '-b:a', '32k', os.path.join(outdir, f'{l}.mp3')], check=True)
                os.unlink(f.name)
            index[str(l)] = {'d': round(t, 1), 's': marks}
            json.dump(index, open(ipath, 'w'), ensure_ascii=False)
            print(f'{cid}:{l} {len(marks)} abzas, {t/60:.1f} dəq')


if __name__ == '__main__':
    main()
