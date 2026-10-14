import sys, json, numpy as np
D, logits_path, text, out = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
FR = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0200095
tok = {}
for line in open(f"{D}/tokens.txt", encoding="utf-8"):
    p = line.rstrip("\n").rsplit(" ", 1); tok[p[0] if p[0] else " "] = int(p[1])
lg = np.load(logits_path).astype(np.float64)
lp = lg - np.log(np.exp(lg - lg.max(-1, keepdims=True)).sum(-1, keepdims=True)) - lg.max(-1, keepdims=True)
words = text.split()
seq = []; wid = []  # target ids and word index per target (space -> -1)
for k, w in enumerate(words):
    if k: seq.append(tok[" "]); wid.append(-1)
    for ch in w: seq.append(tok[ch]); wid.append(k)
T, L = lp.shape[0], len(seq)
# extended with blanks
ext = [0]; ewid = [-2]
for s, k in zip(seq, wid): ext += [s, 0]; ewid += [k, -2]
S_ = len(ext); NEG = -1e18
dp = np.full((T, S_), NEG); bp = np.zeros((T, S_), dtype=np.int32)
dp[0, 0] = lp[0, ext[0]]; dp[0, 1] = lp[0, ext[1]]
for t in range(1, T):
    prev = dp[t-1]
    c0 = prev
    c1 = np.concatenate([[NEG], prev[:-1]])
    c2 = np.concatenate([[NEG, NEG], prev[:-2]])
    allow2 = np.array([j >= 2 and ext[j] != 0 and ext[j] != ext[j-2] for j in range(S_)])
    c2 = np.where(allow2, c2, NEG)
    stack = np.stack([c0, c1, c2]); arg = stack.argmax(0)
    dp[t] = stack.max(0) + lp[t, ext]; bp[t] = arg
j = S_-1 if dp[T-1, S_-1] > dp[T-1, S_-2] else S_-2
path = [0]*T
for t in range(T-1, -1, -1):
    path[t] = j; j -= bp[t, j]
res = [{"w": w, "s": None, "e": None, "conf": []} for w in words]
for t, j in enumerate(path):
    k = ewid[j]
    if k >= 0:
        r = res[k]; ts = t*FR
        if r["s"] is None: r["s"] = ts
        r["e"] = ts + FR; r["conf"].append(float(np.exp(lp[t, ext[j]])))
for r in res:
    r["conf"] = round(float(np.mean(r["conf"])), 2) if r["conf"] else 0; r["s"] = round(r["s"], 2); r["e"] = round(r["e"], 2)
prev_e = 0
for r in res:
    gap = r["s"] - prev_e
    print(f"{r['s']:6.2f}-{r['e']:6.2f}  gap{gap:5.2f}  c{r['conf']:.2f}  {r['w']}"); prev_e = r["e"]
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
