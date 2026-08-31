suppressMessages({library(dplyr); library(ppforest2)})
print(args(pprf)); print(args(pptr))
d <- read.csv(Sys.getenv("UCI697", "datos/uci697.csv"),
              sep=";", check.names=FALSE, fileEncoding="UTF-8-BOM"); names(d) <- trimws(names(d))
v <- c(insc1="Curricular units 1st sem (enrolled)", apro1="Curricular units 1st sem (approved)")
df <- d[, v]; names(df) <- names(v); df$clase <- d$Target
b <- df |> filter(clase %in% c("Dropout","Graduate")) |> mutate(clase=factor(clase))
pt <- pptr(clase ~ ., b)
cat("\n--- root ---\n"); str(pt$root, max.level=3)
