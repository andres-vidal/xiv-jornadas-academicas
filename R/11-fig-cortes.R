suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
b <- cargar()[, c("insc1","apro1","clase")]
M <- as.matrix(b[, c("insc1","apro1")]); y <- b$clase

# --- clasico: rpart, umbrales optimizados por el propio algoritmo ---
fc <- rpart(clase ~ ., b, method="class", control=rpart.control(cp=.01, minsplit=20))
n_cortes <- sum(fc$frame$var != "<leaf>")
acc_c <- mean(predict(fc, b, type="class") == y)

# --- oblicuo: direccion de ppforest2 + mejor umbral sobre esa direccion ---
fo <- pptr(clase ~ ., b, lambda = 0, stop = stop_max_depth(1))
a  <- fo$root$projector; a <- a / sqrt(sum(a^2))
z  <- as.numeric(M %*% a)
cand <- sort(unique(z)); cand <- (head(cand,-1) + tail(cand,-1))/2
ev <- sapply(cand, function(t){ p <- ifelse(z < t, levels(y)[1], levels(y)[2]); max(mean(p==y), 1-mean(p==y)) })
corte <- cand[which.max(ev)]; acc_o <- max(ev)
alto  <- if (mean(z[y==levels(y)[2]]) > mean(z[y==levels(y)[1]])) levels(y)[2] else levels(y)[1]
cat(sprintf("clasico: %d cortes acc=%.4f | oblicuo: 1 corte acc=%.4f\n", n_cortes, acc_c, acc_o))
cat(sprintf("direccion %+.4f*insc1 %+.4f*apro1, angulo %.1f, pendiente frontera %.3f\n",
            a[1], a[2], (atan2(a[2],a[1])*180/pi) %% 180, -a[1]/a[2]))

gx <- seq(-0.7, 15.7, length.out = 340)
g  <- expand.grid(insc1 = gx, apro1 = gx); g$clase <- y[1]
g$clasico <- predict(fc, g, type = "class")
zg <- as.numeric(as.matrix(g[, c("insc1","apro1")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(y), alto)), levels(y))

et <- c(sprintf("Árbol clásico: %d cortes  ·  %s %%", n_cortes, sub("\\.", ",", sprintf("%.1f", 100*acc_c))),
        sprintf("Árbol oblicuo: 1 corte  ·  %s %%", sub("\\.", ",", sprintf("%.1f", 100*acc_o))))
rej <- bind_rows(transform(g[,c("insc1","apro1")], pred=g$clasico, panel=et[1]),
                 transform(g[,c("insc1","apro1")], pred=g$oblicuo, panel=et[2]))
rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(b, panel=et[1]), transform(b, panel=et[2]))
pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data = rej, aes(insc1, apro1, fill = pred), alpha = .22) +
  geom_contour(data = transform(rej, z = as.numeric(pred)), aes(insc1, apro1, z = z),
               breaks = 1.5, colour = "grey25", linewidth = .6, linetype = "dashed") +
  geom_jitter(data = pts, aes(insc1, apro1, colour = clase), width = .28, height = .28,
              size = 2.6, alpha = .6, stroke = 0) +
  facet_wrap(~panel) +
  scale_fill_manual(values = COL, guide = "none") + scale_colour_manual(values = COL) +
  coord_cartesian(xlim = c(-0.7, 15.7), ylim = c(-0.7, 15.7), expand = FALSE) +
  labs(x = "Materias en las que se inscribió (1er semestre)", y = "Materias que aprobó") +
  guides(colour = guide_legend(override.aes = list(size = 6, alpha = 1))) +
  tema(23)
ggsave("img/S1-cortes-clasico-vs-oblicuo.png", p, width = 14, height = 7.4, dpi = 220,
       bg = "white", type = "cairo")
cat("guardado\n")
