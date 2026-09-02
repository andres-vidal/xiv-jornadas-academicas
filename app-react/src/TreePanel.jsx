/* The tree as it is being built.

   With room beside the canvas it is a thumbnail that grows when tapped and takes
   over the screen, without losing its translucency: the decision regions the canvas
   draws have to keep showing through.

   On a narrow screen it already spans the whole width, so growing would mean
   nothing. There it is one more foldable card, with its arrow, opening downwards. */
import { useEffect, useRef } from "react";
import { CardHeader, Collapse, FoldButton } from "./ui.jsx";
import Tree from "./Tree.jsx";
import { percent } from "./strings.js";
import { useLang, useT } from "./useLang.js";

export default function TreePanel({
  game, plane, D, A, mode, narrow, top, expanded, setExpanded,
}) {
  const { root, sel, setSelId, nCuts, accuracy } = game;
  const lang = useLang(), t = useT();
  const ref = useRef(null);
  /* blown up to the whole screen, which only happens with room beside the canvas */
  const zoomed = expanded && !narrow;

  /* Blown up it covers half the screen, so it also closes on an outside tap or with
     Escape. Folded it does not: it is a card like the others, closed with its arrow. */
  useEffect(() => {
    if (!zoomed) return;
    let from = null;
    const down = e => { from = { x: e.clientX, y: e.clientY, t: e.target }; };
    const up = e => {
      if (!from || Math.hypot(e.clientX - from.x, e.clientY - from.y) > 4) { from = null; return; }
      const t = from.t; from = null;
      if (!ref.current?.contains(t)) setExpanded(false);
    };
    const esc = e => { if (e.key === "Escape") setExpanded(false); };
    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("keydown", esc);
    };
  }, [zoomed, setExpanded]);

  const cuts = nCuts === 1 ? t.tree.oneCut : t.tree.manyCuts.replace("{n}", nCuts);
  const title = `${t.tree.title} · ${cuts}`
    + (nCuts > 0 ? " · " + t.tree.accuracy.replace("{p}", percent(lang, accuracy)) : "");

  /* The drawing scales to whatever width there is and never slides sideways: a tree
     you have to drag half of into view is not a tree. */
  const treeSvg = (
    <Tree root={root} sel={sel} mode={mode} onPick={setSelId}
          PTS={plane.PTS} GROUPS={D.GROUPS} TOKENS={D.TOKENS} A={A} axisNames={plane.names} />
  );

  return (
    <div
      ref={ref}
      onClick={() => !narrow && !expanded && nCuts > 0 && setExpanded(true)}
      /* Blown up it rises against the header, and the width goes inline because there
         is no interpolation between "auto" and a length. It has a ceiling: on a 2000px
         monitor, stretching it end to end leaves the nodes huge and a lot of air. It
         stays anchored right, which is where it grew from. */
      style={zoomed ? { top, width: "min(calc(100% - 24px), 920px)" } : { top }}
      className={`absolute right-3 z-40 flex flex-col gap-[5px] rounded-xl border border-regla
                  p-[7px_9px_9px] shadow-[0_4px_16px_-8px_rgba(20,22,28,.4)]
                  transition-[width,background] duration-300 ease-out motion-reduce:transition-none
        ${zoomed
          ? "cursor-default bg-papel/80 backdrop-blur-[3px]"
          : `w-[calc(100%-24px)] bg-papel/80 backdrop-blur-[10px] sm:w-[min(330px,32vw)]
             ${!narrow && nCuts > 0 ? "cursor-zoom-in" : ""}`}`}
    >
      <CardHeader title={title}>
        {narrow && nCuts > 0 && (
          <FoldButton open={expanded} onClick={() => setExpanded(!expanded)}
                      labelOpen={t.tree.fold} labelClosed={t.tree.show} />
        )}
        {zoomed && (
          <button type="button" aria-label={t.tree.shrink}
            onClick={e => { e.stopPropagation(); setExpanded(false); }}
            className="px-[2px] text-base leading-none text-mudo hover:text-tinta">×</button>
        )}
      </CardHeader>

      {nCuts === 0 ? (
        <p className="py-[6px] text-[0.88rem] leading-[1.35] text-mudo">
          {t.tree.empty}
        </p>
      ) : narrow ? (
        <Collapse open={expanded}>{treeSvg}</Collapse>
      ) : (
        <div className={zoomed ? "" : "pointer-events-none hidden sm:block"}>
          {treeSvg}
        </div>
      )}
    </div>
  );
}
