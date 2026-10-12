"""Every number of one neuron for pill 10: first-row neuron 10 of the digit network at its random start (seed 42,
as train.py), reading the 7 (sample 2 of net.json). Forward: 64 inputs x 64 weights, the 64 products, their sum
plus the bias, the squash. Backward: the blame arriving from the 16 neurons of the next row, the blame of this
neuron's sum, and the slope of each of its 65 knobs, with nudging as a check."""

import json

import numpy as np

NET = json.load(open("net.json"))
rng = np.random.default_rng(42)


def init(n_in, n_out):
    return rng.normal(0, 1 / np.sqrt(n_in), (n_in, n_out)), np.zeros(n_out)


U1, c1 = init(64, 32)
U2, c2 = init(32, 16)
U3, c3 = init(16, 10)

s = NET["samples"][2]
x = np.array(s["pixels"]) / 16.0
y = s["label"]
Y = np.zeros(10)
Y[y] = 1
J = 10  # the neuron of pills 05, 06, 08, 09
PX = 21  # the pixel of those pills


def softmax(z):
    z = z - z.max()
    p = np.exp(z)
    return p / p.sum()


def forward(P):
    W1, b1, W2, b2, W3, b3 = P
    z1 = x @ W1 + b1
    h1 = np.tanh(z1)
    z2 = h1 @ W2 + b2
    h2 = np.tanh(z2)
    z3 = h2 @ W3 + b3
    p = softmax(z3)
    return z1, h1, z2, h2, z3, p, float(-np.log(p[y]))


P0 = [U1, c1, U2, c2, U3, c3]
z1, h1, z2, h2, z3, p, loss = forward(P0)
g3 = p - Y
gh2 = g3 @ U3.T
g2 = gh2 * (1 - h2**2)
gh1 = g2 @ U2.T
g1 = gh1 * (1 - h1**2)


def nudge(block, idx, h=1e-4):
    Q = [a.copy() for a in P0]
    Q[block][idx] += h
    lp = forward(Q)[6]
    Q[block][idx] -= 2 * h
    lm = forward(Q)[6]
    return (lp - lm) / (2 * h)


w = U1[:, J]
prod = x * w
back_terms = (
    g2 * U2[J, :]
)  # what each of the 16 next-row neurons sends back: its blame times the wire's weight
slopes = g1[J] * x
dark = [int(i) for i in np.flatnonzero(x == 0)]
out = {
    "neuron": J,
    "pixel": PX,
    "label": y,
    "loss": loss,
    "x": x.tolist(),
    "w": w.tolist(),
    "b": float(c1[J]),
    "prod": prod.tolist(),
    "sum_pos": float(prod[prod > 0].sum()),
    "sum_neg": float(prod[prod < 0].sum()),
    "z": float(z1[J]),
    "h": float(h1[J]),
    "squash_slope": float(1 - h1[J] ** 2),
    "dark": dark,
    "n_dark": len(dark),
    "big_prod": int(np.abs(prod).argmax()),
    "big_w": int(np.abs(w).argmax()),
    "g2": g2.tolist(),
    "w2": U2[J, :].tolist(),
    "back_terms": back_terms.tolist(),
    "big_back": int(np.abs(back_terms).argmax()),
    "blame_h": float(gh1[J]),
    "blame_z": float(g1[J]),
    "slopes": slopes.tolist(),
    "slope_b": float(g1[J]),
    "big_slope": int(np.abs(slopes).argmax()),
    "nudged_w21": nudge(0, (PX, J)),
    "nudged_b": nudge(1, J),
    "nudged_big": nudge(0, (int(np.abs(slopes).argmax()), J)),
    "n_knobs": 2778,
    "n_neurons": 58,
}
json.dump(out, open("neuron.json", "w"), separators=(",", ":"))
for k, v in out.items():
    if not isinstance(v, list):
        print(k, v)
print("pixel", PX, "x", x[PX], "w", w[PX], "prod", prod[PX], "slope", slopes[PX])
print(
    "big_prod",
    out["big_prod"],
    x[out["big_prod"]],
    w[out["big_prod"]],
    prod[out["big_prod"]],
)
print("big_slope", out["big_slope"], x[out["big_slope"]], slopes[out["big_slope"]])
print(
    "big_back",
    out["big_back"],
    g2[out["big_back"]],
    U2[J, out["big_back"]],
    back_terms[out["big_back"]],
)
print("check sum", prod.sum() + c1[J], z1[J], "back sum", back_terms.sum(), gh1[J])
