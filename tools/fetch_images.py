"""Kurs şəkillərini Wikimedia Commons-dan yükləyir (GitHub Actions-da işləyir).

tools/images.json: {"<kurs>": {"<ad>": "File:<Commons faylı>"}}
Nəticə: courses/<kurs>/img/<ad>.jpg və courses/<kurs>/img/credits.json
(müəllif, lisenziya, mənbə linki). Tapılmayan fayllar ötürülür və loga yazılır.
"""
import json, os, re, sys, time, urllib.parse, urllib.request

UA = {"User-Agent": "AkademiyaCourseImages/1.0 (https://github.com/tardigrade23/akademiya; educational)"}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get(url, tries=4):
    for i in range(tries):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except urllib.error.HTTPError as e:
            if e.code == 429 and i < tries - 1:
                time.sleep(int(e.headers.get("retry-after", "30")) + 2)
                continue
            raise


def clean(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html or "")).strip()


spec = json.load(open(os.path.join(ROOT, "tools", "images.json"), encoding="utf-8"))
missing = []
for course, items in spec.items():
    outdir = os.path.join(ROOT, "courses", course, "img")
    os.makedirs(outdir, exist_ok=True)
    q = urllib.parse.urlencode({
        "action": "query", "titles": "|".join(items.values()), "prop": "imageinfo",
        "iiprop": "url|extmetadata", "iiurlwidth": "520", "format": "json",
    })
    data = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q))
    norm = {n["from"]: n["to"] for n in data["query"].get("normalized", [])}
    pages = {p["title"]: p for p in data["query"]["pages"].values()}
    credits = {}
    for name, title in items.items():
        p = pages.get(norm.get(title, title))
        if not p or "imageinfo" not in p:
            missing.append(title)
            continue
        ii = p["imageinfo"][0]
        md = ii.get("extmetadata", {})
        img = get(ii["thumburl"])
        open(os.path.join(outdir, name + ".jpg"), "wb").write(img)
        credits[name] = {
            "title": title[5:],
            "artist": clean(md.get("Artist", {}).get("value"))[:120],
            "license": clean(md.get("LicenseShortName", {}).get("value")),
            "source": ii.get("descriptionurl"),
        }
        print("ok", name, credits[name]["license"], len(img), "bytes")
        time.sleep(1)
    json.dump(credits, open(os.path.join(outdir, "credits.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)

if missing:
    print("TAPILMADI:", *missing, sep="\n  ")
