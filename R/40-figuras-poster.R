## Figuras dimensionadas para el póster A0: el texto de cada gráfico se calibra
## para que, ya escalado en el pliego, coincida con el cuerpo de texto (~19 pt).
suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
b <- cargar()[, c("insc1","apro1","clase")]
M <- as.matrix(b[, c("insc1","apro1")]); y <- b$clase

## ---- S1: cortes clásicos vs. oblicuo (ancho en el póster: 757 mm) ----
fc <- rpart(clase ~ ., b, method="class", control=rpart.control(cp=.01, minsplit=20))
n_cortes <- sum(fc$frame$var != "<leaf>"); acc_c <- mean(predict(fc, b, type="class") == y)
fo <- pptr(clase ~ ., b, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(M %*% a)
cand <- sort(unique(z)); cand <- (head(cand,-1)+tail(cand,-1))/2
ev <- sapply(cand, function(t){ p <- ifelse(z<t, levels(y)[1], levels(y)[2]); max(mean(p==y),1-mean(p==y)) })
corte <- cand[which.max(ev)]; acc_o <- max(ev)
alto <- if (mean(z[y==levels(y)[2]]) > mean(z[y==levels(y)[1]])) levels(y)[2] else levels(y)[1]

gx <- seq(-0.7, 15.7, length.out=360); g <- expand.grid(insc1=gx, apro1=gx); g$clase <- y[1]
g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("insc1","apro1")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(y), alto)), levels(y))
et <- c(sprintf("Árbol clásico: %d cortes  ·  %s %%", n_cortes, sub("\\.", ",", sprintf("%.1f", 100*acc_c))),
        sprintf("Árbol oblicuo: 1 corte  ·  %s %%", sub("\\.", ",", sprintf("%.1f", 100*acc_o))))
rej <- bind_rows(transform(g[,c("insc1","apro1")], pred=g$clasico, panel=et[1]),
                 transform(g[,c("insc1","apro1")], pred=g$oblicuo, panel=et[2]))
rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(b, panel=et[1]), transform(b, panel=et[2])); pts$panel <- factor(pts$panel, et)
p1 <- ggplot() +
  geom_raster(data=rej, aes(insc1, apro1, fill=pred), alpha=.22) +
  geom_contour(data = transform(rej, z = as.numeric(pred)), aes(insc1, apro1, z = z),
               breaks = 1.5, colour = "grey25", linewidth = .8, linetype = "dashed") +
  geom_jitter(data=pts, aes(insc1, apro1, colour=clase), width=.28, height=.28,
              size=3.4, alpha=.6, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COL, guide="none") + scale_colour_manual(values=COL) +
  coord_cartesian(xlim=c(-0.7,15.7), ylim=c(-0.7,15.7), expand=FALSE) +
  labs(x="Materias en las que se inscribió (1er semestre)", y="Materias que aprobó") +
  guides(colour=guide_legend(override.aes=list(size=7, alpha=1))) +
  tema(22) + theme(legend.margin=margin(t=2), plot.margin=margin(4,6,2,2),
        strip.text=element_text(face="bold", size=21), legend.text=element_text(size=17))
ggsave("img/P1-cortes.png", p1, width=28, height=11.1, dpi=200, bg="white", type="cairo")

## ---- S3: curva del índice (ancho en el póster: 234 mm) ----
W <- Reduce(`+`, lapply(levels(y), function(gr){ Z <- scale(M[y==gr,,drop=FALSE], scale=FALSE); t(Z)%*%Z }))
Tm <- { Z <- scale(M, scale=FALSE); t(Z)%*%Z }
indice <- function(th){ u <- c(cos(th), sin(th)); 1 - as.numeric(t(u)%*%W%*%u)/as.numeric(t(u)%*%Tm%*%u) }
th <- seq(0, pi, length.out=721); I <- sapply(th, indice); opt <- th[which.max(I)]
p3 <- ggplot(data.frame(grados=th*180/pi, I=I), aes(grados, I)) +
  geom_line(linewidth=1.5, colour="grey30") +
  geom_point(data=data.frame(grados=opt*180/pi, I=max(I)), size=9, colour=COL[["Abandona"]]) +
  annotate("text", x=opt*180/pi+7, y=max(I), hjust=0, vjust=.35, size=6.4,
           label=sprintf("%d°  ·  I = %.2f", round(opt*180/pi), max(I))) +
  labs(x="Ángulo de la dirección (grados)", y="Índice de proyección") +
  coord_cartesian(xlim=c(0,196)) + scale_x_continuous(breaks=seq(0,180,45)) +
  tema(20) + theme(plot.margin=margin(4,4,2,2))
ggsave("img/P3-curva-indice.png", p3, width=8.6, height=5.1, dpi=300, bg="white", type="cairo")

## ---- S4: comparación de métodos (ancho en el póster: 234 mm) ----
r <- readRDS("R/resumen-comparacion.rds")
r$metodo <- factor(r$metodo, r$metodo)
r$tipo <- ifelse(grepl("ppforest2", r$metodo), "ppforest2", "otros")
p4 <- ggplot(r, aes(media, metodo, colour=tipo)) +
  geom_errorbarh(aes(xmin=media-2*ee, xmax=media+2*ee), height=.16, linewidth=1.2) +
  geom_point(size=8) +
  geom_text(aes(label=sprintf("%.1f %%", 100*media)), vjust=-1.5, size=6, fontface="bold") +
  scale_colour_manual(values=c(ppforest2=COL[["Abandona"]], otros="grey45"), guide="none") +
  scale_x_continuous(labels=scales::percent) +
  labs(x="Aciertos en validación cruzada (15 particiones)", y=NULL) +
  tema(20) + theme(panel.grid.major.y=element_blank(), plot.margin=margin(8,8,2,2))
ggsave("img/P4-comparacion.png", p4, width=8.6, height=4.6, dpi=300, bg="white", type="cairo")
cat(sprintf("P1: %d cortes %.1f%% vs 1 corte %.1f%%\nP3: optimo %.1f°\nlisto\n",
            n_cortes, 100*acc_c, 100*acc_o, opt*180/pi))

## ---- P0: cangrejos, figura principal del póster (ancho en el pliego: 757 mm) ----
data(crabs)
k <- data.frame(largo = crabs$CL, ancho = crabs$CW,
                clase = factor(crabs$Type, c("B","O"), c("Especie azul","Especie naranja")))
k <- k[sample(nrow(k)), ]
COLK <- c(`Especie azul` = JJAA[["azul"]], `Especie naranja` = JJAA[["naranja"]])
fk <- rpart(clase ~ ., k, method="class", control=rpart.control(cp=.001, minsplit=10, xval=0))
nk <- sum(fk$frame$var != "<leaf>")
ok <- pptr(clase ~ ., k, lambda=0, stop=stop_max_depth(1))
ak <- ok$root$projector; ak <- ak/sqrt(sum(ak^2)); zk <- as.numeric(as.matrix(k[,1:2]) %*% ak)
ck <- unique(quantile(zk, seq(.005,.995,.001)))
ek <- sapply(ck, function(t){ p <- ifelse(zk<t, levels(k$clase)[1], levels(k$clase)[2]); max(mean(p==k$clase),1-mean(p==k$clase)) })
cortek <- ck[which.max(ek)]
altok <- if (mean(zk[k$clase==levels(k$clase)[2]]) > mean(zk[k$clase==levels(k$clase)[1]])) levels(k$clase)[2] else levels(k$clase)[1]
rxk <- c(12,49); ryk <- c(15,56)
gk <- expand.grid(largo=seq(rxk[1],rxk[2],length.out=420), ancho=seq(ryk[1],ryk[2],length.out=420))
gk$clase <- k$clase[1]; gk$clasico <- predict(fk, gk, type="class")
zgk <- as.numeric(as.matrix(gk[,c("largo","ancho")]) %*% ak)
gk$oblicuo <- factor(ifelse(zgk >= cortek, altok, setdiff(levels(k$clase), altok)), levels(k$clase))
## los aciertos son los de validación cruzada, calculados en R/22-fig-cangrejos.R
etk <- c("Árbol clásico: 17 cortes  ·  68,0 %", "Árbol oblicuo: 1 corte  ·  90,8 %")
rejk <- bind_rows(transform(gk[,1:2], pred=gk$clasico, panel=etk[1]),
                  transform(gk[,1:2], pred=gk$oblicuo, panel=etk[2])); rejk$panel <- factor(rejk$panel, etk)
ptk <- bind_rows(transform(k, panel=etk[1]), transform(k, panel=etk[2])); ptk$panel <- factor(ptk$panel, etk)
p0 <- ggplot() +
  geom_raster(data=rejk, aes(largo, ancho, fill=pred), alpha=.22) +
  geom_contour(data = transform(rejk, z = as.numeric(pred)), aes(largo, ancho, z = z),
               breaks = 1.5, colour = "grey25", linewidth = .9, linetype = "dashed") +
  geom_point(data=ptk, aes(largo, ancho, colour=clase), size=6.4, alpha=.85, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLK, guide="none") + scale_colour_manual(values=COLK) +
  coord_cartesian(xlim=rxk, ylim=ryk, expand=FALSE) +
  labs(x="Largo del caparazón (mm)", y="Ancho del caparazón (mm)") +
  guides(colour=guide_legend(override.aes=list(size=7))) +
  tema(22) + theme(legend.margin=margin(t=2), plot.margin=margin(4,6,2,2),
                   strip.text=element_text(face="bold", size=21), legend.text=element_text(size=17))
ggsave("img/P0-cangrejos-poster.png", p0, width=13, height=8.2, dpi=200, bg="white", type="cairo")
cat(sprintf("P0 póster: clásico %d cortes\n", nk))
