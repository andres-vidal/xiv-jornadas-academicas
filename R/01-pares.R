suppressMessages(library(dplyr))
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

bs <- function(x,y){ cs <- unique(quantile(x, seq(.02,.98,.004)))
  max(sapply(cs, function(c){p <- ifelse(x<c, levels(y)[1], levels(y)[2]); max(mean(p==y),1-mean(p==y))})) }

nm <- names(v); res <- list()
for (i in seq_along(nm)) for (j in seq_along(nm)) if (i<j) {
  a <- nm[i]; bb <- nm[j]
  s1 <- bs(b[[a]], b$clase); s2 <- bs(b[[bb]], b$clase)
  ld <- MASS::lda(as.formula(paste("clase ~", a, "+", bb)), data=b)
  p <- as.numeric(as.matrix(b[,c(a,bb)]) %*% ld$scaling)
  sl <- bs(p, b$clase)
  res[[length(res)+1]] <- data.frame(v1=a, v2=bb, mejor_uni=max(s1,s2), lda=sl, ganancia=sl-max(s1,s2),
                                     c1=round(ld$scaling[1],3), c2=round(ld$scaling[2],3))
}
r <- bind_rows(res) |> arrange(desc(ganancia))
print(head(r, 15), row.names=FALSE)
