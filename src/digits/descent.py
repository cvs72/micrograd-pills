"""Numbers for pill 11: the training run of train.py replayed step by step (same seed, same shuffles, same
arithmetic, so it ends on the very weights of net.json). Records the first step in full, the batch losses of the first
pass, the loss, accuracy, mean slope and knob A after every pass, knob A's whole path, the same run at other step sizes,
and what a few first-row neurons' weights became."""

import json

import numpy as np

NET = json.load(open("net.json"))


def load(path):
    a = np.loadtxt(path, delimiter=",", dtype=np.int64)
    return a[:, :64], a[:, 64]


Xtr, ytr = load("optdigits.tra")
Xte, yte = load("optdigits.tes")
xtr, xte = Xtr / 16.0, Xte / 16.0
A, B = (6, 7), (4, 9)  # knob A and knob B of pills 04/07/08 (W3 hidden -> score)
WATCH = [
    10,
    4,
    23,
    0,
]  # first-row neurons whose weights are shown as pictures (10 is the neuron of pills 05-10)


def forward(x, W1, b1, W2, b2, W3, b3):
    h1 = np.tanh(x @ W1 + b1)
    h2 = np.tanh(h1 @ W2 + b2)
    z = h2 @ W3 + b3
    z = z - z.max(axis=-1, keepdims=True)
    p = np.exp(z)
    p /= p.sum(axis=-1, keepdims=True)
    return h1, h2, p


def loss_acc(P, x, y):
    _, _, p = forward(x, *P)
    return float(-np.log(p[np.arange(len(y)), y]).mean()), float(
        (p.argmax(1) == y).mean()
    )


def grads(P, x, y):
    W1, b1, W2, b2, W3, b3 = P
    h1, h2, p = forward(x, *P)
    dz = p.copy()
    dz[np.arange(len(y)), y] -= 1
    dz /= len(y)
    dW3 = h2.T @ dz
    db3 = dz.sum(0)
    dh2 = dz @ W3.T * (1 - h2**2)
    dW2 = h1.T @ dh2
    db2 = dh2.sum(0)
    dh1 = dh2 @ W2.T * (1 - h1**2)
    dW1 = x.T @ dh1
    db1 = dh1.sum(0)
    return [dW1, db1, dW2, db2, dW3, db3]


def run(lr, epochs=60, batch=32, record=False):
    rng = np.random.default_rng(42)

    def init(n_in, n_out):
        return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)

    W1, b1 = init(64, 32)
    W2, b2 = init(32, 16)
    W3, b3 = init(16, 10)
    P = [W1, b1, W2, b2, W3, b3]
    start = [a.copy() for a in P]
    n = len(xtr)
    per_pass, batch_losses, knobA_path, first = [], [], [], None
    for ep in range(epochs):
        order = rng.permutation(n)
        for i in range(0, n, batch):
            idx = order[i : i + batch]
            x, y = xtr[idx], ytr[idx]
            G = grads(P, x, y)
            if record:
                lb = loss_acc(P, x, y)[0]
                if ep == 0:
                    batch_losses.append(round(lb, 4))
                if ep == 0 and i == 0:
                    allg = np.concatenate([g.ravel() for g in G])
                    names = ["W1", "b1", "W2", "b2", "W3", "b3"]
                    kb = int(np.argmax([np.abs(g).max() for g in G]))
                    at = np.unravel_index(np.abs(G[kb]).argmax(), G[kb].shape)
                    Gs = grads(P, xtr, ytr)
                    first = {
                        "big": {
                            "block": names[kb],
                            "at": [int(v) for v in at],
                            "w": float(P[kb][at]),
                            "slope": float(G[kb][at]),
                            "after": float(P[kb][at] - lr * G[kb][at]),
                        },
                        "start_mean_abs_slope": float(
                            np.abs(np.concatenate([g.ravel() for g in Gs])).mean()
                        ),
                        "start_knobA_slope": float(Gs[4][A]),
                        "start_train_acc": loss_acc(P, xtr, ytr)[1],
                        "start_test_acc": loss_acc(P, xte, yte)[1],
                        "n_pictures": len(y),
                        "labels": y.tolist(),
                        "loss_before": lb,
                        "n_knobs": int(allg.size),
                        "max_abs_slope": float(np.abs(allg).max()),
                        "mean_abs_slope": float(np.abs(allg).mean()),
                        "knobA_w": float(P[4][A]),
                        "knobA_slope": float(G[4][A]),
                        "knobA_after": float(P[4][A] - lr * G[4][A]),
                        "knobB_w": float(P[4][B]),
                        "knobB_slope": float(G[4][B]),
                        "knobB_after": float(P[4][B] - lr * G[4][B]),
                        "field": {
                            "W1": np.round(G[0], 6).tolist(),
                            "b1": np.round(G[1], 6).tolist(),
                            "W2": np.round(G[2], 6).tolist(),
                            "b2": np.round(G[3], 6).tolist(),
                            "W3": np.round(G[4], 6).tolist(),
                            "b3": np.round(G[5], 6).tolist(),
                        },
                        "full_loss_before": loss_acc(P, xtr, ytr)[0],
                    }
            for p_, g in zip(P, G):
                p_ -= lr * g
            if record:
                knobA_path.append(round(float(P[4][A]), 5))
                if ep == 0 and i == 0:
                    first["loss_after"] = loss_acc(P, x, y)[0]
                    first["full_loss_after"] = loss_acc(P, xtr, ytr)[0]
        ltr, atr = loss_acc(P, xtr, ytr)
        lte, ate = loss_acc(P, xte, yte)
        Gf = grads(P, xtr, ytr)
        allg = np.concatenate([g.ravel() for g in Gf])
        per_pass.append(
            {
                "pass": ep + 1,
                "train_loss": round(ltr, 5),
                "train_acc": round(atr, 5),
                "test_loss": round(lte, 5),
                "test_acc": round(ate, 5),
                "mean_abs_slope": round(float(np.abs(allg).mean()), 6),
                "knobA": round(float(P[4][A]), 5),
                "knobA_slope": round(float(Gf[4][A]), 6),
            }
        )
    return P, start, per_pass, batch_losses, knobA_path, first


P, start, per_pass, batch_losses, knobA_path, first = run(0.05, record=True)
# the replay must land on net.json's weights
W3_json = np.array(NET["W3"])
assert np.abs(np.round(P[4], 4) - W3_json).max() < 1e-9, "replay differs from net.json"
print(
    "replay matches net.json; test acc",
    per_pass[-1]["test_acc"],
    "train loss",
    per_pass[-1]["train_loss"],
)

# the three sample pictures of pill 03 (confident 3, confident 8, a 7 misread as 9): score for the right digit per pass
sample_idx = []
for s in NET["samples"]:
    px = np.array(s["pixels"])
    sample_idx.append(int(np.flatnonzero((Xte == px).all(1))[0]))


def sample_scores(epochs=60):
    """re-run and record p(right digit) for the three samples after every pass (cheap, same seed)"""
    rng = np.random.default_rng(42)

    def init(n_in, n_out):
        return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)

    W1, b1 = init(64, 32)
    W2, b2 = init(32, 16)
    W3, b3 = init(16, 10)
    Pq = [W1, b1, W2, b2, W3, b3]
    out = []
    _, _, p = forward(xte[sample_idx], *Pq)
    out.append([round(float(p[k][NET["samples"][k]["label"]]), 5) for k in range(3)])
    n = len(xtr)
    for ep in range(epochs):
        order = rng.permutation(n)
        for i in range(0, n, 32):
            idx = order[i : i + 32]
            G = grads(Pq, xtr[idx], ytr[idx])
            for p_, g in zip(Pq, G):
                p_ -= 0.05 * g
        _, _, p = forward(xte[sample_idx], *Pq)
        out.append(
            [round(float(p[k][NET["samples"][k]["label"]]), 5) for k in range(3)]
        )
    return out


samples_p = sample_scores()

# the same run at other step sizes
rates = {}
for lr in (0.005, 0.05, 0.5, 2.0):
    _, _, pp, _, _, _ = run(lr, epochs=60)
    rates[str(lr)] = {
        "train_loss": [r["train_loss"] for r in pp],
        "test_acc": [r["test_acc"] for r in pp],
    }
    print(
        "lr",
        lr,
        "loss after 1/10/60:",
        pp[0]["train_loss"],
        pp[9]["train_loss"],
        pp[-1]["train_loss"],
        "acc",
        pp[-1]["test_acc"],
    )

out = {
    "lr": 0.05,
    "epochs": 60,
    "batch": 32,
    "n_train": len(xtr),
    "n_test": len(xte),
    "steps_per_pass": int(np.ceil(len(xtr) / 32)),
    "n_steps": 60 * int(np.ceil(len(xtr) / 32)),
    "A": list(A),
    "B": list(B),
    "first": first,
    "batch_losses": batch_losses,
    "per_pass": per_pass,
    "knobA_path": knobA_path[::10],
    "knobA_path_stride": 10,
    "samples_p": samples_p,
    "sample_labels": [s["label"] for s in NET["samples"]],
    "rates": rates,
    "watch": WATCH,
    "W1_start": [[round(float(v), 4) for v in start[0][:, j]] for j in WATCH],
    "W1_end": [[round(float(v), 4) for v in P[0][:, j]] for j in WATCH],
    "untrained_loss": round(first["full_loss_before"], 4),
}
json.dump(out, open("descent.json", "w"), separators=(",", ":"))
print("first step", {k: v for k, v in first.items() if k != "field"})
print(
    "batch losses (first 10)", batch_losses[:10], "pass-1 mean", np.mean(batch_losses)
)
for r in per_pass[:3] + per_pass[9:10] + per_pass[29:30] + per_pass[-1:]:
    print(r)
print(
    "samples p start/pass1/pass10/end",
    samples_p[0],
    samples_p[1],
    samples_p[10],
    samples_p[-1],
)
print(
    "knobA path", knobA_path[0], knobA_path[119], knobA_path[-1], "len", len(knobA_path)
)
