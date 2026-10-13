// The shared kit of the knowledge pills: renderer, camera, labels, panels, tween engine and player.
// A pill calls Pill.create(options) once, takes what it uses from the object it returns, builds its scene,
// and ends with K.run({ steps, enter, baseState, ledger }). Options default to the look of most pills.
import * as THREE from 'three';
window.THREE = THREE;
window.addEventListener('error', e => { document.title = 'ERR ' + e.message + ' @' + e.lineno + ':' + e.colno; });
window.Pill = {
  create(options) {
    const o = Object.assign({ near: 0.1, far: 300, fog: [70, 150], radius: 30, ambient: 0.8, key: 0.6, grid: [220, 110, 0, -8.8], target: [0, 0, 0],
      elev: 0.06, pad: [1.45, 1.14], minRadius: 2, roughness: 0.45, objectScale: false }, options);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ---------- scene ----------
    const stage = document.getElementById('stage'), labelsEl = document.getElementById('labels'), deck = document.getElementById('deck');
    // r128 look: colours are not converted, output is written as it is, and light intensities are not physical (hence the PI)
    THREE.ColorManagement.enabled = false;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d1c);
    scene.fog = new THREE.Fog(0x090d1c, o.fog[0], o.fog[1]);
    const VFOV = 40;
    const camera = new THREE.PerspectiveCamera(VFOV, 1, o.near, o.far);
    const camTarget = new THREE.Vector3(...o.target), camGoal = new THREE.Vector3(...o.target);
    let camRadius = o.radius, camRadiusGoal = o.radius, camYaw = 0, camYawGoal = 0, camElev = o.elev, camElevGoal = o.elev;
    scene.add(new THREE.AmbientLight(0x9aa6cc, o.ambient * Math.PI));
    const key = new THREE.DirectionalLight(0xffffff, o.key * Math.PI); key.position.set(-6, 12, 14); scene.add(key);
    const grid = new THREE.GridHelper(o.grid[0], o.grid[1], 0x1c2544, 0x151d38); grid.position.set(o.grid[2], o.grid[3], -20); scene.add(grid);
    const glowMat = color => new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0, roughness: o.roughness, metalness: 0.1, transparent: true, opacity: 1, side: THREE.DoubleSide });
    const lineMat = (color, op) => new THREE.LineBasicMaterial({ color, transparent: true, opacity: op });

    // ---------- labels ----------
    const labels = [];
    function label(hueCss, obj, base, ref) { const el = document.createElement('div'); el.className = 'lbl ' + (base || ''); el.style.setProperty('--hue', hueCss); labelsEl.appendChild(el); const L = { el, obj, base: base || '', ref: ref || 30, left: (base || '').includes('left'), right: (base || '').includes('right') }; labels.push(L); return L; }
    function say(L, html) { L.el.innerHTML = html; }
    function state(L, s) { L.el.className = 'lbl ' + L.base + (s === 'on' ? ' on' : s === 'dim' ? ' on dim' : ''); }
    const tmp = new THREE.Vector3(), sc = new THREE.Vector3();
    function placeLabels() {
      const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, tanV = Math.tan(VFOV / 2 * Math.PI / 180);
      for (const L of labels) {
        if (!o.objectScale && !L.el.classList.contains('on')) continue;
        L.obj.getWorldPosition(tmp);
        const size = o.objectScale ? L.obj.getWorldScale(sc).y : 1;
        const dist = tmp.distanceTo(camera.position), s = Math.max(0.1, Math.min(2.5, h / (2 * dist * tanV) * size / L.ref));
        tmp.project(camera);
        L.el.style.transform = `translate(${L.left ? '0' : L.right ? '-100%' : '-50%'},-50%) translate(${(tmp.x * .5 + .5) * w}px,${(tmp.y * -.5 + .5) * h}px) scale(${s.toFixed(3)})`;
      }
    }
    const anchor = (x, y, parent, z) => { const a = new THREE.Object3D(); a.position.set(x, y, z || 0); (parent || scene).add(a); return a; };
    const mk = (hue, x, y, cls, parent, z) => label(hue, anchor(x, y, parent, z), cls, 30);

    // ---------- tiny tween engine ----------
    const anims = []; let now = 0;
    const easeOut = t => 1 - Math.pow(1 - t, 3), easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, linear = t => t;
    function anim(fn, dur, delay, ease) { anims.push({ fn, start: now + (reduced ? 0 : (delay || 0)), dur: reduced ? 0.01 : dur, ease: ease || easeOut, done: false }); }
    const lerp = (a, b, t) => a + (b - a) * t;
    function pulse(mesh, dur, delay) { const s = mesh.scale.x; anim(t => { mesh.scale.setScalar(s * (1 + 0.3 * Math.sin(Math.PI * t))); }, dur, delay); }
    function later(fn, s) { anim(t => { if (t >= 1) fn(); }, 0.01, s, linear); }
    function draw(line, k) { line.geometry.setDrawRange(0, Math.max(line.geometry.drawRange.count, k + 1)); }
    // sweep a dot along a curve, drawing it underneath; xs(k) gives the x value and ys(k) the y value for sample k of M
    function sweep(P, dot, line, M, xs, ys, dur, delay, label, labelAt) { dot.visible = false; later(() => { dot.visible = true; }, delay);
      anim(t => { const k = Math.round(t * M); dot.position.set(P.px(xs(k)), P.py(ys(k)), 0.05); draw(line, k); if (label && labelAt !== undefined && t >= labelAt) state(label, 'on'); }, dur, delay, easeInOut); }
    function fade(mesh, to, dur, delay) { const from = mesh.material.opacity; anim(t => { mesh.material.opacity = lerp(from, to, t); mesh.visible = mesh.material.opacity > 0.01; }, dur, delay); }
    function glow(mesh, to, dur, delay) { const from = mesh.material.emissiveIntensity; anim(t => { mesh.material.emissiveIntensity = lerp(from, to, t); }, dur, delay); }
    const on = (lab, at) => later(() => state(lab, 'on'), at);
    const fadeIn = (mesh, dur, at) => { mesh.visible = false; anim(t => { mesh.visible = true; mesh.material.opacity = t; }, dur, at); };
    const drawTo = (l, t) => l.geometry.setDrawRange(0, Math.round(t * (l.userData.n - 1)) + 1);
    function stepAnims() { for (const a of anims) { if (a.done) continue; const t = (now - a.start) / a.dur; if (t < 0) continue; const k = Math.min(1, t); a.fn(a.ease(k)); if (k >= 1) a.done = true; } for (let i = anims.length - 1; i >= 0; i--) if (anims[i].done) anims.splice(i, 1); }
    function clearAnims() { anims.length = 0; }

    // ---------- panels: axes, ticks and names around a curve, in data coordinates ----------
    // options: x0 y0 w h xmin xmax ymin ymax xt yt (tick values) xf yf (tick text) xName yName xHue yHue
    //          yDx (tick offset), noXLines, noYAxis, drawn (add() takes data points and is drawn by drawTo)
    function makePanel(p) {
      const g = new THREE.Group(); scene.add(g);
      const px = v => p.x0 + (v - p.xmin) / (p.xmax - p.xmin) * p.w, py = v => p.y0 + (v - p.ymin) / (p.ymax - p.ymin) * p.h;
      const mats = [], pls = [], tick = v => (v >= 0 ? '' : '−') + String(Math.abs(v));
      function line(pts, color, op, z) { const m = lineMat(color, op); m.userData.op = op; const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.map(q => new THREE.Vector3(q[0], q[1], z || 0))), m); g.add(l); mats.push(m); return l; }
      for (const t of p.yt) if (t !== 0) line([[p.x0 - 0.2, py(t)], [p.x0 + p.w + 0.4, py(t)]], 0x1e2746, 0.9);
      for (const t of p.xt) if (t !== 0 && !p.noXLines) line([[px(t), p.y0 - 0.2], [px(t), p.y0 + p.h + 0.3]], 0x1e2746, 0.9);
      const ax = Math.max(p.ymin, Math.min(p.ymax, 0)), ay = Math.max(p.xmin, Math.min(p.xmax, 0));
      line([[p.x0 - 0.2, py(ax)], [p.x0 + p.w + 0.4, py(ax)]], 0x3a4670, 0.9);
      if (!p.noYAxis) line([[px(ay), p.y0 - 0.2], [px(ay), p.y0 + p.h + 0.3]], 0x3a4670, 0.9);
      for (const t of p.xt) { const L = mk('#8e99bd', px(t), p.y0 - 0.55, 'mono'); say(L, p.xf ? p.xf(t) : tick(t)); pls.push(L); }
      for (const t of p.yt) { const L = mk('#8e99bd', p.x0 - (p.yDx || 0.85), py(t), 'mono'); say(L, p.yf ? p.yf(t) : tick(t)); pls.push(L); }
      const xName = mk(p.xHue, p.x0 + p.w / 2, p.y0 - 1.35, 'tag'); say(xName, p.xName); pls.push(xName);
      const yName = mk(p.yHue, p.x0 + p.w / 2, p.y0 + p.h + 0.95, 'tag'); say(yName, p.yName); if (p.yName) pls.push(yName);
      const P = { g, px, py, xName, yName,
        add: p.drawn ? (pts, color, z, op) => { const l = line(pts.map(q => [px(q[0]), py(q[1])]), color, op || 1, z || 0.02); l.geometry.setDrawRange(0, 0); l.userData.n = pts.length; return l; }
          : (pts, color, z, op) => line(pts, color, op || 1, z || 0.02),
        // a two-point segment in data coordinates that can be grown from its first point
        seg(color, op, z) { const l = line([[0, 0], [0, 0]], color, op || 1, z || 0.03); l.visible = false;
          l.set = (x1, y1, x2, y2, t) => { const k = t === undefined ? 1 : t, a = l.geometry.attributes.position; a.setXYZ(0, px(x1), py(y1), z || 0.03); a.setXYZ(1, px(x1 + (x2 - x1) * k), py(y1 + (y2 - y1) * k), z || 0.03); a.needsUpdate = true; l.visible = k > 0.001; }; return l; },
        dot(color, r) { const d = new THREE.Mesh(new THREE.SphereGeometry(r || 0.17, 24, 16), glowMat(color || 0xc084fc)); d.material.emissiveIntensity = 1; d.visible = false; g.add(d); return d; },
        bar(color) { const b = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 0.3), glowMat(color)); b.material.emissiveIntensity = 0.5; b.visible = false; g.add(b); return b; },
        show(a) { g.visible = a > 0.01; for (const m of mats) m.opacity = a * m.userData.op; for (const L of pls) state(L, a > 0.5 ? 'on' : ''); } };
      P.show(0); return P;
    }

    // ---------- the player: steps, dots, keyboard, camera and the frame loop ----------
    // run({ steps, enter, baseState, ledger, view, onFrame })
    //   enter: an array of functions, one per step (run when moving forward), or a function (i, previous)
    //   view(step, i, forward) -> { box, yaw, elev, z }: where the camera looks; defaults to the step's own box, yaw and elev
    //   K.aim({ box, yaw }) moves the camera again within a step
    //   onFrame(): called every frame before the labels are placed
    function run(r) {
      const steps = r.steps, view = r.view || (s => ({ box: s.box, yaw: s.yaw, elev: s.elev }));
      let step = -1, playing = !reduced, stepStart = 0, curBox = null;
      const countEl = document.getElementById('count'), dotsEl = document.getElementById('dots'), playBtn = document.getElementById('play');
      const eyebrowEl = document.getElementById('eyebrow'), countBar = document.getElementById('count-bar');
      const titleEl = document.getElementById('title'), textEl = document.getElementById('text');
      steps.forEach(() => { const s = document.createElement('span'); s.appendChild(document.createElement('i')); dotsEl.appendChild(s); });
      let freeHeight = 0;
      function fitRadius(box) {
        const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, aspect = w / h;
        const free = freeHeight || h;
        const pad = w < 640 ? o.pad[1] + 0.06 : o.pad[1];
        const halfW = (box[1] - box[0]) / 2 * pad, halfH = (box[3] - box[2]) / 2 * pad, tanV = Math.tan(VFOV / 2 * Math.PI / 180);
        return Math.max(halfH / tanV * (h / free), halfW / (tanV * aspect), o.minRadius);   // free: the part of the canvas the deck bar leaves visible
      }
      function aim(v) { curBox = v.box; camRadiusGoal = fitRadius(v.box); camYawGoal = v.yaw; camElevGoal = v.elev || o.elev; camGoal.set((v.box[0] + v.box[1]) / 2, (v.box[2] + v.box[3]) / 2, v.z || 0); }
      K.aim = aim;
      function go(i, instant) {
        const prev = step;
        step = (i + steps.length) % steps.length; stepStart = now;
        r.baseState(step);
        titleEl.textContent = steps[step].title; textEl.textContent = steps[step].text; r.ledger(step);
        countEl.textContent = (step + 1) + ' / ' + steps.length;
        if (countBar) countBar.textContent = countEl.textContent;
        [...dotsEl.children].forEach((d, k) => { d.classList.toggle('done', k < step); d.firstChild.style.width = k === step ? '0%' : ''; });
        layout(); aim(view(steps[step], step, prev < 0 || prev === step - 1));
        if (instant) { camRadius = camRadiusGoal; camYaw = camYawGoal; camElev = camElevGoal; camTarget.copy(camGoal); }
        if (typeof r.enter === 'function') r.enter(step, prev); else if (prev < 0 || prev === step - 1) r.enter[step]();
      }
      function setPlaying(p) { playing = p; playBtn.textContent = p ? 'Pause' : 'Play'; }
      document.getElementById('next').onclick = () => go(step + 1);
      document.getElementById('prev').onclick = () => go(step - 1);
      playBtn.onclick = () => setPlaying(!playing);
      window.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(step + 1); else if (e.key === 'ArrowLeft') go(step - 1); else if (e.key === ' ' && !e.target.closest('button, a')) { e.preventDefault(); setPlaying(!playing); } });

      // the stage is everything above the deck (and below its own offset); the deck's height changes with the text, so re-measure on every step and resize
      // On narrow or short viewports the deck is a bar over a full-screen stage: the camera fits the scene to the part
      // the eyebrow and the bar leave free, and a view offset centres it there.
      const sheetMode = window.matchMedia('(max-width: 899px), (max-height: 560px)');
      function layout() {
        let h, top = 0, bottom = 0;
        if (sheetMode.matches) {
          stage.style.height = ''; labelsEl.style.height = ''; h = stage.clientHeight;
          top = eyebrowEl.getBoundingClientRect().bottom + 2; bottom = deck.offsetHeight;
          deck.style.setProperty('--bar', bottom + 'px');
        } else h = Math.max(160, window.innerHeight - deck.offsetHeight - stage.offsetTop);
        if (!sheetMode.matches) { stage.style.height = h + 'px'; labelsEl.style.height = h + 'px'; }
        const w = stage.clientWidth; renderer.setSize(w, h, false); camera.aspect = w / h;
        freeHeight = Math.max(80, h - top - bottom);
        if (top || bottom) camera.setViewOffset(w, h, 0, (bottom - top) / 2, w, h); else camera.clearViewOffset();
        camera.updateProjectionMatrix();
        if (curBox) camRadiusGoal = fitRadius(curBox);
      }
      // a resize or rotation re-fits at once: the camera does not travel to its new place
      window.addEventListener('resize', () => { layout(); if (curBox) camRadius = camRadiusGoal; });

      // the text sheet: open or closed, it never touches the stage, and the state stays across steps
      const sheetBtn = document.getElementById('sheet-toggle'), sheetEl = document.getElementById('sheet');
      function setSheet(open) {
        document.body.classList.toggle('sheet-open', open);
        if (sheetBtn) { sheetBtn.setAttribute('aria-expanded', String(open)); sheetBtn.setAttribute('aria-label', open ? 'Hide the text' : 'Show the text'); }
      }
      if (sheetBtn) {
        // the handle exists only where the sheet does: in the wide layout the text is already in view
        const syncHandle = () => { if (sheetMode.matches) { if (!sheetBtn.isConnected) titleEl.after(sheetBtn); } else { setSheet(false); sheetBtn.remove(); } };
        sheetMode.addEventListener('change', syncHandle); syncHandle();
        sheetBtn.onclick = () => setSheet(!document.body.classList.contains('sheet-open'));
        stage.addEventListener('click', () => setSheet(false));
        window.addEventListener('keydown', e => { if (e.key === 'Escape') setSheet(false); });
        let y0 = 0;
        deck.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true });
        deck.addEventListener('touchend', e => {
          const dy = e.changedTouches[0].clientY - y0, inSheet = sheetEl.contains(e.target);
          if (dy > 50 && (!inSheet || sheetEl.scrollTop === 0)) setSheet(false); else if (dy < -50 && !inSheet) setSheet(true);
        }, { passive: true });
      }

      function place(drift) {
        camera.position.set(camTarget.x + Math.sin(camYaw + drift) * camRadius, camTarget.y + camRadius * camElev, camTarget.z + Math.cos(camYaw + drift) * camRadius);
        camera.lookAt(camTarget);
      }
      let last = performance.now();
      function frame(tms) {
        const dt = Math.min(document.hidden ? 1 : 0.05, (tms - last) / 1000); last = tms; now += dt;
        if (playing) { const el = now - stepStart, d = steps[step].dur; dotsEl.children[step].firstChild.style.width = Math.min(100, 100 * el / d) + '%'; if (el >= d) { if (step === steps.length - 1) setPlaying(false); else go(step + 1); } }
        stepAnims();
        const k = reduced ? 1 : 1 - Math.pow(0.03, dt);
        camRadius = lerp(camRadius, camRadiusGoal, k); camYaw = lerp(camYaw, camYawGoal, k); camElev = lerp(camElev, camElevGoal, k); camTarget.lerp(camGoal, k);
        place(reduced ? 0 : Math.sin(now * 0.2) * 0.02);
        if (r.onFrame) r.onFrame();
        placeLabels();
        renderer.render(scene, camera);
        schedule(frame);
      }
      // animation frames stop in a hidden tab; fall back to a timer so the pill keeps its place
      function schedule(fn) { if (document.hidden) setTimeout(() => fn(performance.now()), 33); else requestAnimationFrame(fn); }
      // preview hook (?debug): fast-forward the current step by `secs` of animation time and render once, for screenshots from a hidden tab
      if (/\bdebug\b/.test(location.search)) window.__ff = secs => { const end = now + secs; while (now < end) { now += 0.05; stepAnims(); } camRadius = camRadiusGoal; camYaw = camYawGoal; camElev = camElevGoal; camTarget.copy(camGoal);
        place(0); if (r.onFrame) r.onFrame(); placeLabels(); renderer.render(scene, camera); return now; };
      // firstFitBodyFallback: this pill was framed on the fallback body font; make its first fit there, then let the web font settle in
      const root = document.documentElement.style;
      if (r.firstFitBodyFallback) root.setProperty('--body', "'Helvetica Neue', Arial, sans-serif");
      layout(); go(0, true);
      root.removeProperty('--body');
      schedule(frame);    }

    const K = { reduced, stage, labelsEl, deck, renderer, scene, camera, glowMat, lineMat, label, say, state, anchor, mk, placeLabels, makePanel,
      anim, pulse, later, draw, sweep, fade, glow, on, fadeIn, drawTo, easeOut, easeInOut, linear, lerp, run, clearAnims,
      get now() { return now; } };
    return K;
  }
};
