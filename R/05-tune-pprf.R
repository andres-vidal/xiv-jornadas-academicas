suppressMessages({library(dplyr); library(ppforest2)})
set.seed(7)
source_data <- function() {
  d <- read.csv(Sys.getenv("UCI697", "datos/uci697.csv"),
                sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM"); names(d) <- trimws(names(d))
  v <- c(insc1="Curricular units 1st sem (enrolled)", apro1="Curricular units 1st sem (approved)",
         nota1="Curricular units 1st sem (grade)",    eval1="Curricular units 1st sem (evaluations)",
         insc2="Curricular units 2nd sem (enrolled)", apro2="Curricular units 2nd sem (approved)",
         nota2="Curricular units 2nd sem (grade)",    eval2="Curricular units 2nd sem (evaluations)",
         ingreso="Admission grade", edad="Age at enrollment", previa="Previous qualification (grade)")
  df <- d[, v]; names(df) <- names(v); df$clase <- d$Target
  df |> filter(clase %in% c("Dropout","Graduate")) |> mutate(clase=factor(clase, c("Dropout","Graduate")))
}
X <- source_data()
fs <- split(sample(seq_len(nrow(X))), rep(1:5, length.out=nrow(X)))
grid <- expand.grid(lambda=c(0,0.1,0.5), nv=c(3,5,8,11))
for (i in seq_len(nrow(grid))) {
  acc <- sapply(1:3, function(k){ te <- fs[[k]]; tr <- setdiff(seq_len(nrow(X)), te)
    m <- pprf(clase~., X[tr,], size=200, lambda=grid$lambda[i], n_vars=grid$nv[i])
    mean(predict(m, X[te,])==X$clase[te]) })
  cat(sprintf("lambda=%.1f n_vars=%2d  acc=%.4f\n", grid$lambda[i], grid$nv[i], mean(acc)))
}
