suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
data(fishcatch)
f <- fishcatch |> filter(Type %in% c("Perch","Bream")) |>
  transmute(cuerpo = length1, total = length3,
            clase = factor(Type, c("Bream","Perch"), c("Brema","Perca")))
f <- f[sample(nrow(f)), ]
COLF <- c(Brema = JJAA[["naranja"]], Perca = JJAA[["azul"]])

fc <- rpart(clase ~ ., f, method="class", control=rpart.control(cp=.01, minsplit=8))
nc <- sum(fc$frame$var != "<leaf>"); acc_c <- mean(predict(fc, f, type="class") == f$clase)
fo <- pptr(clase ~ ., f, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(f[,1:2]) %*% a)
cand <- sort(unique(z)); cand <- (head(cand,-1)+tail(cand,-1))/2
ev <- sapply(cand, function(t){ p <- ifelse(z<t, levels(f$clase)[1], levels(f$clase)[2]); max(mean(p==f$clase),1-mean(p==f$clase)) })
corte <- cand[which.max(ev)]; acc_o <- max(ev)
alto <- if (mean(z[f$clase=="Perca"]) > mean(z[f$clase=="Brema"])) "Perca" else "Brema"
cat(sprintf("clásico %d cortes %.1f%%  |  oblicuo 1 corte %.1f%%\n", nc, 100*acc_c, 100*acc_o))
cat(sprintf("dirección: %+.3f*cuerpo %+.3f*total   pendiente frontera %.3f\n", a[1], a[2], -a[1]/a[2]))

rg <- range(c(f$cuerpo, f$total)); rg <- c(rg[1]-3, rg[2]+3)
g <- expand.grid(cuerpo = seq(rg[1], rg[2], length.out=330), total = seq(rg[1], rg[2], length.out=330))
g$clase <- f$clase[1]
g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("cuerpo","total")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(f$clase), alto)), levels(f$clase))

et <- c(sprintf("Árbol clásico: %d cortes  ·  %.1f %%", nc, 100*acc_c),
        sprintf("Árbol oblicuo: 1 corte  ·  %.1f %%", 100*acc_o))
rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                 transform(g[,1:2], pred=g$oblicuo, panel=et[2]))
rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(f, panel=et[1]), transform(f, panel=et[2])); pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data=rej, aes(cuerpo, total, fill=pred), alpha=.22) +
  geom_point(data=pts, aes(cuerpo, total, colour=clase), size=3.4, alpha=.85, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLF, guide="none") + scale_colour_manual(values=COLF) +
  coord_cartesian(xlim=rg, ylim=rg, expand=FALSE) +
  labs(x="Largo hasta el nacimiento de la cola (cm)", y="Largo total (cm)") +
  guides(colour=guide_legend(override.aes=list(size=6))) +
  tema(23)
ggsave("img/S7-pescado.png", p, width=14, height=7.4, dpi=200, bg="white", type="cairo")
cat("guardado\n")
