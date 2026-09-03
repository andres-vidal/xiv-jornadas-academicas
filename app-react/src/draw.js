
/* The board adapts to its container. Both axes keep the same scale, so a
   diagonal looks diagonal. The scale comes from the shorter side of the plot, so
   the cloud fits whichever way the screen is: on a wide screen that is the
   height, and on a phone, where the plot is far taller than wide, it is the
   width, which is what keeps the points from falling off the sides. */
export const CAM0 = { k: 1, cx: 0, cy: 0 };
export const ZOOM = [0.25, 24];

/* UY = units visible vertically at zoom 1; each plane sets its own. */
/* Height of the shadow band: the HUD anchors to this same number.

   It never takes more than half the board. On a very short one the floor of 72 is
   taller than the board itself, the plot is left with a negative height, and the
   scale that comes out of it is negative: the canvas then throws on the first
   radius it is handed. */
export const bandHeight = (H, withBand = true) =>
  withBand ? Math.min(Math.max(72, Math.min(132, H * 0.15)), H / 2) : 0;

export function frame(W, H, cam = CAM0, UY = 16.4, withBand = true) {
  const band = bandHeight(H, withBand);
  const plotH = H - band;
  const scale = (Math.min(plotH, W) / UY) * cam.k;
  const medioY = plotH / 2 / scale, medioX = W / 2 / scale;
  const yD = [cam.cy - medioY, cam.cy + medioY];
  const xD = [cam.cx - medioX, cam.cx + medioX];
  return {
    band, plotH, scale, xD, yD,
    sx: v => (v - xD[0]) * scale,
    sy: v => plotH - (v - yD[0]) * scale,
    /* from canvas pixels to data units */
    dx: px => xD[0] + px / scale,
    dy: py => yD[0] + (plotH - py) / scale,
  };
}

/* clip a polygon against a half-plane (Sutherland–Hodgman) */
function clipHalf(poly, u, c, lado) {
  const inside = p => lado ? p[0] * u[0] + p[1] * u[1] <= c : p[0] * u[0] + p[1] * u[1] >= c;
  const crossing = (a, b) => {
    const da = a[0] * u[0] + a[1] * u[1] - c, db = b[0] * u[0] + b[1] * u[1] - c, t = da / (da - db);
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
  };
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], ia = inside(a), ib = inside(b);
    if (ia) out.push(a);
    if (ia !== ib) out.push(crossing(a, b));
  }
  return out;
}
function region(root, obj, m) {
  let poly = [[m.xD[0], m.yD[0]], [m.xD[1], m.yD[0]], [m.xD[1], m.yD[1]], [m.xD[0], m.yD[1]]];
  (function descend(nd) {
    if (!nd.children) return false;
    for (let h = 0; h < 2; h++)
      if (nd.children[h] === obj || descend(nd.children[h])) {
        poly = clipHalf(poly, nd.u, nd.cut, h === 0);
        return true;
      }
    return false;
  })(root);
  return poly;
}
function tracePoly(g, poly, m) {
  if (poly.length < 3) return;
  g.beginPath(); g.moveTo(m.sx(poly[0][0]), m.sy(poly[0][1]));
  for (let i = 1; i < poly.length; i++) g.lineTo(m.sx(poly[i][0]), m.sy(poly[i][1]));
  g.closePath();
}

export function draw(cv, { root, sel, deg, mode, rule, col, cg, W, H, cam, PTS, A, UY,
                            axisNames, R, labelsY }) {
  const withBand = !!(sel && A.splittable(sel, mode));
  if (!W || !H) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) {
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  }
  const g = cv.getContext("2d");
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);

  const { leaves, predict, splittable, bestCut } = A;
  const m = frame(W, H, cam, UY, withBand), { sx, sy } = m;
  const t = deg * Math.PI / 180, u = [Math.cos(t), Math.sin(t)];

  /* Regions: fill only. Outlining them would also draw the box border, which
     at full screen reads as a stray frame. */
  if (root.children) leaves(root).forEach(h => {
    const poly = region(root, h, m);
    if (poly.length < 3) return;
    tracePoly(g, poly, m);
    g.fillStyle = cg[predict(h, mode).k];
    g.globalAlpha = h === sel ? 0.17 : 0.09; g.fill();
    g.globalAlpha = 1;
  });
  /* the borders are the committed cuts, each clipped to its own node */
  (function borders(n) {
    if (!n.children) return;
    const poly = region(root, n, m);
    if (poly.length >= 3) {
      const nu = [-n.u[1], n.u[0]], L = 200;
      const a = [n.u[0] * n.cut - nu[0] * L, n.u[1] * n.cut - nu[1] * L];
      const b = [n.u[0] * n.cut + nu[0] * L, n.u[1] * n.cut + nu[1] * L];
      g.save(); tracePoly(g, poly, m); g.clip();
      g.beginPath(); g.moveTo(sx(a[0]), sy(a[1])); g.lineTo(sx(b[0]), sy(b[1]));
      g.strokeStyle = col.mudo; g.lineWidth = 1.3; g.stroke();
      g.restore();
    }
    n.children.forEach(borders);
  })(root);

  /* the shadow band, at the foot */
  if (m.band > 0) { g.fillStyle = col.panel; g.fillRect(0, m.plotH, W, m.band); }
  /* Which variable each axis carries. They sit at the foot of the plot, where the
     corner is free; on a narrow screen the controls take that corner, so the view
     hands down the height where there is room. Stacked and not on one line, since
     long variable names would run together. */
  g.fillStyle = col.mudo; g.font = `700 15px ${col.sans}`;
  g.textAlign = "left";
  const ly = labelsY ?? m.plotH - 36;
  g.fillText("↑ " + axisNames[1], 16, ly);
  g.fillText(axisNames[0] + " →", 16, ly + 22);

  const inSel = new Set(sel ? sel.ids : []);
  PTS.forEach((p, i) => {
    g.beginPath(); g.arc(sx(p[0]), sy(p[1]), 4.4, 0, 6.2832);
    g.fillStyle = cg[p[2]];
    g.globalAlpha = !sel || inSel.has(i) ? 0.85 : 0.16;
    g.fill();
  });
  g.globalAlpha = 1;

  if (!sel || !splittable(sel, mode)) return;

  /* ---------- projection axis, rays and shadow ---------- */
  const c = bestCut(sel, deg, rule);
  const nn = [-u[1], u[0]];
  const zs = [], ws = [];
  sel.ids.forEach(i => {
    zs.push(PTS[i][0] * u[0] + PTS[i][1] * u[1]);
    ws.push(PTS[i][0] * nn[0] + PTS[i][1] * nn[1]);
  });
  const zlo = Math.min(...zs), zhi = Math.max(...zs);
  const wlo = Math.min(...ws), whi = Math.max(...ws);
  const pad = (zhi - zlo) * 0.05 || 0.6, sep = (whi - wlo) * 0.11 + 0.4;
  void wlo; void whi;
  const en = (z, w) => [u[0] * z + nn[0] * w, u[1] * z + nn[1] * w];

  /* the axis rests on the circle: turning slides it instead of jumping sides */
  const wOff = -R;

  g.save(); g.beginPath(); g.rect(0, 0, W, m.plotH); g.clip();

  /* the circle enclosing every point */
  g.beginPath();
  g.ellipse(sx(0), sy(0), R * m.scale, R * m.scale, 0, 0, 6.2832);
  g.strokeStyle = col.mudo; g.globalAlpha = 0.4; g.lineWidth = 1.2;
  g.setLineDash([4, 7]); g.stroke();
  g.setLineDash([]); g.globalAlpha = 1;

  g.strokeStyle = col.tinta; g.globalAlpha = 0.13; g.lineWidth = 0.8; g.beginPath();
  sel.ids.forEach((id, j) => {
    const a = en(zs[j], ws[j]), b = en(zs[j], wOff);
    g.moveTo(sx(a[0]), sy(a[1])); g.lineTo(sx(b[0]), sy(b[1]));
  });
  g.stroke(); g.globalAlpha = 1;

  const e0 = en(zlo - pad, wOff), e1 = en(zhi + pad, wOff);
  g.beginPath(); g.moveTo(sx(e0[0]), sy(e0[1])); g.lineTo(sx(e1[0]), sy(e1[1]));
  g.strokeStyle = col.mudo; g.lineWidth = 1.6; g.stroke();

  /* the candidate cut stays dashed until it is committed */
  const fb = en(c.z, wOff), ft = en(c.z, wOff > whi ? wlo : whi);
  g.setLineDash([4, 4]); g.lineWidth = 1.2; g.strokeStyle = col.tinta; g.globalAlpha = 0.45;
  g.beginPath(); g.moveTo(sx(fb[0]), sy(fb[1])); g.lineTo(sx(ft[0]), sy(ft[1])); g.stroke();
  g.globalAlpha = 1;
  const poly = region(root, sel, m);
  if (poly.length >= 3) {
    const L = 200;
    const p0 = [u[0] * c.z - nn[0] * L, u[1] * c.z - nn[1] * L];
    const p1 = [u[0] * c.z + nn[0] * L, u[1] * c.z + nn[1] * L];
    g.save(); tracePoly(g, poly, m); g.clip();
    g.beginPath(); g.moveTo(sx(p0[0]), sy(p0[1])); g.lineTo(sx(p1[0]), sy(p1[1]));
    g.strokeStyle = col.tinta; g.lineWidth = 2.4; g.setLineDash([7, 5]); g.stroke();
    g.restore();
  }
  g.setLineDash([]);

  sel.ids.forEach((id, j) => {
    const b = en(zs[j], wOff);
    g.beginPath(); g.arc(sx(b[0]), sy(b[1]), 3.4, 0, 6.2832);
    g.fillStyle = cg[PTS[id][2]]; g.globalAlpha = 0.85; g.fill();
  });
  g.globalAlpha = 1;
  const t0 = en(c.z, wOff - sep * 0.42), t1 = en(c.z, wOff + sep * 0.42);
  g.beginPath(); g.moveTo(sx(t0[0]), sy(t0[1])); g.lineTo(sx(t1[0]), sy(t1[1]));
  g.strokeStyle = col.tinta; g.lineWidth = 2.8; g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]);
  g.restore();

  /* the strip below is that same axis, unrolled */
  const flipped = sx(e1[0]) < sx(e0[0]);
  const tz = v => {
    const q = (v - (zlo - pad)) / ((zhi + pad) - (zlo - pad));
    return 30 + (flipped ? 1 - q : q) * (W - 60);
  };
  const yT = m.plotH + m.band * 0.62;
  g.setLineDash([3, 5]); g.strokeStyle = col.regla; g.lineWidth = 1; g.beginPath();
  g.moveTo(sx(e0[0]), sy(e0[1])); g.lineTo(tz(zlo - pad), yT);
  g.moveTo(sx(e1[0]), sy(e1[1])); g.lineTo(tz(zhi + pad), yT);
  g.stroke(); g.setLineDash([]);
  g.beginPath(); g.moveTo(16, yT); g.lineTo(W - 16, yT); g.stroke();
  sel.ids.forEach((id, j) => {
    g.beginPath(); g.arc(tz(zs[j]), yT, 4.2, 0, 6.2832);
    g.fillStyle = cg[PTS[id][2]]; g.globalAlpha = 0.8; g.fill();
  });
  g.globalAlpha = 1;
  g.beginPath(); g.moveTo(tz(c.z), yT - 26); g.lineTo(tz(c.z), yT + 26);
  g.strokeStyle = col.tinta; g.lineWidth = 2.8; g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]);
}
