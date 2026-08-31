/* Who signs the work and where to go for more. The content is used two ways: as a
   card in the corner when there is room beside the canvas, and as a dialog when
   there is not, because on a phone the open card takes a third of the screen and
   the game is left with none. */
import { CARD, CardHeader, Collapse, Dialog, FoldButton } from "./ui.jsx";
import { BoxIcon, DocIcon, EventIcon, GlobeIcon } from "./icons.jsx";

const LINKS = [
  { href: "https://andres-vidal.github.io/busqueda-de-proyecciones/informe.html",
    title: "Búsqueda de proyecciones", note: "El material completo", Icon: DocIcon },
  { href: "https://github.com/andres-vidal/ppforest2",
    title: "ppforest2", note: "El paquete", Icon: BoxIcon },
  { href: "https://fcea.udelar.edu.uy/campanas/Jornadas_Academicas/2026/",
    title: "XIV Jornadas Académicas", note: "FCEA — Udelar", Icon: EventIcon },
  { href: "https://andresvidal.dev",
    title: "El autor", note: "andresvidal.dev", Icon: GlobeIcon },
];

function WorkContent() {
  return (
    <>
      <h2 className="text-[1rem] font-bold leading-[1.3]">
        Búsqueda de proyecciones para revelar estructuras de grupos en datos multivariados
      </h2>
      <p className="mt-1 text-[0.86rem] leading-[1.4] text-mudo">
        Andrés Vidal Berriel · Licenciatura en Estadística<br />
        Referente: Natalia da Silva · IESTA, FCEA — Udelar
      </p>
      <div className="mt-2 flex flex-col gap-[5px]">
        {LINKS.map(({ href, title, note, Icon }) => (
          <a key={href} href={href} target="_blank" rel="noreferrer"
             className="flex items-center gap-[9px] rounded-lg border border-regla bg-fondo
                        px-[9px] py-[6px] no-underline transition-colors hover:border-tinta2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border
                             border-regla bg-papel text-mudo"><Icon /></span>
            <span className="flex min-w-0 flex-col">
              <span className="text-[0.9rem] font-bold leading-tight">{title}</span>
              <span className="font-mono text-[0.78rem] text-mudo">{note}</span>
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
  return (
    <div className={CARD + " w-[min(340px,72vw)] px-3 py-[9px]"}>
      <CardHeader title="El trabajo">
        <FoldButton open={open} onClick={() => setOpen(!open)}
                    labelOpen="Plegar" labelClosed="Ver el trabajo y los enlaces" />
      </CardHeader>
      <Collapse open={open}
                className="max-h-[36dvh] overflow-y-auto [@media(min-height:600px)]:max-h-none">
        <div className="mt-1"><WorkContent /></div>
      </Collapse>
    </div>
  );
}

export function WorkDialog(props) {
  return (
    <Dialog {...props} title="El trabajo">
      <WorkContent />
    </Dialog>
  );
}
