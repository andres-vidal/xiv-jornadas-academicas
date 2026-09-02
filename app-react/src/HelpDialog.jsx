/* What the piece is about, how it is used, and the poster to take away, which sits
   in the dialog footer and therefore stays in view. */
import { Dialog, rich } from "./ui.jsx";
import {
  DocIcon, FlagIcon, ResetIcon, RobotIcon, ScissorsIcon, UndoIcon,
} from "./icons.jsx";
import { useT } from "./useLang.js";

const POSTER_PDF = "https://andres-vidal.github.io/xiv-jornadas-academicas/poster.pdf";

/* the icons of the tree's buttons, in the order the bar shows them; the words are
   in strings.js, under help.buttons */
const TREE_BUTTONS = [
  ["cut", ScissorsIcon], ["undo", UndoIcon], ["auto", RobotIcon],
  ["finish", FlagIcon], ["reset", ResetIcon],
];

function Row({ Icon, children }) {
  return (
    <li className="flex items-center gap-2">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-regla
                       text-tinta"><Icon /></span>
      {children}
    </li>
  );
}

export default function HelpDialog(props) {
  const t = useT();
  const posterLink = (
    <a href={POSTER_PDF} target="_blank" rel="noreferrer"
       className="flex items-center gap-[10px] rounded-[10px] border border-regla
                  px-[11px] py-[9px] no-underline transition-colors hover:bg-panel">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg
                       border border-regla text-tinta"><DocIcon /></span>
      <span className="flex flex-col">
        <b className="text-[0.95rem] leading-tight">{t.help.poster}</b>
        <span className="font-mono text-[0.84rem] text-mudo">{t.help.posterNote}</span>
      </span>
    </a>
  );

  return (
    <Dialog {...props} title={t.help.title} footer={posterLink}>
      <div className="flex flex-col gap-3 text-[0.95rem] leading-[1.55]">
        <p>{rich(t.help.what)}</p>
        <p className="text-tinta2">{t.help.why}</p>

        <div>
          <h3 className="font-bold">{t.help.gameTitle}</h3>
          <p className="mt-1 text-tinta2">{t.help.game}</p>
          <ul className="mt-2 flex flex-col gap-[6px] text-[0.91rem] text-tinta2">
            {TREE_BUTTONS.map(([key, Icon]) => (
              <Row key={key} Icon={Icon}>{t.help.buttons[key]}</Row>
            ))}
          </ul>
          <p className="mt-2 text-tinta2">{rich(t.help.settings)}</p>
        </div>

        <div>
          <h3 className="font-bold">{t.help.cloudTitle}</h3>
          <p className="mt-1 text-tinta2">{t.help.cloud}</p>
          <ul className="mt-2 flex flex-col gap-[6px] text-[0.91rem] text-tinta2">
            <Row Icon={RobotIcon}>{t.help.cloudRobot}</Row>
          </ul>
          <p className="mt-2 text-tinta2">{rich(t.help.cloudCard)}</p>
        </div>

        <p className="text-tinta2">{t.help.address}</p>
      </div>
    </Dialog>
  );
}
