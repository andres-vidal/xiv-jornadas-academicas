suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
data(wdbc, package="mclust"); w <- as.data.frame(wdbc)[sample(569), ]
d <- data.frame(radio = w$Radius_mean, perimetro = w$Perimeter_mean,
                clase = factor(w$Diagnosis, c("B","M"), c("Benigno","Maligno")))
COLN <- c(Benigno = JJAA[["azul"]], Maligno = JJAA[["naranja"]])

## complejidad óptima del árbol clásico, elegida por validación cruzada
obl <- function(tr,te){ fo <- pptr(clase~., tr, lambda=0, stop=stop_max_depth(1))
  u <- fo$root$projector; u <- u/sqrt(sum(u^2)); z <- as.numeric(as.matrix(tr[,1:2])%*%u)
  cs <- unique(quantile(z, seq(.01,.99,.002)))
  ev <- sapply(cs, function(t) mean(ifelse(z<t, levels(tr$clase)[1], levels(tr$clase)[2])==tr$clase))
  k <- which.max(pmax(ev,1-ev)); t0 <- cs[k]; inv <- ev[k]<.5
  p <- ifelse(as.numeric(as.matrix(te[,1:2])%*%u) < t0, levels(tr$clase)[1], levels(tr$clase)[2])
  if(inv) p <- ifelse(p==levels(tr$clase)[1], levels(tr$clase)[2], levels(tr$clase)[1]); mean(p==te$clase) }
cps <- c(.05,.02,.01,.005,.002,.001); A <- matrix(NA,15,length(cps)); N <- A; O <- numeric(15); f <- 0
for (rep in 1:3){ fs <- split(sample(569), rep(1:5, length.out=569))
  for(k in 1:5){ f <- f+1; te <- fs[[k]]; tr <- setdiff(1:569, te)
    for(j in seq_along(cps)){ ft <- rpart(clase~., d[tr,], method="class",
        control=rpart.control(cp=cps[j], minsplit=10, maxdepth=30, xval=0))
      A[f,j] <- mean(predict(ft, d[te,], type="class")==d$clase[te]); N[f,j] <- sum(ft$frame$var!="<leaf>") }
    O[f] <- obl(d[tr,], d[te,]) } }
best <- which.max(colMeans(A)); acc_c <- colMeans(A)[best]; nc_cv <- colMeans(N)[best]; acc_o <- mean(O)
cat(sprintf("CV -> oblicuo %.3f (1 corte) | escalera %.3f (%.1f cortes, cp=%.3f)\n", acc_o, acc_c, nc_cv, cps[best]))
cat(sprintf("     escalera con más cortes: %s\n", paste(sprintf("%.1f→%.3f", colMeans(N), colMeans(A)), collapse="  ")))

fc <- rpart(clase ~ ., d, method="class", control=rpart.control(cp=cps[best], minsplit=10, xval=0))
nc <- sum(fc$frame$var != "<leaf>")
fo <- pptr(clase ~ ., d, lambda=0, stop=stop_max_depth(1))
a <- fo$root$projector; a <- a/sqrt(sum(a^2)); z <- as.numeric(as.matrix(d[,1:2]) %*% a)
cs <- unique(quantile(z, seq(.005,.995,.001)))
ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(d$clase)[1], levels(d$clase)[2]); max(mean(p==d$clase),1-mean(p==d$clase)) })
corte <- cs[which.max(ev)]
alto <- if (mean(z[d$clase=="Maligno"]) > mean(z[d$clase=="Benigno"])) "Maligno" else "Benigno"

rx <- c(6.2, 29); ry <- c(40, 190)
g <- expand.grid(radio=seq(rx[1],rx[2],length.out=420), perimetro=seq(ry[1],ry[2],length.out=420))
g$clase <- d$clase[1]; g$clasico <- predict(fc, g, type="class")
zg <- as.numeric(as.matrix(g[,c("radio","perimetro")]) %*% a)
g$oblicuo <- factor(ifelse(zg >= corte, alto, setdiff(levels(d$clase), alto)), levels(d$clase))
et <- c(sprintf("Árbol clásico: %d corte  ·  %.1f %%", nc, 100*acc_c),
        sprintf("Árbol oblicuo: 1 corte  ·  %.1f %%", 100*acc_o))
rej <- bind_rows(transform(g[,1:2], pred=g$clasico, panel=et[1]),
                 transform(g[,1:2], pred=g$oblicuo, panel=et[2])); rej$panel <- factor(rej$panel, et)
pts <- bind_rows(transform(d, panel=et[1]), transform(d, panel=et[2])); pts$panel <- factor(pts$panel, et)

p <- ggplot() +
  geom_raster(data=rej, aes(radio, perimetro, fill=pred), alpha=.22) +
  geom_abline(slope=2*pi, intercept=0, linetype="dashed", colour="grey35", linewidth=.9) +
  geom_point(data=pts, aes(radio, perimetro, colour=clase), size=1.9, alpha=.7, stroke=0) +
  annotate("text", x=22.5, y=132, label="contorno circular\nperímetro = 2π × radio",
           size=5.4, colour="grey35", lineheight=.95, hjust=0) +
  facet_wrap(~panel) +
  scale_fill_manual(values=COLN, guide="none") + scale_colour_manual(values=COLN) +
  coord_cartesian(xlim=rx, ylim=ry, expand=FALSE) +
  labs(x="Radio medio del núcleo (µm)", y="Perímetro medio del núcleo (µm)") +
  guides(colour=guide_legend(override.aes=list(size=6))) + tema(23)
ggsave("img/S12-radio-perimetro.png", p, width=14, height=7.2, dpi=200, bg="white", type="cairo")
cat("guardado\n")
