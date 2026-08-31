/* What the piece is about, how it is used, and the poster to take away, which sits
   in the dialog footer and therefore stays in view. */
import { Dialog } from "./ui.jsx";
import {
  DocIcon, FlagIcon, ResetIcon, RobotIcon, ScissorsIcon, UndoIcon,
} from "./icons.jsx";

const POSTER_PDF = "https://andres-vidal.github.io/xiv-jornadas-academicas/poster.pdf";

const TREE_BUTTONS = [
  [ScissorsIcon, "Cortar en el ángulo elegido"],
  [UndoIcon, "Deshacer el último corte"],
  [RobotIcon, "Dejar que el algoritmo lo arme solo"],
  [FlagIcon, "Dar el árbol por terminado, en corte libre"],
  [ResetIcon, "Empezar de nuevo"],
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

const posterLink = (
  <a href={POSTER_PDF} target="_blank" rel="noreferrer"
     className="flex items-center gap-[10px] rounded-[10px] border border-regla
                px-[11px] py-[9px] no-underline transition-colors hover:bg-panel">
    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg
                     border border-regla text-tinta"><DocIcon /></span>
    <span className="flex flex-col">
      <b className="text-[0.95rem] leading-tight">El póster</b>
      <span className="font-mono text-[0.84rem] text-mudo">en PDF</span>
    </span>
  </a>
);

export default function HelpDialog(props) {
  return (
    <Dialog {...props} title="De qué se trata" footer={posterLink}>
      <div className="flex flex-col gap-3 text-[0.95rem] leading-[1.55]">
              <p>
                <b>ppforest2</b> es un paquete de R para clasificación con árboles y bosques
                aleatorios basados en búsqueda de proyecciones. Esta página permite explorar
                la parte central del método.
              </p>
              <p className="text-tinta2">
                Un árbol clásico parte los datos por una variable a la vez. ppforest2 busca
                primero la proyección unidimensional que mejor separa los grupos, una
                combinación lineal de todas las variables, y sólo entonces corta. Eso importa
                cuando la diferencia entre los grupos está repartida en varias medidas y
                ninguna alcanza por sí sola.
              </p>

              <div>
                <h3 className="font-bold">Armar el árbol</h3>
                <p className="mt-1 text-tinta2">
                  La barra controla la dirección y debajo aparece la sombra, que son los datos
                  proyectados sobre ella. El corte se hace cuando los grupos quedan separados
                  en esa sombra. Cada corte parte un nodo en dos y el árbol crece.
                </p>
                <ul className="mt-2 flex flex-col gap-[6px] text-[0.91rem] text-tinta2">
                  {TREE_BUTTONS.map(([Icon, txt]) => (
                    <Row key={txt} Icon={Icon}>{txt}</Row>
                  ))}
                </ul>
                <p className="mt-2 text-tinta2">
                  En <b>Ajustes</b> se cambian los datos y el plano, y las dos decisiones del
                  algoritmo: si un grupo puede quedar repartido entre las dos ramas, y qué
                  regla fija dónde cae el corte.
                </p>
              </div>

              <div>
                <h3 className="font-bold">Explorar la nube</h3>
                <p className="mt-1 text-tinta2">
                  El mismo conjunto, ahora en tres dimensiones. Se rota arrastrando y se acerca
                  con la rueda o con dos dedos. La barra de abajo indica qué combinación lineal
                  define cada eje del cubo.
                </p>
                <ul className="mt-2 flex flex-col gap-[6px] text-[0.91rem] text-tinta2">
                  <Row Icon={RobotIcon}>
                    Girar el cubo hasta la mejor proyección, la que usa el árbol
                  </Row>
                </ul>
                <p className="mt-2 text-tinta2">
                  La tarjeta <b>La nube</b> elige los datos y qué medida va en cada eje.
                </p>
              </div>

              <p className="text-tinta2">
                Todo lo que se elige viaja en la dirección de la página, así que el enlace
                vuelve a abrir exactamente lo mismo.
              </p>
      </div>
    </Dialog>
  );
}
