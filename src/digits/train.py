"""Train a tiny 64 -> 32 -> 16 -> 10 network on the UCI 8x8 handwritten digits (optdigits) with plain numpy
gradient descent, then export the weights, a few sample pictures and the untrained scores as JSON for pill 03.
Hidden layers use tanh (the squash of the lecture), the output row is a softmax so the ten scores sum to one."""

import json
import sys

import numpy as np

rng = np.random.default_rng(42)


def load(path):
    a = np.loadtxt(path, delimiter=",", dtype=np.int64)
    return a[:, :64], a[:, 64]


Xtr, ytr = load("optdigits.tra")
Xte, yte = load("optdigits.tes")
xtr, xte = Xtr / 16.0, Xte / 16.0  # pixel brightness 0..16 -> 0..1


def init(n_in, n_out):
    return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)


W1, b1 = init(64, 32)
W2, b2 = init(32, 16)
W3, b3 = init(16, 10)
untrained = [W1.copy(), b1.copy(), W2.copy(), b2.copy(), W3.copy(), b3.copy()]


def forward(x, W1, b1, W2, b2, W3, b3):
    h1 = np.tanh(x @ W1 + b1)
    h2 = np.tanh(h1 @ W2 + b2)
    z = h2 @ W3 + b3
    z = z - z.max(axis=-1, keepdims=True)
    p = np.exp(z)
    p /= p.sum(axis=-1, keepdims=True)
    return h1, h2, p


lr, epochs, batch = 0.05, 60, 32
n = len(xtr)
for ep in range(epochs):
    order = rng.permutation(n)
    for i in range(0, n, batch):
        idx = order[i : i + batch]
        x, y = xtr[idx], ytr[idx]
        h1, h2, p = forward(x, W1, b1, W2, b2, W3, b3)
        # backward pass (cross-entropy with softmax): the slope of the loss at every number inside
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
        for P, G in ((W1, dW1), (b1, db1), (W2, dW2), (b2, db2), (W3, dW3), (b3, db3)):
            P -= lr * G
    if ep % 10 == 9 or ep == epochs - 1:
        _, _, p = forward(xte, W1, b1, W2, b2, W3, b3)
        print(
            f"epoch {ep + 1}: test accuracy {(p.argmax(1) == yte).mean():.4f}",
            file=sys.stderr,
        )

_, _, pte = forward(xte, W1, b1, W2, b2, W3, b3)
pred = pte.argmax(1)
acc = (pred == yte).mean()
right = int((pred == yte).sum())


# samples: a confident 3, a confident 8, and one the network gets wrong
def pick(label, correct=True):
    cands = [
        i for i in range(len(yte)) if yte[i] == label and (pred[i] == yte[i]) == correct
    ]
    cands.sort(key=lambda i: -pte[i].max())
    return cands[0]


wrong = [i for i in range(len(yte)) if pred[i] != yte[i]]
wrong.sort(key=lambda i: -pte[i].max())
samples_idx = [pick(3), pick(8), wrong[0]]


def sample(i):
    _, _, p0 = forward(xte[i], *untrained)
    return {
        "pixels": Xte[i].tolist(),
        "label": int(yte[i]),
        "pred": int(pred[i]),
        "probs": [round(float(v), 4) for v in pte[i]],
        "untrained": [round(float(v), 4) for v in p0],
    }


out = {
    "shape": [64, 32, 16, 10],
    "n_train": int(n),
    "n_test": len(yte),
    "test_right": right,
    "test_acc": round(float(acc), 4),
    "W1": np.round(W1, 4).tolist(),
    "b1": np.round(b1, 4).tolist(),
    "W2": np.round(W2, 4).tolist(),
    "b2": np.round(b2, 4).tolist(),
    "W3": np.round(W3, 4).tolist(),
    "b3": np.round(b3, 4).tolist(),
    "samples": [sample(i) for i in samples_idx],
}
json.dump(out, open("net.json", "w"), separators=(",", ":"))
print(
    json.dumps(
        {k: out[k] for k in ("shape", "n_train", "n_test", "test_right", "test_acc")}
    )
)
for s in out["samples"]:
    print(
        "label",
        s["label"],
        "pred",
        s["pred"],
        "probs",
        s["probs"],
        "untrained",
        s["untrained"],
    )
