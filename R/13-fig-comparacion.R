suppressMessages({library(dplyr); library(ggplot2); library(rpart); library(ranger); library(ppforest2)})
source("R/10-datos.R"); set.seed(2026)
X <- cargar()
res <- list()
for (rep in 1:3) { fs <- split(sample(seq_len(nrow(X))), rep(1:5, length.out=nrow(X)))
  for (k in 1:5) { te <- fs[[k]]; tr <- setdiff(seq_len(nrow(X)), te); a <- function(p) mean(p==X$clase[te])
    res[[length(res)+1]] <- data.frame(rep=rep, k=k,
      `Árbol clásico (rpart)`      = a(predict(rpart(clase~., X[tr,], method="class"), X[te,], type="class")),
      `Árbol oblicuo (ppforest2)`  = a(predict(pptr(clase~., X[tr,], lambda=.1), X[te,])),
      `Bosque clásico (ranger)`    = a(predict(ranger(clase~., X[tr,], num.trees=300, classification=TRUE), X[te,])$predictions),
      `Bosque oblicuo (ppforest2)` = a(predict(pprf(clase~., X[tr,], size=300, lambda=.1, n_vars=11), X[te,])),
      check.names = FALSE) } }
R <- bind_rows(res)
resumen <- R |> select(-rep,-k) |> tidyr::pivot_longer(everything(), names_to="metodo", values_to="acc") |>
  group_by(metodo) |> summarise(media=mean(acc), ee=sd(acc)/sqrt(n()), .groups="drop") |> arrange(media)
print(as.data.frame(resumen))
saveRDS(resumen, "R/resumen-comparacion.rds")

resumen$metodo <- factor(resumen$metodo, resumen$metodo)
resumen$tipo <- ifelse(grepl("ppforest2", resumen$metodo), "ppforest2", "otros")
p <- ggplot(resumen, aes(media, metodo, colour = tipo)) +
  geom_errorbarh(aes(xmin=media-2*ee, xmax=media+2*ee), height=.18, linewidth=1.1) +
  geom_point(size = 9) +
  geom_text(aes(label = sprintf("%.1f%%", 100*media)), vjust = -1.5, size = 7, fontface = "bold") +
  scale_colour_manual(values = c(ppforest2 = "#E1701A", otros = "grey45"), guide="none") +
  scale_x_continuous(labels = scales::percent) +
  labs(x = "Aciertos en validación cruzada (15 particiones)", y = NULL) +
  tema(22) + theme(panel.grid.major.y = element_blank())
ggsave("img/S4-comparacion-metodos.png", p, width = 11, height = 5.2, dpi = 220, bg="white", type="cairo")
cat("guardado\n")
