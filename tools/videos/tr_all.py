import sys, json, time, os, random, re
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, sys.argv[1])
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
api = YouTubeTranscriptApi()
C = json.load(open("yt_all/candidates.json", encoding="utf-8"))
SP = "yt_all/status.json"
st = json.load(open(SP, encoding="utf-8")) if os.path.exists(SP) else {}
os.makedirs("yt_all/para", exist_ok=True)
def save(): json.dump(st, open(SP, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
def fmt(s): s=int(s); return f"{s//60}:{s%60:02d}"
def write(vid, v, lang, segs):
    hdr = f"{v['title']} | {v.get('channel')} | {lang} | https://www.youtube.com/watch?v={vid}\n"
    with open(f"yt_all/{vid}.txt", "w", encoding="utf-8") as f:
        f.write(hdr)
        for start, text in segs: f.write(f"[{fmt(start)}] {text}\n")
    paras=[]; cur=None; buf=[]
    for start, text in segs:
        if cur is None or start-cur>=40:
            if buf: paras.append(f"[{fmt(cur)}] "+" ".join(buf))
            cur=start; buf=[]
        buf.append(text.replace("\n"," ").strip())
    if buf: paras.append(f"[{fmt(cur)}] "+" ".join(buf))
    with open(f"yt_all/para/{vid}.txt","w",encoding="utf-8") as f:
        f.write(hdr+"\n"+"\n\n".join(paras)+"\n")
    return os.path.getsize(f"yt_all/{vid}.txt")
order = sys.argv[2:] or list(C)
for vid in order:
    v = C.get(vid, {"title":vid,"channel":None})
    if st.get(vid,{}).get("status") in ("ok","none"): continue
    # reuse existing
    if os.path.exists(f"yt/{vid}.txt"):
        segs=[]
        for line in open(f"yt/{vid}.txt",encoding="utf-8"):
            m=re.match(r"\[(\d+):(\d+)\] (.*)",line.rstrip("\n"))
            if m: segs.append((int(m[1])*60+int(m[2]), m[3]))
        size=write(vid,v,"?(prev run)",segs); st[vid]={"status":"ok","lang":"?","size":size,"src":"prev"}; save(); print(vid,"reused",flush=True); continue
    for attempt in range(40):
        try:
            tl = api.list(vid)
            tracks=list(tl); langs=[(t.language_code,t.is_generated) for t in tracks]
            gen=[t for t in tracks if t.is_generated]
            if len(gen)>1:
                gen.sort(key=lambda t:(t.language_code!='fr', t.language_code=='en'))
            tr = gen[0] if gen else tracks[0]
            data = tr.fetch()
            segs=[(s.start, s.text) for s in data]
            size=write(vid,v,tr.language_code+(" (auto)" if tr.is_generated else " (manual)"),segs)
            st[vid]={"status":"ok","lang":tr.language_code,"gen":tr.is_generated,"tracks":langs,"size":size}
            print(vid,"ok",tr.language_code,size,flush=True); break
        except (TranscriptsDisabled, NoTranscriptFound) as e:
            st[vid]={"status":"none","err":type(e).__name__}; print(vid,"NONE",type(e).__name__,flush=True); break
        except VideoUnavailable as e:
            st[vid]={"status":"none","err":"VideoUnavailable"}; print(vid,"UNAVAIL",flush=True); break
        except Exception as e:
            msg=f"{type(e).__name__} {str(e)[:200]}"
            print(vid,"ERR",attempt,msg.replace("\n"," "),flush=True)
            st[vid]={"status":"err","err":msg}
            if re.search(r"429|Blocked|Too Many|RequestBlocked|IpBlocked",msg,re.I):
                time.sleep(min(1200, 300+attempt*180))
            else:
                time.sleep(30)
                if attempt>=2: break
    save()
    time.sleep(random.uniform(20,35))
print("DONE",flush=True)
