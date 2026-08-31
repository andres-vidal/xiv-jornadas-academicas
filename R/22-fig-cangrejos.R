suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
data(crabs)
d <- data.frame(largo = crabs$CL, ancho = crabs$CW,
                clase = factor(crabs$Type, c("B","O"), c("Especie azul","Especie naranja")))
d <- d[sample(nrow(d)), ]
COLK <- c(`Especie azul` = JJAA[["azul"]], `Especie naranja` = JJAA[["naranja"]])

obl <- function(tr,te){ fo <- pptr(clase~., tr, lambda=0, stop=stop_max_depth(1))
  u <- fo$root$projector; u <- u/sqrt(sum(u^2)); z <- as.numeric(as.matrix(tr[,1:2])%*%u)
  cs <- unique(quantile(z, seq(.01,.99,.002)))
  ev <- sapply(cs, function(t) mean(ifelse(z<t, levels(tr$clase)[1], levels(tr$clase)[2])==tr$clase))
  k <- which.max(pmax(ev,1-ev)); t0 <- cs[k]; inv <- ev[k]<.5
  p <- ifelse(as.numeric(as.matrix(te[,1:2])%*%u) < t0, levels(tr$clase)[1], levels(tr$clase)[2])
  if(inv) p <- ifelse(p==levels(tr$clase)[1], levels(tr$clase)[2], levels(tr$clase)[1]); mean(p==te$clase) }

cps <- c(.05,.02,.01,.005,.002,.001)
A <- matrix(NA,15,length(cps)); N <- A; O <- numeric(15); f <- 0
for (rep in 1:3){ fs <- split(sample(nrow(d)), rep(1:5, length.out=nrow(d)))
  for(k in 1:5){ f <- f+1; te <- fs[[k]]; tr <- setdiff(seq_len(nrow(d)), te)
    for(j in seq_along(cps)){ ft <- rpart(clase~., d[tr,], method="class",
        control=rpart.control(cp=cps[j], minsplit=10, maxdepth=30, xval=0))
      A[f,j] <- mean(predict(ft, d[te,], type="class")==d$clase[te]); N[f,j] <- sum(ft$frame$var!="<leaf>") }
    O[f] <- obl(d[tr,], d[te,]) } }
best <- which.max(colMeans(A)); acc_c <- colMeans(A)[best]; acc_o <- mean(O)
cat("curva de la escalera (cortes -> aciertos):\n  ",
    paste(sprintf("%.1f→%.3f", colMeans(N), colMeans(A)), collapse="   "), "\n")
cat(sprintf("óptimo escalera: %.1f cortes, %.3f  |  oblicuo: 1 corte, %.3f\n",
            colMeans(N)[best], acc_c, acc_o))

fc <- rpart(clase ~ ., d, method="class", control=rpart.control(cp=cps[best], minsplit=10, xval=0))
nc <- sum(fc$frame$var != "<leaf>")
fo <- pptr(clase ~ ., d, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
cs <- unique(quantile(z, seq(.005,.995,.001)))
ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
corte <- cs[which.max(ev)]
alto <- if (mean(z[d$clase==levels(d$clase)[2]]) > mean(z[d$clase==levels(d$clase)[1]])) levels(d$clase)[2] else levels(d$clase)[1]
cat(sprintf("frontera: ancho = %.3f x largo\n", -a[1]/a[2]))

rx <- c(12, 49); ry <- c(15, 56)
g <- expand.grid(largo=seq(rx[1],rx[2],length.out=420), ancho=seq(ry[1],ry[2],length.out=420))
g$clase <- d$clase[1]; g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("largo","ancho")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))
et <- c(sprintf("Árbol clásico: %d cortes  ·  %.1f %%", nc, 100*acc_c),
        sprintf("Árbol oblicuo: 1 corte  ·  %.1f %%", 100*acc_o))
rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                 transform(g[,1:2], pred=g$oblicuo, panel=et[2])); rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(d, panel=et[1]), transform(d, panel=et[2])); pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data=rej, aes(largo, ancho, fill=pred), alpha=.22) +
  geom_contour(data = transform(rej, z = as.numeric(pred)), aes(largo, ancho, z = z),
               breaks = 1.5, colour = "grey25", linewidth = .7, linetype = "dashed") +
  geom_point(data=pts, aes(largo, ancho, colour=clase), size=4.4, alpha=.85, stroke=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLK, guide="none") + scale_colour_manual(values=COLK) +
  coord_cartesian(xlim=rx, ylim=ry, expand=FALSE) +
  labs(x="Largo del caparazón (mm)", y="Ancho del caparazón (mm)") +
  guides(colour=guide_legend(override.aes=list(size=6))) + tema(23)
ggsave("img/P0-cangrejos.png", p, width=14, height=7.2, dpi=200, bg="white", type="cairo")
cat("guardado\n")
