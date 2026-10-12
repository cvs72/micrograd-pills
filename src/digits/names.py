"""Numbers for pill 12 (the names): the trained network of net.json reading the 7 of pill 03. One forward pass with
every intermediate value named, the loss of that picture, the gradient over the training set, the backward pass for
the picture, and the counts of the recipe (train.py)."""

import json

import numpy as np

NET = json.load(open("net.json"))
W1, b1, W2, b2, W3, b3 = (
    np.array(NET[k]) for k in ("W1", "b1", "W2", "b2", "W3", "b3")
)
P = [W1, b1, W2, b2, W3, b3]
A = (6, 7)  # knob A of pills 04-11: hidden 6 -> score 7
NEURON, PIXEL = 10, 21  # the neuron and pixel of pills 05-10


def load(path):
    a = np.loadtxt(path, delimiter=",", dtype=np.int64)
    return a[:, :64], a[:, 64]


Xtr, ytr = load("optdigits.tra")
Xte, yte = load("optdigits.tes")
xtr, xte = Xtr / 16.0, Xte / 16.0


def forward(x):
    z1 = x @ W1 + b1
    h1 = np.tanh(z1)
    z2 = h1 @ W2 + b2
    h2 = np.tanh(z2)
    z3 = h2 @ W3 + b3
    e = np.exp(z3 - z3.max(axis=-1, keepdims=True))
    p = e / e.sum(axis=-1, keepdims=True)
    return z1, h1, z2, h2, z3, p


def grads(x, y):
    """mean loss gradient over the rows of x: the gradient of the loss with respect to every parameter"""
    z1, h1, z2, h2, z3, p = forward(x)
    dz3 = p.copy()
    dz3[np.arange(len(y)), y] -= 1
    dz3 /= len(y)
    dW3, db3 = h2.T @ dz3, dz3.sum(0)
    dh2 = dz3 @ W3.T
    dz2 = dh2 * (1 - h2**2)
    dW2, db2 = h1.T @ dz2, dz2.sum(0)
    dh1 = dz2 @ W2.T
    dz1 = dh1 * (1 - h1**2)
    dW1, db1 = x.T @ dz1, dz1.sum(0)
    return [dW1, db1, dW2, db2, dW3, db3], (dz3, dh2, dz2, dh1, dz1)


# the 7 of pill 03 (misread as 9)
s7 = NET["samples"][2]
i7 = int(np.flatnonzero((Xte == np.array(s7["pixels"])).all(1))[0])
x7, y7 = xte[i7 : i7 + 1], yte[i7 : i7 + 1]
assert y7[0] == 7
z1, h1, z2, h2, z3, p = (v[0] for v in forward(x7))
loss7 = float(-np.log(p[7]))
G7, (dz3, dh2, dz2, dh1, dz1) = grads(x7, y7)

# the whole training set: loss, accuracy, gradient
_, _, _, _, _, ptr = forward(xtr)
_, _, _, _, _, pte = forward(xte)
train_loss = float(-np.log(ptr[np.arange(len(ytr)), ytr]).mean())
train_acc = float((ptr.argmax(1) == ytr).mean())
test_loss = float(-np.log(pte[np.arange(len(yte)), yte]).mean())
test_acc = float((pte.argmax(1) == yte).mean())
Gf, _ = grads(xtr, ytr)
allg = np.concatenate([g.ravel() for g in Gf])
n_knobs = int(allg.size)
assert n_knobs == 2778
print("test acc", test_acc, "net.json", NET["test_acc"], NET["test_right"])
assert round(test_acc, 4) == NET["test_acc"]

r = lambda v, d=4: round(float(v), d)
out = {
    "shape": [64, 32, 16, 10],
    "n_neurons": 32 + 16 + 10,
    "n_knobs": n_knobs,
    "n_weights": int(W1.size + W2.size + W3.size),
    "n_biases": int(b1.size + b2.size + b3.size),
    "n_train": len(xtr),
    "n_test": len(xte),
    "lr": 0.05,
    "epochs": 60,
    "batch": 32,
    "steps_per_pass": int(np.ceil(len(xtr) / 32)),
    "n_steps": 60 * int(np.ceil(len(xtr) / 32)),
    "A": list(A),
    "knobA_w": r(W3[A]),
    "neuron": NEURON,
    "pixel": PIXEL,
    "pixels": s7["pixels"],
    "label": 7,
    "pred": int(p.argmax()),
    # forward, neuron 10 of the first row
    "x21": r(x7[0, PIXEL]),
    "w21": r(W1[PIXEL, NEURON]),
    "b10": r(b1[NEURON]),
    "z10": r(z1[NEURON]),
    "h10": r(h1[NEURON]),
    "h1_mean_abs": r(np.abs(h1).mean()),
    # the ten raw scores and the ten probabilities
    "logits": [r(v) for v in z3],
    "probs": [r(v, 5) for v in p],
    "p_right": r(p[7], 5),
    "p_top": r(p.max(), 5),
    "loss7": r(loss7),
    "train_loss": r(train_loss),
    "train_acc": r(train_acc, 5),
    "test_loss": r(test_loss),
    "test_acc": r(test_acc, 5),
    "test_right": int((pte.argmax(1) == yte).sum()),
    # the gradient over the training set
    "mean_abs_slope": r(np.abs(allg).mean(), 6),
    "max_abs_slope": r(np.abs(allg).max(), 6),
    "knobA_slope": r(Gf[4][A], 6),
    "n_neg": int((allg < 0).sum()),
    "n_pos": int((allg > 0).sum()),
    "field": {
        k: np.round(g, 6).tolist()
        for k, g in zip(("W1", "b1", "W2", "b2", "W3", "b3"), Gf)
    },
    # the backward pass for the 7 alone
    "g_score7": r(p[7] - 1),  # slope of the loss against the raw score for 7: score - 1
    "g_score9": r(p[9]),
    "knobA_slope7": r(G7[4][A]),  # h2[6] x (p7 - 1)
    "h2_6": r(h2[A[0]]),
    "blame_z10": r(dz1[0, NEURON], 5),
    "blame_h10": r(dh1[0, NEURON], 5),
    "squash_slope10": r(1 - h1[NEURON] ** 2),
    "slope_w21": r(G7[0][PIXEL, NEURON], 5),
    "slope_b10": r(G7[1][NEURON], 5),
    "nudged_w21": r(W1[PIXEL, NEURON] - 0.05 * G7[0][PIXEL, NEURON]),
}
assert abs(out["slope_w21"] - r(x7[0, PIXEL] * dz1[0, NEURON], 5)) < 2e-5
json.dump(out, open("names.json", "w"), separators=(",", ":"))
print({k: v for k, v in out.items() if k not in ("field", "pixels")})
