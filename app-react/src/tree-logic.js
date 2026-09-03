/* Where the threshold goes once the groups are already split into two blocks.
   "medias" is what ppforest2 implements; the others are the same tree with a
   different last step, and they move the boundary without moving the direction. */
export const CUT_RULES = ["medias", "dispersion", "medianas", "margen", "aciertos"];

/* The direction written as a linear combination, normalised so the largest
   coefficient is 1, as in the package's print output. The decimal mark comes from
   outside: the algorithm knows nothing about languages. */
export function formula(deg, axisNames = ["Z₁", "Z₂"], decimalMark = ",") {
  const t = deg * Math.PI / 180;
  let a = [Math.cos(t), Math.sin(t)];
  const m = Math.max(Math.abs(a[0]), Math.abs(a[1]));
  a = a.map(v => v / m);
  let out = "";
  a.forEach((v, k) => {
    const av = Math.abs(v);
    if (av < 0.005) return;
    const sign = out === "" ? (v < 0 ? "−" : "") : (v < 0 ? " − " : " + ");
    const coef = av > 0.995 ? "" : av.toFixed(2).replace(".", decimalMark) + "·";
    out += sign + coef + axisNames[k];
  });
  return out;
}

/* The threshold, in the same units the combination is written in: formula()
   divides the coefficients by the largest one, so the cut is divided by the same
   number and the rule can be read as it is written. */
export function cutValue(deg, cut) {
  const t = deg * Math.PI / 180;
  return cut / Math.max(Math.abs(Math.cos(t)), Math.abs(Math.sin(t)));
}

/* All the tree logic, bound to one dataset. Created once per dataset;
   the functions close over it. */
export function makeTree(PTS, nClases) {
  const N = PTS.length;
  const ALL_CLASSES = Array.from({ length: nClases }, (_, i) => i);

  const node = (id, ids, depth, classes) =>
    ({ id, ids, depth, classes, deg: null, cut: null, u: null, children: null });
  const initialRoot = () => node("", PTS.map((_, i) => i), 0, ALL_CLASSES);

  function findNode(n, id) {
    if (n.id === id) return n;
    if (!n.children) return null;
    return findNode(n.children[0], id) || findNode(n.children[1], id);
  }
  function leaves(n, acc = []) {
    if (!n.children) acc.push(n); else n.children.forEach(h => leaves(h, acc));
    return acc;
  }
  function replaceNode(n, id, fn) {
    if (n.id === id) return fn(n);
    if (!n.children) return n;
    const a = replaceNode(n.children[0], id, fn), b = replaceNode(n.children[1], id, fn);
    return (a === n.children[0] && b === n.children[1]) ? n : { ...n, children: [a, b] };
  }

  /* Projection index: between-group against total variation. */
  function index(ids, deg, classes) {
    if (classes) ids = ids.filter(i => classes.includes(PTS[i][2]));
    if (ids.length < 2) return 0;
    const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)];
    const z = ids.map(i => PTS[i][0] * u[0] + PTS[i][1] * u[1]);
    const m = z.reduce((a, b) => a + b, 0) / z.length;
    const T = z.reduce((s, v) => s + (v - m) * (v - m), 0);
    if (T <= 0) return 0;
    const sum = {}, count = {};
    ids.forEach((id, j) => {
      const k = PTS[id][2];
      sum[k] = (sum[k] || 0) + z[j]; count[k] = (count[k] || 0) + 1;
    });
    if (Object.keys(count).length < 2) return 0;
    let W = 0;
    ids.forEach((id, j) => {
      const k = PTS[id][2], mk = sum[k] / count[k];
      W += (z[j] - mk) * (z[j] - mk);
    });
    return Math.max(0, 1 - W / T);
  }

  const meanOf = v => v.reduce((s, x) => s + x, 0) / v.length;
  const sdOf = v => {
    const m = meanOf(v);
    return Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / Math.max(1, v.length - 1));
  };
  const medianOf = v => {
    const w = [...v].sort((a, b) => a - b), h = w.length >> 1;
    return w.length % 2 ? w[h] : (w[h - 1] + w[h]) / 2;
  };
  /* the midpoint between consecutive values that leaves the most points on the
     side their block is on */
  function bestSeparator(left, right) {
    const all = [...left.map(v => [v, 0]), ...right.map(v => [v, 1])].sort((a, b) => a[0] - b[0]);
    let ok = right.length, bestOk = -1, cut = all[0][0] - 1;   // everything to the right
    for (let i = 0; i < all.length; i++) {
      ok += all[i][1] ? -1 : 1;                                 // move this point left
      if (i + 1 < all.length && all[i][0] === all[i + 1][0]) continue;
      if (ok > bestOk) {
        bestOk = ok;
        cut = i + 1 < all.length ? (all[i][0] + all[i + 1][0]) / 2 : all[i][0];
      }
    }
    return cut;
  }

  /* The classes are ordered by their projected mean and split into two blocks.
     Where the threshold lands between the blocks is what the rule decides;
     "medias" is the mean of the two block means, which is what ppforest2 does.
     The mode decides which classes are ordered: "pp" separates only the ones the
     node was handed, "gen" every class whose points are here, since there a class
     may fall on both sides and each leaf votes by majority. */
  function bestCut(n, deg, rule = "medias", mode) {
    const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)];
    const proj = i => PTS[i][0] * u[0] + PTS[i][1] * u[1];
    /* In "pp" the node separates the classes it was handed, not every class whose
       points leaked into it at the parent cut. Ordering all of them would place the
       threshold between two groups this node does not own, and the direction, chosen
       for the assigned classes, would not match it. So here we look only at the
       points of those classes; in "gen" a class can fall on both sides, so every
       point counts. */
    const ownIds = mode === "pp" && n.classes
      ? n.ids.filter(i => n.classes.includes(PTS[i][2])) : n.ids;
    const sum = {}, count = {};
    ownIds.forEach(i => {
      const k = PTS[i][2];
      sum[k] = (sum[k] || 0) + proj(i); count[k] = (count[k] || 0) + 1;
    });
    const G = Object.keys(count).map(Number).filter(k => count[k]);
    const base = G.reduce((s, k) => s + count[k], 0);
    if (G.length < 2) return { acc: 0, z: 0, leftC: null, rightC: null, base };

    const mean = k => sum[k] / count[k];
    const order = [...G].sort((a, b) => mean(a) - mean(b));
    const avg = ks => ks.reduce((s, k) => s + mean(k), 0) / ks.length;
    const values = ks => ownIds.filter(i => ks.includes(PTS[i][2])).map(proj);

    function threshold(leftC, rightC) {
      if (rule === "medias") return (avg(leftC) + avg(rightC)) / 2;
      const a = values(leftC), b = values(rightC);
      if (rule === "medianas") return (medianOf(a) + medianOf(b)) / 2;
      if (rule === "margen") return (Math.max(...a) + Math.min(...b)) / 2;
      if (rule === "aciertos") return bestSeparator(a, b);
      /* "dispersion": the same centres as "medias", but the cut does not land at the
         midpoint: it moves towards the tighter block, in the proportion the standard
         deviations set. With equal deviations it gives exactly "medias". */
      const mA = avg(leftC), mB = avg(rightC), sa = sdOf(a), sb = sdOf(b);
      return sa + sb ? mA + (sa / (sa + sb)) * (mB - mA) : (mA + mB) / 2;
    }

    let best = { acc: -1, z: 0, leftC: null, rightC: null, base };
    for (let c = 1; c < order.length; c++) {
      const leftC = order.slice(0, c), rightC = order.slice(c);
      const cut = threshold(leftC, rightC);
      let ok = 0;
      ownIds.forEach(i => {
        const k = PTS[i][2];
        if (leftC.includes(k) ? proj(i) <= cut : proj(i) > cut) ok++;
      });
      const acc = base ? ok / base : 0;
      if (acc > best.acc) best = { acc, z: cut, leftC, rightC, base };
    }
    return best;
  }


  function bestDirection(n, mode) {
    const G = mode === "pp" ? n.classes : null;
    let best = { deg: 0, idx: -1 };
    for (let d = 0; d < 180; d += 0.5) {
      const v = index(n.ids, d, G);
      if (v > best.idx) best = { deg: d, idx: v };
    }
    return best;
  }

  function majority(ids) {
    const c = {}; ids.forEach(i => c[PTS[i][2]] = (c[PTS[i][2]] || 0) + 1);
    let k = 0, m = -1;
    for (const g in c) if (c[g] > m) { m = c[g]; k = +g; }
    return { k, n: m, total: ids.length, puro: m === ids.length };
  }
  function predict(n, mode) {
    if (mode === "pp" && n.classes && n.classes.length === 1) {
      const k = n.classes[0];
      const c = n.ids.filter(i => PTS[i][2] === k).length;
      return { k, n: c, total: n.ids.length, puro: c === n.ids.length };
    }
    return majority(n.ids);
  }
  const accuracy = (root, mode) =>
    leaves(root).reduce((s, h) => s + predict(h, mode).n, 0) / N;

  /* "pp" stops on its own: a node with a single group left cannot be split.
     "gen" has no such limit, so the only thing that closes a leaf is being
     pure, so the player decides when the tree is done. */
  function splittable(n, mode) {
    if (n.children || n.ids.length < 2) return false;
    if (mode === "pp") return n.classes && n.classes.length >= 2;
    return !majority(n.ids).puro;
  }
  function nextNode(root, mode) {
    const c = leaves(root).filter(n => splittable(n, mode));
    return c.sort((a, b) => b.ids.length - a.ids.length)[0] || null;
  }

  function split(root, id, deg, mode, rule) {
    const n = findNode(root, id);
    if (!n || !splittable(n, mode)) return root;
    const c = bestCut(n, deg, rule, mode);
    const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)];
    const a = [], b = [];
    n.ids.forEach(i => ((PTS[i][0] * u[0] + PTS[i][1] * u[1]) <= c.z ? a : b).push(i));
    if (!a.length || !b.length) return root;
    const present = l => [...new Set(l.map(i => PTS[i][2]))].sort();
    /* The threshold is the same in both modes. What differs is the inheritance:
       in "pp" each child keeps whole groups, so the split of the ordered groups
       is intersected with the ones this node was given. */
    let ca, cb;
    if (mode === "pp" && n.classes) {
      ca = (c.leftC || []).filter(k => n.classes.includes(k));
      cb = (c.rightC || []).filter(k => n.classes.includes(k));
      if (!ca.length || !cb.length) return root;
    } else {
      ca = present(a); cb = present(b);
    }
    return replaceNode(root, id, nd => ({
      ...nd, deg, cut: c.z, u,
      children: [
        node(nd.id + "0", a, nd.depth + 1, ca),
        node(nd.id + "1", b, nd.depth + 1, cb),
      ],
    }));
  }
  const undo = (root, id) =>
    replaceNode(root, id, nd => ({ ...nd, deg: null, cut: null, u: null, children: null }));

  return {
    PTS, nClases, initialRoot, findNode, leaves, index, bestCut, bestDirection,
    majority, predict, accuracy, splittable, nextNode, split, undo,
  };
}
