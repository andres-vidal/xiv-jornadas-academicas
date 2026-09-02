/* The two numbers that move while playing: how well the chosen direction splits
   the current node, and how much the tree built so far gets right. */
import { CARD } from "./ui.jsx";
import { decimal, percent } from "./strings.js";
import { useLang, useT } from "./useLang.js";

export default function Readouts({ A, root, sel, deg, mode, canSplit, nCuts, accuracy, className = "" }) {
  const lang = useLang(), t = useT();
  const values = [
    [t.readouts.index,
      canSplit ? decimal(lang, A.index(sel.ids, deg, mode === "pp" ? sel.classes : null)) : "—"],
    /* no cuts, no tree: showing the 25 % of "everything one group" misleads */
    [t.readouts.accuracy, nCuts === 0 ? "—" : percent(lang, accuracy)],
  ];
  return (
    <div className={"grid grid-cols-2 gap-2 " + className}>
      {values.map(([k, v]) => (
        <span key={k} className={CARD + " flex min-w-0 flex-col gap-px px-[11px] py-[6px]"}>
          <i className="font-mono text-[0.72rem] not-italic uppercase leading-[1.2]
                        tracking-[0.08em] text-mudo">{k}</i>
          <b className="whitespace-nowrap font-mono text-[1.26rem] font-bold leading-[1.1]">{v}</b>
        </span>
      ))}
    </div>
  );
}
