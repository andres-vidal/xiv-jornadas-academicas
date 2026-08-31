suppressMessages({library(dplyr); library(jsonlite); library(ppforest2)})
source("R/10-datos.R"); data(crabs)
k <- data.frame(x = crabs$CL, y = crabs$CW, k = as.integer(crabs$Type == "O"))
cat("n:", nrow(k), " azul:", sum(k$k==0), " naranja:", sum(k$k==1), "\n")
cat("rango largo:", range(k$x), " ancho:", range(k$y), "\n")
# mismo formato que antes: [x, y, clase, n]; acá n = 1 porque las medidas son continuas
cel <- k |> transmute(x = round(x,1), y = round(y,1), k, n = 1L)
out <- list(n = nrow(cel), clases = c("Especie azul","Especie naranja"),
            vars = c("Largo del caparazón (mm)","Ancho del caparazón (mm)"),
            celdas = as.matrix(cel[, c("x","y","k","n")]))
write_json(out, "app/datos.json", digits = 4, matrix = "rowmajor", auto_unbox = TRUE)
cat("bytes:", file.size("app/datos.json"), "\n")
