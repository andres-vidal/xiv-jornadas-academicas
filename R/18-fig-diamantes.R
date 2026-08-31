suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
d <- as.data.frame(ggplot2::diamonds) |> filter(x > 0, z > 0, z < 10, x < 10) |>
  filter(cut %in% c("Premium","Good")) |>
  transmute(ancho = x, profundidad = z,
            clase = factor(as.character(cut), c("Good","Premium"), c("Tallado regular","Tallado premium")))
d <- d[sample(nrow(d), 6000), ]
COLD <- c(`Tallado regular` = JJAA[["naranja"]], `Tallado premium` = JJAA[["azul"]])

fc <- rpart(clase ~ ., d, method="class", control=rpart.control(cp=.0005, minsplit=20, maxdepth=30, xval=0))
nc <- sum(fc$frame$var != "<leaf>"); acc_c <- mean(predict(fc, d, type="class") == d$clase)
fo <- pptr(clase ~ ., d, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
cs <- unique(quantile(z, seq(.005,.995,.001)))
ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
corte <- cs[which.max(ev)]; acc_o <- max(ev)
alto <- if (mean(z[d$clase==levels(d$clase)[2]]) > mean(z[d$clase==levels(d$clase)[1]])) levels(d$clase)[2] else levels(d$clase)[1]
cat(sprintf("clásico %d cortes %.1f%% | oblicuo 1 corte %.1f%% | pendiente %.3f\n",
            nc, 100*acc_c, 100*acc_o, -a[1]/a[2]))

rx <- c(3.6, 9.2); ry <- c(2.0, 5.8)
g <- expand.grid(ancho = seq(rx[1], rx[2], length.out=420), profundidad = seq(ry[1], ry[2], length.out=420))
g$clase <- d$clase[1]
g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("ancho","profundidad")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))

et <- c(sprintf("Árbol clásico: %d cortes  ·  %.1f %%", nc, 100*acc_c),
        sprintf("Árbol oblicuo: 1 corte  ·  %.1f %%", 100*acc_o))
rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                 transform(g[,1:2], pred=g$oblicuo, panel=et[2])); rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(d, panel=et[1]), transform(d, panel=et[2])); pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data=rej, aes(ancho, profundidad, fill=pred), alpha=.22) +
  geom_point(data=pts, aes(ancho, profundidad, colour=clase), size=.85, alpha=.4, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLD, guide="none") + scale_colour_manual(values=COLD) +
  coord_cartesian(xlim=rx, ylim=ry, expand=FALSE) +
  labs(x="Ancho de la piedra (mm)", y="Profundidad de la piedra (mm)") +
  guides(colour=guide_legend(override.aes=list(size=6, alpha=1))) +
  tema(23)
ggsave("img/S8-diamantes.png", p, width=14, height=7.2, dpi=200, bg="white", type="cairo")
cat("guardado\n")
