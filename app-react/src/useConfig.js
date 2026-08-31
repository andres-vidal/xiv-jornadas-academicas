import { useSearchParams } from "react-router-dom";
import { DATASETS, DEFAULT_3D, KEYS } from "./data.js";
import { CUT_RULES } from "./tree-logic.js";

/* The settings live in the query string, so reloading the page or handing the
   link to someone opens exactly the same thing. A default is written as a missing
   parameter: with nothing touched, the address stays clean.

   Parameters: datos, plano (two variable indices, or absent for the best
   projection), cubo (three indices), cortes and regla. */
export function useConfig() {
  const [params, setParams] = useSearchParams();

  const dataKey = KEYS.includes(params.get("datos")) ? params.get("datos") : "crabs";
  const D = DATASETS[dataKey];

  /* n distinct variable indices, or null when the value does not fit this dataset */
  const readAxes = (raw, n) => {
    const v = (raw ?? "").split(",").map(Number);
    const fits = v.length === n && new Set(v).size === n
      && v.every(x => Number.isInteger(x) && x >= 0 && x < D.VARS.length);
    return fits ? v : null;
  };

  const axes = readAxes(params.get("plano"), 2);

  const setCfg = patch => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v == null ? next.delete(k) : next.set(k, v)));
    setParams(next, { replace: true });
  };

  return {
    dataKey, D,
    axes,                                          // null when the best projection is in use
    bestPlane: !axes,
    axes3d: readAxes(params.get("cubo"), 3) || DEFAULT_3D[dataKey],
    mode: params.get("cortes") === "gen" ? "gen" : "pp",
    rule: CUT_RULES.includes(params.get("regla")) ? params.get("regla") : "medias",

    setCfg,
    /* a new dataset invalidates the axes chosen for the previous one */
    setDataset: k => setCfg({ datos: k === "crabs" ? null : k, plano: null, cubo: null }),
    atDefaults: [...params.keys()].length === 0,
    resetAll: () => setParams(new URLSearchParams(), { replace: true }),
  };
}
