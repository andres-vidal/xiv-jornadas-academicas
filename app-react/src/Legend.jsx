/* Which colour is which group. On a narrow screen it sits in a row above the
   controls; from sm up it leans on the right edge, in a column. */
import { CARD } from "./ui.jsx";

export default function Legend({ groups, tokens, className = "", style }) {
  return (
    <div style={style}
         className={CARD + " pointer-events-none flex flex-row flex-wrap justify-center gap-x-3 " +
                    "gap-y-[2px] px-[10px] py-[5px] sm:flex-col sm:flex-nowrap sm:gap-x-0 " + className}>
      {groups.map((g, k) => (
        <span key={g} className="inline-flex items-center gap-[5px] whitespace-nowrap
                                 text-[0.82rem] text-tinta2">
          <i className="h-2 w-2 shrink-0 rounded-full" style={{ background: `var(${tokens[k]})` }} />
          {g}
        </span>
      ))}
    </div>
  );
}
