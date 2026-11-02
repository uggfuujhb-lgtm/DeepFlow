"""Post to the OptionLap Telegram channel. ONLY run after the owner's explicit command for this post.

Usage:
  python3 team/tools/tg_post.py --text-file post.txt [--photo chart.png] [--dry-run]
- With --photo: sends the photo; if the text fits in 1024 chars it becomes the caption,
  otherwise the photo goes with a short caption and the full text follows as a message.
- Reads TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID from the environment. Never prints the token.
"""
import argparse, json, os, sys, urllib.request, uuid

ap = argparse.ArgumentParser()
ap.add_argument("--text-file", required=True); ap.add_argument("--photo"); ap.add_argument("--dry-run", action="store_true")
ap.add_argument("--short-caption", default="📍 الشارت: المناطق على شموع اليوم · للتعليم فقط وليست توصية")
a = ap.parse_args()
text = open(a.text_file, encoding="utf-8").read().strip()
tok = os.environ.get("TELEGRAM_BOT_TOKEN", "")
ch = os.environ.get("TELEGRAM_CHANNEL_ID", "").strip()
if ch.startswith("http"): ch = "@" + ch.rstrip("/").rsplit("/", 1)[-1]
if not tok or not ch: sys.exit("missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHANNEL_ID")
api = f"https://api.telegram.org/bot{tok}/"


def call(method, fields, file=None):
    if file:
        b = uuid.uuid4().hex; body = b""
        for k, v in fields.items():
            body += f'--{b}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode()
        body += (f'--{b}\r\nContent-Disposition: form-data; name="photo"; filename="chart.png"\r\n'
                 f'Content-Type: image/png\r\n\r\n').encode() + open(file, "rb").read() + f"\r\n--{b}--\r\n".encode()
        req = urllib.request.Request(api + method, body, {"Content-Type": f"multipart/form-data; boundary={b}"})
    else:
        req = urllib.request.Request(api + method, json.dumps(fields).encode(), {"Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        r = json.load(e)
    if not r.get("ok"): sys.exit(f"telegram error: {r.get('description')}")
    return r["result"]["message_id"]


plan = []
if a.photo and len(text) <= 1024: plan = [("sendPhoto", {"chat_id": ch, "caption": text}, a.photo)]
elif a.photo: plan = [("sendPhoto", {"chat_id": ch, "caption": a.short_caption}, a.photo),
                      ("sendMessage", {"chat_id": ch, "text": text, "disable_web_page_preview": True}, None)]
else: plan = [("sendMessage", {"chat_id": ch, "text": text, "disable_web_page_preview": True}, None)]
for m, f, p in plan:
    if a.dry_run: print("dry-run", m, len(f.get("caption", f.get("text", ""))), "chars", p or ""); continue
    print(m, "ok msg", call(m, f, p))
