/* Pill 02 opens on the finished onion of pill 01, greys every layer except neural networks, goes inside it to a small network,
then into one neuron and walks through its recipe without numbers, then back out to the network. Stage above, deck below. */
(function () {
  'use strict';
  const K = Pill.create({ near: 0.05, ambient: 0.75, key: 0.65, grid: [220, 110, 0, -8.6], pad: [1.45, 1.25], minRadius: 1.2, roughness: 0.4, objectScale: true });
  const { scene, label, say, state, glowMat, lineMat, anim, later, lerp, easeInOut, fade, glow, clearAnims } = K;

  // ---------- scene ----------
  {
    const n = 700, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { pos[i * 3] = -60 + Math.random() * 120; pos[i * 3 + 1] = -10 + Math.random() * 30; pos[i * 3 + 2] = -20 - Math.random() * 60; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x3b4a7a, size: 0.14, transparent: true, opacity: 0.8 })));
  }
  const C = { input: 0x4fd1ff, knob: 0xf5b942, signal: 0xc084fc, output: 0x5eead4, body: 0x2a3561, node: 0x3a4a86, grey: 0x2b3352 };
  function sphere(r, color, pos, parent) { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 40, 28), glowMat(color)); m.position.copy(pos); parent.add(m); return m; }
  function ring(color, pos, parent) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.13, 20, 48), glowMat(color)); m.position.copy(pos); m.rotation.y = Math.PI / 2; parent.add(m); return m; }
  function tube(curve, color, parent, radius) { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, radius || 0.06, 10, false), glowMat(color)); m.material.opacity = 0.25; parent.add(m); return m; }
  function hide(m) { m.visible = false; m.material.opacity = 0; }

  // ---------- HTML labels anchored to objects; scale = pixels per local unit / the size the type was designed for ----------

  // ---------- the onion from pill 01, finished ----------
  const HUES = [0x60a5fa, 0x22d3ee, 0x34d399, 0xfacc15, 0xfb923c, 0xf472b6];   // AI … LLMs, outer to inner (k = 5 … 0)
  const HUE_CSS = ['#60a5fa', '#22d3ee', '#34d399', '#facc15', '#fb923c', '#f472b6'];
  const TITLES = ['LLMs', 'Generative AI', 'Deep learning', 'Neural networks', 'Machine learning', 'Artificial intelligence'];
  const R0 = 1.7, RW = 1.35, layerR = k => R0 + RW * k;
  const onion = new THREE.Group(); onion.position.set(0, -8.2, 0); scene.add(onion);
  const layers = TITLES.map((t, k) => {
    const r = layerR(k), hue = HUES[5 - k];
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 96), glowMat(hue)); m.material.emissiveIntensity = 0.22; m.position.set(0, r, -0.06 * k); onion.add(m);
    const a = new THREE.Object3D(); a.position.set(0, k === 0 ? r : 2 * r - RW / 2 - 0.02, -0.06 * k + 0.02); onion.add(a);
    const L = label(HUE_CSS[5 - k], a, 'cap', 30); say(L, t);
    return { k, r, mesh: m, hue: new THREE.Color(hue), lbl: L };
  });
  const NN = layers[3], NNC = new THREE.Vector3(0, -8.2 + NN.r, 0);   // the neural-networks disc and its centre
  const greyCol = new THREE.Color(C.grey);
  function setLayer(L, t, op) { L.mesh.material.color.lerpColors(L.hue, greyCol, t); L.mesh.material.emissive.copy(L.mesh.material.color); L.mesh.material.emissiveIntensity = 0.22 * (1 - t); L.mesh.material.opacity = op; L.mesh.visible = op > 0.01; }

  // ---------- a small network inside the neural-networks disc ----------
  const net = new THREE.Group(); net.position.set(NNC.x, NNC.y, 0.6); scene.add(net);
  const ROWS = [[-3.6, [-2.2, 0, 2.2]], [-1.2, [-2.7, -0.9, 0.9, 2.7]], [1.2, [-2.7, -0.9, 0.9, 2.7]], [3.6, [-1.1, 1.1]]];
  const nodes = [], wires = [];
  ROWS.forEach(([x, ys], r) => { ys.forEach(y => { const col = r === 0 ? C.input : r === ROWS.length - 1 ? C.output : C.node; const m = sphere(0.3, col, new THREE.Vector3(x, y, 0), net); m.userData.row = r; nodes.push(m); }); });
  for (let r = 0; r < ROWS.length - 1; r++) for (const a of nodes.filter(n => n.userData.row === r)) for (const b of nodes.filter(n => n.userData.row === r + 1)) { const w = tube(new THREE.CatmullRomCurve3([a.position, b.position]), C.node, net, 0.03); w.userData.row = r; wires.push(w); }
  const chosen = nodes.filter(n => n.userData.row === 1)[1];
  const netAnchor = new THREE.Object3D(); netAnchor.position.set(0, 3.5, 0); net.add(netAnchor);
  const LBnet = label('#8e99bd', netAnchor, 'tag', 60); say(LBnet, 'a neural network · rows of neurons, each row feeding the next');
  function setNet(op, em) { for (const n of nodes) { n.material.opacity = op; n.visible = op > 0.01; n.material.emissiveIntensity = em; n.scale.setScalar(1); } for (const w of wires) { w.material.opacity = 0.35 * op; w.visible = op > 0.01; } }

  // ---------- one neuron, built around the chosen node at a fifth of the network's scale ----------
  const rig = new THREE.Group(); rig.position.set(NNC.x + chosen.position.x, NNC.y + chosen.position.y, 0.9); rig.scale.setScalar(0.2); scene.add(rig);
  const P = {
    x: [new THREE.Vector3(-6.5, 2.3, 0), new THREE.Vector3(-6.5, 0, 0), new THREE.Vector3(-6.5, -2.3, 0)],
    k: [new THREE.Vector3(-3.3, 1.25, 0.3), new THREE.Vector3(-3.3, 0, 0.3), new THREE.Vector3(-3.3, -1.25, 0.3)],
    body: new THREE.Vector3(0, 0, 0), bias: new THREE.Vector3(0, -2.6, 0.2), panel: new THREE.Vector3(4.0, 0.1, 0), out: new THREE.Vector3(7.4, 0, 0)
  };
  const wiresIn = P.x.map((x, i) => new THREE.CatmullRomCurve3([x, P.k[i], P.body]));
  const wireB = new THREE.CatmullRomCurve3([P.bias, new THREE.Vector3(0, -1.3, 0.1), P.body]);
  const wireO = new THREE.CatmullRomCurve3([P.body, P.panel, P.out]);
  const M = {
    x: P.x.map(p => sphere(0.5, C.input, p, rig)), tIn: wiresIn.map(w => tube(w, C.input, rig)),
    k: P.k.map(p => ring(C.knob, p, rig)), bias: ring(C.knob, P.bias, rig), tB: tube(wireB, C.knob, rig),
    body: sphere(1.15, C.body, P.body, rig), tO: tube(wireO, C.output, rig), out: sphere(0.55, C.output, P.out, rig),
    orbs: P.x.map(p => sphere(0.17, C.signal, p, rig)), orbB: sphere(0.17, C.signal, P.bias, rig), orbO: sphere(0.17, C.signal, P.body, rig)
  };
  M.bias.rotation.set(Math.PI / 2, 0, 0);
  for (const o of M.orbs.concat([M.orbB, M.orbO])) { o.material.emissiveIntensity = 1.0; o.visible = false; }
  const rigParts = [...M.x, ...M.tIn, ...M.k, M.bias, M.tB, M.body, M.tO, M.out];
  // the squash panel: axes, a faint straight line (what happens without a squash), the tanh curve, the ReLU hinge, a moving dot
  const panel = new THREE.Group(); panel.position.copy(P.panel); rig.add(panel);
  const mkLine = (pts, mat) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); panel.add(l); return l; };
  mkLine([new THREE.Vector3(-1.6, 0, 0), new THREE.Vector3(1.6, 0, 0)], lineMat(0x3a4670, 0.9)); mkLine([new THREE.Vector3(0, -1.35, 0), new THREE.Vector3(0, 1.35, 0)], lineMat(0x3a4670, 0.9));
  const straight = mkLine([new THREE.Vector3(-1.6, -1.2, 0), new THREE.Vector3(1.6, 1.2, 0)], lineMat(0x6b7599, 0.5));
  const tanhPts = [], reluPts = []; for (let i = 0; i <= 80; i++) { const x = -3.2 + 6.4 * i / 80; tanhPts.push(new THREE.Vector3(x * 0.5, Math.tanh(x) * 1.2, 0)); reluPts.push(new THREE.Vector3(x * 0.5, Math.max(0, x) * 0.42, 0)); }
  const tanhLine = mkLine(tanhPts, lineMat(C.output, 1)), reluLine = mkLine(reluPts, lineMat(C.knob, 1));
  const dot = sphere(0.11, C.signal, new THREE.Vector3(-1.6, -1.2, 0), panel); dot.material.emissiveIntensity = 1.6;
  function setPanel(a, tanhOp, reluOp, lineOp) { panel.visible = a > 0.01; for (const o of panel.children) if (o.material) o.material.opacity = a * (o === tanhLine ? tanhOp : o === reluLine ? reluOp : o === straight ? lineOp : o === dot ? 1 : 0.9); dot.visible = a > 0.01 && dot.material.opacity > 0.01; }
  // labels on the rig (anchored to rig objects, designed for ~55 px per rig unit)
  const anchor = (x, y, z) => { const a = new THREE.Object3D(); a.position.set(x, y, z || 0); rig.add(a); return a; };
  const LB = {
    x: P.x.map(p => { const L = label('#4fd1ff', anchor(p.x, p.y + 0.95), 'tag', 55); say(L, 'a number'); return L; }),
    k: P.k.map((p, i) => { const L = label('#f5b942', anchor(p.x, p.y + (i === 0 ? 1.0 : i === 2 ? -1.0 : 0.95)), 'tag', 55); say(L, '× weight'); return L; }),
    body: label('#c084fc', anchor(0, 1.75), 'tag', 55), bias: label('#f5b942', anchor(0.9, -2.75), 'tag', 55),
    sq: label('#5eead4', anchor(4.0, 1.95), 'tag', 55), out: label('#5eead4', anchor(7.4, 0.95), 'tag', 55),
    chain: label('#8e99bd', anchor(0.4, -3.4), 'tag', 55)
  };
  say(LB.body, 'add them up'); say(LB.bias, '+ bias'); say(LB.sq, 'squash: tanh'); say(LB.out, 'one number out'); say(LB.chain, '×  ×  ×  +  +  squash');

  // ---------- tiny tween engine ----------
  function pulse(mesh, dur, delay) { const s = mesh.scale.x; anim(t => { mesh.scale.setScalar(s * (1 + 0.25 * Math.sin(Math.PI * t))); }, dur, delay); }
  function travel(orb, curve, dur, delay, after) { anim(t => { orb.visible = true; orb.position.copy(curve.getPoint(t)); if (t >= 0.999 && after) { after(); after = null; } }, dur, delay, easeInOut); }

  // ---------- the steps ----------
  const rigBox = (b) => [rig.position.x + b[0] * 0.2, rig.position.x + b[1] * 0.2, rig.position.y + b[2] * 0.2, rig.position.y + b[3] * 0.2];
  const steps = [
    { dur: 15, title: 'After the map', box: [-9.6, 9.6, -9.1, 9.7], yaw: 0,
      text: 'After the map we have a better idea of what sits inside AI. The part that matters for us is the centre: what the language models are built from. Trace the layers inward and we reach machine learning, and inside it neural networks. Everything else can go grey for now.',
      line: 'AI ⊃ machine learning ⊃ <span class="o">neural networks</span>' },
    { dur: 13, title: 'A very large network', box: [-6.4, 6.4, -8.6, 3.7], yaw: 0.06,
      text: 'A language model is a very large neural network with a particular wiring. Rows of small units, each row feeding the next. And a network can be stripped down to its smallest part: one unit, a neuron. Everything the network does is this unit, repeated.',
      line: 'language model = a very large network of neurons' },
    { dur: 12, title: 'A neuron', box: null, rb: [-7.8, 2.0, -3.6, 3.4], yaw: -0.14,
      text: 'A neuron is a short series of calculations in a fixed order. Numbers come in. Several of them, each on its own wire: in a real network, the outputs of the row before. The neuron receives them and cannot change them.',
      line: '<span class="i">numbers in</span>, one per wire' },
    { dur: 13, title: 'Weights', box: null, rb: [-7.8, 2.0, -3.6, 3.4], yaw: -0.1,
      text: 'Each number is multiplied by a weight: a number that decides how much that input counts. Near zero, the input is ignored. Large, it dominates. Negative, it is flipped. One weight per wire, and the weights belong to the neuron.',
      line: 'each <span class="i">number</span> × its <span class="k">weight</span>' },
    { dur: 12, title: 'Add them up, add the bias', box: null, rb: [-7.8, 2.0, -3.8, 3.4], yaw: 0,
      text: 'The results are added up into one total. Then one more number, the bias, is added to that total whatever the inputs were. It lets the neuron lean towards yes or no before it has looked at anything. One bias per neuron.',
      line: '<span class="s">add them up</span> + <span class="k">bias</span>' },
    { dur: 16, title: 'Squash: tanh', box: null, rb: [-7.8, 8.8, -3.8, 3.6], yaw: 0.18,
      text: 'That total is then squashed. For decades the squash was tanh, a fixed curve that bends any number into the range from minus one to one. The bend is the point: without it, rows of neurons would collapse into one straight line and could not learn anything curved.',
      line: '<span class="o">squash</span>: tanh, bends into −1 … 1' },
    { dur: 14, title: 'Squash: ReLU', box: null, rb: [-7.8, 8.8, -3.8, 3.6], yaw: 0.18,
      text: 'Today most networks use ReLU instead. It does the same job more cheaply: negative numbers become zero, positive numbers pass through unchanged. And it keeps the learning signal alive through many layers, where tanh goes flat at both ends and the signal fades.',
      line: '<span class="o">squash</span>: ReLU, 0 or the number itself' },
    { dur: 10, title: 'One output', box: null, rb: [-7.8, 8.8, -3.8, 3.6], yaw: 0.06,
      text: 'Out of all that comes one number: the neuron’s output. That is all the next row will ever see of it. The weights, the sum, the bias and the squash stay inside.',
      line: '<span class="o">one number out</span>' },
    { dur: 16, title: 'A network repeats it', box: [-4.6, 4.6, -3.6, 3.6], yaw: 0,
      text: 'A network repeats this little calculation for every neuron, in rows, with the outputs of one row feeding the next. In a language model that is millions of neurons and billions of weights. Every one of those weights is a number that training will adjust. The next pills show how.',
      line: 'repeat for every neuron, row after row · the weights are what training adjusts' }
  ];
  for (const s of steps) if (s.rb) s.box = rigBox(s.rb);
  steps[8].box = [NNC.x + steps[8].box[0], NNC.x + steps[8].box[1], NNC.y + steps[8].box[2], NNC.y + steps[8].box[3]];

  // deterministic resting state at the start of step i
  function baseState(i) {
    clearAnims();
    const set = (m, on, op, em) => { m.visible = on; m.material.opacity = on ? op : 0; m.material.emissiveIntensity = on ? em : 0; m.scale.setScalar(1); };
    // onion: lit on step 0; from step 1 everything but neural networks is grey; from step 2 the NN disc is a faint backdrop
    layers.forEach(L => { const isNN = L === NN; const grey = i >= 1 && !isNN; setLayer(L, grey ? 1 : 0, i >= 2 ? (isNN ? 0.12 : 0.25) : 1); state(L.lbl, i === 0 ? 'on' : isNN && i === 1 ? 'on' : ''); });
    // network: lit on step 1 (chosen neuron brighter) and on step 8
    const netOn = i === 1 || i === 8;
    setNet(netOn ? 1 : 0, i === 1 ? 0.2 : 0.5); if (i === 1) chosen.material.emissiveIntensity = 1.0;
    state(LBnet, i === 8 ? 'on' : '');
    // rig: parts appear step by step and stay
    const inRig = i >= 2 && i <= 7, knobs = i >= 3, summed = i >= 4, squashed = i >= 5, relu = i >= 6, outp = i >= 7;
    for (const m of rigParts) hide(m);
    for (const o of M.orbs.concat([M.orbB, M.orbO])) o.visible = false;
    if (inRig) {
      M.x.forEach(m => set(m, true, 1, i === 2 ? 0.9 : 0.3)); M.tIn.forEach(m => set(m, true, 0.6, 0.4));
      M.k.forEach(m => set(m, knobs, 1, i === 3 ? 1.1 : 0.7));
      set(M.body, true, 1, summed ? 0.55 : 0.08); M.body.material.color.setHex(summed ? C.signal : C.body); M.body.material.emissive.setHex(summed ? C.signal : C.body);
      set(M.bias, summed, 1, i === 4 ? 1.1 : 0.7); set(M.tB, summed, 0.6, 0.4);
      set(M.tO, squashed, 0.6, 0.4); set(M.out, outp, 1, 1.0);
      if (i === 2 || i === 3) M.orbs.forEach((o, j) => { o.visible = true; o.position.copy(P.k[j]); });
    }
    setPanel(inRig && squashed ? 1 : 0, relu ? 0.25 : 1, relu ? 1 : 0, 0.5);
    dot.position.set(relu ? 0.9 : 0.5, relu ? 0.9 * 2 * 0.42 : Math.tanh(1.0) * 1.2, 0);
    LB.x.forEach(L => state(L, inRig ? (i === 2 ? 'on' : 'dim') : ''));
    LB.k.forEach(L => state(L, inRig && knobs ? (i === 3 ? 'on' : 'dim') : ''));
    state(LB.body, inRig && summed ? (i === 4 ? 'on' : 'dim') : ''); state(LB.bias, inRig && summed ? (i === 4 ? 'on' : 'dim') : '');
    say(LB.sq, relu ? 'squash: ReLU' : 'squash: tanh'); state(LB.sq, inRig && squashed ? (i === 5 || i === 6 ? 'on' : 'dim') : '');
    state(LB.out, inRig && outp ? 'on' : ''); state(LB.chain, i === 7 ? 'on' : '');
  }

  const enter = [
    () => { // grey the onion from the outside in, then from the inside out, leaving neural networks lit
      layers.forEach(L => setLayer(L, 0, 1));
      const order = [5, 4, 0, 1, 2];
      order.forEach((k, j) => { const L = layers[k]; anim(t => setLayer(L, t, 1), 0.9, 1.0 + j * 0.7); later(() => state(L.lbl, 'dim'), 1.2 + j * 0.7); });
      later(() => { pulse(NN.mesh, 0.8, 0); glow(NN.mesh, 0.5, 0.5, 0); glow(NN.mesh, 0.22, 0.6, 0.6); }, 4.8);
    },
    () => { // into the disc: it fades to a backdrop while the network grows inside it
      setLayer(NN, 0, 1); anim(t => setLayer(NN, 0, lerp(1, 0.12, t)), 1.2, 0.6);
      layers.forEach(L => { if (L !== NN) anim(t => setLayer(L, 1, lerp(1, 0.25, t)), 1.2, 0.6); });
      state(NN.lbl, 'on'); later(() => state(NN.lbl, ''), 1.0);
      setNet(0, 0.2); for (const n of nodes) n.scale.setScalar(0.01);
      anim(t => { for (const n of nodes) { n.material.opacity = t; n.visible = t > 0.01; n.scale.setScalar(0.01 + 0.99 * t); } }, 1.2, 1.4);
      anim(t => { for (const w of wires) { w.material.opacity = 0.35 * t; w.visible = t > 0.01; } }, 1.2, 2.0);
      chosen.material.emissiveIntensity = 0.2; later(() => { glow(chosen, 1.0, 0.6, 0); pulse(chosen, 0.9, 0); }, 4.2);
    },
    () => { // into the neuron: the network fades, the rig appears, three numbers arrive and wait on their wires
      setNet(1, 0.2); chosen.material.emissiveIntensity = 1.0; anim(t => setNet(1 - t, 0.2), 0.9, 0.2);
      M.x.forEach(m => { m.material.opacity = 0; fade(m, 1, 0.6, 0.9); }); M.tIn.forEach(m => { m.material.opacity = 0; fade(m, 0.6, 0.6, 1.0); }); M.body.material.opacity = 0; fade(M.body, 1, 0.6, 1.0);
      M.orbs.forEach((o, j) => { o.visible = false; travel(o, new THREE.CatmullRomCurve3([P.x[j], P.k[j]]), 1.4, 1.8 + j * 0.5); });
      LB.x.forEach(L => state(L, '')); LB.x.forEach((L, j) => later(() => state(L, 'on'), 1.6 + j * 0.5));
    },
    () => { // the weights appear around the waiting numbers and spin
      M.k.forEach((m, j) => { m.material.opacity = 0; fade(m, 1, 0.6, 0.3 + j * 0.4); anim(t => { m.rotation.x = t * Math.PI * 2; }, 2.0, 0.4 + j * 0.4); });
      LB.k.forEach(L => state(L, '')); LB.k.forEach((L, j) => later(() => state(L, 'on'), 0.9 + j * 0.4));
    },
    () => { // the numbers go on to the body and are added; the bias arrives from below
      M.body.material.color.setHex(C.body); M.body.material.emissive.setHex(C.body); M.body.material.emissiveIntensity = 0.08;
      M.orbs.forEach((o, j) => { o.visible = true; o.position.copy(P.k[j]); travel(o, new THREE.CatmullRomCurve3([P.k[j], P.body]), 1.2, 0.3 + j * 0.3, j === 2 ? () => {
        const a = new THREE.Color(C.body), b = new THREE.Color(C.signal);
        anim(t => { M.body.material.color.lerpColors(a, b, t); M.body.material.emissive.copy(M.body.material.color); M.body.material.emissiveIntensity = lerp(0.08, 0.55, t); }, 1.0, 0); pulse(M.body, 0.9, 0);
        M.orbs.forEach(oo => { oo.visible = false; });
      } : null); });
      state(LB.body, ''); later(() => state(LB.body, 'on'), 2.0);
      M.bias.material.opacity = M.tB.material.opacity = 0; fade(M.bias, 1, 0.6, 2.4); fade(M.tB, 0.6, 0.6, 2.6); anim(t => { M.bias.rotation.z = t * Math.PI * 2; }, 1.8, 2.5);
      state(LB.bias, ''); later(() => state(LB.bias, 'on'), 3.0);
      travel(M.orbB, wireB, 1.3, 3.6, () => { pulse(M.body, 0.8, 0); M.orbB.visible = false; });
    },
    () => { // the squash panel: first the straight line, then the tanh bend, then a dot riding the curve
      setPanel(0, 1, 0, 0.5); anim(t => setPanel(t, 0, 0, 0.5), 0.8, 0.3);
      anim(t => setPanel(1, t, 0, 0.5), 0.9, 1.6);
      state(LB.sq, ''); later(() => state(LB.sq, 'on'), 2.2);
      dot.position.set(-1.6, -1.2, 0); anim(t => { const x = lerp(-3.2, 2.0, t); dot.position.set(x * 0.5, Math.tanh(x) * 1.2, 0); }, 3.0, 2.8);
      M.tO.material.opacity = 0; fade(M.tO, 0.6, 0.8, 1.0);
    },
    () => { // tanh fades back, the ReLU hinge takes its place, the dot rides the hinge
      setPanel(1, 1, 0, 0.5); anim(t => setPanel(1, lerp(1, 0.25, t), t, 0.5), 1.2, 0.6);
      say(LB.sq, 'squash: tanh'); later(() => say(LB.sq, 'squash: ReLU'), 1.0);
      dot.position.set(-1.6, 0, 0); anim(t => { const x = lerp(-3.2, 1.8, t); dot.position.set(x * 0.5, Math.max(0, x) * 0.42, 0); }, 3.0, 2.0);
    },
    () => { // one number leaves
      M.out.material.opacity = 0; M.out.material.emissiveIntensity = 0; state(LB.out, ''); state(LB.chain, '');
      travel(M.orbO, new THREE.CatmullRomCurve3([P.panel, P.out]), 1.2, 0.5, () => { fade(M.out, 1, 0.3, 0); glow(M.out, 1.0, 0.6, 0); pulse(M.out, 0.9, 0); state(LB.out, 'on'); M.orbO.visible = false; });
      later(() => state(LB.chain, 'on'), 2.4);
    },
    () => { // back out: the rig dissolves, the network returns and lights row by row
      baseState(7); for (const L of Object.values(LB).flat()) state(L, ''); state(LB.sq, '');
      for (const m of rigParts) fade(m, 0, 0.8, 0.2); anim(t => setPanel(1 - t, 0.25, 1, 0.5), 0.8, 0.2);
      setNet(0, 0.2); anim(t => setNet(t, 0.2), 1.2, 1.0);
      for (let r = 0; r < ROWS.length; r++) { for (const n of nodes) if (n.userData.row === r) { glow(n, 1.1, 0.4, 2.4 + r * 0.6); glow(n, 0.5, 0.6, 2.9 + r * 0.6); pulse(n, 0.6, 2.4 + r * 0.6); } for (const w of wires) if (w.userData.row === r) { anim(t => { w.material.opacity = 0.35 + 0.5 * Math.sin(Math.PI * t); }, 0.8, 2.7 + r * 0.6); } }
      later(() => state(LBnet, 'on'), 3.0);
    }
  ];

  // ---------- ledger: the recipe so far, every line stays ----------
  const ledgerEl = document.getElementById('ledger');
  function renderLedger(i) {
    ledgerEl.innerHTML = '<div class="ln title">the recipe so far</div>';
    for (let k = 0; k <= i; k++) { const d = document.createElement('div'); d.className = 'ln' + (k === i ? ' now' : ''); d.innerHTML = steps[k].line; ledgerEl.appendChild(d); }
  }

  // ---------- camera fitted to each step's box ----------
  // the content sits on different planes (onion z 0, network z 0.6, neuron z 0.9); the camera target must sit on the same plane or the fit is wrong
  const planeZ = i => i >= 2 && i <= 7 ? 0.9 : i === 8 ? 0.6 : i === 1 ? 0.4 : 0;

  K.run({ steps, enter, baseState, ledger: renderLedger, view: (s, i) => ({ box: s.box, yaw: s.yaw, z: planeZ(i) }) });
})();
