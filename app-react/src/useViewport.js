import { useEffect, useState } from "react";

function useMedia(query) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const f = () => setMatches(mq.matches);
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, [query]);
  return matches;
}

/* Width below which the cards take the whole width. It is the same break as
   Tailwind's sm: prefix, so what the CSS decides and what the JS decides cannot
   drift apart. */
export const useNarrow = () => useMedia("(max-width: 639px)");

/* There is room for a card beside the canvas when the screen is wide and also
   tall: a phone on its side is 812 wide but 375 tall, and an open card eats half
   the board there. The foldable ones start closed when this is false. */
export const useHasRoom = () => useMedia("(min-width: 640px) and (min-height: 600px)");

/* The real height of an element, to rest something else below it without numbers
   written by hand. The header uses it, and its height changes with the screen
   width when the title wraps onto its own line. */
export function useElementHeight(ref, initial = 0) {
  const [h, setH] = useState(initial);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    setH(el.offsetHeight);
    return () => ro.disconnect();
  }, [ref]);
  return h;
}

/* The canvas works out the shadow band height from the window height. The
   controls anchor to that same number so they do not float far away on a tall
   screen. */
export function useViewportHeight() {
  const [h, setH] = useState(() => window.innerHeight);
  useEffect(() => {
    const f = () => setH(window.innerHeight);
    window.addEventListener("resize", f);
    return () => window.removeEventListener("resize", f);
  }, []);
  return h;
}
