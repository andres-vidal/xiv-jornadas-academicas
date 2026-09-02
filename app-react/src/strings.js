/* Everything that changes with the language: the text the interface shows and the
   two number conventions that go with it.

   Spanish is the original. The app accompanies a poster written in Spanish and
   shown at a Spanish-speaking event, so that is the default; English is here so the
   link can travel on its own.

   No i18n library. Both dictionaries have the same shape, so a missing key shows up
   as "undefined" on screen the first time the page is opened, which is enough of a
   check for eighty strings. Two marks are allowed inside a string: *bold* and
   {name} for a value filled in at render time. ui.jsx has `rich`, which turns them
   into what React draws. */
export const LANGS = ["es", "en"];

export const STRINGS = {
  es: {
    /* the two lines that name the app in the browser and in the header */
    documentTitle: "¿Y si miramos por otro lado?",
    title: "¿Y si miramos por otro lado?",

    header: {
      views: "Qué se muestra",
      game: "Armar el árbol",
      cloud: "Explorar la nube",
      work: "El trabajo",
      help: "De qué se trata",
      settings: "Ajustes",
      /* the button shows the other language and says where it takes you */
      otherLang: "EN",
      toOtherLang: "Ver en inglés",
    },

    ui: {
      close: "Cerrar",
      fold: "Plegar",
    },

    work: {
      title: "El trabajo",
      show: "Ver el trabajo y los enlaces",
      heading: "Búsqueda de proyecciones para revelar estructuras de grupos en datos multivariados",
      author: "Andrés Vidal Berriel · Licenciatura en Estadística",
      advisor: "Referente: Natalia da Silva · IESTA, FCEA — Udelar",
      links: {
        report: { title: "Búsqueda de proyecciones", note: "El material completo" },
        package: { title: "ppforest2", note: "El paquete" },
        event: { title: "XIV Jornadas Académicas", note: "FCEA — Udelar" },
        author: { title: "El autor", note: "andresvidal.dev" },
      },
    },

    help: {
      title: "De qué se trata",
      what: "*ppforest2* es un paquete de R para clasificación con árboles y bosques " +
            "aleatorios basados en búsqueda de proyecciones. Esta página permite explorar " +
            "la parte central del método.",
      why: "Un árbol clásico parte los datos por una variable a la vez. ppforest2 busca " +
           "primero la proyección unidimensional que mejor separa los grupos, una " +
           "combinación lineal de todas las variables, y sólo entonces corta. Eso importa " +
           "cuando la diferencia entre los grupos está repartida en varias medidas y " +
           "ninguna alcanza por sí sola.",
      gameTitle: "Armar el árbol",
      game: "La barra controla la dirección y debajo aparece la sombra, que son los datos " +
            "proyectados sobre ella. El corte se hace cuando los grupos quedan separados " +
            "en esa sombra. Cada corte parte un nodo en dos y el árbol crece.",
      buttons: {
        cut: "Cortar en el ángulo elegido",
        undo: "Deshacer el último corte",
        auto: "Dejar que el algoritmo lo arme solo",
        finish: "Dar el árbol por terminado, en corte libre",
        reset: "Empezar de nuevo",
      },
      settings: "En *Ajustes* se cambian los datos y el plano, y las dos decisiones del " +
                "algoritmo: si un grupo puede quedar repartido entre las dos ramas, y qué " +
                "regla fija dónde cae el corte.",
      cloudTitle: "Explorar la nube",
      cloud: "El mismo conjunto, ahora en tres dimensiones. Se rota arrastrando y se acerca " +
             "con la rueda o con dos dedos. La barra de abajo indica qué combinación lineal " +
             "define cada eje del cubo.",
      cloudRobot: "Girar el cubo hasta la mejor proyección, la que usa el árbol",
      cloudCard: "La tarjeta *La nube* elige los datos y qué medida va en cada eje.",
      address: "Todo lo que se elige viaja en la dirección de la página, así que el enlace " +
               "vuelve a abrir exactamente lo mismo.",
      poster: "El póster",
      posterNote: "en PDF",
    },

    settings: {
      title: "Ajustes",
      defaults: "Valores por defecto",
      toDefaults: "Volver a los valores por defecto",
      dataLabel: "datos",
      data: "Datos",
      planeLabel: "plano",
      plane: "Plano",
      bestPlane: "La mejor proyección",
      twoVars: "Dos variables",
      xAxis: "Eje horizontal",
      yAxis: "Eje vertical",
      cutsLabel: "cortes",
      cuts: "Cortes",
      likePackage: "Como ppforest2",
      freeCut: "Corte libre",
      notePackage: "Cada grupo va entero a un lado, así que el árbol frena solo a los " +
                   "*{n} cortes*.",
      noteFree: "Un grupo puede quedar repartido entre las dos ramas; cada hoja vota por " +
                "mayoría y se puede seguir cortando hasta dar el árbol por terminado.",
      ruleLabel: "regla",
      rule: "Regla del corte",
    },

    /* where the threshold falls once the groups are split into two blocks */
    rules: {
      medias: {
        name: "Media de las medias",
        why: "El punto medio entre las medias de los dos bloques. Es la que implementa ppforest2.",
      },
      dispersion: {
        name: "Ponderada por dispersión",
        why: "El corte se desplaza hacia el bloque más compacto, que necesita menos espacio.",
      },
      medianas: {
        name: "Media de las medianas",
        why: "Como la primera pero con medianas, así unos pocos casos extremos no arrastran el corte.",
      },
      margen: {
        name: "En el medio del hueco",
        why: "Entre el último punto de un bloque y el primero del otro. Deja el mayor margen " +
             "cuando los bloques no se pisan.",
      },
      aciertos: {
        name: "Máximos aciertos",
        why: "Prueba todos los umbrales y conserva el que deja más puntos del lado que les corresponde.",
      },
    },

    actions: {
      angle: "Ángulo de la dirección, en grados",
      pickNode: "Elegir un nodo",
      closedNode: "Nodo cerrado",
      cutTip: "Cortar · {right} de {total} correctos",
      cut: "Cortar en esta dirección",
      undoTip: "Deshacer",
      undo: "Deshacer el último corte",
      autoPackage: "Automático con ppforest2",
      autoFree: "Automático, a corte libre",
      auto: "Armar el árbol automáticamente",
      finishTip: "Terminar el árbol",
      finish: "Dar el árbol por terminado",
      resetTip: "Reiniciar",
      reset: "Reiniciar el árbol",
      index: "índice",
    },

    readouts: {
      index: "índice del nodo",
      accuracy: "aciertos del árbol",
    },

    tree: {
      /* "el árbol · 2 cortes · 87,5 % de aciertos" */
      title: "el árbol",
      oneCut: "1 corte",
      manyCuts: "{n} cortes",
      accuracy: "{p} de aciertos",
      show: "Ver el árbol",
      fold: "Plegar el árbol",
      shrink: "Achicar el árbol",
      empty: "Todavía sin cortes. Elegir una dirección y cortar.",
      root: "la raíz",
      oneSide: "de un lado",
      otherSide: "del otro",
      pure: "{n} · puro",
      share: "{n} de {total}",
      diagram: "Estructura del árbol: cada nodo partido se muestra como un histograma de los " +
               "datos proyectados, con la combinación lineal que los proyecta y el umbral " +
               "donde se corta.",
    },

    cloud: {
      title: "La nube",
      show: "Ver datos, ejes y leyenda",
      bestPlane: "Usar la mejor proyección",
      axes: ["eje x", "eje y", "eje z"],
      summary: "{n} individuos · {groups} grupos · {vars} medidas.",
    },

    /* what each dataset is and why its variables move together, written by hand:
       this is context about the data, not something to compute from it */
    data: {
      crabs: {
        name: "Cangrejos",
        groups: ["Azul macho", "Azul hembra", "Naranja macho", "Naranja hembra"],
        vars: ["Frente", "Rostro", "Largo", "Ancho", "Alto"],
        citation: "Campbell, N. A. y Mahon, R. J. (1974). A multivariate study of variation in " +
                  "two species of rock crab of genus Leptograpsus. Australian Journal of " +
                  "Zoology, 22, 417–425.",
        measures: "Cinco medidas del caparazón, en milímetros: frente, rostro, largo, ancho y alto.",
        why: "Todas miden el mismo animal, así que crecen juntas: un cangrejo más grande lo es " +
             "en todas sus dimensiones. Por eso están casi perfectamente correlacionadas y la " +
             "nube se estira sobre el tamaño. Las proporciones entre esas medidas son las que " +
             "distinguen especie y sexo.",
      },
      flowers: {
        name: "Flores",
        groups: ["Setosa", "Versicolor", "Virginica"],
        vars: ["Largo sépalo", "Ancho sépalo", "Largo pétalo", "Ancho pétalo"],
        citation: "Anderson, E. (1935). The irises of the Gaspé Peninsula. Bulletin of the " +
                  "American Iris Society, 59, 2–5. Popularizado por Fisher, R. A. (1936), " +
                  "Annals of Eugenics, 7, 179–188.",
        measures: "Largo y ancho del sépalo y del pétalo, en centímetros.",
        why: "Largo y ancho del pétalo crecen juntos, y son los que más distinguen a las tres " +
             "especies. Los sépalos varían bastante menos entre ellas.",
      },
      penguins: {
        name: "Pingüinos",
        groups: ["Adelia", "Barbijo", "Papúa"],
        vars: ["Largo pico", "Alto pico", "Largo aleta", "Masa"],
        citation: "Horst, A. M., Hill, A. P. y Gorman, K. B. (2020). palmerpenguins: Palmer " +
                  "Archipelago (Antarctica) penguin data. Datos de Gorman, K. B., Williams, " +
                  "T. D. y Fraser, W. R. (2014), PLoS ONE 9(3).",
        measures: "Largo y alto del pico y largo de la aleta, en milímetros; masa corporal en gramos.",
        why: "La aleta y la masa crecen con el tamaño del animal, así que van juntas. El pico " +
             "aporta algo distinto: su forma, la relación entre largo y alto, separa especies " +
             "de tamaño parecido.",
      },
    },
  },

  en: {
    documentTitle: "What if we looked from another angle?",
    title: "What if we looked from another angle?",

    header: {
      views: "What is shown",
      game: "Build the tree",
      cloud: "Explore the cloud",
      work: "The work",
      help: "What this is about",
      settings: "Settings",
      otherLang: "ES",
      toOtherLang: "View in Spanish",
    },

    ui: {
      close: "Close",
      fold: "Collapse",
    },

    work: {
      title: "The work",
      show: "Show the work and the links",
      heading: "Projection pursuit for revealing group structure in multivariate data",
      author: "Andrés Vidal Berriel · BSc in Statistics",
      advisor: "Advisor: Natalia da Silva · IESTA, FCEA — Udelar",
      links: {
        report: { title: "Projection pursuit", note: "The full write-up" },
        package: { title: "ppforest2", note: "The package" },
        event: { title: "XIV Jornadas Académicas", note: "FCEA — Udelar" },
        author: { title: "The author", note: "andresvidal.dev" },
      },
    },

    help: {
      title: "What this is about",
      what: "*ppforest2* is an R package for classification with trees and random forests " +
            "based on projection pursuit. This page explores the core of the method.",
      why: "A classical tree splits the data one variable at a time. ppforest2 first looks " +
           "for the one-dimensional projection that best separates the groups, a linear " +
           "combination of every variable, and only then cuts. That matters when the " +
           "difference between the groups is spread across several measurements and none " +
           "of them is enough on its own.",
      gameTitle: "Build the tree",
      game: "The slider controls the direction, and the shadow below it is the data projected " +
            "onto that direction. The cut is made once the groups are separated in that " +
            "shadow. Each cut splits a node in two and the tree grows.",
      buttons: {
        cut: "Cut at the chosen angle",
        undo: "Undo the last cut",
        auto: "Let the algorithm build it on its own",
        finish: "Call the tree finished, in free-cut mode",
        reset: "Start over",
      },
      settings: "*Settings* changes the data and the plane, along with the two decisions the " +
                "algorithm makes: whether a group may be split across both branches, and " +
                "which rule fixes where the cut falls.",
      cloudTitle: "Explore the cloud",
      cloud: "The same dataset, now in three dimensions. Drag to rotate, and zoom with the " +
             "wheel or with two fingers. The bar at the bottom gives the linear combination " +
             "that defines each axis of the cube.",
      cloudRobot: "Turn the cube to the best projection, the one the tree uses",
      cloudCard: "*The cloud* card picks the data and which measurement goes on each axis.",
      address: "Everything chosen travels in the page address, so the link reopens exactly " +
               "the same thing.",
      poster: "The poster",
      posterNote: "as PDF",
    },

    settings: {
      title: "Settings",
      defaults: "Default values",
      toDefaults: "Back to the default values",
      dataLabel: "data",
      data: "Data",
      planeLabel: "plane",
      plane: "Plane",
      bestPlane: "The best projection",
      twoVars: "Two variables",
      xAxis: "Horizontal axis",
      yAxis: "Vertical axis",
      cutsLabel: "cuts",
      cuts: "Cuts",
      likePackage: "Like ppforest2",
      freeCut: "Free cut",
      notePackage: "Each group goes whole to one side, so the tree stops on its own at " +
                   "*{n} cuts*.",
      noteFree: "A group may be split across both branches; each leaf votes by majority and " +
                "cutting can go on until the tree is called finished.",
      ruleLabel: "rule",
      rule: "Cut rule",
    },

    rules: {
      medias: {
        name: "Mean of the means",
        why: "The midpoint between the means of the two blocks. This is the one ppforest2 implements.",
      },
      dispersion: {
        name: "Weighted by spread",
        why: "The cut moves towards the more compact block, which needs less room.",
      },
      medianas: {
        name: "Mean of the medians",
        why: "Like the first one but with medians, so a few extreme cases do not drag the cut.",
      },
      margen: {
        name: "In the middle of the gap",
        why: "Between the last point of one block and the first of the other. It leaves the " +
             "widest margin when the blocks do not overlap.",
      },
      aciertos: {
        name: "Most correct",
        why: "Tries every threshold and keeps the one that leaves the most points on the side " +
             "where they belong.",
      },
    },

    actions: {
      angle: "Direction angle, in degrees",
      pickNode: "Pick a node",
      closedNode: "Closed node",
      cutTip: "Cut · {right} of {total} correct",
      cut: "Cut in this direction",
      undoTip: "Undo",
      undo: "Undo the last cut",
      autoPackage: "Automatic, with ppforest2",
      autoFree: "Automatic, free cut",
      auto: "Build the tree automatically",
      finishTip: "Finish the tree",
      finish: "Call the tree finished",
      resetTip: "Reset",
      reset: "Reset the tree",
      index: "index",
    },

    readouts: {
      index: "node index",
      accuracy: "tree accuracy",
    },

    tree: {
      title: "the tree",
      oneCut: "1 cut",
      manyCuts: "{n} cuts",
      accuracy: "{p} correct",
      show: "Show the tree",
      fold: "Collapse the tree",
      shrink: "Shrink the tree",
      empty: "No cuts yet. Choose a direction and cut.",
      root: "the root",
      oneSide: "one side",
      otherSide: "the other side",
      pure: "{n} · pure",
      share: "{n} of {total}",
      diagram: "Tree structure: each split node is shown as a histogram of the projected data, " +
               "with the linear combination that projects it and the threshold where it is cut.",
    },

    cloud: {
      title: "The cloud",
      show: "Show data, axes and legend",
      bestPlane: "Use the best projection",
      axes: ["x axis", "y axis", "z axis"],
      summary: "{n} individuals · {groups} groups · {vars} measurements.",
    },

    data: {
      crabs: {
        name: "Crabs",
        groups: ["Blue male", "Blue female", "Orange male", "Orange female"],
        vars: ["Frontal lobe", "Rear width", "Length", "Width", "Depth"],
        citation: "Campbell, N. A. and Mahon, R. J. (1974). A multivariate study of variation " +
                  "in two species of rock crab of genus Leptograpsus. Australian Journal of " +
                  "Zoology, 22, 417–425.",
        measures: "Five measurements of the carapace, in millimetres: frontal lobe, rear " +
                  "width, length, width and depth.",
        why: "They all measure the same animal, so they grow together: a bigger crab is bigger " +
             "in every dimension. That makes them almost perfectly correlated and stretches " +
             "the cloud along size. What tells species and sex apart are the proportions " +
             "between those measurements.",
      },
      flowers: {
        name: "Flowers",
        groups: ["Setosa", "Versicolor", "Virginica"],
        vars: ["Sepal length", "Sepal width", "Petal length", "Petal width"],
        citation: "Anderson, E. (1935). The irises of the Gaspé Peninsula. Bulletin of the " +
                  "American Iris Society, 59, 2–5. Popularised by Fisher, R. A. (1936), " +
                  "Annals of Eugenics, 7, 179–188.",
        measures: "Length and width of the sepal and of the petal, in centimetres.",
        why: "Petal length and width grow together, and they are what tells the three species " +
             "apart best. The sepals vary considerably less between them.",
      },
      penguins: {
        name: "Penguins",
        groups: ["Adélie", "Chinstrap", "Gentoo"],
        vars: ["Bill length", "Bill depth", "Flipper length", "Body mass"],
        citation: "Horst, A. M., Hill, A. P. and Gorman, K. B. (2020). palmerpenguins: Palmer " +
                  "Archipelago (Antarctica) penguin data. Data from Gorman, K. B., Williams, " +
                  "T. D. and Fraser, W. R. (2014), PLoS ONE 9(3).",
        measures: "Bill length and depth and flipper length, in millimetres; body mass in grams.",
        why: "The flipper and the mass grow with the size of the animal, so they go together. " +
             "The bill contributes something else: its shape, the relation between length and " +
             "depth, separates species of similar size.",
      },
    },
  },
};

/* Numbers follow the language too: Spanish writes 0,42 and 90,8 %, English 0.42
   and 90.8%. Everything that prints a number goes through these two. */
export function decimal(lang, x, digits = 2) {
  const s = x.toFixed(digits);
  return lang === "es" ? s.replace(".", ",") : s;
}

export function percent(lang, x) {
  return decimal(lang, x * 100, 1) + (lang === "es" ? " %" : "%");
}
