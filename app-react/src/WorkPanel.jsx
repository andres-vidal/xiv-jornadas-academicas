/* Who signs the work and where to go for more. The content is used two ways: as a
   card in the corner when there is room beside the canvas, and as a dialog when
   there is not, because on a phone the open card takes a third of the screen and
   the game is left with none. */
import { CARD, CardHeader, Collapse, Dialog, FoldButton } from "./ui.jsx";
import { BoxIcon, DocIcon, EventIcon, GlobeIcon } from "./icons.jsx";
import { useT } from "./useLang.js";

/* the address and the icon of each link; the words are in strings.js, under the
   same key */
const LINKS = [
  { key: "report", href: "https://andres-vidal.github.io/busqueda-de-proyecciones/informe.html",
    Icon: DocIcon },
  { key: "package", href: "https://github.com/andres-vidal/ppforest2", Icon: BoxIcon },
  { key: "event", href: "https://fcea.udelar.edu.uy/campanas/Jornadas_Academicas/2026/",
    Icon: EventIcon },
  { key: "author", href: "https://andresvidal.dev", Icon: GlobeIcon },
];

function WorkContent() {
  const t = useT();
  return (
    <>
      <h2 className="text-[1rem] font-bold leading-[1.3]">{t.work.heading}</h2>
      <p className="mt-1 text-[0.86rem] leading-[1.4] text-mudo">
        {t.work.author}<br />
        {t.work.advisor}
      </p>
      <div className="mt-2 flex flex-col gap-[5px]">
        {LINKS.map(({ key, href, Icon }) => (
          <a key={href} href={href} target="_blank" rel="noreferrer"
             className="flex items-center gap-[9px] rounded-lg border border-regla bg-fondo
                        px-[9px] py-[6px] no-underline transition-colors hover:border-tinta2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border
                             border-regla bg-papel text-mudo"><Icon /></span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[0.9rem] font-bold leading-tight">{t.work.links[key].title}</span>
              <span className="font-mono text-[0.78rem] text-mudo">{t.work.links[key].note}</span>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}

/* The corner card, which starts open. On a short wide screen it gets a ceiling,
   since there it would reach down to the controls. */
export function WorkCard({ open, setOpen }) {
  const t = useT();
  return (
    <div className={CARD + " w-[min(340px,72vw)] px-3 py-[9px]"}>
      <CardHeader title={t.work.title}>
        <FoldButton open={open} onClick={() => setOpen(!open)}
                    labelOpen={t.ui.fold} labelClosed={t.work.show} />
      </CardHeader>
      <Collapse open={open}
                className="max-h-[36dvh] overflow-y-auto [@media(min-height:600px)]:max-h-none">
        <div className="mt-1"><WorkContent /></div>
      </Collapse>
    </div>
  );
}

/* The same content, folded to no height.

   On a phone the work lives in a dialog, and a dialog only exists while it is open,
   so at that width the page holds no links at all. Google indexes what it renders
   at phone width, which is where it would find none. This keeps them in the
   document without drawing anything: the grid interpolates to 0fr and the child
   clips, the same mechanism the cards fold with.

   `inert` is what makes it honest to the reader as well: the links stay in the
   document for a crawler to follow, and leave the focus order and the accessibility
   tree, so tabbing never lands on something nobody can see. App only mounts it
   while the dialog is closed, so there is never a second copy. */
export function WorkFolded() {
  return (
    <div inert className="grid grid-rows-[0fr]">
      <div className="min-h-0 overflow-hidden"><WorkContent /></div>
    </div>
  );
}

export function WorkDialog(props) {
  const t = useT();
  return (
    <Dialog {...props} title={t.work.title}>
      <WorkContent />
    </Dialog>
  );
}
