"""Loss numbers for pill 07 (the bowl), computed from the trained weights in net.json with numpy.
Cross-entropy per picture: -log of the score given to the right digit. Averaged over the 3,823 training pictures:
the loss of the network. The same average as one weight turns (a bowl), and as two weights turn (a bowl surface)."""

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
xte, yte = load("optdigits.tes")


def probs_from_z(z):
    z = z - z.max(axis=-1, keepdims=True)
    p = np.exp(z)
    return p / p.sum(axis=-1, keepdims=True)


def h2_of(x, W1, b1, W2, b2):
    return np.tanh(np.tanh(x @ W1 + b1) @ W2 + b2)


def mean_loss(p, y):
    return float(-np.log(p[np.arange(len(y)), y]).mean())


H2tr = h2_of(xtr, W1, b1, W2, b2)
H2te = h2_of(xte, W1, b1, W2, b2)
train_loss = mean_loss(probs_from_z(H2tr @ W3 + b3), ytr)
test_loss = mean_loss(probs_from_z(H2te @ W3 + b3), yte)

# the untrained network: the same random start as train.py (seed 42, the same three init calls)
rng = np.random.default_rng(42)


def init(n_in, n_out):
    return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)


U1, c1 = init(64, 32)
U2, c2 = init(32, 16)
U3, c3 = init(16, 10)
untrained_loss = mean_loss(probs_from_z(h2_of(xtr, U1, c1, U2, c2) @ U3 + c3), ytr)

# the three sample pictures of pill 03: loss of each from its own scores
samples = [
    {
        "label": s["label"],
        "p_right": s["probs"][s["label"]],
        "loss": round(-float(np.log(s["probs"][s["label"]])), 4),
    }
    for s in NET["samples"]
]

# knob A: the wire of pill 04, hidden neuron 6 -> output 7. knob B: the wire into output 9 that matters most for the 7
A = (6, 7)
x7 = np.array(NET["samples"][2]["pixels"]) / 16.0
h27 = h2_of(x7, W1, b1, W2, b2)
kB = int(np.argmax(np.abs(h27 * W3[:, 9])))
B = (kB, 9)
WA0, WB0 = float(W3[A]), float(W3[B])


def loss_at(wa, wb):
    W = W3.copy()
    W[A] = wa
    W[B] = wb
    return mean_loss(probs_from_z(H2tr @ W + b3), ytr)


WMIN, WMAX, N = -6.0, 6.0, 120
ws = np.linspace(WMIN, WMAX, N + 1)
curve = [round(loss_at(w, WB0), 4) for w in ws]
fine = np.linspace(WMIN, WMAX, 2401)
fine_loss = np.array([loss_at(w, WB0) for w in fine])
k = int(fine_loss.argmin())
bottom = {"w": round(float(fine[k]), 3), "loss": round(float(fine_loss[k]), 4)}

G = 30
ga = np.linspace(WMIN, WMAX, G + 1)
gb = np.linspace(WMIN, WMAX, G + 1)
grid = [[round(loss_at(wa, wb), 4) for wa in ga] for wb in gb]  # grid[row b][col a]
flat = np.array(grid)
jb, ja = np.unravel_index(flat.argmin(), flat.shape)
bottom2 = {
    "wa": round(float(ga[ja]), 3),
    "wb": round(float(gb[jb]), 3),
    "loss": round(float(flat[jb, ja]), 4),
}

out = {
    "n_train": len(ytr),
    "n_test": len(yte),
    "train_loss": round(train_loss, 4),
    "test_loss": round(test_loss, 4),
    "untrained_loss": round(untrained_loss, 4),
    "samples": samples,
    "A": list(A),
    "B": list(B),
    "WA0": round(WA0, 4),
    "WB0": round(WB0, 4),
    "wmin": WMIN,
    "wmax": WMAX,
    "n": N,
    "curve": curve,
    "bottom": bottom,
    "loss_now": round(loss_at(WA0, WB0), 4),
    "grid_n": G,
    "grid": grid,
    "bottom2": bottom2,
}
json.dump(out, open("loss.json", "w"), separators=(",", ":"))
print(
    {
        k: out[k]
        for k in (
            "train_loss",
            "test_loss",
            "untrained_loss",
            "samples",
            "A",
            "B",
            "WA0",
            "WB0",
            "bottom",
            "loss_now",
            "bottom2",
        )
    }
)
print(
    "curve ends",
    curve[0],
    curve[60],
    curve[120],
    "grid corners",
    grid[0][0],
    grid[0][G],
    grid[G][0],
    grid[G][G],
    "grid max",
    float(flat.max()),
)
