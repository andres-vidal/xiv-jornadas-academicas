suppressMessages({library(dplyr); library(rpart); library(ranger); library(ppforest2)})
set.seed(2026)
d <- read.csv(Sys.getenv("UCI697", "datos/uci697.csv"),
              sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM")
names(d) <- trimws(names(d))
v <- c(insc1="Curricular units 1st sem (enrolled)", apro1="Curricular units 1st sem (approved)",
       nota1="Curricular units 1st sem (grade)",    eval1="Curricular units 1st sem (evaluations)",
       insc2="Curricular units 2nd sem (enrolled)", apro2="Curricular units 2nd sem (approved)",
       nota2="Curricular units 2nd sem (grade)",    eval2="Curricular units 2nd sem (evaluations)",
       ingreso="Admission grade", edad="Age at enrollment", previa="Previous qualification (grade)")
df <- d[, v]; names(df) <- names(v); df$clase <- d$Target
b <- df |> filter(clase %in% c("Dropout","Graduate")) |> mutate(clase=factor(clase, c("Dropout","Graduate")))

cat("### 2 variables (insc1, apro1) — profundidad que necesita rpart\n")
b2 <- b[, c("insc1","apro1","clase")]
for (cp in c(0.05, 0.01, 0.005, 0.002, 0.001)) {
  ft <- rpart(clase ~ ., b2, method="class", control=rpart.control(cp=cp, minsplit=20))
  nsp <- sum(ft$frame$var != "<leaf>")
  acc <- mean(predict(ft, b2, type="class") == b2$clase)
  cat(sprintf("  rpart cp=%.3f : %2d cortes, acc=%.3f\n", cp, nsp, acc))
}
pt <- pptr(clase ~ ., b2)
cat(sprintf("  pptr        : acc=%.3f\n", mean(predict(pt, b2) == b2$clase)))
str(pt, max.level=1)

cat("\n### comparacion 5x2 CV, todas las variables numericas, 2 clases\n")
X <- b
folds <- function(y, k=5) split(sample(seq_along(y)), rep(1:k, length.out=length(y)))
res <- list()
for (rep in 1:2) { fs <- folds(X$clase, 5)
  for (k in 1:5) {
    te <- fs[[k]]; tr <- setdiff(seq_len(nrow(X)), te)
    a <- function(p) mean(p == X$clase[te])
    r1 <- rpart(clase ~ ., X[tr,], method="class")
    r2 <- ranger(clase ~ ., X[tr,], num.trees=300, classification=TRUE)
    r3 <- pptr(clase ~ ., X[tr,])
    r4 <- pprf(clase ~ ., X[tr,], n_trees=300)
    res[[length(res)+1]] <- data.frame(
      rpart=a(predict(r1, X[te,], type="class")),
      ranger=a(predict(r2, X[te,])$predictions),
      pptr=a(predict(r3, X[te,])),
      pprf=a(predict(r4, X[te,])))
  }
}
print(round(colMeans(bind_rows(res)), 4))
