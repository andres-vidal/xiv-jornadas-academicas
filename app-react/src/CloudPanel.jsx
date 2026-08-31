/* The cube's controls: which dataset, which variable on each axis, what those
   measurements are and which colour is which group. CloudView decides where it
   sits. */
import { Fragment } from "react";
import { CARD, CardHeader, Collapse, FoldButton, Label, Menu } from "./ui.jsx";
import { DATASETS, KEYS, NOTES } from "./data.js";
import DataSource from "./DataSource.jsx";
import { DefaultsButton } from "./SettingsPanel.jsx";

const AXES = ["eje x", "eje y", "eje z"];

export default function CloudPanel({ config, open, setOpen, top, className = "" }) {
  const { dataKey, D, axes3d, setCfg, setDataset } = config;

  /* if the variable is already on another axis, the two axes swap */
  const setAxis = (k, v) => {
    const next = [...axes3d];
    const j = next.findIndex((x, i) => i !== k && x === v);
    const prev = next[k];
    next[k] = v;
    if (j >= 0) next[j] = prev;
    setCfg({ cubo: next.join(",") });
  };

  return (
    <div style={{ top }} className={CARD + " flex flex-col gap-2 p-3 " + className}>
      <CardHeader title="La nube">
        <DefaultsButton config={config} />
        <FoldButton open={open} onClick={() => setOpen(!open)}
                    labelOpen="Plegar" labelClosed="Ver datos, ejes y leyenda" />
      </CardHeader>

      <Collapse open={open} className="max-h-[72dvh] overflow-y-auto">
        <div className="grid grid-cols-[3.6em_1fr] items-center gap-x-2 gap-y-2">
          <Label>datos</Label>
          <Menu label="Datos" value={dataKey} onChange={setDataset}
                options={KEYS.map(k => ({ value: k, text: DATASETS[k].name }))} />
          <span />
          <DataSource dataKey={dataKey} />
          {AXES.map((eje, k) => (
            <Fragment key={eje}>
              <Label>{eje}</Label>
              <Menu label={eje} value={axes3d[k]} onChange={v => setAxis(k, v)}
                    options={D.VARS.map((name, i) => ({ value: i, text: name }))} />
            </Fragment>
          ))}
        </div>

        {/* what was measured, and why the variables move together */}
        <div className="mt-2 flex flex-col gap-1 border-t border-regla pt-2
                        text-[0.82rem] leading-[1.45] text-mudo">
          <p>{D.PTS.length} individuos · {D.GROUPS.length} grupos · {D.VARS.length} medidas.</p>
          <p>{NOTES[dataKey].measures}</p>
          <p>{NOTES[dataKey].why}</p>
        </div>

        <div className="mt-2 flex flex-col gap-[3px] border-t border-regla pt-2">
          {D.GROUPS.map((g, k) => (
            <span key={g} className="inline-flex items-center gap-[5px] whitespace-nowrap
                                     text-[0.82rem] text-tinta2">
              <i className="h-2 w-2 shrink-0 rounded-full"
                 style={{ background: `var(${D.TOKENS[k]})` }} />
              {g}
            </span>
          ))}
        </div>
      </Collapse>
    </div>
  );
}
