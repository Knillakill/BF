import json, re, os, sys
sys.stdout.reconfigure(encoding="utf-8")
C=json.load(open("yt_all/candidates.json",encoding="utf-8"))
st=json.load(open("yt_all/status.json",encoding="utf-8"))
order=open("yt_all/order.txt").read().split()
B={"Prince":r"\bprin[cz]e?\b|prinzen|principe|książ",
   "Soul Huntress":r"soul ?hunt|seelenj|chasseuse|cacciatrice",
   "Aether Dragon":r"a?ether|äther|ether ?drag|drago",
   "Stone Golem":r"golem",
   "3-Headed Ogre":r"\bogre|\boger|orco|ogr\b",
   "Tentacolossus":r"tenta[ck]ol",
   "Magmaros":r"magmar",
   "Bombossa":r"bomboss",
   "Jelly":r"\bjelly|gelee|gelée|glibber|schleim",
   "Madame Voodoo":r"voodoo|vaudou|vudu",
   "Jungle Fever":r"jungle|dschungel",
   "Elite mode":r"\belite"}
def typ(t):
    t=t.lower(); out=[]
    for k,p in [("rules",r"rule|regel|règle|tutorial|how to|comment jouer|anleitung|zasad|jak grać|guide|erklär"),("play",r"play|gameplay|partie|spiel(en|t)|let'?s|rozgryw|partida|live"),("review",r"review|avis|critique|test|opinion|recensione|reseña|ersteindruck|look|discussion|hype|good|gut"),("unboxing",r"unbox|ausgepackt|inside"),("interview/dev",r"interview|palm|zach|creators|entwicklung"),("teaser/news",r"teaser|nominat|neuheit|news|release|premiery|toy fair|gen con|song")]:
        if re.search(p,t): out.append(k)
    return ",".join(out) or "-"
rows=[]; cnt={"ok":0,"none":0,"err":0,"pending":0}
for vid in order:
    v=C[vid]; s=st.get(vid,{}); status=s.get("status","pending"); cnt[status]=cnt.get(status,0)+1
    lang=s.get("lang","?")
    if s.get("src")=="prev":
        lang="(prev)"
    bosses=""
    if status=="ok":
        txt=open(f"yt_all/{vid}.txt",encoding="utf-8").read().lower()
        hits=[k for k,p in B.items() if len(re.findall(p,txt))>=2]
        bosses=", ".join(hits)
    d=v.get("duration"); dur=f"{int(d)//60}:{int(d)%60:02d}" if d else "?"
    stt={"ok":"OK","none":"no captions","err":"failed: "+s.get("err","")[:40],"pending":"pending"}[status]
    title=(v["title"] or "").replace("|","/")
    rows.append(f"| [{vid}](https://youtu.be/{vid}) | {title} | {(v.get('channel') or '').replace('|','/')} | {lang} | {dur} | {typ(v['title'] or '')} | {bosses} | {stt} | {s.get('size','')} |")
hdr=f"""# Boss Fighters QR - video transcripts index

Found: {len(order)} | transcribed: {cnt['ok']} | no captions/unavailable: {cnt['none']} | failed: {cnt.get('err',0)} | pending: {cnt.get('pending',0)}

Files: `<id>.txt` = raw timestamped captions (line 1 = title / channel / language / URL); `para/<id>.txt` = paragraphs with [mm:ss] every ~40 s.
Titles are as returned by YouTube search (often auto-translated to English). Language = caption track used (auto = YouTube ASR). "(prev)" = copied from earlier run (yt/ folder).
Bosses column = boss names mentioned at least twice in the transcript (keyword heuristic, ASR may garble names; not proof the fight is shown).

| ID | Title | Channel | Lang | Duration | Type (from title) | Bosses mentioned | Transcript | Bytes |
|---|---|---|---|---|---|---|---|---|
"""
open("yt_all/INDEX.md","w",encoding="utf-8").write(hdr+"\n".join(rows)+"\n")
print(cnt)
