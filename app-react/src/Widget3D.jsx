import { useEffect, useRef, useState } from "react";
import scatter3d from "./scatter3d.js";

export default function Widget3D({ data, apiRef, readoutHost }) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);

  /* the widget draws at a fixed size, so we measure the slot it has to fill and
     only re-init when that changes by enough to matter */
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host) return;
    const measure = () => {
      const r = host.getBoundingClientRect();
      const W = Math.round(r.width), H = Math.round(r.height);
      setSize(s => (!s || Math.abs(s.W - W) > 24 || Math.abs(s.H - H) > 24) ? { W, H } : s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || !size) return;
    el.innerHTML = "";
    /* the readout lives outside the widget root: it has to be cleared too */
    if (readoutHost?.current) readoutHost.current.innerHTML = "";
    const api = scatter3d(el.id, data, {
      W: size.W, H: size.H, tight: true, readoutHost: readoutHost?.current,
    });
    /* by ref, not callback: a fresh function each render would sit in the
       dependency list and rebuild the widget constantly */
    if (apiRef) apiRef.current = api;
  }, [data, size, apiRef, readoutHost]);

  return <div id="crab3d" ref={ref} className="h-full w-full" />;
}
