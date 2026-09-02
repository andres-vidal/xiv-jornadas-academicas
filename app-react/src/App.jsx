/* The frame: the header, the two views and the dialogs that open from it. State
   lives in two hooks, useConfig for the settings that travel in the page address
   and useGame for the game itself. */
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  autoUpdate, flip, offset, shift,
  useClick, useDismiss, useFloating, useInteractions, useRole,
} from "@floating-ui/react";
import { planeFor } from "./data.js";
import { makeTree } from "./tree-logic.js";
import { useConfig } from "./useConfig.js";
import { useGame } from "./useGame.js";
import { STRINGS } from "./strings.js";
import { LangContext } from "./useLang.js";
import { HeaderButton } from "./ui.jsx";
import { GearIcon, HelpIcon, InfoIcon } from "./icons.jsx";
import { WorkCard, WorkDialog, WorkFolded } from "./WorkPanel.jsx";
import HelpDialog from "./HelpDialog.jsx";
import SettingsPanel from "./SettingsPanel.jsx";
import Readouts from "./Readouts.jsx";
import { useElementHeight, useHasRoom, useNarrow } from "./useViewport.js";
import GameView from "./GameView.jsx";
import CloudView from "./CloudView.jsx";

const VIEWS = [
  { key: "game", path: "/arbol" },
  { key: "cloud", path: "/nube" },
];

export default function App() {
  /* the route is the view: react-router owns the address, the history and the back
     button, and falls back to memory where there is no address bar */
  const location = useLocation();
  const navigate = useNavigate();
  const view = location.pathname.startsWith("/nube") ? "cloud" : "game";
  const inGame = view === "game";

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [workDialog, setWorkDialog] = useState(false);

  const config = useConfig();
  const { lang, setLang, dataKey, D, axes, bestPlane, mode, rule } = config;
  /* App puts the language into the context, so it cannot read it from there: it is
     the one component that takes its text straight from the dictionary. */
  const t = STRINGS[lang];

  /* the page itself speaks the language too: screen readers and the browser's
     translation prompt both go by this */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.documentTitle;
  }, [lang, t]);

  /* the query carries the settings: changing view must not lose them */
  const goTo = path => {
    setSettingsOpen(false);
    navigate({ pathname: path, search: location.search });
  };

  /* Floating UI handles the panels. Since it knows its own portals, tapping an
     option inside a menu does not count as tapping outside the panel. */
  const settings = useFloating({
    open: settingsOpen, onOpenChange: setSettingsOpen, placement: "bottom-end",
    /* 20px clears the header and lands the panel on the same line as the cards that
       float over the canvas */
    middleware: [offset(20), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });
  const settingsInt = useInteractions([
    useClick(settings.context), useDismiss(settings.context),
    useRole(settings.context, { role: "dialog" }),
  ]);

  const help = useFloating({ open: helpOpen, onOpenChange: setHelpOpen });
  const helpInt = useInteractions([
    useClick(help.context), useDismiss(help.context, { outsidePressEvent: "mousedown" }),
    useRole(help.context, { role: "dialog" }),
  ]);

  const work = useFloating({ open: workDialog, onOpenChange: setWorkDialog });
  const workInt = useInteractions([
    useClick(work.context), useDismiss(work.context, { outsidePressEvent: "mousedown" }),
    useRole(work.context, { role: "dialog" }),
  ]);

  /* the header goes to two lines on a narrow screen: the cards rest on its real
     height instead of on a number written by hand */
  const headerRef = useRef(null);
  const top = useElementHeight(headerRef, 48) + 12;

  /* On a narrow screen the work becomes a dialog opened from the header: as an open
     card it would take a third of the screen and the game would be left with none.
     The corner is free there, and the other cards rest straight against the header. */
  const hasRoom = useHasRoom();
  const narrow = useNarrow();
  const [workOpen, setWorkOpen] = useState(true);

  const plane = planeFor(dataKey, bestPlane, axes || [0, 1], makeTree, D.VARS);
  const game = useGame({
    A: plane.A, mode, rule,
    planeSig: `${dataKey}|${bestPlane ? "best" : axes.join(",")}|${mode}|${rule}`,
  });

  /* the cube mounts the first time it is asked for and stays mounted, so it keeps
     its rotation when coming back from the game */
  const [cloudSeen, setCloudSeen] = useState(false);
  useEffect(() => { if (view === "cloud") setCloudSeen(true); }, [view]);

  return (
    <LangContext.Provider value={lang}>
    <section className="relative h-[100dvh] w-full overflow-hidden">
      <GameView config={config} plane={plane} game={game} hidden={!inGame}
                hasRoom={hasRoom} narrow={narrow} top={top} />
      {cloudSeen && <CloudView config={config} hidden={inGame} top={top} />}

      {/* header: identity, navigation and the dialogs, on one line */}
      <header ref={headerRef}
              className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center gap-x-4 gap-y-2
                         border-b border-regla bg-papel/85 px-3 py-2 backdrop-blur-[10px]">
        {/* On a narrow screen it goes to two lines: the title and the buttons share the
            first one, the views take the second. The three of them in a row wrap into a
            lone strip of buttons pushed to the right, with a hole beside it. The order
            classes put the buttons ahead of the views for that, and leave the reading
            order alone from sm up. */}
        <b className="order-1 min-w-0 flex-1 text-[1.04rem] font-bold
                      sm:w-auto sm:flex-none sm:text-[1.06rem]">
          {t.title}
        </b>

        <div className="order-3 inline-flex min-w-0 overflow-hidden rounded-lg border border-regla
                        sm:order-2"
             role="group" aria-label={t.header.views}>
          {VIEWS.map(({ key, path }, i) => (
            <button key={key} type="button" onClick={() => goTo(path)}
              className={`truncate px-[10px] py-[5px] text-[0.9rem] transition-colors
                ${i ? "border-l border-regla" : ""}
                ${view === key ? "bg-tinta font-bold text-papel"
                               : "bg-papel text-mudo hover:bg-panel hover:text-tinta"}`}>
              {t.header[key]}
            </button>
          ))}
        </div>

        <div className="order-2 ml-auto flex items-center gap-2 sm:order-3">
          {/* the button shows the language it takes you to, not the one in use */}
          <HeaderButton onClick={() => setLang(lang === "es" ? "en" : "es")}
                        aria-label={t.header.toOtherLang}>
            <span className="font-mono text-[0.72rem] font-bold">{t.header.otherLang}</span>
          </HeaderButton>

          {narrow && (
            <HeaderButton open={workDialog} ref={work.refs.setReference}
              {...workInt.getReferenceProps({ "aria-label": t.header.work, "aria-expanded": workDialog })}>
              <InfoIcon />
            </HeaderButton>
          )}

          <HeaderButton open={helpOpen} ref={help.refs.setReference}
            {...helpInt.getReferenceProps({ "aria-label": t.header.help, "aria-expanded": helpOpen })}>
            <HelpIcon />
          </HeaderButton>

          {/* everything set here belongs to the game; the cube has its own card */}
          {inGame && (
            <HeaderButton open={settingsOpen} ref={settings.refs.setReference}
              {...settingsInt.getReferenceProps({ "aria-label": t.header.settings, "aria-expanded": settingsOpen })}>
              <GearIcon />
            </HeaderButton>
          )}
        </div>
      </header>

      {/* the work has no card at this width, so this is what leaves its links in the
          document for a crawler; it goes while the dialog is up */}
      {narrow && !workDialog && <WorkFolded />}

      {workDialog && narrow && (
        <WorkDialog context={work.context} refs={work.refs}
                    getFloatingProps={workInt.getFloatingProps}
                    onClose={() => setWorkDialog(false)} />
      )}

      {helpOpen && (
        <HelpDialog context={help.context} refs={help.refs}
                    getFloatingProps={helpInt.getFloatingProps}
                    onClose={() => setHelpOpen(false)} />
      )}

      {settingsOpen && inGame && (
        <SettingsPanel config={config} refs={settings.refs} top={top}
                       floatingStyles={settings.floatingStyles}
                       getFloatingProps={settingsInt.getFloatingProps}
                       onClose={() => setSettingsOpen(false)} />
      )}

      {/* Top left corner: the work and, below it, the game's numbers. It sits under
          the controls, because on a short wide screen the open card reaches down to
          them and they have to stay usable. */}
      <div style={{ top }}
           className="pointer-events-none absolute left-3 z-10 flex flex-col items-start gap-2">
        {!narrow && (
          <div className="pointer-events-auto">
            <WorkCard open={workOpen} setOpen={setWorkOpen} />
          </div>
        )}
        {/* with room beside the canvas these numbers go here; if not, with the controls */}
        {inGame && hasRoom && (
          <Readouts className="pointer-events-auto w-[min(340px,72vw)]"
                    A={plane.A} root={game.root} sel={game.sel} deg={game.deg} mode={mode}
                    canSplit={game.canSplit} nCuts={game.nCuts} accuracy={game.accuracy} />
        )}
      </div>
    </section>
    </LangContext.Provider>
  );
}
