/* The tree-building view: the board full screen, the tree floating top right and
   the controls resting on the shadow band. */
import Board from "./Board.jsx";
import { bandHeight } from "./draw.js";
import ActionBar from "./ActionBar.jsx";
import Legend from "./Legend.jsx";
import TreePanel from "./TreePanel.jsx";
import { useRef } from "react";
import { useElementHeight, useViewportHeight } from "./useViewport.js";
import { decimal } from "./strings.js";
import { useLang } from "./useLang.js";

export default function GameView({ config, plane, game, hidden, hasRoom, narrow, top }) {
  const { D, mode, rule } = config;
  const lang = useLang();
  const A = plane.A;
  /* the shadow band only exists when there is a node to project; the controls rest
     on it so they do not float far away on a tall screen */
  const viewportH = useViewportHeight();
  const band = bandHeight(viewportH, game.canSplit);
  /* With no room beside the canvas the controls take the foot of the plot, where the
     axis labels live. They stay at the foot, just above the controls, so the view
     measures how tall that stack is. */
  const barRef = useRef(null);
  const barH = useElementHeight(barRef);
  const labelsY = narrow ? viewportH - band - 14 - barH - 30 : null;

  /* Switching views hides it rather than unmounting it, so the board keeps its
     framing and the tree being built. "contents" lets the children go on positioning
     against the section, which is the one with the position. */
  return (
    <div className={hidden ? "hidden" : "contents"}>
      <div className="absolute inset-0">
        <Board root={game.root} sel={game.sel} deg={game.deg} mode={mode} rule={rule}
               PTS={plane.PTS} TOKENS={D.TOKENS} A={A} UY={plane.UY}
               axisNames={plane.names} R={plane.R} resetToken={game.resetToken}
               labelsY={labelsY} />
      </div>

      <TreePanel game={game} plane={plane} D={D} A={A} mode={mode} narrow={narrow}
                 top={top}
                 expanded={game.expanded} setExpanded={game.setExpanded} />

      <div ref={barRef}
           className="pointer-events-none absolute inset-x-3 z-30 flex flex-col items-center gap-2"
           style={{ bottom: band + 14 }}>
        {/* one column, so the floating pieces measure the same and line up with each
            other instead of stepping */}
        <div className="flex w-full max-w-[500px] flex-col gap-2">
          <Legend groups={D.GROUPS} tokens={D.TOKENS}
                  className="w-full sm:absolute sm:bottom-0 sm:right-0 sm:w-auto" />

          {/* with no room beside the canvas the index travels with the buttons: one
              more card does not fit on a phone screen */}
          <ActionBar game={game} mode={mode}
                     index={hasRoom || !game.canSplit ? null
                       : decimal(lang, A.index(game.sel.ids, game.deg,
                                             mode === "pp" ? game.sel.classes : null))} />
        </div>
      </div>
    </div>
  );
}
