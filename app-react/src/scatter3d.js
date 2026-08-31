// scatter3d.js -----------------------------------------------------------
// Scatter 3D rotable, compartido por las visualizaciones de iris y crab. Los
// datos llegan en sus unidades originales. Dos funciones opcionales,
// activadas por banderas en los datos:
//
//   selector : tres desplegables para elegir qué variable va en cada eje.
//   readout  : muestra en vivo los coeficientes de Z1 (horizontal) y Z2
//              (vertical) como combinación lineal de las tres variables
//              elegidas. Son, literalmente, las dos primeras filas de la
//              matriz de rotación: al girar la nube se elige una proyección,
//              y esos números son la proyección.
//
// La rotación es un trackball: se mantiene una matriz 3x3 y cada arrastre la
// pre-multiplica por un giro en los ejes de la pantalla. Así ambos ejes
// proyectados combinan de verdad las tres variables.
function scatter3d(rootId, dataId, opts) {
  var CH = C_MUDO, CV = C_TINTA;          // Z1 gris, Z2 negro: son andamiaje, así que
                                               // no compiten con los colores de los grupos
  var root = document.getElementById(rootId);
  // Se vacía el contenedor antes de construir. Al guardar la página desde el
  // navegador ("guardar como"), lo que queda en el archivo es el DOM ya
  // construido; al abrirlo, este script vuelve a correr y, sin esta línea,
  // agregaría un segundo widget debajo del que quedó guardado --- que además
  // se ve roto, porque el contenido de un lienzo no se guarda.
  root.innerHTML = "";
  var data = typeof dataId === "string"
    ? JSON.parse(document.getElementById(dataId).textContent)
    : dataId;
  var vars = data.vars;                         // etiquetas cortas (ejes y selectores)
  var varsL = data.varsLong || data.vars;       // nombres completos (lectura de coeficientes)
  var pts = data.pts, cols = data.col, N = pts.length;
  var conSelector = !!data.selector, conLectura = !!data.readout;

  opts = opts || {};
  // Los estilos salen de los tokens de la app, para que el widget se vea
  // igual que el resto de la interfaz.
  var _cs = getComputedStyle(document.documentElement);
  var T = function (n, d) { var v = _cs.getPropertyValue(n).trim(); return v || d; };
  var C_REGLA = T("--color-regla", "#d9dee3"), C_PAPEL = T("--color-papel", "#ffffff"),
      C_TINTA = T("--color-tinta", "#222222"), C_MUDO  = T("--color-mudo",  "#6b7378"),
      C_PANEL = T("--color-panel", "#eef0f4"),
      F_SANS  = T("--font-sans", "sans-serif"), F_MONO = T("--font-mono", "monospace");
  var W = opts.W || 640, H = opts.H || 430, EJE = C_MUDO;
  root.style.cssText = opts.tight
    ? "max-width:" + W + "px;margin:0 auto;padding:0"
    : "max-width:" + W + "px;margin:18px auto 24px;padding:0 4px";

  // --- barra de selectores (opcional) ------------------------------------
  var sel = [];
  if (conSelector) {
    var bar = document.createElement("div");
    bar.style.cssText = "display:flex;gap:14px;align-items:center;flex-wrap:wrap;" +
      "justify-content:center;font-family:" + F_MONO + ";font-size:.6rem;" +
      "letter-spacing:.08em;text-transform:uppercase;color:" + C_MUDO + ";margin-bottom:10px";
    ["eje x", "eje y", "eje z"].forEach(function (nom, k) {
      var lab = document.createElement("label");
      lab.style.cssText = "display:flex;gap:6px;align-items:center";
      lab.appendChild(document.createTextNode(nom));
      var s = document.createElement("select");
      s.style.cssText = "font-family:" + F_SANS + ";font-size:.76rem;letter-spacing:0;" +
        "text-transform:none;padding:5px 8px;border:1px solid " + C_REGLA + ";" +
        "border-radius:8px;background:" + C_PAPEL + ";color:" + C_TINTA;
      vars.forEach(function (v, i) {
        var o = document.createElement("option"); o.value = i; o.textContent = v; s.appendChild(o);
      });
      s.addEventListener("change", function () { elegir(k, +s.value); });
      lab.appendChild(s); bar.appendChild(lab); sel.push(s);
    });
    root.appendChild(bar);
  }

  // --- lienzo ------------------------------------------------------------
  var canvas = document.createElement("canvas");
  var dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr; canvas.height = H * dpr;
  canvas.style.cssText = "display:block;margin:0 auto;width:100%;max-width:" + W +
    "px;height:auto;cursor:grab;touch-action:none;border-radius:6px";
  var ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  root.appendChild(canvas);

  // --- coeficientes de Z1 y Z2 (opcional) --------------------------------
  // No son sólo una lectura: cada coeficiente es un campo editable, así que la
  // proyección puede escribirse a mano además de obtenerse girando la nube.
  var out = null, campos = [[], []];

  // Deja el texto en forma de número: descarta lo que no sea dígito, punto o
  // signo, admite un solo signo (al frente) y un solo punto, y recorta a
  // [-1, 1], que es donde vive todo coeficiente de una dirección de norma 1.
  // Conserva los estados intermedios "-", "0." y "-0." para poder escribir con
  // naturalidad; "--9" o "++9" simplemente no llegan a formarse.
  // Los coeficientes se muestran con coma decimal, como el resto de la app.
  function fmt(v) { return v.toFixed(2).replace(".", ","); }
  function num(t) { var v = parseFloat(String(t).replace(",", ".")); return isNaN(v) ? 0 : v; }

  function sanear(txt) {
    txt = txt.replace(/\./g, ",").replace(/[^0-9,\-]/g, "");
    var neg = txt.charAt(0) === "-";
    txt = txt.replace(/-/g, "");
    var partes = txt.split(",");
    txt = partes.shift() + (partes.length ? "," + partes.join("") : "");
    if (neg) txt = "-" + txt;
    var v = parseFloat(txt.replace(",", "."));
    if (!isNaN(v) && (v > 1 || v < -1)) txt = v > 1 ? "1" : "-1";
    return txt;
  }

  if (conLectura) {
    out = document.createElement("div");
    /* when the app hosts the readout it draws the card itself, so here we only
       set type and colour and let the host own the frame */
    out.style.cssText = opts.readoutHost
      ? "font-family:" + F_MONO + ";font-size:.78rem;color:" + C_TINTA
      : "font-family:" + F_MONO + ";font-size:.78rem;padding:11px 13px;margin-top:12px;" +
        "border:1px solid " + C_REGLA + ";border-radius:12px;" +
        "background:rgba(255,255,255,.8);backdrop-filter:blur(10px);" +
        "box-shadow:0 4px 16px -8px rgba(20,22,28,.4);color:" + C_TINTA;

    [0, 1].forEach(function (r) {
      // Rótulo a la izquierda y términos en una grilla propia. Los términos se
      // acomodan en columnas iguales, así que cuando no entran los tres a lo
      // ancho el que baja queda alineado bajo el primero y no suelto en el medio.
      var linea = document.createElement("div");
      linea.style.cssText = "display:grid;grid-template-columns:3.6em 1fr;" +
        "align-items:center;gap:6px;margin:9px 0";
      var tag = document.createElement("span");
      tag.style.cssText = "color:" + (r ? CV : CH) + ";font-weight:600";
      tag.innerHTML = (r ? "&#9650; Z<sub>2</sub>" : "&#9654; Z<sub>1</sub>") + " =";
      linea.appendChild(tag);

      var terminos = document.createElement("div");
      terminos.style.cssText = "display:grid;gap:6px 14px;justify-content:start;" +
        "grid-template-columns:repeat(auto-fit,minmax(8.8em,max-content))";
      linea.appendChild(terminos);

      for (var j = 0; j < 3; j++) {
        // Campo de texto y no type="number": con éste último, un contenido como
        // "--9" deja al input en estado inválido y `value` devuelve "", que no
        // se distingue de un "-" a medio escribir. Con texto se ve siempre lo
        // que hay escrito y se puede sanear.
        var caja = document.createElement("input");
        caja.type = "text"; caja.inputMode = "decimal";
        caja.autocomplete = "off"; caja.spellcheck = false;
        caja.style.cssText = "font:inherit;width:4.2em;padding:4px 6px;text-align:right;" +
          "border:1px solid " + C_REGLA + ";border-radius:8px;background:" + C_PAPEL +
          ";color:" + C_TINTA;

        caja.addEventListener("input", function () {
          var pos = this.selectionStart, antes = this.value, limpio = sanear(antes);
          if (limpio !== antes) {
            this.value = limpio;
            var d = antes.length - limpio.length;
            try { this.setSelectionRange(pos - d, pos - d); } catch (e) {}
          }
          // Si el texto saneado es el que ya está aplicado, no se recalcula.
          // Recalcular partiría de los valores que la vista dejó escritos
          // redondeados a dos decimales, y la proyección iría derivando sola a
          // cada tecla aunque el número no haya cambiado.
          if (limpio === this.aplicado) return;
          this.aplicado = limpio;
          aplicarCoeficientes();
        });
        // Las flechas del teclado mueven el coeficiente de a 0.05, que es lo
        // que daban los controles de type="number".
        caja.addEventListener("keydown", function (e) {
          if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
          e.preventDefault();
          var v = num(this.value) + (e.key === "ArrowUp" ? 0.05 : -0.05);
          this.value = fmt(Math.min(1, Math.max(-1, v)));
          this.aplicado = this.value;
          aplicarCoeficientes();
        });

        var nom = document.createElement("span");
        nom.style.cssText = "color:" + C_MUDO + ";overflow:hidden;text-overflow:ellipsis;" +
          "white-space:nowrap";
        var termino = document.createElement("span");
        termino.style.cssText = "display:flex;align-items:center;gap:5px;min-width:0";
        termino.appendChild(caja); termino.appendChild(nom);
        terminos.appendChild(termino);
        campos[r].push({ caja: caja, nom: nom });
      }
      out.appendChild(linea);
    });

    (opts.readoutHost || root).appendChild(out);
  }

  // --- leyenda (opcional: la app dibuja la suya) --------------------------
  if (data.leyenda !== false) {
  var leg = document.createElement("div");
  leg.style.cssText = "display:flex;gap:16px;justify-content:center;flex-wrap:wrap;" +
    "font-family:ui-monospace,Menlo,monospace;font-size:12px;color:#24303a;" +
    "margin-top:14px;padding-bottom:2px";
  data.grupos.forEach(function (g, i) {
    var it = document.createElement("span");
    it.style.cssText = "display:flex;gap:6px;align-items:center";
    it.innerHTML = '<span style="width:11px;height:11px;border-radius:50%;background:' +
      data.colgrupos[i] + '"></span>' + g;
    leg.appendChild(it);
  });
  root.appendChild(leg);
  }

  // --- estado ------------------------------------------------------------
  function idx(nom, alt) { var i = vars.indexOf(nom); return i < 0 ? alt : i; }
  var eje = data.axes ? data.axes.slice() : [0, 1, 2];
  if (conSelector) sel.forEach(function (s, k) { s.value = eje[k]; });
  var zoom = 0.55;                     // starts further out, like the board

  // --- álgebra de matrices 3x3 -------------------------------------------
  function mul(A, B) {
    var C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
    for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++)
      C[i][j] = A[i][0] * B[0][j] + A[i][1] * B[1][j] + A[i][2] * B[2][j];
    return C;
  }
  function Rx(t) { var c = Math.cos(t), s = Math.sin(t);
                   return [[1, 0, 0], [0, c, -s], [0, s, c]]; }
  function Ry(t) { var c = Math.cos(t), s = Math.sin(t);
                   return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; }
  function rotInicial(giro, altura) {
    return mul(Rx(altura * Math.PI / 180), Ry(giro * Math.PI / 180));
  }
  var M0 = rotInicial(-35, 22), M = M0;

  // Arma la matriz de la vista con las direcciones escritas por el usuario.
  // Z1 se lleva a norma 1; a Z2 se le quita su parte paralela a Z1 (Gram-Schmidt)
  // y también se normaliza. La tercera fila, el producto vectorial, es la
  // profundidad: no se ve, sólo ordena los puntos.
  function aplicarCoeficientes() {
    var a = campos[0].map(function (c) { return num(c.caja.value); });
    var b = campos[1].map(function (c) { return num(c.caja.value); });

    var na = Math.hypot(a[0], a[1], a[2]);
    if (na < 1e-9) return;                       // todos ceros: no hay dirección
    a = a.map(function (v) { return v / na; });

    var pr = b[0] * a[0] + b[1] * a[1] + b[2] * a[2];
    b = [b[0] - pr * a[0], b[1] - pr * a[1], b[2] - pr * a[2]];
    var nb = Math.hypot(b[0], b[1], b[2]);
    if (nb < 1e-9) {                             // Z2 quedó paralela a Z1:
      var aux = Math.abs(a[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];   // cualquier
      b = [aux[1] * a[2] - aux[2] * a[1],                       // perpendicular
           aux[2] * a[0] - aux[0] * a[2],
           aux[0] * a[1] - aux[1] * a[0]];
      nb = Math.hypot(b[0], b[1], b[2]);
    }
    b = b.map(function (v) { return v / nb; });

    M = [a, b, [a[1] * b[2] - a[2] * b[1],
                a[2] * b[0] - a[0] * b[2],
                a[0] * b[1] - a[1] * b[0]]];
    dibujar();
  }

  function elegir(k, v) {
    var otro = eje.indexOf(v);                  // si ya está en otro eje, se intercambian
    if (otro >= 0 && otro !== k) { eje[otro] = eje[k]; sel[otro].value = eje[otro]; }
    eje[k] = v; sel[k].value = v;
    dibujar();
  }

  // Encuadre: el cubo es sólo el volumen desde el que se mira, no una
  // normalización. Cada variable se centra en el punto medio de su rango y las
  // tres se dividen por UNA SOLA media arista, la del rango más ancho. Así el
  // cubo sale cúbico, pero los datos no se reescalan variable por variable:
  // cada una ocupa sólo la fracción de su arista que le corresponde por su
  // dispersión real, y la nube conserva su forma. Llevar cada variable a [0, 1]
  // la estiraría hasta llenar su arista, igualando dispersiones que no lo son.
  var mrc;
  function encuadrar() {
    var lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (var k = 0; k < N; k++) for (var j = 0; j < 3; j++) {
      var v = pts[k][eje[j]];
      if (v < lo[j]) lo[j] = v;
      if (v > hi[j]) hi[j] = v;
    }
    var c = [0, 0, 0], s = 0;
    for (var j2 = 0; j2 < 3; j2++) {
      c[j2] = (lo[j2] + hi[j2]) / 2;
      s = Math.max(s, (hi[j2] - lo[j2]) / 2);
    }
    s = (s || 0.5) * 1.08;                      // holgura
    mrc = { c: c, s: s };                       // el cubo es [c - s, c + s] en cada eje
  }

  function proyectar(p) {
    var x = (p[0] - mrc.c[0]) / mrc.s,
        y = (p[1] - mrc.c[1]) / mrc.s,
        z = (p[2] - mrc.c[2]) / mrc.s;
    return { u: M[0][0] * x + M[0][1] * y + M[0][2] * z,
             v: M[1][0] * x + M[1][1] * y + M[1][2] * z,
             d: M[2][0] * x + M[2][1] * y + M[2][2] * z };
  }

  // S se elige para que el cubo entre completo en el lienzo sea cual sea la
  // rotación: una esquina puede alejarse hasta sqrt(3) del centro, y el lado
  // corto del lienzo es H/2.
  var S = Math.floor(H / 2 * 0.95 / Math.sqrt(3)), CX = W / 2, CY = H / 2;
  function pantalla(q) { var s = S * zoom; return { x: CX + s * q.u, y: CY - s * q.v, d: q.d }; }

  function f(v) { return (v < 0 ? "" : "+") + fmt(v); }
  function flecha(x1, y1, x2, y2, color) {
    var a  = Math.atan2(y2 - y1, x2 - x1);
    var hl = 9, hw = 4.5;                        // largo y medio-ancho de la cabeza
    var bx = x2 - hl * Math.cos(a);              // base de la cabeza: la línea termina acá
    var by = y2 - hl * Math.sin(a);
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);          // punta exactamente en (x2, y2)
    ctx.lineTo(bx - hw * Math.sin(a), by + hw * Math.cos(a));
    ctx.lineTo(bx + hw * Math.sin(a), by - hw * Math.cos(a));
    ctx.closePath(); ctx.fill();
  }

  function dibujar() {
    ctx.clearRect(0, 0, W, H);
    encuadrar();

    // Todo --- puntos, aristas del cubo y ejes rotulados --- se dibuja en una
    // sola pasada ordenada por profundidad. Si las líneas se pintaran antes o
    // después en bloque, quedarían siempre detrás o siempre delante de la nube,
    // sin importar dónde están en el espacio. Para que cada tramo caiga donde
    // corresponde, las líneas se parten en trozos cortos y cada trozo entra en
    // la lista con su propia profundidad.
    var cosas = [];

    var esq = function (i) {
      return [mrc.c[0] + ((i & 1)        ? mrc.s : -mrc.s),
              mrc.c[1] + (((i >> 1) & 1) ? mrc.s : -mrc.s),
              mrc.c[2] + (((i >> 2) & 1) ? mrc.s : -mrc.s)];
    };

    var punto = function (q, col) {
      return function () {
        var r = (4.6 + 1.7 * q.d) * Math.sqrt(Math.min(zoom, 3));
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 2 * Math.PI);
        ctx.fillStyle = col; ctx.fill();
        ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(20,30,40,0.55)"; ctx.stroke();
        ctx.beginPath(); ctx.arc(q.x - r * 0.3, q.y - r * 0.3, r * 0.28, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.fill();
      };
    };
    var trozo = function (qa, qb, color, ancho) {
      return function () {
        ctx.strokeStyle = color; ctx.lineWidth = ancho; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(qa.x, qa.y); ctx.lineTo(qb.x, qb.y); ctx.stroke();
      };
    };
    // Parte un segmento del espacio en trozos y los agrega a la lista.
    var TROZOS = 32;
    var linea3d = function (p, q, color, ancho) {
      var qa = pantalla(proyectar(p));
      for (var t = 1; t <= TROZOS; t++) {
        var f = t / TROZOS;
        var qb = pantalla(proyectar([p[0] + (q[0] - p[0]) * f,
                                     p[1] + (q[1] - p[1]) * f,
                                     p[2] + (q[2] - p[2]) * f]));
        cosas.push({ d: (qa.d + qb.d) / 2, pintar: trozo(qa, qb, color, ancho) });
        qa = qb;
      }
      return qa;                                  // extremo, para el rótulo
    };

    for (var k = 0; k < N; k++) {
      var q = pantalla(proyectar([pts[k][eje[0]], pts[k][eje[1]], pts[k][eje[2]]]));
      cosas.push({ d: q.d, pintar: punto(q, cols[k]) });
    }

    // Las 12 aristas del cubo: pares de esquinas que difieren en un solo bit.
    for (var a = 0; a < 8; a++) for (var b = a + 1; b < 8; b++) {
      var dif = a ^ b;
      if (dif === 1 || dif === 2 || dif === 4) linea3d(esq(a), esq(b), "#d3dae1", 1);
    }

    // Los tres ejes rotulados salen de la esquina de valores mínimos hacia el
    // extremo opuesto de cada uno.
    var rotulos = [];
    [0, 1, 2].forEach(function (j) {
      var org = [mrc.c[0] - mrc.s, mrc.c[1] - mrc.s, mrc.c[2] - mrc.s];
      var ext = org.slice();
      ext[j] = mrc.c[j] + mrc.s;
      var fin = linea3d(org, ext, EJE, 1.6);
      rotulos.push({ p0: pantalla(proyectar(org)), p1: fin, txt: vars[eje[j]] });
    });

    cosas.sort(function (p, q) { return p.d - q.d; });
    cosas.forEach(function (c) { c.pintar(); });

    // Los rótulos van al final: son referencia y conviene que se lean siempre.
    ctx.font = "600 13px ui-monospace,Menlo,monospace"; ctx.fillStyle = EJE;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    rotulos.forEach(function (r) {
      var tx = r.p1.x + (r.p1.x - r.p0.x) * 0.16, ty = r.p1.y + (r.p1.y - r.p0.y) * 0.16;
      tx = Math.max(24, Math.min(W - 24, tx)); ty = Math.max(14, Math.min(H - 14, ty));
      ctx.fillText(r.txt, tx, ty);
    });

    // Ejes de la pantalla y coeficientes en vivo (Z1 horizontal, Z2 vertical).
    if (conLectura) {
      /* same corner labels as the board, so both views read alike */
      ctx.save();
      ctx.font = "700 15px " + F_SANS;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillStyle = C_MUDO;
      ctx.fillText("\u2191 Z\u2082", 18, H - 46);
      ctx.fillText("Z\u2081 \u2192", 18, H - 24);
      ctx.restore();
      // Se refleja la vista en los campos, salvo en el que se está escribiendo:
      // pisarlo mientras el usuario tipea le borraría lo que está entrando.
      for (var r = 0; r < 2; r++) for (var j = 0; j < 3; j++) {
        campos[r][j].nom.innerHTML = "&middot;" + varsL[eje[j]];
        if (document.activeElement !== campos[r][j].caja) {
          campos[r][j].caja.value = fmt(M[r][j]);
          campos[r][j].caja.aplicado = campos[r][j].caja.value;
        }
      }
    }
  }

  // --- rotación (trackball), zoom y reinicio -----------------------------
  var arrastrando = false, px = 0, py = 0;
  function baja(e) { arrastrando = true; canvas.style.cursor = "grabbing";
                     px = e.clientX; py = e.clientY; e.preventDefault(); }
  function mueve(e) {
    if (!arrastrando) return;
    var dx = (e.clientX - px) * 0.01, dy = (e.clientY - py) * 0.01;
    M = mul(mul(Rx(dy), Ry(dx)), M);            // giro en los ejes de la pantalla
    px = e.clientX; py = e.clientY; dibujar();
  }
  function sube() { arrastrando = false; canvas.style.cursor = "grab"; }
  function fijarZoom(z) { zoom = Math.max(0.25, Math.min(24, z)); dibujar(); }
  canvas.addEventListener("mousedown", baja);
  window.addEventListener("mousemove", mueve);
  window.addEventListener("mouseup", sube);

  canvas.addEventListener("wheel", function (e) {
    e.preventDefault(); fijarZoom(zoom * Math.exp(-e.deltaY * 0.0015));
  }, { passive: false });
  canvas.addEventListener("dblclick", function () { M = M0; zoom = 0.55; dibujar(); });

  function separacion(t) { return Math.hypot(t[0].clientX - t[1].clientX,
                                             t[0].clientY - t[1].clientY); }
  var pellizco = 0;
  canvas.addEventListener("touchstart", function (e) {
    if (e.touches.length === 2) pellizco = separacion(e.touches);
    else baja(e.touches[0]);
  }, { passive: false });
  canvas.addEventListener("touchmove", function (e) {
    if (e.touches.length === 2) {
      var d = separacion(e.touches);
      if (pellizco > 0) fijarZoom(zoom * d / pellizco);
      pellizco = d; e.preventDefault();
    } else if (arrastrando) { mueve(e.touches[0]); e.preventDefault(); }
  }, { passive: false });
  canvas.addEventListener("touchend", function () { pellizco = 0; sube(); });

  dibujar();

  // API mínima para la app: fijar Z1 y Z2 desde afuera.
  return {
    ponerZ: function (a, b) {
      if (!conLectura) return;
      for (var j = 0; j < 3; j++) {
        campos[0][j].caja.value = fmt(a[j]);
        campos[1][j].caja.value = fmt(b[j]);
      }
      aplicarCoeficientes();
    },
  };
}

export default scatter3d;
