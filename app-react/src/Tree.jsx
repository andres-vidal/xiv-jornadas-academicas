import { cutValue, formula } from "./tree-logic.js";
import { decimal } from "./strings.js";
import { useLang, useT } from "./useLang.js";

/* The threshold with two decimals. A rounded zero is forced positive, because a
   cut landing right on the origin came out as "-0,00". */
const threshold = (lang, v) => {
  const r = Math.round(v * 100) / 100;
  return decimal(lang, r === 0 ? 0 : r);
};

const NW = 186, NH = 62, LH = 118, GAP = 20;

function Histogram({ n, x, y, w, h, PTS, nClasses, color }) {
  const zs = n.ids.map(i => PTS[i][0] * n.u[0] + PTS[i][1] * n.u[1]);
  const lo = Math.min(...zs), hi = Math.max(...zs), B = 26;
  const binWidth = (hi - lo) / B || 1;
  const bins = Array.from({ length: B }, () => Array(nClasses).fill(0));
  zs.forEach((z, j) => {
    const b = Math.min(B - 1, Math.max(0, Math.floor((z - lo) / binWidth)));
    bins[b][PTS[n.ids[j]][2]]++;
  });
  const maxBin = Math.max(...bins.map(c => c.reduce((s, v) => s + v, 0))) || 1;
  const binW = w / B;
  const bars = [];
  bins.forEach((c, b) => {
    let acc = 0;
    c.forEach((v, k) => {
      if (!v) return;
      const hh = v / maxBin * h, yy = y + h - acc - hh;
      acc += hh;
      bars.push(<rect key={`${b}-${k}`} x={x + b * binW} y={yy} width={binW + 0.5} height={hh} fill={color(k)} />);
    });
  });
  const cx = x + (n.cut - lo) / ((hi - lo) || 1) * w;
  return (
    <>
      {bars}
      <line x1={cx} y1={y - 5} x2={cx} y2={y + h + 5} stroke="var(--color-tinta)" strokeWidth={2.2} />
    </>
  );
}

function NodeBox({ n, x, y, sel, mode, onPick, PTS, nClasses, color, GROUPS, A, axisNames, lang, t }) {
  const m = A.predict(n, mode), active = A.splittable(n, mode), chosen = n === sel;
  const tag = n.id === "" ? t.tree.root : n.id.endsWith("0") ? t.tree.oneSide : t.tree.otherSide;
  return (
    <g
      role={active ? "button" : undefined}
      tabIndex={active ? 0 : undefined}
      className={active ? "cursor-pointer" : undefined}
      onClick={active ? e => { e.stopPropagation(); onPick(n.id); } : undefined}
      onKeyDown={active ? e => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); onPick(n.id); }
      } : undefined}
    >
      <title>{tag}</title>
      {n.children && (
        <rect
          x={x - NW / 2 - 6} y={y - 8} width={NW + 12} height={NH + 38} rx={9}
          fill={chosen ? "var(--color-papel)" : "transparent"}
          stroke={chosen ? "var(--color-tinta)" : "transparent"} strokeWidth={1.6}
        />
      )}
      {n.children ? (
        <>
          <Histogram n={n} x={x - NW / 2} y={y} w={NW} h={NH}
                      PTS={PTS} nClasses={nClasses} color={color} />
          {/* the node's rule, as it reads: the combination and its threshold */}
          <text x={x} y={y + NH + 21} textAnchor="middle"
                className="font-mono text-[12px] fill-[var(--color-tinta2)]">
            {formula(n.deg, axisNames, lang === "es" ? "," : ".")} ≤ {threshold(lang, cutValue(n.deg, n.cut))}
          </text>
        </>
      ) : (
        <>
          <rect x={x - NW / 2} y={y + NH - 34} width={NW} height={34} rx={8}
                fill={color(m.k)} fillOpacity={m.puro ? 0.22 : 0.13}
                stroke={chosen ? "var(--color-tinta)" : color(m.k)}
                strokeWidth={chosen ? 2 : 1.2} />
          <circle cx={x - NW / 2 + 15} cy={y + NH - 17} r={5} fill={color(m.k)} />
          <text x={x - NW / 2 + 27} y={y + NH - 13}
                className="font-sans text-[13px] font-bold fill-[var(--color-tinta)]">
            {GROUPS[m.k]}
          </text>
          <text x={x} y={y + NH + 21} textAnchor="middle"
                className="font-mono text-[13px] fill-[var(--color-mudo)]">
            {m.puro ? t.tree.pure.replace("{n}", n.ids.length)
                    : t.tree.share.replace("{n}", m.n).replace("{total}", m.total)}
          </text>
        </>
      )}
    </g>
  );
}

export default function Tree({ root, sel, mode, onPick, PTS, GROUPS, TOKENS, A, axisNames }) {
  const lang = useLang(), t = useT();
  const color = k => `var(${TOKENS[k]})`;
  const leafOrder = [];
  (function collectLeaves(n) { n.children ? (collectLeaves(n.children[0]), collectLeaves(n.children[1])) : leafOrder.push(n); })(root);

  const px = new Map(), py = new Map();
  let depth = 0;
  (function place(n, d) {
    depth = Math.max(depth, d);
    py.set(n, d * LH + 8);
    if (n.children) {
      place(n.children[0], d + 1); place(n.children[1], d + 1);
      px.set(n, (px.get(n.children[0]) + px.get(n.children[1])) / 2);
    } else px.set(n, leafOrder.indexOf(n) * (NW + GAP) + NW / 2);
  })(root, 0);

  const allNodes = [];
  (function walk(n) { allNodes.push(n); if (n.children) n.children.forEach(walk); })(root);

  /* The frame reserves from the start the width the finished tree will take:
     with a single node it stays small and centred instead of stretching. */
  const SLOTS = Math.max(leafOrder.length, 4);
  const W = SLOTS * (NW + GAP), H = depth * LH + NH + 46;
  /* What it really takes: n boxes and n-1 gaps. Centring over W without
     discounting the spare gap shifted everything half a GAP to the left. */
  const used = leafOrder.length * NW + (leafOrder.length - 1) * GAP;
  const offset = (W - used) / 2;
  allNodes.forEach(n => px.set(n, px.get(n) + offset));
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMin meet"
         className="block w-full h-auto"
         aria-label={t.tree.diagram}>
      {allNodes.filter(n => n.children).flatMap(n =>
        n.children.map((h, i) => (
          <path key={`${n.id}-${i}`} fill="none" stroke="var(--color-regla)" strokeWidth={1.4}
                d={`M${px.get(n)} ${py.get(n) + NH + 16} V${py.get(n) + LH - 14} H${px.get(h)} V${py.get(h)}`} />
        ))
      )}
      {allNodes.map(n => (
        <NodeBox key={n.id} n={n} x={px.get(n)} y={py.get(n)} sel={sel} mode={mode}
              onPick={onPick} PTS={PTS} nClasses={GROUPS.length} color={color}
              GROUPS={GROUPS} A={A} axisNames={axisNames} lang={lang} t={t} />
      ))}
    </svg>
  );
}
