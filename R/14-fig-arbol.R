suppressMessages({library(dplyr); library(ggplot2); library(ppforest2); library(patchwork)})
source("R/10-datos.R"); set.seed(2026)
# UCI 697 (Realinho et al. 2021). No se versiona: bajarlo a datos/uci697.csv
# o apuntar la variable de entorno UCI697 al archivo.
RUTA <- Sys.getenv("UCI697", "datos/uci697.csv")
d <- read.csv(RUTA, sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM"); names(d) <- trimws(names(d))
b <- data.frame(
  Inscriptas  = d[["Curricular units 1st sem (enrolled)"]],
  Aprobadas   = d[["Curricular units 1st sem (approved)"]],
  Inscriptas2 = d[["Curricular units 2nd sem (enrolled)"]],
  Aprobadas2  = d[["Curricular units 2nd sem (approved)"]],
  Nota2       = d[["Curricular units 2nd sem (grade)"]],
  clase = factor(d$Target, c("Dropout","Enrolled","Graduate"),
                           c("Abandona","Sigue cursando","Egresa")))
vars <- setdiff(names(b), "clase")
ft <- pptr(clase ~ ., b, lambda = .1, stop = stop_max_depth(2))

## Nodos internos, en el orden en que los dibuja el paquete (raíz primero)
internos <- function(nd) {
  if (is.null(nd$projector)) return(list())
  c(list(nd), internos(nd$lower), internos(nd$upper))
}
nodos <- internos(ft$root)

## El paquete formatea los coeficientes con dos decimales; como acá son del orden
## de 0,006 se imprimen todos como ".00". Los reescalamos (la escala de una
## dirección de proyección es arbitraria) para que la fórmula se pueda leer.
etiqueta <- function(nd, k = 2) {   # dos términos: con tres, la fórmula no entra en la columna
  a <- nd$projector; s <- max(abs(a)); a <- a / s
  o <- order(-abs(a))[seq_len(min(k, length(a)))]
  trozos <- vapply(seq_along(o), function(i) {
    j <- o[i]; v <- a[j]
    signo <- if (i == 1) (if (v < 0) "−" else "") else (if (v < 0) " − " else " + ")
    mag <- format(round(abs(v), 2), nsmall = 2, decimal.mark = ",")
    paste0(signo, mag, "·", vars[j])
  }, character(1))
  list(formula = paste0(paste(trozos, collapse = ""), " + …"),
       corte   = nd$cutpoint / s)
}
et <- lapply(nodos, etiqueta)

arbol <- plot(ft)[[1]]
## capa 9: fórmulas de cada nodo · capa 2: umbrales de cada rama
arbol$layers[[9]]$data$label <- vapply(et, `[[`, character(1), "formula")
cortes <- vapply(et, `[[`, numeric(1), "corte")
fc <- function(x) format(round(x, 2), nsmall = 2, decimal.mark = ",")
## el paquete ordena las ramas del nodo profundo primero (filas 1-2) y la raíz después (3-4)
arbol$layers[[2]]$data$label <- c(paste("<", fc(cortes[2])), paste("≥", fc(cortes[2])),
                                  paste("<", fc(cortes[1])), paste("≥", fc(cortes[1])))
arbol$layers[[6]]$data$label <- ""   # los extremos del eje no aportan nada acá

## El paquete fija estos tamaños en valores absolutos que el tema no alcanza;
## para A0 hay que subirlos o las fórmulas quedan ilegibles impresas.
arbol$layers[[9]]$aes_params$size <- 6.8   # fórmulas de cada nodo
arbol$layers[[2]]$aes_params$size <- 6.4   # umbrales de cada rama
arbol$layers[[8]]$aes_params$size <- 6.6   # etiquetas de las hojas

COLS <- c(Abandona = JJAA[["naranja"]], `Sigue cursando` = JJAA[["celeste"]], Egresa = JJAA[["azul"]])
arbol <- arbol +
  scale_fill_manual(values = COLS) + scale_colour_manual(values = COLS) +
  labs(title = NULL) +
  theme(legend.position = "top", legend.title = element_blank(),
        text = element_text(family = FUENTE, size = 18),
        legend.text = element_text(size = 18),
        plot.margin = margin(2, 2, 2, 2))
ggsave("img/S5-arbol-estudiantes.png", arbol, width = 11, height = 7.2, dpi = 240,
       bg = "white", type = "cairo")
cat("fórmulas:\n"); for (e in et) cat("  ", e$formula, "  corte:", fc(e$corte), "\n")

## recorte del blanco sobrante a la derecha y abajo
system("sips -c 1500 2400 --cropOffset 0 0 img/S5-arbol-estudiantes.png --out img/S5-arbol-estudiantes.png >/dev/null 2>&1")
