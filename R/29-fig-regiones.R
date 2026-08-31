## Regiones de decisión: qué puede dibujar un árbol clásico y qué uno oblicuo.
## Datos simulados a propósito — la figura ilustra la geometría, no mide nada.
suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(11)

## dos grupos alargados sobre la misma diagonal, corridos en perpendicular
n <- 160; rho <- .965
gen <- function(off) {
  z1 <- rnorm(n); z2 <- rnorm(n)
  a <- z1; b <- rho*z1 + sqrt(1-rho^2)*z2
  data.frame(x = a*2.4 + off*0.72, y = b*2.4 - off*0.72)
}
d <- bind_rows(transform(gen(-1), clase = "Grupo A"), transform(gen(1), clase = "Grupo B"))
d$clase <- factor(d$clase); d <- d[sample(nrow(d)), ]
COL2 <- c(`Grupo A` = JJAA[["azul"]], `Grupo B` = JJAA[["naranja"]])

fc <- rpart(clase ~ ., d, method = "class", control = rpart.control(cp = .01, minsplit = 10))
nc <- sum(fc$frame$var != "<leaf>")
fo <- pptr(clase ~ ., d, lambda = 0, stop = stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
cs <- unique(quantile(z, seq(.01,.99,.002)))
ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
corte <- cs[which.max(ev)]
alto <- if (mean(z[d$clase=="Grupo B"]) > mean(z[d$clase=="Grupo A"])) "Grupo B" else "Grupo A"
cat(sprintf("clásico: %d cortes · oblicuo: 1 corte\n", nc))

r <- range(c(d$x, d$y)) + c(-.6, .6)
g <- expand.grid(x = seq(r[1], r[2], length.out = 400), y = seq(r[1], r[2], length.out = 400))
g$clase <- d$clase[1]
g$clasico <- predict(fc, g, type = "class")
zg <- as.numeric(as.matrix(g[,c("x","y")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))
et <- c(sprintf("Árbol clásico: %d cortes", nc), "Árbol oblicuo: 1 corte")
rej <- bind_rows(transform(g[,1:2], pred = g$clasico, panel = et[1]),
                 transform(g[,1:2], pred = g$oblicuo, panel = et[2]))
rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(d, panel = et[1]), transform(d, panel = et[2]))
pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data = rej, aes(x, y, fill = pred), alpha = .22) +
  geom_contour(data = transform(rej, z = as.numeric(pred)), aes(x, y, z = z),
               breaks = 1.5, colour = "grey25", linewidth = .9, linetype = "dashed") +
  geom_point(data = pts, aes(x, y, colour = clase), size = 3.4, alpha = .8, stroke = 0) +
  facet_wrap(~panel) +
  scale_fill_manual(values = COL2, guide = "none") + scale_colour_manual(values = COL2) +
  coord_cartesian(xlim = r, ylim = r, expand = FALSE) +
  labs(x = NULL, y = NULL) +
    tema(20) + theme(legend.position = "none", axis.text = element_blank(), panel.grid = element_blank(),
                   strip.text = element_text(face = "bold", size = 26),
                   legend.text = element_text(size = 20), legend.margin = margin(t = 2),
                   plot.margin = margin(4, 6, 2, 2))
ggsave("img/K6-regiones.png", p, width = 15, height = 7.8, dpi = 220, bg = "white", type = "cairo")
cat("guardado\n")
