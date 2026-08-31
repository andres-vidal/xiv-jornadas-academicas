/* The cube view: the same data in three dimensions, with the linear combinations
   bar resting at the bottom and the robot that takes the cube to the best
   projection, the same one the tree uses. */
import { useRef, useState } from "react";
import { LOADINGS, payload3d } from "./data.js";
import Widget3D from "./Widget3D.jsx";
import CloudPanel from "./CloudPanel.jsx";
import { CARD, IconButton } from "./ui.jsx";
import { RobotIcon } from "./icons.jsx";
import { useHasRoom } from "./useViewport.js";

export default function CloudView({ config, hidden, top }) {
  const { dataKey, D, axes3d } = config;
  const api = useRef(null);
  const readoutRef = useRef(null);
  /* With no room beside the canvas it starts folded, like the tree in the other
     view: they are the two cards you look at when you need them. */
  const hasRoom = useHasRoom();
  const [open, setOpen] = useState(hasRoom);

  const showBestPlane = () => {
    const L = LOADINGS[dataKey];
    api.current?.ponerZ(axes3d.map(i => L[0][i]), axes3d.map(i => L[1][i]));
  };

  return (
    <div className={hidden ? "hidden" : "contents"}>
      {/* One column: the cube takes everything left over and the readout goes below,
          so they can never overlap whatever the window height is. The cards float
          above and take no room from it, as in the other view. */}
      <div style={{ top: top - 4 }} className="absolute inset-x-3 bottom-3 flex flex-col gap-3">
        <div className="min-h-0 flex-1">
          <Widget3D key={dataKey + axes3d.join(",")} data={payload3d(D, axes3d)}
                    apiRef={api} readoutHost={readoutRef} />
        </div>
        <div className={CARD + " flex shrink-0 items-center gap-3 px-3 py-[10px]"}>
          {/* on a phone the two combinations take several lines: the height is capped
              and it scrolls instead of eating the cube */}
          <div ref={readoutRef} className="max-h-[11rem] min-w-0 flex-1 overflow-y-auto sm:max-h-none" />
          <IconButton label="Usar la mejor proyección" tip="Usar la mejor proyección"
                      onClick={showBestPlane}><RobotIcon /></IconButton>
        </div>
      </div>

      {/* floats in the corner; on a narrow screen it rests below the work card, which
          takes the whole width there */}
      <CloudPanel config={config} open={open} setOpen={setOpen} top={top}
                  className="absolute right-3 z-20 w-[calc(100%-24px)] sm:w-[min(340px,86vw)]" />
    </div>
  );
}
