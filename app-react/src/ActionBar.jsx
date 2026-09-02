/* The game's action bar: the angle, and the buttons that cut, undo, build the tree
   on their own, call it done and start over.

   On a narrow screen the bar splits into two rows, with the angle and the slider on
   top: choosing the direction is what asks for the most precision, so it takes the
   whole width instead of sharing it with five buttons. */
import { CARD, IconButton } from "./ui.jsx";
import { FlagIcon, ResetIcon, RobotIcon, ScissorsIcon, UndoIcon } from "./icons.jsx";
import { useT } from "./useLang.js";

export default function ActionBar({ game, mode, index }) {
  const { deg, setDeg, canSplit, cut, sel, nCuts, gameOver, canUndo } = game;
  const t = useT();

  const cutTip = !sel ? t.actions.pickNode
    : !canSplit ? t.actions.closedNode
    : t.actions.cutTip
        .replace("{right}", Math.round(cut.acc * cut.base))
        .replace("{total}", cut.base);

  return (
    <div className={CARD + " pointer-events-auto flex w-full flex-wrap items-center " +
                    "justify-center gap-[9px] px-[11px] py-[9px]"}>
      <div className="flex w-full min-w-0 items-center gap-[9px] sm:w-auto sm:flex-1">
        <span className="min-w-[3.1em] shrink-0 font-mono text-[1.12rem] font-bold">{deg}°</span>
        <input type="range" min="0" max="359" step="1" value={deg} disabled={!canSplit}
               onChange={e => setDeg(+e.target.value)}
               aria-label={t.actions.angle}
               className="min-w-0 flex-1 disabled:opacity-40" />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-[9px] sm:flex-none">
        <IconButton primary tip={cutTip} label={t.actions.cut}
                    onClick={game.split} disabled={!canSplit}><ScissorsIcon /></IconButton>
        <IconButton tip={t.actions.undoTip} label={t.actions.undo}
                    onClick={game.undo} disabled={!canUndo}><UndoIcon /></IconButton>
        <IconButton tip={mode === "pp" ? t.actions.autoPackage : t.actions.autoFree}
                    label={t.actions.auto}
                    onClick={game.auto}><RobotIcon /></IconButton>
        {mode === "gen" && (
          <IconButton tip={t.actions.finishTip} label={t.actions.finish}
                      onClick={game.finish} disabled={gameOver || !nCuts}><FlagIcon /></IconButton>
        )}
        <IconButton tip={t.actions.resetTip} label={t.actions.reset}
                    onClick={game.reset}><ResetIcon /></IconButton>
      </div>

      {/* with room beside the canvas this number sits top left, under the work card */}
      {index != null && (
        <span className="flex shrink-0 items-center gap-[6px]">
          <i className="font-mono text-[0.72rem] not-italic uppercase tracking-[0.08em]
                        text-mudo">{t.actions.index}</i>
          <b className="font-mono text-[0.95rem] font-bold">{index}</b>
        </span>
      )}
    </div>
  );
}
