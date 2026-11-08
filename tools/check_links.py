# Checks every link in data/extras.json (the "Əlavə oxu" lists) and prints its HTTP status.
#   python3 tools/check_links.py
# Run from the Actions tab (workflow "Check reading links"); a non-zero exit means a link is broken.
import json
import pathlib
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
data = json.loads((ROOT / 'data' / 'extras.json').read_text(encoding='utf-8'))
urls = sorted({r['u'] for c in data.values() for r in c.get('reading', []) if r.get('u')})
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
bad = 0
for u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': UA, 'Accept': 'text/html,*/*'})
        with urllib.request.urlopen(req, timeout=25) as r:
            code, final = r.status, r.geturl()
    except urllib.error.HTTPError as e:
        code, final = e.code, u
    except Exception as e:  # noqa: BLE001
        code, final = type(e).__name__, u
    ok = code == 200 or code in (401, 403, 429)  # some sites refuse bots but exist
    bad += not ok
    print(f"{'OK ' if ok else 'BAD'} {code} {u}" + (f" -> {final}" if final != u else ''))
print(f'{len(urls)} links, {bad} broken')
sys.exit(1 if bad else 0)
