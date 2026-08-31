import { useEffect, useRef } from "react";
import { draw, frame, CAM0, ZOOM } from "./draw.js";

export default function Board({ root, sel, deg, mode, rule, PTS, TOKENS, A, UY,
                                axisNames, R, resetToken, labelsY }) {
  const canvasRef = useRef(null), boxRef = useRef(null);
  const cam = useRef({ ...CAM0 });

  /* a new plane or dataset means a new scale: reset the view */
  useEffect(() => { cam.current = { ...CAM0 }; }, [PTS, resetToken]);

  useEffect(() => {
    const cv = canvasRef.current, box = boxRef.current;
    if (!cv || !box) return;

    const measure = () => box.getBoundingClientRect();

    /* The colours come from CSS variables. Reading them forces a style recalc, and
       doing it on every finger move makes the drag stutter, so they are read once
       per mount and again on resize. */
    const readColours = () => {
      const cs = getComputedStyle(document.documentElement);
      const t = n => cs.getPropertyValue(n).trim();
      return {
        col: {
          tinta: t("--color-tinta"), mudo: t("--color-mudo"), regla: t("--color-regla"),
          panel: t("--color-panel"), papel: t("--color-papel"), sans: t("--font-sans"),
        },
        cg: TOKENS.map(t),
      };
    };
    let colours = readColours();

    const render = () => {
      const r = measure();
      draw(cv, {
        root, sel, deg, mode, rule, W: r.width, H: r.height, cam: cam.current,
        col: colours.col, cg: colours.cg, PTS, A, UY, axisNames, R, labelsY,
      });
    };
    /* One repaint per frame: pointer events arrive more often than frames, and
       drawing on every one leaves the canvas running behind the finger. */
    let pending = 0;
    const paint = () => {
      if (pending) return;
      pending = requestAnimationFrame(() => { pending = 0; render(); });
    };

    render();
    const ro = new ResizeObserver(() => { colours = readColours(); paint(); });
    ro.observe(box);

    /* ---------- framing: drag to pan, wheel or pinch to zoom ---------- */
    const toLocal = (cx, cy) => {
      const r = measure();
      return [cx - r.left, cy - r.top];
    };
    const zoomAt = (factor, px, py) => {
      const r = measure();
      const before = frame(r.width, r.height, cam.current, UY, !!(sel && A.splittable(sel, mode)));
      const ux = before.dx(px), uy = before.dy(py);        // point under the cursor
      const k = Math.max(ZOOM[0], Math.min(ZOOM[1], cam.current.k * factor));
      cam.current = { ...cam.current, k };
      const after = frame(r.width, r.height, cam.current, UY, !!(sel && A.splittable(sel, mode)));
      /* shift the centre so that point stays put */
      const lim = v => Math.max(-R, Math.min(R, v));
      cam.current = {
        k,
        cx: lim(cam.current.cx + (ux - after.dx(px))),
        cy: lim(cam.current.cy + (uy - after.dy(py))),
      };
      paint();
    };
    const pan = (dxPx, dyPx) => {
      const r = measure();
      const m = frame(r.width, r.height, cam.current, UY, !!(sel && A.splittable(sel, mode)));
      /* The centre also stays inside the data circle, so a long drag can never
         push every point off screen. */
      const clamp = v => Math.max(-R, Math.min(R, v));
      cam.current = {
        ...cam.current,
        cx: clamp(cam.current.cx - dxPx / m.scale),
        cy: clamp(cam.current.cy + dyPx / m.scale),
      };
      paint();
    };

    const onWheel = e => {
      e.preventDefault();
      const [px, py] = toLocal(e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.0015), px, py);
    };
    /* One input model: pointer events, which already cover mouse, pen and fingers.
       They used to live next to touch events, and on a phone both handlers ran at
       once: one finger moved the frame at twice the speed and the pinch fought
       with the drag. */
    const active = new Map();
    const points = () => [...active.values()];
    const spread = p => Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    const midpoint = p => [(p[0].x + p[1].x) / 2, (p[0].y + p[1].y) / 2];
    let pinch = 0, centre = null;

    const onDown = e => {
      /* capturing throws if the pointer is no longer active; the gesture still works */
      try { cv.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
      active.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (active.size === 2) { pinch = spread(points()); centre = midpoint(points()); }
      cv.style.cursor = "grabbing";
    };
    const onMove = e => {
      const before = active.get(e.pointerId);
      if (!before) return;
      active.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const p = points();
      if (p.length >= 2) {
        /* two fingers do both at once: the distance between them zooms, and the
           midpoint drags */
        const d = spread(p), c = midpoint(p);
        if (pinch > 0) zoomAt(d / pinch, ...toLocal(...c));
        if (centre) pan(c[0] - centre[0], c[1] - centre[1]);
        pinch = d; centre = c;
      } else {
        pan(e.clientX - before.x, e.clientY - before.y);
      }
    };
    /* the drag also ends if the pointer is lost outside the canvas: without this, a
       pointerup that never arrives leaves every later move panning the board */
    const onUp = e => {
      if (e && e.pointerId != null) active.delete(e.pointerId); else active.clear();
      if (active.size < 2) { pinch = 0; centre = null; }
      if (!active.size) cv.style.cursor = "grab";
    };
    const onDouble = () => { cam.current = { ...CAM0 }; paint(); };

    cv.style.cursor = "grab";
    cv.addEventListener("wheel", onWheel, { passive: false });
    cv.addEventListener("pointerdown", onDown);
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerup", onUp);
    cv.addEventListener("pointercancel", onUp);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onUp);
    cv.addEventListener("dblclick", onDouble);
    return () => {
      cancelAnimationFrame(pending);
      ro.disconnect();
      cv.removeEventListener("wheel", onWheel);
      cv.removeEventListener("pointerdown", onDown);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerup", onUp);
      cv.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onUp);
      cv.removeEventListener("dblclick", onDouble);
    };
  }, [root, sel, deg, mode, rule, PTS, TOKENS, A, UY, axisNames, R, labelsY]);

  return (
    <div ref={boxRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full touch-none" role="img"
        aria-label={`Los ${PTS.length} individuos en el plano ${axisNames[0]} contra ${axisNames[1]}. ` +
          "Se puede arrastrar para mover el encuadre y usar la rueda o dos dedos para acercarse; " +
          "el doble clic lo vuelve a encuadrar."} />
    </div>
  );
}
