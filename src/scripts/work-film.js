// A live, transparent film drawn in line: a point → a neural network wires itself layer by layer, its rings of neurons
// turning against each other while signals take paths through it → the linked circles of a Hopf torus (the shape of the
// brain's grid-cell code) → the Lorenz attractor (determinism and chaos) → everything gathers to the point → the
// calligraphic R is written outward from its heart in ink → it retracts to the point, and the loop begins again.
//
// Every figure is a set of curves sampled along their length. Each new figure draws itself on curve by curve while the last one shrinks
// and fades; the attractor is traced out as its trajectory unfolds. Every figure is bounded (|p| ≤ 1.1 before
// framing, well inside the frame), so nothing is ever cropped. Line weight and opacity follow depth. The accent is one
// continuous thing per figure (signals on the edges, one fibre, the present state, the wet tip of the ink).

const K = 32, M = 96, LOOP = 26, BINS = 6;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => x * x * (3 - 2 * x);
const lerp = (a, b, p) => a + (b - a) * p;
const mix3 = (a, b, q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)];
const rot4 = ([x, y, z, w], a1, a2) => { // turn in the XW and YZ planes
  [x, w] = [x * Math.cos(a1) - w * Math.sin(a1), x * Math.sin(a1) + w * Math.cos(a1)];
  [y, z] = [y * Math.cos(a2) - z * Math.sin(a2), y * Math.sin(a2) + z * Math.cos(a2)];
  return [x, y, z, w];
};

/* ---------- the network: five layers left to right, each a slim column of neurons turning in a narrow ellipse,
   alternate layers turning opposite ways; each neuron wired to its receptive field in the next layer ---------- */
const NL = [4, 7, 9, 7, 4], NX = [-0.9, -0.45, 0, 0.45, 0.9], NR = [0.38, 0.6, 0.78, 0.6, 0.38], DEPTH = 0.2; // |p| ≤ 1.01
const NOFF = NL.map((_, l) => NL.slice(0, l).reduce((a, b) => a + b, 0)); // first neuron of each ring
const NE = []; // edges, ring pair by ring pair, so drawing them on in order wires the net layer by layer
const arc = (l, j) => (j / NL[l]) * 6.2832 + l * 0.5, near = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) < 1.25;
for (let l = 0; l < NL.length - 1; l++) for (let a = 0; a < NL[l]; a++) for (let b = 0; b < NL[l + 1]; b++) if (near(arc(l, a), arc(l + 1, b))) NE.push([NOFF[l] + a, NOFF[l + 1] + b]);
const RING = NL.flatMap((n, l) => Array(n).fill(l)), SLOT = NL.flatMap((n) => [...Array(n).keys()]);
function neuron(i, t) {
  const l = RING[i], a = arc(l, SLOT[i]) + t * 0.3 * (l % 2 ? -1 : 1), wob = 0.35 * Math.sin(t * 0.35);
  const x = NX[l], y = NR[l] * Math.cos(a), z = DEPTH * Math.sin(a);
  return [x * Math.cos(wob) + z * Math.sin(wob), y, -x * Math.sin(wob) + z * Math.cos(wob)];
}
function network(k, f, t) {
  const [a, b] = NE[k];
  return mix3(neuron(a, t), neuron(b, t), f);
}
const netDots = (t) => NL.flatMap((n, l) => [...Array(n)].map((_, j) => [neuron(NOFF[l] + j, t), P(t, FIGS[0].in + l * 0.4, FIGS[0].in + 0.25 + l * 0.4)]));
const hash = (x) => { const s = Math.sin(x * 127.1) * 43758.5453; return s - Math.floor(s); };
function netSignals(t) { // a forward pass: each signal takes one path, a neuron per ring, easing through each synapse
  const out = [];
  for (let b = 0; b < 8; b++) {
    const L = NL.length - 1, ph = t * 0.9 + b * 0.53, cycle = Math.floor(ph / L), seg = Math.floor(ph % L), f = (ph % L) - seg;
    const step = (l, j) => { const outs = NE.filter(([a]) => a === NOFF[l] + j); return outs[Math.floor(hash(b * 31 + cycle * 17 + l * 5 + j) * outs.length)][1] - NOFF[l + 1]; };
    let j = Math.floor(hash(b * 13 + cycle * 7) * NL[0]);
    for (let l = 0; l < seg; l++) j = step(l, j);
    out.push(mix3(neuron(NOFF[seg] + j, t), neuron(NOFF[seg + 1] + step(seg, j), t), ease(f)));
  }
  return out;
}

/* ---------- the Hopf torus: fibres of the Clifford torus turning in 4D ---------- */
const D4 = 1.45, BOUND = 1 / Math.sqrt(D4 * D4 - 1), E2 = Math.SQRT1_2;
function torus(k, f, t) {
  const u = f * 6.2832, ph = (k / K) * 6.2832 + t * 0.2;
  const [x, y, z, w] = rot4([E2 * Math.cos(u), E2 * Math.sin(u), E2 * Math.cos(u + ph), E2 * Math.sin(u + ph)], t * 0.3, t * 0.18);
  const s = 0.9 / ((D4 - w) * BOUND); // perspective from w = 1.45 keeps |p| ≤ 0.9 (stereographic would fly to infinity)
  return [x * s, y * s, z * s];
}

/* ---------- the Lorenz attractor: K consecutive windows sliding along one trajectory ---------- */
const LZ = (() => {
  const f = ([x, y, z]) => [10 * (y - x), x * (28 - z) - y, x * y - (8 / 3) * z], h = 0.006, out = [];
  let p = [1, 1, 1];
  for (let i = 0; i < 26000; i++) {
    const k1 = f(p), k2 = f(p.map((v, n) => v + (h / 2) * k1[n])), k3 = f(p.map((v, n) => v + (h / 2) * k2[n])), k4 = f(p.map((v, n) => v + h * k3[n]));
    p = p.map((v, n) => v + (h / 6) * (k1[n] + 2 * k2[n] + 2 * k3[n] + k4[n]));
    if (i > 2000 && i % 2 === 0) out.push([p[0] / 36, (p[2] - 25) / 36, p[1] / 36]); // butterfly faces the viewer, |p| < 1
  }
  return out;
})();
const WIN = 150, FLOW = 55; // trajectory samples per curve; samples per second the figure flows
function lorenz(k, f, t) {
  const x = Math.max(0, t - 11.8) * FLOW + (k + f) * WIN, i = Math.floor(x), u = x - i;
  return mix3(LZ[i], LZ[i + 1], u);
}

/* ---------- the timeline ---------- */
// in/out: when a figure appears and when it has faded; draw/stag: seconds each curve takes to draw on, spread across curves.
const GATHER = [18, 19], INK_T = [19.2, 23], RETRACT = [24.6, 25.5], STILL_AT = 24;
const FIGS = [
  { fn: network, n: NE.length, m: 10, in: 1, out: 6, draw: 0.35, stag: 1.6, alpha: 0.7, dots: netDots, signals: netSignals },
  { fn: torus, n: K, m: M, in: 5.6, out: 12.2, draw: 1.2, stag: 0.8, hot: 3 },
  { fn: lorenz, n: K, m: M, in: 11.8, out: GATHER[1], draw: 0.25, stag: 1.6, hot: K - 1, last: true },
];

/* ---------- the R, written outward from its heart ---------- */
async function monogram() {
  const img = new Image();
  img.src = "/rumi-monogram.png";
  await img.decode();
  return img;
}
function inkField(img, W) { // per pixel: ink coverage, and arrival step of a breadth-first flood from the letter's heart
  const m = document.createElement("canvas");
  m.width = m.height = W;
  const x = m.getContext("2d"), s = W * 0.8, o = (W - s) / 2;
  x.drawImage(img, o, o, s, s);
  const px = x.getImageData(0, 0, W, W).data, cov = new Float32Array(W * W), arr = new Int32Array(W * W).fill(1e9);
  for (let i = 0; i < W * W; i++) cov[i] = (clamp((600 - px[i * 4] - px[i * 4 + 1] - px[i * 4 + 2]) / 450) * px[i * 4 + 3]) / 255;
  let seed = 0, best = Infinity;
  const hx = o + (600 / 1254) * s, hy = o + (590 / 1254) * s; // where the stem crosses the bowl
  for (let i = 0; i < W * W; i++) if (cov[i] > 0.6) { const d = ((i % W) - hx) ** 2 + (((i / W) | 0) - hy) ** 2; if (d < best) { best = d; seed = i; } }
  let front = [seed], step = 0;
  arr[seed] = 0;
  while (front.length) {
    const next = [];
    step++;
    for (const i of front) {
      const cx = i % W, cy = (i / W) | 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const j = (cy + dy) * W + cx + dx;
        if (j >= 0 && j < W * W && cov[j] > 0.05 && arr[j] > step) { arr[j] = step; next.push(j); }
      }
    }
    front = next;
  }
  const idx = [];
  for (let i = 0; i < W * W; i++) if (cov[i] > 0.02 && arr[i] < 1e9) idx.push(i);
  const cv = document.createElement("canvas");
  cv.width = cv.height = W;
  const cx = cv.getContext("2d");
  return { cov, arr, max: step, idx: Int32Array.from(idx), cv, cx, out: cx.createImageData(W, W) };
}

/* ---------- drawing ---------- */
export async function mount(canvas) {
  const img = await monogram();
  const g = canvas.getContext("2d"), bins = [...Array(2 * BINS)].map(() => []);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches; // reduced motion: one frame of the finished R
  let W = 0, dpr = 1, dark = false, INK = [18, 18, 17], ACC = [168, 109, 89], R = null;
  const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  function frame(time) {
    const t = time % LOOP, S = W * 0.42, ox = W / 2, oy = W / 2;
    g.clearRect(0, 0, W, W);
    // camera: a slow turn and a gentle tilt
    const turn = ease(P(t, 5.3, 6.6)), yaw = t * 0.08 * turn, tilt = lerp(0.06, 0.35, turn), cyw = Math.cos(yaw), syw = Math.sin(yaw), ct = Math.cos(tilt), st = Math.sin(tilt);
    const proj = ([x, y, z]) => { [x, z] = [x * cyw + z * syw, -x * syw + z * cyw]; [y, z] = [y * ct - z * st, y * st + z * ct]; return [ox + x * S, oy - y * S, z]; };
    const beads = [];
    for (const F of FIGS) {
      if (t < F.in || t > F.out) continue;
      const exit = F.last ? ease(P(t, ...GATHER)) : ease(P(t, F.out - 0.7, F.out));
      const scale = F.last ? 1 - exit : 1 - 0.15 * exit, fade = F.last ? 1 - P(t, GATHER[0] + 0.4, GATHER[1]) : 1 - exit;
      const settled = t > F.in + F.stag + F.draw;
      bins.forEach((b) => (b.length = 0));
      let tip = null;
      for (let k = 0; k < F.n; k++) {
        const drawn = ease(P(t, F.in + (k / F.n) * F.stag, F.in + (k / F.n) * F.stag + F.draw));
        if (drawn <= 0) continue;
        if (drawn < 1 || k === F.n - 1) tip = [k, drawn];
        const hot = settled && k === F.hot;
        let prev = null;
        for (let j = 0; j <= F.m; j++) {
          const f = Math.min(j / F.m, drawn), p = proj(F.fn(k, f, t).map((v) => v * scale));
          if (prev) bins[(hot ? BINS : 0) + Math.floor(clamp((prev[2] + p[2]) / 4 + 0.5, 0, 0.999) * BINS)].push(prev[0], prev[1], p[0], p[1]);
          prev = p;
          if (f >= drawn) break;
        }
      }
      for (const glow of dark ? [true, false] : [false]) // dark mode: a wide faint stroke under each line, glow that works in every browser
        bins.forEach((b, i) => {
          if (!b.length) return;
          const d = ((i % BINS) + 1) / BINS, hot = i >= BINS, w = dpr * (0.5 + 1.2 * d * d) * (hot ? 1.3 : 1);
          g.lineWidth = glow ? w * 4 : w;
          g.strokeStyle = rgba(hot ? ACC : INK, (0.14 + 0.8 * d) * fade * (F.alpha ?? 1) * (glow ? 0.1 : 1));
          g.beginPath();
          for (let j = 0; j < b.length; j += 4) { g.moveTo(b[j], b[j + 1]); g.lineTo(b[j + 2], b[j + 3]); }
          g.stroke();
        });
      if (F.dots) for (const [v, a] of F.dots(t)) { // neurons
        const p = proj(v.map((c) => c * scale));
        g.fillStyle = rgba(INK, a * fade * clamp(p[2] / 2 + 0.7));
        g.beginPath(); g.arc(p[0], p[1], 2 * dpr, 0, 6.2832); g.fill();
      }
      // signals: along the network's paths and the torus's fibres; the attractor's present state at its tip
      if (F.signals && settled) for (const v of F.signals(t)) beads.push([v, scale, fade]);
      if (F.fn === torus && settled) for (let n = 0; n < 5; n++) beads.push([torus((n * 7 + 1) % K, (t * 0.14 + n * 0.21) % 1, t), scale, fade]);
      if (F.fn === lorenz && tip) beads.push([lorenz(tip[0], tip[1], t), scale, fade]);
    }
    for (const [v, sc, fd] of beads) {
      const p = proj(v.map((c) => c * sc));
      g.fillStyle = rgba(ACC, clamp(p[2] / 2 + 0.75) * fd);
      g.beginPath(); g.arc(p[0], p[1], 1.7 * dpr, 0, 6.2832); g.fill();
    }
    // the point: before birth, as everything gathers, and after the R retracts
    const dot = Math.max(1 - P(t, FIGS[0].in, FIGS[0].in + 0.6), P(t, GATHER[1] - 0.5, GATHER[1]) * (1 - P(t, INK_T[0] + 0.2, INK_T[0] + 0.8)), P(t, RETRACT[1] - 0.2, LOOP - 0.2));
    if (dot > 0) { g.fillStyle = rgba(ACC, dot); g.beginPath(); g.arc(ox, oy, 2.2 * dpr, 0, 6.2832); g.fill(); }
    // the R: ink runs out from its heart along every stroke; a wet terracotta band just behind the front
    if (R && t > INK_T[0]) {
      const grow = ease(P(t, ...INK_T)) * (1 - ease(P(t, ...RETRACT))), T = grow * (R.max + 30), band = R.max * 0.06, d = R.out.data;
      d.fill(0);
      for (const i of R.idx) {
        const a = R.arr[i];
        if (a > T) continue;
        const wet = grow < 1 && a > T - band ? 1 - (T - a) / band : 0;
        d[i * 4] = lerp(INK[0], ACC[0], wet); d[i * 4 + 1] = lerp(INK[1], ACC[1], wet); d[i * 4 + 2] = lerp(INK[2], ACC[2], wet);
        d[i * 4 + 3] = 255 * R.cov[i] * clamp((T - a) / 6);
      }
      R.cx.putImageData(R.out, 0, 0);
      g.drawImage(R.cv, 0, 0); // through an offscreen canvas: putImageData would overwrite everything else
    }
  }

  const theme = () => {
    dark = document.documentElement.classList.contains("dark");
    const v = getComputedStyle(document.documentElement).getPropertyValue("--color-text-base").split(",").map(Number);
    if (v.length === 3 && v.every((n) => !Number.isNaN(n))) INK = v;
    ACC = dark ? [234, 128, 90] : [168, 109, 89];
    if (still) frame(STILL_AT);
  };
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.round(canvas.getBoundingClientRect().width * dpr);
    if (w === W || !w) return;
    W = canvas.width = canvas.height = w;
    R = inkField(img, W);
    if (still) frame(STILL_AT); // resizing clears the canvas
  };
  resize(); theme();
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  if (still) return;

  let visible = false, elapsed = 0, last = 0, raf = 0;
  const tick = (now) => {
    elapsed += Math.min(0.1, (now - last) / 1000);
    last = now;
    frame(elapsed);
    raf = requestAnimationFrame(tick);
  };
  const update = () => {
    const run = visible && document.visibilityState === "visible";
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; update(); }).observe(canvas);
  document.addEventListener("visibilitychange", update);
  frame(0);
}
