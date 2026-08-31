## ¿La escalera alcanza al corte oblicuo, o solo lo parece por sobreajuste?
## Comparación honesta: fuera de muestra, 5x3 CV.
suppressMessages({library(dplyr); library(rpart); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)

corte_oblicuo <- function(tr, te) {
  fo <- pptr(clase ~ ., tr, lambda = 0, stop = stop_max_depth(1))
  a  <- fo$root$projector; a <- a/sqrt(sum(a^2))
  z  <- as.numeric(as.matrix(tr[,1:2]) %*% a)
  cs <- sort(unique(z)); cs <- (head(cs,-1)+tail(cs,-1))/2
  ev <- sapply(cs, function(t){ p <- ifelse(z<t, levels(tr$clase)[1], levels(tr$clase)[2]); mean(p==tr$clase) })
  k  <- which.max(pmax(ev, 1-ev)); t0 <- cs[k]; inv <- ev[k] < .5
  zt <- as.numeric(as.matrix(te[,1:2]) %*% a)
  p  <- ifelse(zt < t0, levels(tr$clase)[1], levels(tr$clase)[2])
  if (inv) p <- ifelse(p==levels(tr$clase)[1], levels(tr$clase)[2], levels(tr$clase)[1])
  mean(p == te$clase)
}

evaluar <- function(d, etq) {
  cat("\n===", etq, "· n =", nrow(d), "===\n")
  cps <- c(.05,.02,.01,.005,.002,.001,.0005,.0002)
  acc <- matrix(NA, 15, length(cps)); ncort <- matrix(NA, 15, length(cps)); obl <- numeric(15)
  fila <- 0
  for (rep in 1:3) { fs <- split(sample(seq_len(nrow(d))), rep(1:5, length.out=nrow(d)))
    for (k in 1:5) { fila <- fila + 1
      te <- fs[[k]]; tr <- setdiff(seq_len(nrow(d)), te)
      for (j in seq_along(cps)) {
        ft <- rpart(clase ~ ., d[tr,], method="class",
                    control=rpart.control(cp=cps[j], minsplit=20, maxdepth=30, xval=0))
        acc[fila,j]   <- mean(predict(ft, d[te,], type="class") == d$clase[te])
        ncort[fila,j] <- sum(ft$frame$var != "<leaf>")
      }
      obl[fila] <- corte_oblicuo(d[tr,], d[te,])
    } }
  cat(sprintf("  1 corte oblicuo          %.4f\n", mean(obl)))
  for (j in seq_along(cps))
    cat(sprintf("  escalera, %5.1f cortes    %.4f\n", mean(ncort[,j]), mean(acc[,j])))
  invisible(NULL)
}

## (a) el caso actual: conteos enteros en retícula
evaluar(cargar()[, c("insc1","apro1","clase")], "Estudiantes (enteros, retícula)")

## (b) contraste: variables continuas y muy correlacionadas dentro de cada grupo
data(crabs, package="ppforest2")
cr <- data.frame(CL = crabs$CL, CW = crabs$CW, clase = factor(crabs$Type))
evaluar(cr, "Cangrejos (continuas, correlacionadas)")
