"""Chain-rule numbers for pill 09, computed with numpy at the same random start as train.py (seed 42), on the 7 that
the trained network misreads (sample 2 of net.json). Every local slope along the path from one first-row knob to the
loss, their product, the branching sums at the hidden rows, the blame of every neuron from one backward walk, and the
same slopes measured by nudging, as a check."""

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

# the backward walk: the slope of the loss against every sum (the blame of every neuron), row by row from the loss
g3 = (
    p - Y
)  # slope of -log softmax against each score: the score's probability minus the target
gh2 = g3 @ U3.T  # paths add: each hidden output feeds all 10 scores
g2 = gh2 * (1 - h2**2)  # through the squash
gh1 = g2 @ U2.T
g1 = gh1 * (1 - h1**2)
gW1, gW2, gW3 = np.outer(x, g1), np.outer(h1, g2), np.outer(h2, g3)


def nudge(block, idx, h=1e-4):
    """Central finite difference of the 7's loss against one knob."""
    Q = [a.copy() for a in P0]
    Q[block][idx] += h
    lp = forward(Q)[6]
    Q[block][idx] -= 2 * h
    lm = forward(Q)[6]
    return (lp - lm) / (2 * h)


# the knob of pills 05/06/08: pixel 21 -> first-row neuron 10
PX, J = 21, 10
# knob A of pills 04/07/08: hidden 6 -> score 7
A = (6, 7)
# the branching example: the second-row neuron with the largest blame through its 10 paths, and a knob into it
JB = int(np.abs(gh2).argmax())
IB = int(np.abs(h1).argmax())
terms = [float(U3[JB][k] * g3[k]) for k in range(10)]

out = {
    "label": y,
    "loss": loss,
    "p": p.tolist(),
    "g3": g3.tolist(),
    "z1": z1.tolist(),
    "h1": h1.tolist(),
    "z2": z2.tolist(),
    "h2": h2.tolist(),
    "z3": z3.tolist(),
    "gh2": gh2.tolist(),
    "g2": g2.tolist(),
    "gh1": gh1.tolist(),
    "g1": g1.tolist(),
    "knob1": {
        "pixel": PX,
        "neuron": J,
        "w": float(U1[PX][J]),
        "x": float(x[PX]),
        "z": float(z1[J]),
        "h": float(h1[J]),
        "squash_slope": float(1 - h1[J] ** 2),
        "blame_h": float(gh1[J]),
        "blame_z": float(g1[J]),
        "chain": float(gW1[PX][J]),
        "nudged": nudge(0, (PX, J)),
        "paths": 16 * 10,
    },
    "knobA": {
        "hidden": A[0],
        "score": A[1],
        "w": float(U3[A]),
        "h": float(h2[A[0]]),
        "p": float(p[A[1]]),
        "score_slope": float(g3[A[1]]),
        "chain": float(gW3[A]),
        "nudged": nudge(4, A),
    },
    "branch": {
        "neuron": JB,
        "terms": terms,
        "weights": [float(U3[JB][k]) for k in range(10)],
        "sum": float(gh2[JB]),
        "h": float(h2[JB]),
        "squash_slope": float(1 - h2[JB] ** 2),
        "blame_z": float(g2[JB]),
        "from": IB,
        "input": float(h1[IB]),
        "w": float(U2[IB][JB]),
        "chain": float(gW2[IB][JB]),
        "nudged": nudge(2, (IB, JB)),
    },
    "n_knobs": 2778,
    "n_train": 3823,
}
json.dump(out, open("chain.json", "w"), separators=(",", ":"))
for k in ("loss", "knob1", "knobA", "branch"):
    print(k, out[k])
print("p", np.round(p, 4), "g3", np.round(g3, 4))
print("max |blame| rows", np.abs(g1).max(), np.abs(g2).max(), np.abs(g3).max())
print("sum of terms", sum(terms), "gh2[JB]", gh2[JB])
