suppressMessages({library(dplyr); library(jsonlite)})
source("R/10-datos.R")
b <- cargar()
# conteos por celda (insc1, apro1, clase) -> payload minusculo
cel <- b |> count(insc1, apro1, clase) |>
  mutate(k = as.integer(clase) - 1L) |> select(x = insc1, y = apro1, k, n)
cat("celdas:", nrow(cel), " total:", sum(cel$n), "\n")
out <- list(
  n        = sum(cel$n),
  clases   = c("Abandona", "Egresa"),
  vars     = c("Materias en las que se inscribió", "Materias que aprobó"),
  celdas   = as.matrix(cel[, c("x","y","k","n")]),
  optimo   = list(grados = 122, indice = 0.487)
)
write_json(out, "app/datos.json", digits = 4, matrix = "rowmajor", auto_unbox = TRUE)
cat("bytes:", file.size("app/datos.json"), "\n")
