suppressMessages({library(dplyr); library(rpart); library(ranger); library(ppforest2)})
set.seed(2026)
d <- read.csv(Sys.getenv("UCI697", "datos/uci697.csv"),
              sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM"); names(d) <- trimws(names(d))
v <- c(insc1="Curricular units 1st sem (enrolled)", apro1="Curricular units 1st sem (approved)",
       nota1="Curricular units 1st sem (grade)",    eval1="Curricular units 1st sem (evaluations)",
       insc2="Curricular units 2nd sem (enrolled)", apro2="Curricular units 2nd sem (approved)",
       nota2="Curricular units 2nd sem (grade)",    eval2="Curricular units 2nd sem (evaluations)",
       ingreso="Admission grade", edad="Age at enrollment", previa="Previous qualification (grade)")
df <- d[, v]; names(df) <- names(v); df$clase <- d$Target
b <- df |> filter(clase %in% c("Dropout","Graduate")) |> mutate(clase=factor(clase, c("Dropout","Graduate")))
b2 <- b[, c("insc1","apro1","clase")]

cat("### lambda en el par (insc1, apro1): direccion y accuracy de UN corte\n")
for (lam in c(0, 0.1, 0.25, 0.5, 0.9)) {
  pt <- pptr(clase ~ ., b2, lambda=lam, stop=stop_max_depth(1))
  pj <- pt$root$projector; pj <- pj/max(abs(pj))
  cat(sprintf("  lambda=%.2f  dir = %+.3f*insc1 %+.3f*apro1   acc=%.4f\n",
      lam, pj[1], pj[2], mean(predict(pt, b2)==b2$clase)))
}
cat("\n### rpart en el mismo par: cuantos cortes para igualar\n")
for (cp in c(0.05,0.02,0.01,0.005,0.002,0.001,0.0005)) {
  ft <- rpart(clase ~ ., b2, method="class", control=rpart.control(cp=cp, minsplit=20, maxdepth=30))
  cat(sprintf("  cp=%.4f : %2d cortes, acc=%.4f\n", cp, sum(ft$frame$var!="<leaf>"),
      mean(predict(ft,b2,type="class")==b2$clase)))
}

cat("\n### 5x2 CV, 11 variables, 2 clases\n")
X <- b; res <- list()
for (rep in 1:2) { fs <- split(sample(seq_len(nrow(X))), rep(1:5, length.out=nrow(X)))
  for (k in 1:5) { te <- fs[[k]]; tr <- setdiff(seq_len(nrow(X)), te); a <- function(p) mean(p==X$clase[te])
    res[[length(res)+1]] <- data.frame(
      rpart = a(predict(rpart(clase~., X[tr,], method="class"), X[te,], type="class")),
      ranger= a(predict(ranger(clase~., X[tr,], num.trees=300, classification=TRUE), X[te,])$predictions),
      pptr  = a(predict(pptr(clase~., X[tr,], lambda=0.1), X[te,])),
      pprf  = a(predict(pprf(clase~., X[tr,], size=300, lambda=0.1), X[te,]))) } }
print(round(colMeans(bind_rows(res)),4)); print(round(sapply(bind_rows(res), sd),4))
