// A live, transparent film in one arc: sacred geometry → technology → neural networks → the monogram, then back to the point.
// Point, Seed and Flower of Life → Metatron's Cube → vector equilibrium and geodesic sphere → circuit board
// → layered network → connectome → the calligraphic R → collapse to the point. Line art draws itself on; particles are the light along it.
// Each formation declares its radius and the camera frames it with room to spare, so nothing is cropped.

const N = 4000;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const P = (t, a, b) => clamp((t - a) / (b - a));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(11);
const R1 = new Float32Array(N), R4 = new Float32Array(N), G = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  R1[i] = R(); R4[i] = R();
  for (let k = 0; k < 3; k++) { const u = Math.max(1e-6, R()), v = R(); G[i * 3 + k] = Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); }
}
const buf = () => ({ pos: new Float32Array(N * 3), bri: new Float32Array(N), acc: new Float32Array(N), sz: new Float32Array(N), bounds: 1 });
const A = buf(), B = buf();
const put = (o, i, [x, y, z], b, a, s) => { o.pos[i * 3] = x; o.pos[i * 3 + 1] = y; o.pos[i * 3 + 2] = z; o.bri[i] = b; o.acc[i] = a; o.sz[i] = s; };
const rot = ([x, y, z], ay, ax) => { let c = Math.cos(ay), s = Math.sin(ay); [x, z] = [x * c + z * s, -x * s + z * c]; c = Math.cos(ax); s = Math.sin(ax); return [x, y * c - z * s, y * s + z * c]; };
const roll = ([x, y, z], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const mixv = (a, b, q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)];
const hex = (k, r, off = 90) => { const a = ((k * 60 + off) * Math.PI) / 180; return [Math.cos(a) * r, Math.sin(a) * r, 0]; };
const jit = (i, p, s) => [p[0] + G[i * 3] * s, p[1] + G[i * 3 + 1] * s, p[2] + G[i * 3 + 2] * s];

// [formation, seconds, morph seconds]
const PLAN = [["flower", 2.8, 0.9], ["metatron", 2.6, 0.8], ["solids", 2.8, 0.8], ["circuit", 2.6, 0.9], ["network", 2.6, 0.9], ["connectome", 3, 0.9], ["mono", 3.4, 1.1]];
let acc = 0;
const SECTIONS = PLAN.map(([id, d, morph]) => { const s = { id, t0: acc, t1: acc + d, morph }; acc += d; return s; });
const LOOP = acc;
const sectionAt = (t) => { let k = 0; SECTIONS.forEach((s, i) => { if (t >= s.t0) k = i; }); return k; };

/* ---------- 1. point → vesica → Seed of Life → Flower of Life ---------- */
const r0 = 70;
const FOL = [[0, 0, 0]];
for (let k = 0; k < 6; k++) FOL.push(hex(k, r0, 0));
for (let k = 0; k < 6; k++) FOL.push(hex(k, 2 * r0, 0), hex(k, Math.sqrt(3) * r0, 30));
const drawAt = (c) => (c === 0 ? 0.25 : c < 7 ? 0.6 + (c - 1) * 0.09 : 1.2 + (c - 7) * 0.05);
const DRAW = 0.5, OUTER = 3 * r0, OUTER_AT = 1.95;
const FOL_X = []; // intersections of the 19 circles: where the light gathers
for (let a = 0; a < 19; a++) for (let b = a + 1; b < 19; b++) {
  const d = dist(FOL[a], FOL[b]);
  if (d <= 0 || d >= 2 * r0) continue;
  const h = Math.sqrt(r0 * r0 - (d * d) / 4), m = mixv(FOL[a], FOL[b], 0.5), ux = (FOL[b][0] - FOL[a][0]) / d, uy = (FOL[b][1] - FOL[a][1]) / d;
  for (const sg of [-1, 1]) {
    const p = [m[0] - uy * h * sg, m[1] + ux * h * sg, 0];
    if (Math.hypot(p[0], p[1]) < OUTER + 1 && !FOL_X.some((q) => dist(p, q) < 1)) FOL_X.push([...p, Math.max(drawAt(a), drawAt(b)) + DRAW]);
  }
}
function flower(o, t, S) {
  const u = t - S.t0, spin = u * 0.12;
  for (let i = 0; i < N; i++) {
    let p = [0, 0, 0], b = 0, a = 0, s = 1;
    if (u < 0.25) { p = jit(i, [0, 0, 0], 3); b = 1; s = 1.2; } // the monad
    else if (i % 5 === 0) { const x = FOL_X[i / 5 % FOL_X.length | 0]; if (u > x[3]) { p = jit(i, x, 2.5); b = 0.95; a = Math.exp(-(u - x[3]) * 3); s = 1.3; } }
    else if (i % 23 === 0) { const q = P(u, OUTER_AT, OUTER_AT + 0.7), th = R1[i] * 6.2832 * q; p = [Math.cos(th) * OUTER, Math.sin(th) * OUTER, 0]; b = q > 0 ? 0.6 : 0; }
    else { const c = i % 19, q = P(u, drawAt(c), drawAt(c) + DRAW), th = R1[i] * 6.2832 * q; p = [FOL[c][0] + Math.cos(th) * r0, FOL[c][1] + Math.sin(th) * r0, 0]; b = q > 0 ? 0.45 : 0; s = 0.8; }
    put(o, i, roll(p, spin), b, a, s);
  }
  o.bounds = OUTER; // framed on the finished flower from the start, so the point never fills the screen
}
function flowerLines(t, S, L) {
  const u = t - S.t0, spin = u * 0.12;
  FOL.forEach((c, k) => { const q = ease(P(u, drawAt(k), drawAt(k) + DRAW)); if (q > 0) L.circle(roll(c, spin), r0, q, 0.5, spin); });
  const q = ease(P(u, OUTER_AT, OUTER_AT + 0.7));
  if (q > 0) L.circle([0, 0, 0], OUTER, q, 0.6, spin);
}

/* ---------- 2. Fruit of Life → Metatron's Cube: 13 centres, 78 lines ---------- */
const MET = [[0, 0, 0]];
for (let k = 0; k < 6; k++) MET.push(hex(k, 2 * r0));
for (let k = 0; k < 6; k++) MET.push(hex(k, 4 * r0));
const MET_E = [];
for (let a = 0; a < 13; a++) for (let b = a + 1; b < 13; b++) MET_E.push([a, b]);
MET_E.sort((e, f) => dist(MET[e[0]], MET[e[1]]) - dist(MET[f[0]], MET[f[1]]));
const lineAt = (j) => 0.55 + (j / MET_E.length) * 1.3;
function metatron(o, t, S) {
  const u = t - S.t0, spin = 0.33 + u * 0.1;
  for (let i = 0; i < N; i++) {
    if (i % 4 === 0) { const c = i / 4 % 13 | 0; put(o, i, roll(jit(i, MET[c], 4), spin), 1, c === 0 ? 1 : 0, 1.4); continue; }
    const j = i % MET_E.length, [e0, e1] = MET_E[j], q = P(u, lineAt(j), lineAt(j) + 0.35);
    put(o, i, roll(mixv(MET[e0], MET[e1], R1[i] * q), spin), q > 0 ? 0.5 : 0, 0, 0.75);
  }
  o.bounds = 5 * r0;
}
function metatronLines(t, S, L) {
  const u = t - S.t0, spin = 0.33 + u * 0.1;
  MET.forEach((c, k) => { const q = ease(P(u, 0.1 + k * 0.03, 0.6 + k * 0.03)); if (q > 0) L.circle(roll(c, spin), r0, q, 0.3, spin); });
  MET_E.forEach(([a, b], j) => { const q = ease(P(u, lineAt(j), lineAt(j) + 0.35)); if (q > 0) L.line(roll(MET[a], spin), roll(mixv(MET[a], MET[b], q), spin), 0.35, false); });
}

/* ---------- 3. 2D → 3D: vector equilibrium, then a geodesic sphere ---------- */
function polyhedron(V) {
  let min = Infinity;
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) min = Math.min(min, dist(V[i], V[j]));
  const Ed = [];
  for (let i = 0; i < V.length; i++) for (let j = i + 1; j < V.length; j++) if (dist(V[i], V[j]) < min * 1.01) Ed.push([i, j]);
  return { V, Ed };
}
const PHI = (1 + Math.sqrt(5)) / 2, RAD = 230;
const norm = (v) => { const l = Math.hypot(...v); return v.map((c) => (c / l) * RAD); };
const CUBO = polyhedron([[1, 1, 0], [1, -1, 0], [-1, 1, 0], [-1, -1, 0], [1, 0, 1], [1, 0, -1], [-1, 0, 1], [-1, 0, -1], [0, 1, 1], [0, 1, -1], [0, -1, 1], [0, -1, -1]].map(norm));
const GEO = (() => { // icosahedron subdivided once and pushed out to the sphere: 42 vertices
  const ico = polyhedron([-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [[0, a, b * PHI], [a, b * PHI, 0], [a * PHI, 0, b]])).map(norm));
  return polyhedron([...ico.V, ...ico.Ed.map(([a, b]) => norm(mixv(ico.V[a], ico.V[b], 0.5)))]);
})();
const POLY = [CUBO, GEO];
const polyPos = (k, i) => {
  const { V, Ed } = POLY[k];
  if (i % 6 === 0) return [...jit(i, V[i / 6 % V.length | 0], 4), 1];
  const [a, b] = Ed[i % Ed.length];
  return [...mixv(V[a], V[b], R1[i]), 0];
};
const HALF = 1.3, turn = (u) => [u * 0.7, 0.35 + u * 0.25];
function solids(o, t, S) {
  const u = t - S.t0, k = u < HALF ? 0 : 1, q = k ? ease(P(u, HALF, HALF + 0.6)) : 1, [ay, ax] = turn(u), sw = Math.sin(Math.PI * q) * 30;
  for (let i = 0; i < N; i++) {
    const b = polyPos(k, i), a = k ? polyPos(0, i) : b;
    put(o, i, rot(jit(i, mixv(a, b, q), sw), ay, ax), b[3] ? 1 : 0.55, 0, b[3] ? 1.4 : 0.8);
  }
  o.bounds = RAD;
}
function solidsLines(t, S, L) {
  const u = t - S.t0, k = u < HALF ? 0 : 1, q = k ? P(u, HALF + 0.45, HALF + 0.7) : P(u, 0.3, 0.7), [ay, ax] = turn(u), { V, Ed } = POLY[k];
  if (q > 0) for (const [a, b] of Ed) L.line(rot(V[a], ay, ax), rot(V[b], ay, ax), 0.45 * q, false);
}

/* ---------- 4. circuit: pads, chamfered Manhattan traces, chips, packets on the move ---------- */
const PAD = 64;
const CIRCUIT = (() => {
  const r = rng(9), pads = [], traces = [];
  for (let x = 0; x < 7; x++) for (let y = 0; y < 7; y++) pads.push([(x - 3) * PAD, 0, (y - 3) * PAD]);
  while (traces.length < 34) {
    const a = pads[Math.floor(r() * pads.length)], b = pads[Math.floor(r() * pads.length)];
    if (a === b) continue;
    const dx = b[0] - a[0], dz = b[2] - a[2], c = Math.min(Math.abs(dx), Math.abs(dz)) * 0.5;
    traces.push([a, [b[0] - Math.sign(dx) * c, 0, a[2]], [b[0], 0, a[2] + Math.sign(dz) * c], b]);
  }
  return { pads, traces, chips: [[-96, -96, 60], [96, 32, 44], [-32, 128, 36]] };
})();
const along = (poly, f) => { const x = f * (poly.length - 1), k = Math.min(poly.length - 2, Math.floor(x)); return mixv(poly[k], poly[k + 1], x - k); };
const board = (u, p) => rot(p, u * 0.18, 0);
const traceAt = (n) => 0.3 + n * 0.03;
function circuit(o, t, S) {
  const u = t - S.t0, { pads, traces } = CIRCUIT;
  for (let i = 0; i < N; i++) {
    const n = i % traces.length;
    if (i % 5 === 0) put(o, i, board(u, jit(i, pads[i / 5 % pads.length | 0], 5).map((v, x) => (x === 1 ? 0 : v))), 0.85, 0, 1.1);
    else if (i % 7 === 0) put(o, i, board(u, along(traces[n], (u * 0.45 + R4[i]) % 1)), 1, 1, 1.2); // packets
    else { const q = P(u, traceAt(n), traceAt(n) + 0.6); put(o, i, board(u, along(traces[n], R1[i] * q)), q > 0 ? 0.45 : 0, 0, 0.7); }
  }
  o.bounds = 250;
}
function circuitLines(t, S, L) {
  const u = t - S.t0, { traces, chips } = CIRCUIT, b = (p) => board(u, p);
  traces.forEach((tr, n) => {
    const q = ease(P(u, traceAt(n), traceAt(n) + 0.6));
    for (let k = 0; k < 3; k++) { const f0 = k / 3, f1 = Math.min(q, (k + 1) / 3); if (f1 > f0) L.line(b(along(tr, f0)), b(along(tr, f1)), 0.4, false); }
  });
  chips.forEach(([cx, cz, h], n) => {
    const q = P(u, 0.6 + n * 0.15, 1 + n * 0.15);
    if (q <= 0) return;
    const c = [[cx - h, 0, cz - h], [cx + h, 0, cz - h], [cx + h, 0, cz + h], [cx - h, 0, cz + h]];
    c.forEach((p, j) => L.line(b(p), b(c[(j + 1) % 4]), 0.7 * q, true));
    for (let j = -2; j <= 2; j++) { const z = cz + j * h * 0.35; L.line(b([cx - h, 0, z]), b([cx - h - 12, 0, z]), 0.5 * q, false); L.line(b([cx + h, 0, z]), b([cx + h + 12, 0, z]), 0.5 * q, false); }
  });
}

/* ---------- 5. layered network, forward-pass waves ---------- */
const LAYERS = [4, 8, 12, 8, 4];
const NN = [], NN_E = [];
LAYERS.forEach((n, l) => { for (let j = 0; j < n; j++) NN.push([(l - 2) * 150, (j - (n - 1) / 2) * 42, Math.sin(j * 1.7 + l * 2.1) * 40, l]); });
for (let l = 0, off = 0; l < LAYERS.length - 1; off += LAYERS[l], l++)
  for (let a = 0; a < LAYERS[l]; a++) for (let b = 0; b < LAYERS[l + 1]; b++) NN_E.push([off + a, off + LAYERS[l] + b, l]);
const act = (u, l) => Math.exp(-Math.pow(((u * 2) % 6.2) - 0.8 - l, 2) * 2.2);
function network(o, t, S) {
  const u = t - S.t0;
  for (let i = 0; i < N; i++) {
    if (i % 3 === 0) { const n = NN[i / 3 % NN.length | 0], a = act(u, n[3]); put(o, i, jit(i, n, 5), 0.4 + 0.6 * a, a > 0.55 ? a : 0, 1.1 + 0.6 * a); continue; }
    const e = NN_E[i % NN_E.length], f = (u * 0.8 + R4[i]) % 1, lit = act(u, e[2] + f);
    put(o, i, mixv(NN[e[0]], NN[e[1]], f), (0.12 + 0.8 * lit) * Math.sin(Math.PI * f), lit > 0.6 ? 1 : 0, 0.7 + 0.5 * lit);
  }
  o.bounds = 330;
}
function networkLines(t, S, L) {
  const u = t - S.t0;
  for (const [a, b, l] of NN_E) { const lit = act(u, l + 0.5); L.line(NN[a], NN[b], 0.08 + 0.35 * lit, lit > 0.7); }
}

/* ---------- 6. connectome: neurons on a sphere, activation spreading from one of them ---------- */
const CN = 110, CRAD = 250;
const CNODE = [...Array(CN)].map((_, k) => { const y = 1 - (2 * (k + 0.5)) / CN, r = Math.sqrt(1 - y * y), a = k * 2.39996; return [Math.cos(a) * r * CRAD, y * CRAD, Math.sin(a) * r * CRAD]; });
const CEDGE = (() => {
  const out = [], seen = new Set(), r = rng(21);
  CNODE.forEach((p, i) => CNODE.map((q, j) => [dist(p, q), j]).sort((a, b) => a[0] - b[0]).slice(1, 4).forEach(([, j]) => { const key = Math.min(i, j) * 1000 + Math.max(i, j); if (!seen.has(key)) { seen.add(key); out.push([i, j]); } }));
  for (let n = 0; n < 26; n++) out.push([Math.floor(r() * CN), Math.floor(r() * CN)]);
  return out;
})();
const fire = (u, i) => Math.exp(-Math.pow((((u * 0.7) % 1.4) - dist(CNODE[0], CNODE[i]) / (2 * CRAD)) * 6, 2));
const brain = (u, p) => rot(p, u * 0.4, 0.3);
function connectome(o, t, S) {
  const u = t - S.t0;
  for (let i = 0; i < N; i++) {
    if (i % 4 === 0) { const k = i / 4 % CN | 0, f = fire(u, k); put(o, i, brain(u, jit(i, CNODE[k], 4)), 0.5 + 0.5 * f, f > 0.5 ? f : 0, 1.1 + 0.6 * f); continue; }
    const [e0, e1] = CEDGE[i % CEDGE.length], f = (u * 0.6 + R4[i]) % 1, lit = Math.max(fire(u, e0), fire(u, e1));
    put(o, i, brain(u, mixv(CNODE[e0], CNODE[e1], f)), (0.15 + 0.7 * lit) * Math.sin(Math.PI * f), lit > 0.6 ? 1 : 0, 0.7);
  }
  o.bounds = CRAD;
}
function connectomeLines(t, S, L) {
  const u = t - S.t0;
  for (const [a, b] of CEDGE) { const lit = Math.max(fire(u, a), fire(u, b)); L.line(brain(u, CNODE[a]), brain(u, CNODE[b]), 0.1 + 0.4 * lit, lit > 0.7); }
}

/* ---------- 7. the R: particles sampled from the monogram (filled in by mount) ---------- */
let MONO = null;
function mono(o, t, S) {
  const u = t - S.t0, sweep = lerp(-340, 340, P(u, 1.1, 2.1));
  for (let i = 0; i < N; i++) {
    const [x, y] = MONO[i];
    put(o, i, [x, y + Math.sin(u * 1.4 + x * 0.012) * 2, 0], 0.85, clamp(1 - Math.abs(x + y * 0.6 - sweep) / 60) * 0.9, 0.9);
  }
  o.bounds = 250;
}

const FORM = { flower, metatron, solids, circuit, network, connectome, mono };
const LINES = { flower: flowerLines, metatron: metatronLines, solids: solidsLines, circuit: circuitLines, network: networkLines, connectome: connectomeLines };
const CAMS = {
  flower: (u) => ({ yaw: 0.12 * Math.sin(u * 0.5), pitch: 0.05 }),
  metatron: (u) => ({ yaw: 0.12 * Math.sin(u * 0.5 + 1.4), pitch: 0.05 }),
  solids: () => ({ yaw: 0, pitch: 0 }),
  circuit: (u) => ({ yaw: 0.15 * Math.sin(u * 0.6), pitch: 0.95 }),
  network: (u) => ({ yaw: -0.4 + u * 0.15, pitch: 0.12 }),
  connectome: () => ({ yaw: 0, pitch: 0.1 }),
  mono: () => ({ yaw: 0, pitch: 0 }),
};
function camera(t, loop) {
  const k = sectionAt(t), S = SECTIONS[k], c = CAMS[S.id](t - S.t0);
  if (k === 0 && !loop) return c;
  const Sp = SECTIONS[k ? k - 1 : SECTIONS.length - 1], prev = CAMS[Sp.id](t - Sp.t0 + (k ? 0 : LOOP)), p = ease(P(t, S.t0, S.t0 + S.morph + 0.2));
  return { yaw: lerp(prev.yaw, c.yaw, p), pitch: lerp(prev.pitch, c.pitch, p) };
}

/* ---------- drawing ---------- */
const LV = 10, LINE_LEVELS = [0.15, 0.35, 0.6, 1], FILL = 0.36; // formation radius → 36% of the frame's shorter side
export async function mount(canvas) {
  const img = new Image();
  img.src = "/rumi-monogram.png";
  await img.decode();
  const mw = 520, mh = Math.round((mw * img.height) / img.width), mc = document.createElement("canvas");
  mc.width = mw; mc.height = mh;
  const mx = mc.getContext("2d");
  mx.drawImage(img, 0, 0, mw, mh);
  const px = mx.getImageData(0, 0, mw, mh).data, ink_ = [];
  for (let y = 0; y < mh; y += 2) for (let x = 0; x < mw; x += 2) { const j = (y * mw + x) * 4; if (px[j + 3] > 120 && px[j] + px[j + 1] + px[j + 2] < 420) ink_.push([x - mw / 2, mh / 2 - y]); }
  const r = rng(3);
  MONO = [...Array(N)].map(() => { const p = ink_[Math.floor(r() * ink_.length)]; return [p[0] + (r() - 0.5) * 2, p[1] + (r() - 0.5) * 2]; });

  const g = canvas.getContext("2d"), bloom = document.createElement("canvas"), bg = bloom.getContext("2d");
  const buckets = [...Array(2 * LV)].map(() => []), segs = [[], []];
  const PX = new Float32Array(N), PY = new Float32Array(N), PK = new Float32Array(N), AL = new Float32Array(N), SZ = new Float32Array(N), AC = new Float32Array(N);
  const fit = { s: 0 };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches; // reduced motion: one frame of the finished R
  const STILL = LOOP + SECTIONS[SECTIONS.length - 1].t0 + 2.4;
  let dark = false, ink = "18,18,17", accent = "168,109,89", dpr = 1;

  function frame(time, dt) {
    const loop = time >= LOOP, t = time % LOOP, k = sectionAt(t), Sec = SECTIONS[k], cw = canvas.width, ch = canvas.height;
    FORM[Sec.id](B, t, Sec);
    let from = null, Sp = null, tp = t;
    if (k > 0 && t < Sec.t0 + Sec.morph + 0.3) { Sp = SECTIONS[k - 1]; from = A; }
    else if (k === 0 && loop && t < Sec.morph + 0.3) { Sp = SECTIONS[SECTIONS.length - 1]; from = A; tp = t + LOOP; } // everything returns to the point
    if (from) FORM[Sp.id](A, tp, Sp);
    const cam = camera(t, loop), cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw), cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch), F = 1400, D = 1400;
    const project = (x, y, z) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y1 = y * cp - z1 * sp, z2 = y * sp + z1 * cp, kk = F / (D - z2); return [x1 * kk, -y1 * kk, kk, z2]; };
    const radius = from ? lerp(A.bounds, B.bounds, ease(P(t, Sec.t0, Sec.t0 + Sec.morph))) : B.bounds;
    const target = (Math.min(cw, ch) * FILL) / radius, e = fit.s ? 1 - Math.exp(-dt * 4) : 1;
    fit.s = fit.s ? fit.s * Math.pow(target / fit.s, e) : target;
    const s = fit.s, ox = cw / 2, oy = ch / 2, minR = 0.55 * dpr;
    for (let i = 0; i < N; i++) {
      let x = B.pos[i * 3], y = B.pos[i * 3 + 1], z = B.pos[i * 3 + 2], br = B.bri[i];
      SZ[i] = B.sz[i]; AC[i] = B.acc[i];
      if (from) {
        const p = ease(P(t, Sec.t0 + R4[i] * Sec.morph * 0.35, Sec.t0 + Sec.morph * (0.65 + R4[i] * 0.35))), sw = Math.sin(Math.PI * p) * 45;
        x = lerp(A.pos[i * 3], x, p) + sw * G[i * 3]; y = lerp(A.pos[i * 3 + 1], y, p) + sw * G[i * 3 + 1]; z = lerp(A.pos[i * 3 + 2], z, p) + sw * G[i * 3 + 2];
        br = lerp(A.bri[i], br, p); SZ[i] = lerp(A.sz[i], SZ[i], p); AC[i] = lerp(A.acc[i], AC[i], p);
      }
      const [X, Y, kk, z2] = project(x, y, z);
      PX[i] = X; PY[i] = Y; PK[i] = kk > 0 && kk < 6 ? kk : 0;
      AL[i] = br * (0.45 + 0.55 * clamp((z2 + 400) / 800));
    }
    buckets.forEach((b) => (b.length = 0));
    for (let i = 0; i < N; i++) {
      if (!PK[i] || AL[i] <= 0.01) continue;
      buckets[(AC[i] > 0.5 ? LV : 0) + Math.min(LV - 1, Math.floor(AL[i] * LV))].push(ox + PX[i] * s, oy + PY[i] * s, Math.max(minR, 1.1 * SZ[i] * PK[i] * s));
    }
    g.globalCompositeOperation = "source-over";
    g.clearRect(0, 0, cw, ch);
    g.globalCompositeOperation = dark ? "lighter" : "source-over";
    // line art: the outgoing formation fades out while the incoming one draws itself on
    segs[0].length = segs[1].length = 0;
    const P2 = (v) => { const q = project(...v); return [ox + q[0] * s, oy + q[1] * s]; };
    const emit = (fn, S_, time_, fade) => fade > 0 && fn && fn(time_, S_, {
      line: (a, b, alpha, hot) => { const pa = P2(a), pb = P2(b); segs[hot ? 1 : 0].push(pa[0], pa[1], pb[0], pb[1], alpha * fade); },
      circle: (c, r, q, alpha, phase = 0) => { // an arc of a circle in the z = 0 plane, drawn on from `phase`
        const n = Math.max(6, Math.ceil(72 * q));
        let prev = P2([c[0] + Math.cos(phase) * r, c[1] + Math.sin(phase) * r, c[2]]);
        for (let j = 1; j <= n; j++) { const th = phase + (j / n) * q * 6.2832, pt = P2([c[0] + Math.cos(th) * r, c[1] + Math.sin(th) * r, c[2]]); segs[0].push(prev[0], prev[1], pt[0], pt[1], alpha * fade); prev = pt; }
      },
    });
    emit(LINES[Sec.id], Sec, t, from ? P(t, Sec.t0 + Sec.morph * 0.4, Sec.t0 + Sec.morph) : 1);
    if (from) emit(LINES[Sp.id], Sp, tp, 1 - P(t, Sec.t0, Sec.t0 + Sec.morph * 0.5));
    g.lineWidth = Math.max(1, 0.85 * dpr);
    segs.forEach((L, hot) => LINE_LEVELS.forEach((lvl, n) => {
      g.strokeStyle = `rgba(${hot ? accent : ink},${lvl * (dark ? 0.8 : 0.7)})`;
      g.beginPath();
      for (let j = 0; j < L.length; j += 5) if (L[j + 4] <= lvl && L[j + 4] > (LINE_LEVELS[n - 1] ?? 0.02)) { g.moveTo(L[j], L[j + 1]); g.lineTo(L[j + 2], L[j + 3]); }
      g.stroke();
    }));
    buckets.forEach((b, bi) => {
      if (!b.length) return;
      const lvl = (bi % LV) + 1;
      g.fillStyle = `rgba(${bi >= LV ? accent : ink},${bi >= LV ? lvl / LV : (lvl / LV) * (dark ? 0.85 : 0.75)})`;
      g.beginPath();
      for (let j = 0; j < b.length; j += 3) { const rr = b[j + 2]; g.moveTo(b[j] + rr, b[j + 1]); g.arc(b[j], b[j + 1], rr, 0, 6.2832); }
      g.fill();
    });
    if (dark) { // glow: a blurred downsample added back
      bg.clearRect(0, 0, bloom.width, bloom.height);
      bg.filter = `blur(${Math.max(1, cw / 320)}px)`;
      bg.drawImage(canvas, 0, 0, bloom.width, bloom.height);
      bg.filter = "none";
      g.globalAlpha = 0.7; g.drawImage(bloom, 0, 0, cw, ch); g.globalAlpha = 1;
    }
    g.globalCompositeOperation = "source-over";
  }

  const theme = () => {
    dark = document.documentElement.classList.contains("dark");
    ink = getComputedStyle(document.documentElement).getPropertyValue("--color-text-base").trim() || ink;
    accent = dark ? "234,128,90" : "168,109,89";
    if (still) frame(STILL, 1);
  };
  const resize = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    bloom.width = Math.max(1, canvas.width >> 2); bloom.height = Math.max(1, canvas.height >> 2);
    fit.s = 0;
    if (still) frame(STILL, 1); // resizing clears the canvas
  };
  theme(); resize();
  new ResizeObserver(resize).observe(canvas);
  new MutationObserver(theme).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  if (still) return;

  let visible = false, elapsed = 0, last = 0, raf = 0;
  const tick = (now) => {
    const dt = Math.min(0.1, (now - last) / 1000);
    elapsed += dt; last = now;
    frame(elapsed, dt);
    raf = requestAnimationFrame(tick);
  };
  const update = () => {
    const run = visible && document.visibilityState === "visible";
    if (run && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    if (!run && raf) { cancelAnimationFrame(raf); raf = 0; }
  };
  new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; update(); }).observe(canvas);
  document.addEventListener("visibilitychange", update);
  frame(0, 1);
}
