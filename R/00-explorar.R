library(dplyr)
d <- read.csv(Sys.getenv("UCI697", "datos/uci697.csv"),
              sep = ";", check.names = FALSE, fileEncoding = "UTF-8-BOM")
names(d) <- trimws(names(d))
cat("dim:", dim(d), "\n\n")

v <- c(insc1 = "Curricular units 1st sem (enrolled)",
       apro1 = "Curricular units 1st sem (approved)",
       nota1 = "Curricular units 1st sem (grade)",
       eval1 = "Curricular units 1st sem (evaluations)",
       insc2 = "Curricular units 2nd sem (enrolled)",
       apro2 = "Curricular units 2nd sem (approved)",
       nota2 = "Curricular units 2nd sem (grade)",
       ingreso = "Admission grade",
       edad = "Age at enrollment")

df <- d[, v]; names(df) <- names(v)
df$clase <- d$Target
print(summary(df))
cat("\n=== medias por clase ===\n")
print(df |> group_by(clase) |> summarise(across(everything(), \(x) round(mean(x),2)), n = n()) |> as.data.frame())

# Binario: abandona vs egresa
b <- df |> filter(clase %in% c("Dropout","Graduate")) |> mutate(clase = factor(clase, c("Dropout","Graduate")))
cat("\n=== binario n =", nrow(b), "===\n")

# mejor corte univariado (accuracy) por variable
best_split <- function(x, y) {
  cs <- unique(quantile(x, seq(.02,.98,.005)))
  acc <- sapply(cs, function(c) {
    p <- ifelse(x < c, levels(y)[1], levels(y)[2]); max(mean(p==y), 1-mean(p==y))
  })
  c(acc = max(acc), cut = cs[which.max(acc)])
}
cat("\n=== mejor corte de UNA sola variable (accuracy) ===\n")
for (nm in names(v)) {
  r <- best_split(b[[nm]], b$clase)
  cat(sprintf("%-8s acc=%.3f  corte=%.2f\n", nm, r["acc"], r["cut"]))
}

# LDA en el par (insc1, apro1)
ld <- MASS::lda(clase ~ insc1 + apro1, data = b)
proj <- as.matrix(b[, c("insc1","apro1")]) %*% ld$scaling
r <- best_split(as.numeric(proj), b$clase)
cat(sprintf("\nLDA sobre (insc1, apro1): acc=%.3f   coef=%s\n", r["acc"], paste(round(ld$scaling,3), collapse=", ")))

ld2 <- MASS::lda(clase ~ insc1 + apro1 + insc2 + apro2, data = b)
p2 <- as.matrix(b[, c("insc1","apro1","insc2","apro2")]) %*% ld2$scaling
cat(sprintf("LDA sobre 4 vars: acc=%.3f  coef=%s\n", best_split(as.numeric(p2), b$clase)["acc"],
            paste(round(ld2$scaling,3), collapse=", ")))
