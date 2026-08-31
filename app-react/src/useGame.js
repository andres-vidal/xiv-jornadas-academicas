import { useEffect, useMemo, useState } from "react";

/* All the state of one game: the tree, the chosen node, the angle, the undo stack
   and whether the player called it done. It takes the plane already built (A) and
   the two options that change how a node is cut.

   `planeSig` identifies the combination of dataset, plane, mode and rule. When it
   changes, the tree starts over. */
export function useGame({ A, mode, rule, planeSig }) {
  const [rootState, setRoot] = useState(() => A.initialRoot());
  const [selIdState, setSelId] = useState("");
  const [deg, setDeg] = useState(90);
  const [undoStack, setUndoStack] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [finished, setFinished] = useState(false);
  const [resetToken, setResetToken] = useState(0);

  /* The reset happens in this same render and not in an effect: an effect would
     leave one frame drawing the old tree over the new dataset, reading points that
     are not there any more. */
  const [sig, setSig] = useState(planeSig);
  const stale = sig !== planeSig;
  const root = stale ? A.initialRoot() : rootState;
  const selId = stale ? "" : selIdState;
  if (stale) {
    setSig(planeSig); setRoot(root); setSelId("");
    setDeg(90); setUndoStack([]); setExpanded(false); setFinished(false);
    setResetToken(t => t + 1);
  }

  const sel = useMemo(() => (selId === null ? null : A.findNode(root, selId)), [A, root, selId]);
  const canSplit = sel ? A.splittable(sel, mode) : false;
  const cut = canSplit ? A.bestCut(sel, deg, rule) : null;
  const nCuts = A.leaves(root).length - 1;
  const accuracy = A.accuracy(root, mode);
  /* the tree is done when nothing can be cut any more, or when the player says so */
  const gameOver = nCuts > 0 && (finished || !A.nextNode(root, mode));

  useEffect(() => { if (gameOver) setExpanded(true); }, [gameOver]);

  function reset() {
    setResetToken(t => t + 1);          // resetting also reframes the board
    setRoot(A.initialRoot());
    setSelId(""); setDeg(90); setUndoStack([]); setExpanded(false); setFinished(false);
  }

  function split() {
    if (!canSplit) return;
    const r = A.split(root, selId, deg, mode, rule);
    if (r === root) return;
    setRoot(r); setUndoStack([...undoStack, selId]); setFinished(false);
    setSelId(A.nextNode(r, mode)?.id ?? null); setDeg(90);
  }

  function undo() {
    if (!undoStack.length) return;
    const id = undoStack[undoStack.length - 1];
    setRoot(A.undo(root, id)); setUndoStack(undoStack.slice(0, -1)); setSelId(id);
    setExpanded(false); setFinished(false);
  }

  /* Calling it done also drops the selection, so the board loses the band and the
     dotted cut line. */
  function finish() {
    setFinished(true); setSelId(null);
  }

  /* "pp" stops by itself at groups − 1 cuts. Free mode has no such limit, so the
     robot keeps cutting while a cut still buys accuracy and calls the tree done
     when none does. */
  function auto() {
    let r = A.initialRoot(); const h = [];
    for (let step = 0; step < 40; step++) {
      const open = A.leaves(r).filter(n => A.splittable(n, mode))
                    .sort((x, y) => y.ids.length - x.ids.length);
      let moved = false;
      for (const n of open) {
        const next = A.split(r, n.id, A.bestDirection(n, mode).deg, mode, rule);
        if (next === r) continue;
        if (mode === "gen" && A.accuracy(next, mode) <= A.accuracy(r, mode)) continue;
        h.push(n.id); r = next; moved = true; break;
      }
      if (!moved) break;
    }
    setRoot(r); setUndoStack(h);
    setFinished(mode === "gen");
    setSelId(mode === "gen" ? null : A.nextNode(r, mode)?.id ?? null);
  }

  return {
    root, sel, selId, setSelId, deg, setDeg,
    canSplit, cut, nCuts, accuracy, gameOver, resetToken,
    canUndo: undoStack.length > 0,
    expanded, setExpanded,
    split, undo, auto, reset, finish,
  };
}
