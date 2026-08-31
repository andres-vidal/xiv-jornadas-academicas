## Todas las piezas del póster, ahora sobre cangrejos.
suppressMessages({library(dplyr); library(ggplot2); library(ppforest2); library(patchwork)})
source("R/10-datos.R"); set.seed(2026)
data(crabs)
k <- data.frame(largo = crabs$CL, ancho = crabs$CW,
                clase = factor(crabs$Type, c("B","O"), c("Especie azul","Especie naranja")))
k <- k[sample(nrow(k)), ]
COLK <- c(`Especie azul` = JJAA[["azul"]], `Especie naranja` = JJAA[["naranja"]])

## ---- curva del índice de proyección, en el espacio original ----
M <- as.matrix(k[, c("largo","ancho")]); y <- k$clase
W <- Reduce(`+`, lapply(levels(y), function(g){ Z <- scale(M[y==g,,drop=FALSE], scale=FALSE); t(Z)%*%Z }))
Tm <- { Z <- scale(M, scale=FALSE); t(Z)%*%Z }
indice <- function(th){ u <- c(cos(th), sin(th)); 1 - as.numeric(t(u)%*%W%*%u)/as.numeric(t(u)%*%Tm%*%u) }
th <- seq(0, pi, length.out=721); I <- sapply(th, indice); opt <- th[which.max(I)]
cat(sprintf("óptimo: %.1f°  I = %.3f\n", opt*180/pi, max(I)))
curva <- function(base, ancho_in, alto_in, archivo, ptsize, txt) {
  p <- ggplot(data.frame(grados=th*180/pi, I=I), aes(grados, I)) +
    geom_line(linewidth=1.5, colour="grey30") +
    geom_point(data=data.frame(grados=opt*180/pi, I=max(I)), size=ptsize, colour=JJAA[["naranja"]]) +
    annotate("text", x=opt*180/pi+7, y=max(I), hjust=0, vjust=.35, size=txt,
             label=sprintf("%d°  ·  I = %.2f", round(opt*180/pi), max(I))) +
    labs(x="Ángulo de la dirección (grados)", y="Índice de proyección") +
    coord_cartesian(xlim=c(0,196)) + scale_x_continuous(breaks=seq(0,180,45)) +
    tema(base) + theme(plot.margin=margin(4,4,2,2))
  ggsave(archivo, p, width=ancho_in, height=alto_in, dpi=300, bg="white", type="cairo")
}
curva(20, 8.6, 5.1, "img/K3-curva-indice.png", 9, 7.4)   # póster
curva(21, 8.5, 5.0, "img/S3-curva-indice.png", 6, 6.5)   # app

## ---- árbol de búsqueda de proyecciones sobre las cuatro formas de cangrejo ----
data(crab)
cb <- crab; cb$Type <- factor(cb$Type); cb <- cb[sample(nrow(cb)), ]
names(cb)[names(cb)=="FL"] <- "Frente"; names(cb)[names(cb)=="RW"] <- "Rostro"
names(cb)[names(cb)=="CL"] <- "Largo";   names(cb)[names(cb)=="CW"] <- "Ancho"
names(cb)[names(cb)=="BD"] <- "Alto"
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
vars <- setdiff(names(cb), "Type")
## el ancho de hoja por defecto (0,5) no alcanza para "Naranja hembra"
options(ppforest2.leaf_w = 0.74, ppforest2.node_w = 0.86)
ft <- pptr(Type ~ ., cb, lambda = 0, stop = stop_max_depth(2))   # sin penalizar, como el índice del informe
internos <- function(nd) if (is.null(nd$projector)) list() else c(list(nd), internos(nd$lower), internos(nd$upper))
nodos <- internos(ft$root)
etiqueta <- function(nd, kk = 2) {
  a <- nd$projector; s <- max(abs(a)); a <- a/s
  o <- order(-abs(a))[seq_len(min(kk, length(a)))]
  tr <- vapply(seq_along(o), function(i){ j <- o[i]; v <- a[j]
    sg <- if (i==1) (if (v<0) "−" else "") else (if (v<0) " − " else " + ")
    paste0(sg, format(round(abs(v),2), nsmall=2, decimal.mark=","), "·", vars[j]) }, character(1))
  list(formula = paste0(paste(tr, collapse=""), " + …"), corte = nd$cutpoint/s)
}
et <- lapply(nodos, etiqueta)
arbol <- plot(ft)[[1]]
arbol$layers[[9]]$data$label <- vapply(et, `[[`, character(1), "formula")
cortes <- vapply(et, `[[`, numeric(1), "corte")
fc <- function(x) format(round(x,2), nsmall=2, decimal.mark=",")
## Cada arista trae del C++ el corte crudo ya formateado. La emparejamos con su
## nodo comparando ese valor, así el reetiquetado no depende de la forma del árbol.
crudos <- vapply(nodos, function(nd) nd$cutpoint, numeric(1))
escalas <- vapply(nodos, function(nd) max(abs(nd$projector)), numeric(1))
orig <- arbol$layers[[2]]$data$label
arbol$layers[[2]]$data$label <- vapply(orig, function(l) {
  v <- suppressWarnings(as.numeric(sub('^[^0-9.-]+', '', l)))
  i <- which.min(abs(round(crudos, 2) - v))
  op <- if (startsWith(l, '<')) '< ' else '≥ '
  paste0(op, fc(crudos[i] / escalas[i]))
}, character(1))
arbol$layers[[6]]$data$label <- ""
arbol$layers[[9]]$aes_params$size <- 5.0
arbol$layers[[2]]$aes_params$size <- 5.2
arbol$layers[[8]]$aes_params$size <- 5.4
CU <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
        `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])
arbol <- arbol + scale_fill_manual(values=CU) + scale_colour_manual(values=CU) + labs(title=NULL) +
  theme(legend.position="none",   # la leyenda ya está en la figura principal
        text=element_text(family=FUENTE, size=18),
        plot.margin=margin(2,2,2,2))
ggsave("img/K5-arbol-cangrejos.png", arbol, width=8.6, height=4.6, dpi=300, bg="white", type="cairo")

cat("fórmulas del árbol:\n"); for (e in et) cat("  ", e$formula, " corte:", fc(e$corte), "\n")
