## Assets sueltos para armar el póster a mano en el .pptx.
## Cada archivo se genera al tamaño físico pedido y se coloca 1:1, así que los
## tamaños de fuente de acá son los puntos reales que se van a ver impresos.
suppressMessages({library(dplyr); library(ggplot2); library(MASS); library(grid); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
CM <- function(x) x/2.54

data(crab); cb <- crab; cb$Type <- factor(cb$Type)
levels(cb$Type) <- c("Azul hembra","Azul macho","Naranja hembra","Naranja macho")
V <- c("FL","RW","CL","CW","BD"); X <- as.matrix(cb[, V]); y <- cb$Type
CU <- c(`Azul hembra`=JJAA[["celeste"]], `Azul macho`=JJAA[["azul"]],
        `Naranja hembra`=JJAA[["amarillo"]], `Naranja macho`=JJAA[["naranja"]])

## puntos: título de eje 30 pt, marcas 24 pt
base_cuadro <- function() {
  theme_minimal(base_size = 30, base_family = FUENTE) +
  theme(panel.grid.minor = element_blank(),
        panel.grid.major = element_line(colour = "grey88", linewidth = .4),
        axis.title = element_text(size = 30), axis.text = element_blank(),
        axis.ticks = element_blank(), legend.position = "none",
        plot.margin = margin(6, 8, 4, 4))
}

## ---- 1 y 2: los dos cuadrados de 22,44 cm ----
cuadro <- function(d, ejex, ejey, archivo) {
  p <- ggplot(d, aes(x, y, colour = clase)) +
    geom_point(size = 5.4, alpha = .9, stroke = 0) +
    scale_colour_manual(values = CU) +
    labs(x = ejex, y = ejey) +
    coord_fixed(ratio = diff(range(d$x))/diff(range(d$y))) +
    base_cuadro()
  ggsave(archivo, p, width = CM(22.44), height = CM(22.44), dpi = 300,
         bg = "white", type = "cairo")
  cat("  ", archivo, "\n")
}
cuadro(data.frame(x = cb$CL, y = cb$CW, clase = y),
       "Largo del caparazón (mm)", "Ancho del caparazón (mm)",
       "assets/g1-largo-ancho.png")
ld <- lda(X, y); Z <- scale(X %*% ld$scaling[, 1:2], scale = FALSE)
cuadro(data.frame(x = Z[,1], y = Z[,2], clase = y), "Z₁", "Z₂",
       "assets/g2-z1-z2.png")

## ---- 3: la leyenda sola, 44,87 x 2,39 cm ----
pl <- ggplot(data.frame(x=1:4, clase=factor(levels(y), levels(y))), aes(x, x, colour=clase)) +
  geom_point(size = 7) + scale_colour_manual(values = CU) +
  guides(colour = guide_legend(nrow = 1, override.aes = list(size = 8))) +
  theme_minimal(base_size = 30, base_family = FUENTE) +
  theme(legend.position = "bottom", legend.title = element_blank(),
        legend.text = element_text(size = 30), legend.key.spacing.x = unit(10, "mm"),
        legend.margin = margin(0,0,0,0))
## El grob se arma con el dispositivo ya abierto: si no, ggplot mide el texto
## contra el dispositivo nulo, que no conoce la fuente y devuelve otros anchos.
png("assets/g3-leyenda.png", width = CM(44.87), height = CM(2.39), units = "in",
    res = 300, bg = "white", type = "cairo")
g <- ggplotGrob(pl)
leg <- g$grobs[[which(vapply(g$grobs, function(x) x$name, character(1)) == "guide-box")]]
grid.newpage(); grid.draw(leg); dev.off()
cat("   assets/g3-leyenda.png\n")

## ---- 4, 5 y 6: los tres de 23,6 x 12,6 cm ----
base_ancho <- function() {
  theme_minimal(base_size = 26, base_family = FUENTE) +
  theme(panel.grid.minor = element_blank(),
        panel.grid.major = element_line(colour = "grey88", linewidth = .4),
        axis.title = element_text(size = 26), legend.position = "none",
        plot.margin = margin(10, 14, 4, 4))
}
guardar_ancho <- function(p, archivo, fondo = "white") {
  ggsave(archivo, p, width = CM(23.6), height = CM(12.6), dpi = 300,
         bg = fondo, type = "cairo"); cat("  ", archivo, "\n")
}

# El fondo del dispositivo no alcanza: theme_minimal pinta su propio rectángulo
# blanco encima, así que hay que dejarlo transparente a él también.
sin_fondo <- theme(plot.background  = element_rect(fill = NA, colour = NA),
                   panel.background = element_rect(fill = NA, colour = NA))

## 4 · proyección unidimensional (la sombra)
set.seed(7)
d4 <- cb |> transmute(x = CL, y = CW, clase = Type) |>
  group_by(clase) |> slice_sample(n = 7) |> ungroup()
th <- 40*pi/180; u <- c(cos(th), sin(th)); nn <- c(-u[2], u[1])
cx <- mean(d4$x); cy <- mean(d4$y); off <- -9
t4 <- (d4$x - cx)*u[1] + (d4$y - cy)*u[2]
d4$px <- cx + t4*u[1] + nn[1]*off; d4$py <- cy + t4*u[2] + nn[2]*off
L <- max(abs(t4)) + 3
rec <- data.frame(x = cx + nn[1]*off - u[1]*L, y = cy + nn[2]*off - u[2]*L,
                  xe = cx + nn[1]*off + u[1]*L, ye = cy + nn[2]*off + u[2]*L)
p4 <- ggplot(d4) +
  geom_segment(aes(x, y, xend = px, yend = py), colour = "grey72", linewidth = .6, linetype = "22") +
  geom_segment(data = rec, aes(x, y, xend = xe, yend = ye), colour = "grey30", linewidth = 2) +
  geom_point(aes(x, y, colour = clase), size = 9, alpha = .45, stroke = 0) +
  geom_point(aes(px, py, colour = clase), size = 9, stroke = 0) +
  scale_colour_manual(values = CU) + coord_equal(clip = "off") +
  labs(x = "Largo del caparazón", y = "Ancho del caparazón") +
  base_ancho() + theme(axis.text = element_blank(), panel.grid = element_blank(),
                       panel.border = element_rect(colour = "grey88", fill = NA, linewidth = .5))
guardar_ancho(p4, "assets/g4-sombra.png")

## 5 · el punto de corte sobre la variable proyectada
z <- as.numeric(X %*% ld$scaling[,1])
if (mean(z[grepl("Azul", y)]) > mean(z[grepl("Naranja", y)])) z <- -z
azul <- grepl("Azul", y); cs <- sort(unique(z)); cs <- (head(cs,-1)+tail(cs,-1))/2
corte <- cs[which.max(sapply(cs, function(t) mean((z < t) == azul)))]
p5 <- ggplot(data.frame(z = z, clase = y), aes(z, fill = clase)) +
  geom_histogram(bins = 34, colour = "white", linewidth = .4) +
  geom_vline(xintercept = corte, linetype = "dashed", colour = "grey20", linewidth = 1.6) +
  annotate("text", x = corte, y = Inf, vjust = 1.5, hjust = -0.08, size = 9,
           fontface = "bold", colour = "grey20", label = "punto de corte") +
  scale_fill_manual(values = CU) + labs(x = "Z₁", y = NULL) +
  base_ancho() + theme(axis.text.y = element_blank(), panel.grid.major.x = element_blank())
guardar_ancho(p5, "assets/g5-corte.png")

## 6 · estructura del árbol
## A este formato ancho y bajo le achicamos las cajas: con las de por defecto el
## árbol no entra y las hojas se pisan.
options(ppforest2.leaf_w = 0.78, ppforest2.node_w = 0.9,
        ppforest2.node_h = 0.55, ppforest2.leaf_h = 0.26)
cb2 <- cb
names(cb2)[names(cb2)=="FL"] <- "Frente"; names(cb2)[names(cb2)=="RW"] <- "Rostro"
names(cb2)[names(cb2)=="CL"] <- "Largo";  names(cb2)[names(cb2)=="CW"] <- "Ancho"
names(cb2)[names(cb2)=="BD"] <- "Alto"
cb2 <- cb2[sample(nrow(cb2)), ]
vars <- setdiff(names(cb2), "Type")
ft <- pptr(Type ~ ., cb2, lambda = 0, stop = stop_max_depth(2))   # sin penalizar, como el índice del informe
internos <- function(nd) if (is.null(nd$projector)) list() else c(list(nd), internos(nd$lower), internos(nd$upper))
nodos <- internos(ft$root)
## el paquete formatea con dos decimales fijos y acá los coeficientes son ~0,006,
## así que se imprimirían todos como ".00": los reescalamos
etiqueta <- function(nd, k = 1) {   # un solo término: con dos, las fórmulas se pisan a este ancho
  a <- nd$projector; s <- max(abs(a)); a <- a/s
  o <- order(-abs(a))[seq_len(min(k, length(a)))]
  tr <- vapply(seq_along(o), function(i){ j <- o[i]; v <- a[j]
    sg <- if (i==1) (if (v<0) "−" else "") else (if (v<0) " − " else " + ")
    paste0(sg, format(round(abs(v),2), nsmall=2, decimal.mark=","), "·", vars[j]) }, character(1))
  paste0(paste(tr, collapse=""), " + …")
}
fc <- function(x) format(round(x,2), nsmall=2, decimal.mark=",")
arbol <- plot(ft)[[1]]
arbol$layers[[9]]$data$label <- vapply(nodos, etiqueta, character(1))
crudos <- vapply(nodos, function(nd) nd$cutpoint, numeric(1))
esc <- vapply(nodos, function(nd) max(abs(nd$projector)), numeric(1))
arbol$layers[[2]]$data$label <- vapply(arbol$layers[[2]]$data$label, function(l){
  v <- suppressWarnings(as.numeric(sub("^[^0-9.-]+", "", l)))
  i <- which.min(abs(round(crudos,2) - v))
  paste0(if (startsWith(l,"<")) "< " else "≥ ", fc(crudos[i]/esc[i]))
}, character(1))
arbol$layers[[6]]$data$label <- ""
arbol$layers[[9]]$aes_params$size <- 5.0   # fórmulas
arbol$layers[[2]]$aes_params$size <- 5.0   # umbrales
arbol$layers[[8]]$aes_params$size <- 5.4   # hojas
arbol <- arbol + scale_fill_manual(values=CU) + scale_colour_manual(values=CU) + labs(title=NULL) +
  theme(legend.position="none", text=element_text(family=FUENTE, size=26),
        plot.margin=margin(4,4,4,4))
## El gráfico del árbol deja mucho aire alrededor: recortamos la ventana al
## contenido real (cajas, hojas y etiquetas) para que ocupe toda la caja.
lims <- function(p) {
  ## ggplot_build resuelve las estéticas de cada capa, así no dependemos de
  ## cómo esté armado internamente el gráfico que devuelve el paquete
  bd <- ggplot_build(p)$data
  num <- function(d, nms) unlist(lapply(intersect(nms, names(d)),
                                        function(k) suppressWarnings(as.numeric(d[[k]]))))
  xs <- unlist(lapply(bd, num, c("x", "xmin", "xmax", "xend")))
  ys <- unlist(lapply(bd, num, c("y", "ymin", "ymax", "yend")))
  list(x = range(xs, na.rm = TRUE), y = range(ys, na.rm = TRUE))
}
L <- lims(arbol)
## las fórmulas y los umbrales son texto centrado: un poco de aire a los costados
padx <- diff(L$x)*0.10; pady <- diff(L$y)*0.05
arbol <- arbol +
  coord_cartesian(xlim = L$x + c(-padx, padx), ylim = L$y + c(-pady, pady), expand = FALSE) +
  theme(plot.margin = margin(1,1,1,1))
guardar_ancho(arbol, "assets/g6-arbol.png")

## ---- 7: fronteras de decisión sobre crab, 23,6 x 12,6 cm ----
## Va con las dos especies sin distinguir sexo: la comparación "escalera contra
## un corte" sólo tiene sentido con dos clases. Los aciertos son los de
## validación cruzada 3x5 medidos en R/22-fig-cangrejos.R.
suppressMessages(library(rpart))
options(ppforest2.leaf_w = NULL, ppforest2.node_w = NULL,
        ppforest2.node_h = NULL, ppforest2.leaf_h = NULL)
data(crabs)
dk <- data.frame(largo = crabs$CL, ancho = crabs$CW,
                 clase = factor(crabs$Type, c("B","O"), c("Especie azul","Especie naranja")))
dk <- dk[sample(nrow(dk)), ]
COLK <- c(`Especie azul` = JJAA[["azul"]], `Especie naranja` = JJAA[["naranja"]])

fc <- rpart(clase ~ ., dk, method="class", control=rpart.control(cp=.005, minsplit=10, xval=0))   # 17 cortes: la complejidad que elige la validación cruzada
nc <- sum(fc$frame$var != "<leaf>")
fo <- pptr(clase ~ ., dk, lambda=0, stop=stop_max_depth(1))
ak <- fo$root$projector; ak <- ak/sqrt(sum(ak^2)); zk <- as.numeric(as.matrix(dk[,1:2]) %*% ak)
ck <- unique(quantile(zk, seq(.005,.995,.001)))
ek <- sapply(ck, function(t){ p <- ifelse(zk<t, levels(dk$clase)[1], levels(dk$clase)[2])
                              max(mean(p==dk$clase), 1-mean(p==dk$clase)) })
cortek <- ck[which.max(ek)]
altok <- if (mean(zk[dk$clase=="Especie naranja"]) > mean(zk[dk$clase=="Especie azul"]))
           "Especie naranja" else "Especie azul"
rk <- c(12, 49); ry <- c(15, 56)
gk <- expand.grid(largo=seq(rk[1],rk[2],length.out=420), ancho=seq(ry[1],ry[2],length.out=420))
gk$clase <- dk$clase[1]; gk$clasico <- predict(fc, gk, type="class")
zg <- as.numeric(as.matrix(gk[,c("largo","ancho")]) %*% ak)
gk$oblicuo <- factor(ifelse(zg >= cortek, altok, setdiff(levels(dk$clase), altok)), levels(dk$clase))
## en dos líneas: a este ancho, en una sola no entran
etk <- c(sprintf("Árbol clásico\n%d cortes  ·  68,0 %%", nc), "Árbol oblicuo\n1 corte  ·  90,8 %")
rej <- bind_rows(transform(gk[,1:2], pred=gk$clasico, panel=etk[1]),
                 transform(gk[,1:2], pred=gk$oblicuo, panel=etk[2]))
rej$panel <- factor(rej$panel, etk)
ptk <- bind_rows(transform(dk, panel=etk[1]), transform(dk, panel=etk[2]))
ptk$panel <- factor(ptk$panel, etk)

## Orden de capas: regiones, halo blanco, puntos y la frontera ARRIBA de todo.
## Antes la frontera iba debajo de los puntos y la escalera no se leía.
p7 <- ggplot() +
  geom_raster(data=rej, aes(largo, ancho, fill=pred), alpha=.42) +
  geom_point(data=ptk, aes(largo, ancho), size=3.0, colour="white", alpha=.55, stroke=0) +
  geom_point(data=ptk, aes(largo, ancho, colour=clase), size=2.2, alpha=.7, stroke=0) +
  ## la frontera en blanco con filo oscuro: dos trazos superpuestos.
  ## El patrón de guiones se escala con el grosor, así que "21" a grosor doble
  ## da los mismos guiones absolutos que "42" a grosor simple y calzan.
  geom_contour(data=transform(rej, z=as.numeric(pred)), aes(largo, ancho, z=z),
               breaks=1.5, colour="grey15", linewidth=2.0, linetype="21") +
  geom_contour(data=transform(rej, z=as.numeric(pred)), aes(largo, ancho, z=z),
               breaks=1.5, colour="white", linewidth=1.0, linetype="42") +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLK, guide="none") + scale_colour_manual(values=COLK) +
  coord_cartesian(xlim=rk, ylim=ry, expand=FALSE) +
  labs(x="Largo del caparazón (mm)", y="Ancho del caparazón (mm)") +
  base_ancho() + theme(strip.text=element_blank(),   # los títulos van en el .pptx
                       axis.text=element_blank(), panel.grid=element_blank(),
                       panel.spacing=unit(8,"mm")) + sin_fondo
guardar_ancho(p7, "assets/g7-fronteras-crab.png", fondo = "transparent")
cat(sprintf("   clásico: %d cortes\n", nc))
