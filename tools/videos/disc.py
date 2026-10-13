import sys, json, time
sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, sys.argv[1])
import yt_dlp
qs = ["brettspielblog boss fighters qr","brettspielblog boss fighers","geekpunkt boss fighters qr","flo ben boss fighters qr","boss fighters qr boss 8 9 10","boss fighters qr carl flo ben","pegasus spiele boss fighters let's play","boss fighters qr zu zweit","boss fighters qr solo playthrough","boss fighters qr co-op playthrough","boss fighters qr full game","boss fighters qr gameplay","boss fighters qr jouer"]
ydl = yt_dlp.YoutubeDL({"quiet":True,"extract_flat":True,"skip_download":True})
res = {}
for q in qs:
    try:
        info = ydl.extract_info(f"ytsearch40:{q}", download=False)
        for e in info.get("entries",[]):
            vid=e.get("id")
            if vid not in res:
                res[vid]={"id":vid,"title":e.get("title"),"channel":e.get("channel") or e.get("uploader"),"duration":e.get("duration"),"q":q}
        print(q, len(res), flush=True)
    except Exception as ex:
        print(q,"ERR",ex, flush=True)
    time.sleep(3)
json.dump(res, open("yt_all/search_raw3.json","w",encoding="utf-8"), ensure_ascii=False, indent=1)
