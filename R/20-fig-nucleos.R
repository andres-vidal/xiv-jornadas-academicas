suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
data(wdbc, package="mclust"); w <- as.data.frame(wdbc); w <- w[sample(nrow(w)), ]
COLN <- c(Benigno = JJAA[["azul"]], Maligno = JJAA[["naranja"]])

figura <- function(vx, vy, lx, ly, archivo, cp) {
  d <- data.frame(x = w[[vx]], y = w[[vy]],
                  clase = factor(w$Diagnosis, c("B","M"), c("Benigno","Maligno")))
  d <- d[complete.cases(d), ]
  fc <- rpart(clase ~ ., d, method="class", control=rpart.control(cp=cp, minsplit=10, maxdepth=30, xval=0))
  nc <- sum(fc$frame$var != "<leaf>")
  fo <- pptr(clase ~ ., d, lambda=0, stop=stop_max_depth(1))
  a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
  cs <- unique(quantile(z, seq(.005,.995,.001)))
  ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
  corte <- cs[which.max(ev)]
  alto <- if (mean(z[d$clase=="Maligno"]) > mean(z[d$clase=="Benigno"])) "Maligno" else "Benigno"
  rx <- range(d$x) + c(-.05,.05)*diff(range(d$x)); ry <- range(d$y) + c(-.05,.05)*diff(range(d$y))
  g <- expand.grid(x = seq(rx[1],rx[2],length.out=400), y = seq(ry[1],ry[2],length.out=400))
  g$clase <- d$clase[1]; g$clasico <- predict(fc, g, type="class")
  zg <- as.numeric(as.matrix(g[,c("x","y")]) %*% a)
  g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))
  et <- c(sprintf("Árbol clásico: %d cortes", nc), "Árbol oblicuo: 1 corte")
  rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                   transform(g[,1:2], pred=g$oblicuo, panel=et[2])); rej$panel <- factor(rej$panel, et)
  pts <- bind_rows(transform(d, panel=et[1]), transform(d, panel=et[2])); pts$panel <- factor(pts$panel, et)
  p <- ggplot() +
    geom_raster(data=rej, aes(x, y, fill=pred), alpha=.22) +
    geom_point(data=pts, aes(x, y, colour=clase), size=1.9, alpha=.65, stroke=0) +
    facet_wrap(~panel) +
    scale_fill_manual(values=COLN, guide="none") + scale_colour_manual(values=COLN) +
    coord_cartesian(xlim=rx, ylim=ry, expand=FALSE) +
    labs(x=lx, y=ly) + guides(colour=guide_legend(override.aes=list(size=6))) + tema(23)
  ggsave(archivo, p, width=14, height=7.2, dpi=200, bg="white", type="cairo")
  cat(sprintf("%s -> %d cortes clásicos\n", archivo, nc))
}
figura("Radius_mean","Perimeter_mean","Radio medio del núcleo","Perímetro medio del núcleo",
       "img/S10-nucleos-radio.png", .002)
figura("Perimeter_mean","Compactness_mean","Perímetro medio del núcleo","Irregularidad del borde",
       "img/S11-nucleos-compacidad.png", .005)
