# ¿Y si miramos por otro lado?

Póster y app interactiva para *ppforest2: clasificación con árboles y bosques aleatorios
basados en búsqueda de proyecciones*. XIV Jornadas Académicas, FCEA · Udelar,
setiembre de 2026.

Andrés Vidal Berriel · Licenciatura en Estadística · Referente: Natalia da Silva.

## La app

<https://andres-vidal.github.io/xiv-jornadas-academicas/>

Es la dirección a la que lleva el QR del póster. Tiene dos vistas: en **Armar el árbol** se
gira la dirección de proyección y se corta la nube donde uno quiera, y en **Explorar la nube**
se rotan los mismos datos en tres dimensiones. Los ajustes viajan en la query string
(`?datos=penguins&cortes=gen&plano=2,3&regla=margen`), así que un enlace reabre exactamente lo mismo.

```bash
cd app-react
npm install
npm run dev          # servidor de desarrollo
npm run build        # dist/index.html, autocontenido
```

Cada push a `main` la vuelve a publicar con `.github/workflows/pages.yml`.

### Cómo está armado

```
App.jsx           el cabezal, las dos vistas y los dos diálogos
useConfig.js      los ajustes, que viven en la query string
useGame.js        la partida: el árbol, el nodo elegido, deshacer
useViewport.js    cuándo hay lugar para tarjetas al costado del canvas

GameView.jsx      arma la vista del árbol con las piezas de abajo
  Board.jsx         el canvas 2D, con arrastre y zoom
  draw.js           todo el dibujo del tablero
  TreePanel.jsx     el árbol chiquito que se agranda
  Tree.jsx            el SVG del árbol, con un histograma por nodo
  ActionBar.jsx     el ángulo y los cinco botones
  Readouts.jsx      índice del nodo y aciertos del árbol
  Legend.jsx        qué color es cada grupo

CloudView.jsx     arma la vista del cubo
  Widget3D.jsx      monta el widget
  scatter3d.js      el widget, tal como viene del informe
  CloudPanel.jsx    datos, ejes y leyenda

SettingsPanel.jsx  datos, plano, modo de corte y regla
HelpDialog.jsx     de qué se trata, y el póster en PDF
WorkPanel.jsx      quién firma y los enlaces
DataSource.jsx     la cita del conjunto de datos

tree-logic.js     el algoritmo: índice, dirección, corte y árbol
data.js           los tres conjuntos de datos, generados por R
ui.jsx            tarjeta, rótulo, menú, botón de ícono, plegado
icons.jsx         los íconos
```

## Qué hay acá

| | |
|---|---|
| `poster-JJAA.pptx` | el póster, 840 × 1190 mm |
| `poster-JJAA.pdf`  | el mismo póster exportado |
| `app-react/`       | la app: React, Tailwind y react-router sobre Vite |
| `R/`               | los scripts que producen los números y las figuras |
| `assets/`          | las figuras que van en el póster, y el QR |