## "Probar al azar es poco eficiente": distribución del índice sobre 5000 planos
## al azar, contra la proyección que encuentra la búsqueda. Reproduce el
## experimento de la sección 3.2 del informe.
suppressMessages({library(dplyr); library(ggplot2); library(MASS)})
source("R/10-datos.R"); set.seed(1)
suppressMessages(library(ppforest2)); data(crab)
cb <- crab; cb$Type <- factor(cb$Type)
V <- c("FL","RW","CL","CW","BD"); X <- as.matrix(cb[, V]); y <- cb$Type
W <- Reduce(`+`, lapply(levels(y), function(g){ Z <- scale(X[y==g,,drop=FALSE], scale=FALSE); t(Z)%*%Z }))
Tm <- { Z <- scale(X, scale=FALSE); t(Z)%*%Z }
indice <- function(A) 1 - det(t(A)%*%W%*%A)/det(t(A)%*%Tm%*%A)
plano_azar <- function() qr.Q(qr(matrix(rnorm(ncol(X)*2), ncol(X), 2)))

azar <- replicate(5000, indice(plano_azar()))
cat("cuantiles del índice sobre 5000 planos al azar:\n")
print(round(quantile(azar, c(.5,.9,.99,1)), 3))
cat("informe:            50% 0.130 · 90% 0.207 · 99% 0.528 · máx 0.795\n")
cat(sprintf("supera 0,6: %.1f %% (informe: 0,7 %%)\n", 100*mean(azar > .6)))
ld <- lda(X, y); mejor <- indice(ld$scaling[,1:2])
cat(sprintf("proyección hallada: %.3f\n", mejor))

p <- ggplot(data.frame(I = azar), aes(I)) +
  geom_histogram(bins = 46, fill = JJAA[["celeste"]], colour = "white", linewidth = .25) +
  geom_vline(xintercept = mejor, colour = JJAA[["naranja"]], linewidth = 1.4) +
  annotate("text", x = mejor - .02, y = Inf, vjust = 1.6, hjust = 1, size = 6.6,
           colour = JJAA[["naranja"]], fontface = "bold",
           label = sprintf("la búsqueda\nllega acá: %.2f", mejor)) +
  coord_cartesian(xlim = c(0, 1), clip = "off") +
  labs(x = "Índice de proyección", y = "Planos al azar") +
  tema(20) + theme(plot.margin = margin(4,6,2,2))
ggsave("img/K3-azar-vs-busqueda.png", p, width = 8.6, height = 5.2, dpi = 300,
       bg = "white", type = "cairo")
cat("guardado\n")
