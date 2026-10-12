"""Slope numbers for pill 08 (the slope), computed with numpy from the trained weights in net.json and the same random
start as train.py (seed 42). The slope of the training loss against one knob: measured by nudging the knob and dividing
(finite differences, nudges shrinking), and exactly (the derivative). The slope of every one of the 2,778 knobs, at the
random start and after training."""

import json

import numpy as np

NET = json.load(open("net.json"))
W1, b1, W2, b2, W3, b3 = (
    np.array(NET[k]) for k in ("W1", "b1", "W2", "b2", "W3", "b3")
)


def load(path):
    a = np.loadtxt(path, delimiter=",", dtype=np.int64)
    return a[:, :64] / 16.0, a[:, 64]


xtr, ytr = load("optdigits.tra")
n = len(ytr)
Y = np.zeros((n, 10))
Y[np.arange(n), ytr] = 1

# the untrained network: the same random start as train.py (seed 42, the same three init calls)
rng = np.random.default_rng(42)


def init(n_in, n_out):
    return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)


U1, c1 = init(64, 32)
U2, c2 = init(32, 16)
U3, c3 = init(16, 10)


def probs_from_z(z):
    z = z - z.max(axis=-1, keepdims=True)
    p = np.exp(z)
    return p / p.sum(axis=-1, keepdims=True)


def forward(P):
    W1, b1, W2, b2, W3, b3 = P
    h1 = np.tanh(xtr @ W1 + b1)
    h2 = np.tanh(h1 @ W2 + b2)
    p = probs_from_z(h2 @ W3 + b3)
    return h1, h2, p


def loss_of(P):
    _, _, p = forward(P)
    return float(-np.log(p[np.arange(n), ytr]).mean())


def gradient(P):
    """The exact slope of the mean loss against every knob (backpropagation, the subject of pill 09)."""
    W1, b1, W2, b2, W3, b3 = P
    h1, h2, p = forward(P)
    dz3 = (p - Y) / n
    dW3, db3 = h2.T @ dz3, dz3.sum(0)
    dz2 = (dz3 @ W3.T) * (1 - h2**2)
    dW2, db2 = h1.T @ dz2, dz2.sum(0)
    dz1 = (dz2 @ W2.T) * (1 - h1**2)
    dW1, db1 = xtr.T @ dz1, dz1.sum(0)
    return dW1, db1, dW2, db2, dW3, db3


A = (6, 7)  # the knob of pills 04 and 07: hidden neuron 6 -> score for 7
NUDGES = [1.0, 0.1, 0.01, 0.001]


def knob_study(P, name):
    W3 = P[4]
    w0 = float(W3[A])
    L0 = loss_of(P)

    def loss_at(w):
        Q = list(P)
        W = W3.copy()
        W[A] = w
        Q[4] = W
        return loss_of(Q)

    nudges = []
    for h in NUDGES:
        Lh = loss_at(w0 + h)
        nudges.append({"h": h, "loss": Lh, "slope": (Lh - L0) / h})
    exact = float(gradient(P)[4][A])
    ws = np.linspace(-6, 6, 121)
    curve = [loss_at(w) for w in ws]

    def slope_at(w):
        Q = list(P)
        W = W3.copy()
        W[A] = w
        Q[4] = W
        return float(gradient(Q)[4][A])

    fine = np.linspace(-6, 6, 2401)
    fl = np.array([loss_at(w) for w in fine])
    kb = int(fl.argmin())
    bottom = {"w": float(fine[kb]), "loss": float(fl[kb]), "slope": slope_at(fine[kb])}
    tangents = [
        {"w": float(w), "loss": loss_at(w), "slope": slope_at(w)}
        for w in (-4.0, w0, 5.0)
    ]
    print("  bottom", bottom, "tangents", tangents)
    # a close-up around the knob: the bowl, seen from near, is almost a straight line
    span = 1.5
    zs = np.linspace(w0 - span, w0 + span, 61)
    zoom = [loss_at(w) for w in zs]
    print(name, "w0", w0, "L0", L0, "exact", exact)
    for d in nudges:
        print("  h", d["h"], "loss", d["loss"], "slope", d["slope"])
    return {
        "w0": w0,
        "loss": L0,
        "nudges": [{k: round(v, 7) for k, v in d.items()} for d in nudges],
        "slope": exact,
        "curve": [round(v, 5) for v in curve],
        "zoom_w": [round(float(w), 4) for w in zs],
        "zoom": [round(v, 6) for v in zoom],
        "bottom": bottom,
        "tangents": tangents,
    }


P_start = (U1, c1, U2, c2, U3, c3)
P_now = (W1, b1, W2, b2, W3, b3)

start = knob_study(P_start, "start")
now = knob_study(P_now, "now")

# the 7 alone, trained network: slope of its own loss against knob A (pill 07 said left is better)
x7 = np.array(NET["samples"][2]["pixels"]) / 16.0
h2_7 = np.tanh(np.tanh(x7 @ W1 + b1) @ W2 + b2)
p_7 = probs_from_z(h2_7 @ W3 + b3)
slope7 = float((p_7[7] - 1) * h2_7[A[0]])
print("the 7 alone: slope", slope7, "h2[6]", h2_7[A[0]], "p7", p_7[7])


def field(P):
    g = gradient(P)
    flat = np.concatenate([a.ravel() for a in g])
    big = int(np.abs(flat).argmax())
    names = ["W1", "b1", "W2", "b2", "W3", "b3"]
    sizes = [a.size for a in g]
    blk, off = 0, big
    while off >= sizes[blk]:
        off -= sizes[blk]
        blk += 1
    where = list(np.unravel_index(off, g[blk].shape)) if g[blk].ndim == 2 else [off]
    return {
        "biggest": {"block": names[blk], "at": [int(v) for v in where], "slope": float(flat[big])},
        "n_zero": int((flat == 0).sum()),
        "W1": np.round(g[0], 7).tolist(),
        "b1": np.round(g[1], 7).tolist(),
        "W2": np.round(g[2], 7).tolist(),
        "b2": np.round(g[3], 7).tolist(),
        "W3": np.round(g[4], 7).tolist(),
        "b3": np.round(g[5], 7).tolist(),
        "count": int(flat.size),
        "max_abs": float(np.abs(flat).max()),
        "mean_abs": float(np.abs(flat).mean()),
        "n_neg": int((flat < 0).sum()),
        "n_pos": int((flat > 0).sum()),
        "n_tiny": int((np.abs(flat) < 1e-4).sum()),
    }


F_start = field(P_start)
F_now = field(P_now)
for nm, F in (("start", F_start), ("now", F_now)):
    print(
        nm,
        {k: F[k] for k in ("count", "max_abs", "mean_abs", "n_neg", "n_pos", "n_tiny")},
    )

dark = np.where(xtr.max(0) == 0)[0]
print("always-dark pixels", dark, "biggest", F_start["biggest"], F_now["biggest"], "zeros", F_start["n_zero"], F_now["n_zero"])

out = {
    "n_train": n,
    "dark_pixels": [int(v) for v in dark],
    "A": list(A),
    "start": start,
    "now": now,
    "slope7": slope7,
    "field_start": F_start,
    "field_now": F_now,
}
json.dump(out, open("slope.json", "w"), separators=(",", ":"))
