/* The game's settings: which dataset, on which plane, how the node is shared out
   and where the cut falls. Each explanation sits under its menu and starts on the
   same column as the chosen option. */
import { FloatingPortal } from "@floating-ui/react";
import { CARD, CardHeader, CloseButton, IconButton, Label, Menu } from "./ui.jsx";
import { ResetIcon } from "./icons.jsx";
import { DATASETS, KEYS } from "./data.js";
import { CUT_RULES } from "./tree-logic.js";
import DataSource from "./DataSource.jsx";

/* Where the threshold falls once the groups are already split into two blocks. It
   moves the boundary, not the direction. */
const RULES = {
  medias: {
    name: "Media de las medias",
    why: "El punto medio entre las medias de los dos bloques. Es la que implementa ppforest2.",
  },
  dispersion: {
    name: "Ponderada por dispersión",
    why: "El corte se desplaza hacia el bloque más compacto, que necesita menos espacio.",
  },
  medianas: {
    name: "Media de las medianas",
    why: "Como la primera pero con medianas, así unos pocos casos extremos no arrastran el corte.",
  },
  margen: {
    name: "En el medio del hueco",
    why: "Entre el último punto de un bloque y el primero del other. Deja el mayor margen cuando los bloques no se pisan.",
  },
  aciertos: {
    name: "Máximos aciertos",
    why: "Prueba todos los umbrales y conserva el que deja más puntos del lado que les corresponde.",
  },
};

/* The explanation for each option, lined up with the menu above it. */
function Note({ children }) {
  return <p className="px-[10px] text-[0.84rem] leading-[1.45] text-mudo">{children}</p>;
}

export function DefaultsButton({ config }) {
  return (
    <IconButton bare disabled={config.atDefaults} tip="Valores por defecto"
      label="Volver a los valores por defecto" onClick={config.resetAll}><ResetIcon /></IconButton>
  );
}

export default function SettingsPanel({ config, refs, floatingStyles, getFloatingProps, onClose, top }) {
  const { dataKey, D, axes, bestPlane, mode, rule, setCfg, setDataset } = config;

  return (
    <FloatingPortal>
      {/* the header stays put and only the list of settings scrolls */}
      {/* the room available comes from the header, whose height changes with width */}
      <div ref={refs.setFloating} {...getFloatingProps()}
           style={{ ...floatingStyles, maxHeight: `calc(100dvh - ${top + 12}px)` }}
           className={CARD + " z-[70] flex w-[min(340px,92vw)] flex-col overflow-hidden"}>
        <div className="shrink-0 border-b border-regla px-3 py-[10px]">
          <CardHeader title="Ajustes">
            <DefaultsButton config={config} />
            <CloseButton onClick={onClose} />
          </CardHeader>
        </div>

        {/* label and control in two columns: everything lines up on one vertical */}
        <div className="grid grid-cols-[3.6em_1fr] items-center gap-x-2 gap-y-2
                        overflow-y-auto p-3">
          <Label>datos</Label>
          <Menu label="Datos" value={dataKey} onChange={setDataset}
                options={KEYS.map(k => ({ value: k, text: DATASETS[k].name }))} />
          <span />
          <DataSource dataKey={dataKey} />

          <Label>plano</Label>
          <Menu label="Plano" value={bestPlane ? "best" : "vars"}
                onChange={v => setCfg({ plano: v === "best" ? null : (axes || [0, 1]).join(",") })}
                options={[{ value: "best", text: "La mejor proyección" },
                          { value: "vars", text: "Dos variables" }]} />

          {!bestPlane && (<>
            <span />
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map(r => (
                <Menu key={r} label={r ? "Eje vertical" : "Eje horizontal"} value={axes[r]}
                  onChange={v => {
                    /* if the variable is already on the other axis, they swap */
                    const other = axes[1 - r];
                    const fixed = other === v ? (v + 1) % D.VARS.length : other;
                    setCfg({ plano: (r === 0 ? [v, fixed] : [fixed, v]).join(",") });
                  }}
                  options={D.VARS.map((name, i) => ({ value: i, text: name }))} />
              ))}
            </div>
          </>)}

          <Label>cortes</Label>
          <Menu label="Cortes" value={mode} onChange={m => setCfg({ cortes: m === "pp" ? null : m })}
                options={[{ value: "pp", text: "Como ppforest2" },
                          { value: "gen", text: "Corte libre" }]} />
          <span />
          <Note>
            {mode === "pp"
              ? <>Cada grupo va entero a un lado, así que el árbol frena solo a los <b>{D.GROUPS.length - 1} cortes</b>.</>
              : <>Un grupo puede quedar repartido entre las dos ramas; cada hoja vota por mayoría y se puede seguir cortando hasta dar el árbol por terminado.</>}
          </Note>

          <Label>regla</Label>
          <Menu label="Regla del corte" value={rule}
                onChange={r => setCfg({ regla: r === "medias" ? null : r })}
                options={CUT_RULES.map(k => ({ value: k, text: RULES[k].name }))} />
          <span />
          <Note>{RULES[rule].why}</Note>
        </div>
      </div>
    </FloatingPortal>
  );
}
