suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
data(bdims, package="openintro")
b <- as.data.frame(bdims)
d <- data.frame(peso = b$wgt, cadera = b$hip_gi,
                clase = factor(b$sex, c(0,1), c("Mujer","Hombre")))
d <- d[complete.cases(d), ][sample(nrow(d)), ]
COLC <- c(Mujer = JJAA[["naranja"]], Hombre = JJAA[["azul"]])

fc <- rpart(clase ~ ., d, method="class", control=rpart.control(cp=.002, minsplit=10, maxdepth=30, xval=0))
nc <- sum(fc$frame$var != "<leaf>"); acc_c <- mean(predict(fc, d, type="class") == d$clase)
fo <- pptr(clase ~ ., d, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
cs <- unique(quantile(z, seq(.005,.995,.001)))
ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
corte <- cs[which.max(ev)]; acc_o <- max(ev)
alto <- if (mean(z[d$clase=="Hombre"]) > mean(z[d$clase=="Mujer"])) "Hombre" else "Mujer"
cat(sprintf("clásico %d cortes %.1f%% | oblicuo 1 corte %.1f%% | pendiente %.3f\n", nc, 100*acc_c, 100*acc_o, -a[1]/a[2]))

rx <- c(35, 120); ry <- c(78, 122)
g <- expand.grid(peso = seq(rx[1], rx[2], length.out=400), cadera = seq(ry[1], ry[2], length.out=400))
g$clase <- d$clase[1]; g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("peso","cadera")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))
et <- c(sprintf("Árbol clásico: %d cortes", nc), "Árbol oblicuo: 1 corte")
rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                 transform(g[,1:2], pred=g$oblicuo, panel=et[2])); rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(d, panel=et[1]), transform(d, panel=et[2])); pts$panel <- factor(pts$panel, et)
p <- ggplot() +
  geom_raster(data=rej, aes(peso, cadera, fill=pred), alpha=.22) +
  geom_point(data=pts, aes(peso, cadera, colour=clase), size=2, alpha=.65, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLC, guide="none") + scale_colour_manual(values=COLC) +
  coord_cartesian(xlim=rx, ylim=ry, expand=FALSE) +
  labs(x="Peso (kg)", y="Contorno de cadera (cm)") +
  guides(colour=guide_legend(override.aes=list(size=6))) + tema(23)
ggsave("img/S9-cuerpo.png", p, width=14, height=7.2, dpi=200, bg="white", type="cairo")
cat("guardado\n")
