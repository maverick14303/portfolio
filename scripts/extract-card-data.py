# Pulls the real measurements out of the sibling projects into
# content/card-data.json, which make-cards.mjs renders onto the card art.
# Re-run whenever those projects collect more data:
#   python scripts/extract-card-data.py
import csv
import json
import os
import sqlite3

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODE = os.path.dirname(ROOT)
DB = os.path.join(CODE, "stock-news-monitor", "news.db")
SUMMARY = os.path.join(CODE, "trading-bot", "results", "summary.csv")
OUT = os.path.join(ROOT, "content", "card-data.json")

# --- stock-news-monitor: graded signals vs. next-day move ---
con = sqlite3.connect(DB)
total, hits = con.execute("select count(*), sum(hit) from graded").fetchone()
sources = [
    {"name": name, "n": n, "rate": 100.0 * h / n}
    for name, n, h in con.execute(
        "select source, count(*), sum(hit) from graded group by source "
        "having count(*) >= 8 order by 1.0*sum(hit)/count(*) desc"
    )
]
articles = con.execute("select count(*) from articles").fetchone()[0]
days = con.execute("select count(distinct day) from graded").fetchone()[0]
con.close()

# --- trading-bot: best backtested strategy by Sharpe ---
rows = list(csv.DictReader(open(SUMMARY)))
best = max(rows, key=lambda r: float(r["sharpe"]))

data = {
    "news": {
        "hitRate": round(100.0 * hits / total, 1),
        "signals": total,
        "articles": articles,
        "days": days,
        # top 5 by rate, shortened for the card
        "sources": [
            {
                "name": s["name"].replace(" Markets", "").replace(" Companies", "")[:20],
                "rate": round(s["rate"], 1),
                "n": s["n"],
            }
            for s in sources[:5]
        ],
    },
    "bot": {
        "strategy": best["strategy"],
        "cagr": float(best["CAGR_%"]),
        "sharpe": float(best["sharpe"]),
        "maxDD": float(best["max_drawdown_%"]),
        "trades": int(best["n_trades"]),
        "winRate": float(best["win_rate_%"]),
        "years": float(best["years"]),
        "strategies": len(rows),
    },
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w") as f:
    json.dump(data, f, indent=2)

print(json.dumps(data, indent=2))
