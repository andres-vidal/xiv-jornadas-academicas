/* The dataset citation, lined up with the menu that picks it: the px-[10px] is
   the menu border plus its padding, so the name starts on the same column as the
   selected option. */
import { CITATIONS, SOURCES } from "./data.js";

export default function DataSource({ dataKey }) {
  return (
    <div className="flex flex-col gap-1 px-[10px]">
      <span className="font-mono text-[0.79rem] text-tinta2">{SOURCES[dataKey]}</span>
      <p className="text-[0.79rem] leading-[1.45] text-mudo">{CITATIONS[dataKey]}</p>
    </div>
  );
}
