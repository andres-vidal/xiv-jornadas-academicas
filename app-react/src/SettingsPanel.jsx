/* The game's settings: which dataset, on which plane, how the node is shared out
   and where the cut falls. Each explanation sits under its menu and starts on the
   same column as the chosen option. */
import { FloatingPortal } from "@floating-ui/react";
import { CARD, CardHeader, CloseButton, IconButton, Label, Menu, rich } from "./ui.jsx";
import { ResetIcon } from "./icons.jsx";
import { KEYS } from "./data.js";
import { CUT_RULES } from "./tree-logic.js";
import { useT } from "./useLang.js";
import DataSource from "./DataSource.jsx";

/* The explanation for each option, lined up with the menu above it. */
function Note({ children }) {
  return <p className="px-[10px] text-[0.84rem] leading-[1.45] text-mudo">{children}</p>;
}

export function DefaultsButton({ config }) {
  const t = useT();
  return (
    <IconButton bare disabled={config.atDefaults} tip={t.settings.defaults}
      label={t.settings.toDefaults} onClick={config.resetAll}><ResetIcon /></IconButton>
  );
}

export default function SettingsPanel({ config, refs, floatingStyles, getFloatingProps, onClose, top }) {
  const { dataKey, D, axes, bestPlane, mode, rule, setCfg, setDataset } = config;
  const t = useT();

  return (
    <FloatingPortal>
      {/* the header stays put and only the list of settings scrolls */}
      {/* the room available comes from the header, whose height changes with width */}
      <div ref={refs.setFloating} {...getFloatingProps()}
           style={{ ...floatingStyles, maxHeight: `calc(100dvh - ${top + 12}px)` }}
           className={CARD + " z-[70] flex w-[min(340px,92vw)] flex-col overflow-hidden"}>
        <div className="shrink-0 border-b border-regla px-3 py-[10px]">
          <CardHeader title={t.settings.title}>
            <DefaultsButton config={config} />
            <CloseButton onClick={onClose} />
          </CardHeader>
        </div>

        {/* label and control in two columns: everything lines up on one vertical */}
        <div className="grid grid-cols-[3.6em_1fr] items-center gap-x-2 gap-y-2
                        overflow-y-auto p-3">
          <Label>{t.settings.dataLabel}</Label>
          <Menu label={t.settings.data} value={dataKey} onChange={setDataset}
                options={KEYS.map(k => ({ value: k, text: t.data[k].name }))} />
          <span />
          <DataSource dataKey={dataKey} />

          <Label>{t.settings.planeLabel}</Label>
          <Menu label={t.settings.plane} value={bestPlane ? "best" : "vars"}
                onChange={v => setCfg({ plano: v === "best" ? null : (axes || [0, 1]).join(",") })}
                options={[{ value: "best", text: t.settings.bestPlane },
                          { value: "vars", text: t.settings.twoVars }]} />

          {!bestPlane && (<>
            <span />
            <div className="grid grid-cols-2 gap-2">
              {[0, 1].map(r => (
                <Menu key={r} label={r ? t.settings.yAxis : t.settings.xAxis} value={axes[r]}
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

          <Label>{t.settings.cutsLabel}</Label>
          <Menu label={t.settings.cuts} value={mode}
                onChange={m => setCfg({ cortes: m === "pp" ? null : m })}
                options={[{ value: "pp", text: t.settings.likePackage },
                          { value: "gen", text: t.settings.freeCut }]} />
          <span />
          <Note>
            {mode === "pp"
              ? rich(t.settings.notePackage, { n: D.GROUPS.length - 1 })
              : t.settings.noteFree}
          </Note>

          <Label>{t.settings.ruleLabel}</Label>
          <Menu label={t.settings.rule} value={rule}
                onChange={r => setCfg({ regla: r === "medias" ? null : r })}
                options={CUT_RULES.map(k => ({ value: k, text: t.rules[k].name }))} />
          <span />
          <Note>{t.rules[rule].why}</Note>
        </div>
      </div>
    </FloatingPortal>
  );
}
